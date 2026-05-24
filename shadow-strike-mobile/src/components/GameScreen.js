import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, StyleSheet, Dimensions, TouchableOpacity, Text, StatusBar,
  ImageBackground, Image, Platform,
} from 'react-native';
import { COLORS, GAME, SPRITES, getEnemySprite } from '../constants';
import { createPlayer, updatePlayer, playerShoot, playerBomb, damagePlayer, findNearestEnemy } from '../entities/Player';
import { updateBullets, getBulletHit } from '../entities/Bullet';
import { updateEnemy, enemyAttack, damageEnemy } from '../entities/Enemy';
import { spawnFloor, checkBombHit } from '../systems/Combat';
import StoryOverlay from './StoryOverlay';
import { getFloorIntro } from '../story/chapters';
import { isStorySkippedAsync, dismissStoryForeverAsync } from '../storage';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const SCALE = Math.min(SCREEN_W / GAME.ARENA_WIDTH, (SCREEN_H - 120) / GAME.ARENA_HEIGHT);

export default function GameScreen({ onGameOver, onMenu }) {
  const [floor, setFloor] = useState(1);
  const [score, setScore] = useState(0);
  const [enemies, setEnemies] = useState(() => spawnFloor(1));
  const [bullets, setBullets] = useState([]);
  const [effects, setEffects] = useState([]);
  const [storyLines, setStoryLines] = useState(null);
  const [paused, setPaused] = useState(true);
  const [combatHint, setCombatHint] = useState(true);
  const [lastHitFlash, setLastHitFlash] = useState(false);
  const [storySkipped, setStorySkipped] = useState(false);
  const [arenaShake, setArenaShake] = useState(0);

  const playerRef = useRef(createPlayer(GAME.ARENA_WIDTH / 2, GAME.ARENA_HEIGHT / 2));
  const inputRef = useRef({ x: 0, y: 0 });
  const enemiesRef = useRef(enemies);
  const bulletsRef = useRef([]);
  const shootingRef = useRef(false);
  const loopRef = useRef(null);
  const lastTimeRef = useRef(Date.now());
  const floorClearedRef = useRef(false);
  const scoreRef = useRef(0);
  const floorRef = useRef(1);

  enemiesRef.current = enemies;
  scoreRef.current = score;
  floorRef.current = floor;

  const addEffect = useCallback((type, x, y, extra = {}) => {
    setEffects(prev => [...prev.slice(-24), { id: Date.now() + Math.random(), type, x, y, life: 400, ...extra }]);
  }, []);

  const addScore = useCallback((pts) => {
    if (pts <= 0) return;
    scoreRef.current += Math.floor(pts);
    setScore(scoreRef.current);
  }, []);

  const showFloorStory = useCallback((f) => {
    const lines = getFloorIntro(f);
    if (lines && !storySkipped) {
      setStoryLines(lines);
      setPaused(true);
    } else {
      setStoryLines(null);
      setPaused(false);
    }
  }, [storySkipped]);

  useEffect(() => {
    let cancelled = false;
    isStorySkippedAsync().then((skipped) => {
      if (cancelled) return;
      setStorySkipped(skipped);
      const lines = getFloorIntro(1);
      if (lines && !skipped) {
        setStoryLines(lines);
        setPaused(true);
      } else {
        setPaused(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  const nextFloor = useCallback(() => {
    setFloor(f => {
      const next = f + 1;
      floorRef.current = next;
      setEnemies(spawnFloor(next));
      floorClearedRef.current = false;
      bulletsRef.current = [];
      setBullets([]);
      const p = playerRef.current;
      p.hp = Math.min(p.maxHp, p.hp + 20);
      showFloorStory(next);
      return next;
    });
    addEffect('levelup', playerRef.current.x, playerRef.current.y);
  }, [addEffect, showFloorStory]);

  const tryShoot = useCallback(() => {
    const bullet = playerShoot(playerRef.current, enemiesRef.current);
    if (bullet) bulletsRef.current = [...bulletsRef.current, bullet];
  }, []);

  const processBulletHits = useCallback((currentEnemies, currentBullets) => {
    const player = playerRef.current;
    let pts = 0;
    let hitSomething = false;
    const remainingBullets = [];
    let updatedEnemies = currentEnemies.map(e => ({ ...e }));

    for (const bullet of currentBullets) {
      let consumed = false;
      for (let i = 0; i < updatedEnemies.length; i++) {
        const e = updatedEnemies[i];
        if (!e.alive || consumed) continue;
        if (getBulletHit(bullet, e)) {
          const killed = damageEnemy(e, bullet.damage);
          addEffect('enemyhit', e.x, e.y, { color: e.color });
          if (killed) {
            player.combo++;
            player.comboTimer = GAME.COMBO_WINDOW;
            pts += e.score * (1 + player.combo * 0.1);
          }
          consumed = true;
          hitSomething = true;
          break;
        }
      }
      if (!consumed) remainingBullets.push(bullet);
    }

    if (hitSomething) {
      setLastHitFlash(true);
      setArenaShake(5);
      setTimeout(() => setLastHitFlash(false), 100);
      setTimeout(() => setArenaShake(0), 120);
      if (combatHint) setCombatHint(false);
    }
    if (pts > 0) addScore(pts);

    return { enemies: updatedEnemies, bullets: remainingBullets };
  }, [addEffect, addScore, combatHint]);

  useEffect(() => {
    const tick = () => {
      if (paused) {
        loopRef.current = requestAnimationFrame(tick);
        return;
      }

      const now = Date.now();
      const dt = now - lastTimeRef.current;
      lastTimeRef.current = now;

      const player = playerRef.current;
      updatePlayer(player, inputRef.current, dt);

      if (shootingRef.current) tryShoot();

      bulletsRef.current = updateBullets(bulletsRef.current, dt);

      setEnemies(prev => {
        const moved = prev.map(e => {
          const copy = { ...e };
          updateEnemy(copy, player.x, player.y, dt);
          const dmg = enemyAttack(copy, player);
          if (dmg > 0) {
            damagePlayer(player, dmg);
            addEffect('hit', player.x, player.y);
          }
          return copy;
        });

        const { enemies: afterHits, bullets: afterBullets } = processBulletHits(moved, bulletsRef.current);
        bulletsRef.current = afterBullets;
        setBullets(afterBullets);

        const alive = afterHits.filter(e => e.alive);
        if (alive.length === 0 && !floorClearedRef.current) {
          floorClearedRef.current = true;
          setTimeout(nextFloor, 1200);
        }
        return afterHits;
      });

      if (player.hp <= 0) {
        cancelAnimationFrame(loopRef.current);
        onGameOver(scoreRef.current, floorRef.current);
        return;
      }

      setEffects(prev => prev.map(e => ({ ...e, life: e.life - dt })).filter(e => e.life > 0));
      loopRef.current = requestAnimationFrame(tick);
    };

    loopRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(loopRef.current);
  }, [nextFloor, onGameOver, addEffect, paused, tryShoot, processBulletHits]);

  const handleBomb = () => {
    if (paused) return;
    const player = playerRef.current;
    const bomb = playerBomb(player);
    if (!bomb) return;

    addEffect('bomb', bomb.x, bomb.y, { radius: bomb.radius });

    setEnemies(prev => {
      const hits = checkBombHit(bomb, prev);
      let pts = 0;
      const updated = prev.map(e => {
        if (hits.find(h => h.id === e.id)) {
          const killed = damageEnemy(e, bomb.damage);
          addEffect('enemyhit', e.x, e.y, { color: e.color });
          if (killed) {
            player.combo++;
            player.comboTimer = GAME.COMBO_WINDOW;
            pts += e.score * 2;
          }
        }
        return e;
      });
      if (hits.length > 0) {
        setArenaShake(10);
        setTimeout(() => setArenaShake(0), 200);
      }
      addScore(pts);
      if (combatHint) setCombatHint(false);
      return updated;
    });
  };

  const player = playerRef.current;
  const aliveCount = enemies.filter(e => e.alive).length;
  const boss = enemies.find(e => e.alive && e.isBoss);
  const target = !paused && !storyLines ? findNearestEnemy(player, enemies) : null;

  return (
    <View style={[styles.container, Platform.OS === 'web' && { minHeight: '100vh', width: '100%' }]}>
      <StatusBar hidden />

      <View style={styles.hud}>
        <View>
          <Text style={styles.hudHero}>KIRA</Text>
          <Text style={styles.hudText}>FLOOR {floor}</Text>
        </View>
        <Text style={styles.hudScore}>{score.toLocaleString()}</Text>
        <View style={styles.hpBar}>
          <View style={[styles.hpFill, { width: `${(player.hp / player.maxHp) * 100}%` }]} />
        </View>
        {player.combo > 1 && (
          <Text style={styles.combo}>x{player.combo} STREAK</Text>
        )}
        <Text style={styles.enemiesLeft}>{aliveCount} left</Text>
        <TouchableOpacity onPress={onMenu} style={styles.menuBtn}>
          <Text style={styles.menuBtnText}>Menu</Text>
        </TouchableOpacity>
      </View>

      {boss && (
        <View style={styles.bossBar}>
          <Text style={styles.bossName}>⚠ {boss.name || 'BOSS'}</Text>
          <View style={styles.bossHpTrack}>
            <View style={[styles.bossHpFill, { width: `${(boss.hp / boss.maxHp) * 100}%` }]} />
          </View>
        </View>
      )}

      <View style={styles.arenaWrapper}>
        <View style={[
          styles.arena,
          {
            transform: [
              { scale: SCALE },
              { translateX: arenaShake ? (Math.random() - 0.5) * arenaShake : 0 },
              { translateY: arenaShake ? (Math.random() - 0.5) * arenaShake : 0 },
            ],
          },
        ]}>
          <ImageBackground source={SPRITES.arena} style={styles.arenaBg} resizeMode="cover">
            {effects.map(e => {
              if (e.type === 'bomb') {
                const r = e.radius ?? GAME.BOMB_RADIUS;
                return (
                  <View
                    key={e.id}
                    style={[
                      styles.bombBurst,
                      {
                        left: e.x - r,
                        top: e.y - r,
                        width: r * 2,
                        height: r * 2,
                        borderRadius: r,
                        opacity: e.life / 400,
                      },
                    ]}
                  />
                );
              }
              return (
                <View
                  key={e.id}
                  style={[
                    styles.effect,
                    {
                      left: e.x - 20,
                      top: e.y - 20,
                      opacity: e.life / 400,
                      backgroundColor:
                        e.type === 'levelup' ? COLORS.gold :
                        e.type === 'hit' ? COLORS.playerHit :
                        e.type === 'enemyhit' ? (e.color || COLORS.enemy) :
                        '#fff',
                      width: e.type === 'enemyhit' ? 28 : 36,
                      height: e.type === 'enemyhit' ? 28 : 36,
                      borderRadius: e.type === 'enemyhit' ? 14 : 4,
                    },
                  ]}
                />
              );
            })}

            {bullets.map(b => (
              <View
                key={b.id}
                style={[
                  styles.bullet,
                  {
                    left: b.x - 5,
                    top: b.y - 5,
                    transform: [{ rotate: `${Math.atan2(b.vy, b.vx)}rad` }],
                  },
                ]}
              />
            ))}

            {enemies.filter(e => e.alive).map(e => (
              <View
                key={e.id}
                style={[
                  styles.enemyWrap,
                  {
                    left: e.x - e.radius,
                    top: e.y - e.radius * 1.4,
                    width: e.radius * 2,
                    height: e.radius * 2.2,
                  },
                ]}
              >
                {target?.id === e.id && (
                  <View style={styles.targetRing} />
                )}
                <Image
                  source={getEnemySprite(e)}
                  style={[
                    styles.enemySprite,
                    { opacity: e.hitFlash > 0 ? 0.4 : 1, tintColor: e.hitFlash > 0 ? '#fff' : undefined },
                  ]}
                  resizeMode="contain"
                />
                <View style={styles.enemyHpTrack}>
                  <View style={[styles.enemyHp, { width: `${(e.hp / e.maxHp) * 100}%` }]} />
                </View>
                {e.isBoss && <Text style={styles.bossLabel}>{e.name?.split(' ')[0] || 'BOSS'}</Text>}
              </View>
            ))}

            <Image
              source={SPRITES.playerIdle}
              style={[
                styles.playerSprite,
                {
                  left: player.x - 36,
                  top: player.y - 54,
                  opacity: player.invincible ? 0.5 : 1,
                  transform: [{ scaleX: player.facing }],
                },
              ]}
              resizeMode="contain"
            />
          </ImageBackground>
        </View>
      </View>

      {combatHint && !paused && !storyLines && (
        <View style={styles.combatHint}>
          <Text style={styles.combatHintText}>Left stick to evade · Hold SHOOT (auto-aims) · BOMB when swarmed</Text>
        </View>
      )}

      {lastHitFlash && (
        <View style={styles.hitFlash} pointerEvents="none" />
      )}

      <View style={[styles.controls, (paused || storyLines) && styles.controlsDim]} pointerEvents="box-none">
        <View style={styles.controlZone}>
          <Text style={styles.zoneLabel}>MOVE</Text>
          <Joystick onMove={(x, y) => { inputRef.current = { x, y }; }} />
        </View>

        <View style={styles.controlZone}>
          <Text style={styles.zoneLabel}>WEAPONS</Text>
          <View style={styles.actionButtons}>
            <ShootButton
              onStart={() => { shootingRef.current = true; tryShoot(); }}
              onStop={() => { shootingRef.current = false; }}
              size={76}
            />
            <ActionButton
              label="BOMB"
              sub="Blast"
              color={COLORS.special}
              onPress={handleBomb}
              size={68}
              cooldown={player.bombCooldown / GAME.BOMB_COOLDOWN}
            />
          </View>
        </View>
      </View>

      {storyLines && (
        <StoryOverlay
          lines={storyLines}
          onComplete={() => { setStoryLines(null); setPaused(false); setCombatHint(true); }}
          onSkipForever={async () => {
            await dismissStoryForeverAsync();
            setStorySkipped(true);
          }}
        />
      )}
    </View>
  );
}

function Joystick({ onMove }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const originRef = useRef(null);

  const handleTouch = (evt) => {
    const touch = evt.nativeEvent;
    if (!originRef.current) {
      originRef.current = { x: touch.pageX, y: touch.pageY };
    }
    const dx = touch.pageX - originRef.current.x;
    const dy = touch.pageY - originRef.current.y;
    const max = 40;
    const len = Math.hypot(dx, dy) || 1;
    const clamped = Math.min(len, max);
    const nx = (dx / len) * (clamped / max);
    const ny = (dy / len) * (clamped / max);
    setPos({ x: nx * max, y: ny * max });
    onMove(nx, ny);
  };

  const handleRelease = () => {
    originRef.current = null;
    setPos({ x: 0, y: 0 });
    onMove(0, 0);
  };

  return (
    <View
      style={styles.joystickBase}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderMove={handleTouch}
      onResponderRelease={handleRelease}
    >
      <View style={[styles.joystickKnob, { transform: [{ translateX: pos.x }, { translateY: pos.y }] }]} />
    </View>
  );
}

function ShootButton({ onStart, onStop, size }) {
  return (
    <TouchableOpacity
      onPressIn={onStart}
      onPressOut={onStop}
      style={[
        styles.actionBtn,
        styles.actionBtnPrimary,
        styles.shootBtn,
        { width: size, height: size, borderRadius: size / 2, borderColor: COLORS.attack },
      ]}
      activeOpacity={0.7}
    >
      <Text style={[styles.actionLabel, { color: COLORS.attack }]}>SHOOT</Text>
      <Text style={styles.actionSub}>Hold</Text>
    </TouchableOpacity>
  );
}

function ActionButton({ label, sub, color, onPress, size, cooldown = 0 }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.actionBtn,
        { width: size, height: size, borderRadius: size / 2, borderColor: color },
      ]}
      activeOpacity={0.7}
    >
      {cooldown > 0 && (
        <View style={[styles.cooldownOverlay, { height: `${cooldown * 100}%` }]} />
      )}
      <Text style={[styles.actionLabel, { color }]}>{label}</Text>
      {sub && <Text style={styles.actionSub}>{sub}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  hud: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 10,
    backgroundColor: 'rgba(6,3,12,0.9)',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.wall,
  },
  hudHero: { color: COLORS.player, fontSize: 11, fontWeight: '800', letterSpacing: 2 },
  hudText: { color: COLORS.textDim, fontSize: 12, fontWeight: '600' },
  hudScore: { color: COLORS.gold, fontSize: 18, fontWeight: 'bold', flex: 1, textAlign: 'center' },
  hpBar: { width: 90, height: 8, backgroundColor: COLORS.hpBg, borderRadius: 4, overflow: 'hidden' },
  hpFill: { height: '100%', backgroundColor: COLORS.hp, borderRadius: 4 },
  combo: { color: COLORS.combo, fontSize: 12, fontWeight: 'bold' },
  enemiesLeft: { color: COLORS.textDim, fontSize: 11 },
  menuBtn: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: COLORS.textDim },
  menuBtnText: { color: COLORS.textDim, fontSize: 10 },
  bossBar: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: 'rgba(80,0,40,0.6)',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.boss,
  },
  bossName: { color: '#fff', fontSize: 12, fontWeight: '800', letterSpacing: 1, marginBottom: 4, textAlign: 'center' },
  bossHpTrack: { height: 6, backgroundColor: '#330022', borderRadius: 3, overflow: 'hidden' },
  bossHpFill: { height: '100%', backgroundColor: COLORS.boss },
  arenaWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  arena: {
    width: GAME.ARENA_WIDTH,
    height: GAME.ARENA_HEIGHT,
    borderWidth: 1,
    borderColor: COLORS.wall,
    borderRadius: 4,
    overflow: 'hidden',
  },
  bullet: {
    position: 'absolute',
    width: 10,
    height: 4,
    backgroundColor: COLORS.attack,
    borderRadius: 2,
    shadowColor: COLORS.attack,
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  bombBurst: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: COLORS.special,
    backgroundColor: 'rgba(0,204,255,0.25)',
  },
  combatHint: {
    position: 'absolute',
    bottom: 130,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,34,102,0.85)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    zIndex: 50,
  },
  combatHintText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  hitFlash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,0,0.12)',
    zIndex: 40,
  },
  arenaBg: { width: '100%', height: '100%' },
  playerSprite: { position: 'absolute', width: 72, height: 108 },
  enemyWrap: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  targetRing: {
    position: 'absolute',
    width: '130%',
    height: '110%',
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'rgba(255,204,0,0.7)',
    backgroundColor: 'rgba(255,204,0,0.08)',
  },
  enemySprite: { width: '100%', height: '85%' },
  enemyHpTrack: {
    width: '80%', height: 4, backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 2, overflow: 'hidden', marginTop: 2,
  },
  enemyHp: { height: '100%', backgroundColor: '#ff2244' },
  bossLabel: {
    color: '#fff', fontSize: 8, fontWeight: 'bold',
    backgroundColor: 'rgba(200,0,80,0.8)', paddingHorizontal: 4, borderRadius: 3, marginTop: 2,
  },
  effect: { position: 'absolute' },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 12,
    paddingTop: 4,
    height: 130,
    backgroundColor: 'rgba(6,3,12,0.95)',
  },
  controlZone: { alignItems: 'center', gap: 4 },
  zoneLabel: { color: COLORS.textDim, fontSize: 9, fontWeight: '800', letterSpacing: 2 },
  controlsDim: { opacity: 0.4 },
  joystickBase: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 2, borderColor: 'rgba(255,34,102,0.5)',
    alignItems: 'center', justifyContent: 'center',
  },
  joystickKnob: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,34,102,0.75)',
  },
  actionButtons: { flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  actionBtn: {
    borderWidth: 2, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)', overflow: 'hidden',
  },
  actionBtnPrimary: { backgroundColor: 'rgba(255,204,0,0.15)' },
  shootBtn: { shadowColor: COLORS.attack, shadowOpacity: 0.5, shadowRadius: 8 },
  actionLabel: { fontSize: 12, fontWeight: 'bold' },
  actionSub: { color: COLORS.textDim, fontSize: 8, marginTop: 1 },
  cooldownOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
});
