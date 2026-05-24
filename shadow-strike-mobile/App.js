import React, { useState, useEffect, Component } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, StatusBar, ImageBackground, Image, ScrollView, Platform,
} from 'react-native';
import GameScreen from './src/components/GameScreen';
import TutorialScreen from './src/components/TutorialScreen';
import { COLORS, SPRITES } from './src/constants';
import { HERO } from './src/story/chapters';
import { isTutorialDismissedAsync, dismissTutorialForeverAsync } from './src/storage';

const WEB_ROOT = Platform.OS === 'web' ? { minHeight: '100vh', width: '100%' } : null;

class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.errorWrap}>
          <Text style={styles.errorTitle}>Shadow Strike failed to load</Text>
          <Text style={styles.errorText}>{String(this.state.error?.message || this.state.error)}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

function AppRoot() {
  const [screen, setScreen] = useState('menu');
  const [lastRun, setLastRun] = useState({ score: 0, floor: 1 });
  const [highScore, setHighScore] = useState(0);
  const [tutorialOptional, setTutorialOptional] = useState(false);
  const [tutorialDismissed, setTutorialDismissed] = useState(false);
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    isTutorialDismissedAsync()
      .then(setTutorialDismissed)
      .finally(() => setStorageReady(true));
  }, []);

  const handleGameOver = (score, floor) => {
    setLastRun({ score, floor });
    if (score > highScore) setHighScore(score);
    setScreen('gameover');
  };

  const beginGame = () => setScreen('playing');

  const handleTutorialComplete = async ({ neverAgain }) => {
    if (neverAgain) {
      await dismissTutorialForeverAsync();
      setTutorialDismissed(true);
    }
    beginGame();
  };

  const startStory = () => {
    if (tutorialDismissed) beginGame();
    else {
      setTutorialOptional(false);
      setScreen('tutorial');
    }
  };

  const openTutorialFromMenu = () => {
    setTutorialOptional(true);
    setScreen('tutorial');
  };

  if (!storageReady) {
    return (
      <View style={[styles.container, styles.loading, WEB_ROOT]}>
        <Text style={styles.loadingText}>Loading Shadow Strike…</Text>
      </View>
    );
  }

  if (screen === 'tutorial') {
    return (
      <TutorialScreen
        showSkip={!tutorialOptional}
        replayMode={tutorialOptional}
        onComplete={tutorialOptional ? () => setScreen('menu') : handleTutorialComplete}
        onBack={() => setScreen('menu')}
      />
    );
  }

  if (screen === 'playing') {
    return <GameScreen onGameOver={handleGameOver} onMenu={() => setScreen('menu')} />;
  }

  return (
    <ImageBackground source={SPRITES.menuHero} style={[styles.container, WEB_ROOT]} resizeMode="cover">
      <StatusBar hidden />
      <View style={styles.scrim} />

      <ScrollView contentContainerStyle={styles.menuContent} style={styles.menuScroll}>
        {screen === 'menu' ? (
          <>
            <Image source={SPRITES.logo} style={styles.logoImg} resizeMode="contain" />
            <Text style={styles.loreTag}>NEO-TOKYO 2187 · UNDERGROUND CIRCUIT</Text>
            <Text style={styles.title}>SHADOW STRIKE</Text>
            <Text style={styles.heroName}>Play as {HERO.name}</Text>

            <View style={styles.heroRow}>
              <Image source={SPRITES.playerIdle} style={styles.heroPortrait} />
              <View style={styles.storyBox}>
                <Text style={styles.storyTitle}>The Story</Text>
                <Text style={styles.storyText}>{HERO.bio}</Text>
              </View>
            </View>

            <View style={styles.features}>
              <Text style={styles.feature}>🕹️ Left thumb — move Kira</Text>
              <Text style={styles.feature}>🔫 Right thumb — SHOOT (hold) & BOMB</Text>
              <Text style={styles.feature}>💥 BOMB clears nearby enemies · bullets auto-aim</Text>
              <Text style={styles.feature}>🐍 Boss every 5 floors — story cutscenes</Text>
            </View>

            <TouchableOpacity style={styles.playBtn} onPress={startStory}>
              <Text style={styles.playText}>▶ STORY MODE</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.tutorialBtn} onPress={openTutorialFromMenu}>
              <Text style={styles.tutorialText}>📖 How to Play — Tutorial</Text>
            </TouchableOpacity>

            {highScore > 0 && (
              <Text style={styles.highScore}>Best Run: {highScore.toLocaleString()} pts</Text>
            )}
          </>
        ) : (
          <>
            <Text style={styles.gameOverTitle}>K.O.</Text>
            <Image source={SPRITES.playerIdle} style={styles.koHero} />
            <Text style={styles.koLine}>Kira falls… but the circuit never forgets.</Text>
            <Text style={styles.stat}>Score: {lastRun.score.toLocaleString()}</Text>
            <Text style={styles.stat}>Floor Reached: {lastRun.floor}</Text>

            {lastRun.score >= highScore && lastRun.score > 0 && (
              <Text style={styles.newRecord}>★ NEW RECORD ★</Text>
            )}

            <TouchableOpacity style={styles.playBtn} onPress={startStory}>
              <Text style={styles.playText}>FIGHT AGAIN</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuBtn} onPress={() => setScreen('menu')}>
              <Text style={styles.menuText}>Main Menu</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </ImageBackground>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppRoot />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  menuScroll: { flex: 1 },
  loading: { alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: COLORS.text, fontSize: 16 },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(6,3,12,0.78)' },
  menuContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    paddingVertical: 32,
    ...(Platform.OS === 'web' ? { minHeight: '100vh' } : {}),
  },
  loreTag: { color: COLORS.combo, fontSize: 10, letterSpacing: 3, marginBottom: 8 },
  logoImg: { width: 200, height: 80, marginBottom: 8 },
  title: {
    fontSize: 38, fontWeight: '900', color: COLORS.player,
    letterSpacing: 4, marginBottom: 4,
  },
  heroName: { color: COLORS.gold, fontSize: 14, letterSpacing: 2, marginBottom: 20 },
  heroRow: {
    flexDirection: 'row', marginBottom: 24,
    alignItems: 'center', maxWidth: 520, width: '100%',
  },
  heroPortrait: { width: 110, height: 110, marginRight: 16 },
  storyBox: {
    flex: 1, backgroundColor: 'rgba(18,8,24,0.9)', borderRadius: 10,
    padding: 14, borderWidth: 1, borderColor: COLORS.wall,
  },
  storyTitle: { color: COLORS.combo, fontSize: 12, letterSpacing: 2, marginBottom: 6 },
  storyText: { color: COLORS.text, fontSize: 13, lineHeight: 20 },
  features: { marginBottom: 28, maxWidth: 480 },
  feature: { color: COLORS.text, fontSize: 14, textAlign: 'center', marginBottom: 8 },
  playBtn: {
    backgroundColor: COLORS.player, paddingHorizontal: 48, paddingVertical: 16,
    borderRadius: 8, marginBottom: 12,
  },
  playText: { color: '#000', fontSize: 17, fontWeight: 'bold', letterSpacing: 2 },
  tutorialBtn: {
    marginTop: 4, padding: 12, borderWidth: 1, borderColor: COLORS.wall,
    borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.4)',
  },
  tutorialText: { color: COLORS.text, fontSize: 14, textAlign: 'center' },
  highScore: { color: COLORS.gold, fontSize: 15, marginTop: 12 },
  gameOverTitle: {
    fontSize: 48, fontWeight: '900', color: COLORS.playerHit,
    marginBottom: 12, letterSpacing: 6,
  },
  koHero: { width: 80, height: 80, opacity: 0.6, marginBottom: 8 },
  koLine: { color: COLORS.textDim, fontSize: 14, marginBottom: 20, fontStyle: 'italic' },
  stat: { color: COLORS.text, fontSize: 20, marginBottom: 8 },
  newRecord: { color: COLORS.gold, fontSize: 18, fontWeight: 'bold', marginBottom: 24 },
  menuBtn: { padding: 12 },
  menuText: { color: COLORS.textDim, fontSize: 14 },
  errorWrap: {
    flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center',
    padding: 24, ...(Platform.OS === 'web' ? { minHeight: '100vh' } : {}),
  },
  errorTitle: { color: COLORS.player, fontSize: 20, fontWeight: '800', marginBottom: 12 },
  errorText: { color: COLORS.text, fontSize: 14, textAlign: 'center' },
});
