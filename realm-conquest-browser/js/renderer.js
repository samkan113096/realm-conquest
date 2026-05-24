import { FACTIONS, TERRAIN, HEX_SIZE, BUILDINGS, UNITS } from './units.js';
import { hexToPixel } from './map.js';

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.hoverId = null;
    this.mapOffset = { x: 0, y: 0 };
    this.mapScale = 1;
    this._lastMap = null;
    this._lastSelected = null;
    this._lastHints = null;
    this._time = 0;
    this.pulseTerritoryId = null;
    this.pulseKind = 'action';
    this.resize();
    window.addEventListener('resize', () => this.resize());
    const parent = canvas.parentElement;
    if (parent && typeof ResizeObserver !== 'undefined') {
      this._observer = new ResizeObserver(() => this.resize());
      this._observer.observe(parent);
    }
    const tick = (t) => {
      this._time = t * 0.001;
      if (this._lastMap) {
        this._drawMap(this._lastMap, this._lastSelected, this._lastHints);
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  resize() {
    if (!this.syncCanvasSize()) return;
    if (this._lastMap) {
      this.computeOffset(this._lastMap);
      this._drawMap(this._lastMap, this._lastSelected, this._lastHints);
    }
  }

  syncCanvasSize() {
    const box = this.canvas.getBoundingClientRect();
    const w = Math.floor(box.width);
    const h = Math.floor(box.height);
    if (w < 4 || h < 4) return false;

    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
    return true;
  }

  computeOffset(map) {
    if (!map?.territories?.length) {
      this.mapOffset = { x: this.canvas.width / 2, y: this.canvas.height / 2 };
      this.mapScale = 1;
      return;
    }
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const t of map.territories) {
      const { x, y } = hexToPixel(t.col, t.row, HEX_SIZE);
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
    const mapW = maxX - minX + HEX_SIZE * 2;
    const mapH = maxY - minY + HEX_SIZE * 2;
    const pad = 56;
    const scale = Math.min(
      (this.canvas.width - pad * 2) / mapW,
      (this.canvas.height - pad * 2) / mapH,
      0.82
    );
    this.mapScale = Number.isFinite(scale) && scale > 0 ? scale : 1;
    this.mapOffset = {
      x: (this.canvas.width - mapW * scale) / 2 - minX * scale + HEX_SIZE * scale,
      y: (this.canvas.height - mapH * scale) / 2 - minY * scale + HEX_SIZE * scale,
    };
  }

  hexPoints(x, y, size) {
    const pts = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      pts.push([x + size * Math.cos(angle), y + size * Math.sin(angle)]);
    }
    return pts;
  }

  drawHexPath(ctx, x, y, size) {
    const pts = this.hexPoints(x, y, size);
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < 6; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
  }

  toScreen(mapX, mapY) {
    return {
      x: mapX * this.mapScale + this.mapOffset.x,
      y: mapY * this.mapScale + this.mapOffset.y,
    };
  }

  drawBackground(ctx, w, h) {
    const grd = ctx.createLinearGradient(0, 0, w, h);
    grd.addColorStop(0, '#0f1a2e');
    grd.addColorStop(0.4, '#1a3a28');
    grd.addColorStop(1, '#0d2018');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = 'rgba(255,220,120,0.04)';
    for (let i = 0; i < 40; i++) {
      const sx = (i * 173) % w;
      const sy = (i * 97) % h;
      ctx.beginPath();
      ctx.arc(sx, sy, 1 + (i % 2), 0, Math.PI * 2);
      ctx.fill();
    }

    const vig = ctx.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, h * 0.85);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(0,0,0,0.45)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);
  }

  drawTerrainTexture(ctx, px, py, s, terrainKey, seed) {
    if (terrainKey === 'forest') {
      ctx.fillStyle = 'rgba(20,60,30,0.5)';
      for (let i = 0; i < 5; i++) {
        const tx = px + Math.sin(seed + i * 2.1) * s * 0.35;
        const ty = py + Math.cos(seed + i * 1.7) * s * 0.25;
        ctx.beginPath();
        ctx.moveTo(tx, ty - 8 * this.mapScale);
        ctx.lineTo(tx + 6 * this.mapScale, ty + 4 * this.mapScale);
        ctx.lineTo(tx - 6 * this.mapScale, ty + 4 * this.mapScale);
        ctx.closePath();
        ctx.fill();
      }
    } else if (terrainKey === 'hills') {
      ctx.strokeStyle = 'rgba(90,70,40,0.35)';
      ctx.lineWidth = 2 * this.mapScale;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(px - s * 0.2 + i * s * 0.2, py + s * 0.1, s * 0.25, Math.PI, 0);
        ctx.stroke();
      }
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.arc(px + Math.sin(seed + i) * s * 0.4, py + Math.cos(seed + i * 1.3) * s * 0.35, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  drawBuildingIcon(ctx, px, py, key, scale) {
    const bd = BUILDINGS[key];
    if (!bd) return;
    const r = 9 * scale;
    ctx.fillStyle = bd.color;
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.font = `${Math.max(10, 12 * scale)}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(bd.icon, px, py + 1);
  }

  drawUnitRow(ctx, px, py, territory, scale) {
    let ox = px - (territory.units.length - 1) * 8 * scale;
    for (const u of territory.units) {
      if (u.count <= 0) continue;
      const def = UNITS[u.type];
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.beginPath();
      ctx.arc(ox, py, 11 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = `${Math.max(9, 11 * scale)}px serif`;
      ctx.textAlign = 'center';
      ctx.fillText(def?.icon || '⚔', ox, py + 1);
      ctx.font = `bold ${Math.max(8, 9 * scale)}px Inter, sans-serif`;
      ctx.fillStyle = '#fff';
      ctx.fillText(String(u.count), ox, py + 14 * scale);
      ox += 16 * scale;
    }
  }

  drawHexTerritory(ctx, px, py, size, territory, isSelected, isHover, hints = {}) {
    const terrain = TERRAIN[territory.terrain] || TERRAIN.plains;
    const faction = FACTIONS[territory.owner];
    const s = size * this.mapScale;

    const isMoveTarget = hints.moveTargets?.some(t => t.id === territory.id);
    const isAttackTarget = hints.attackTargets?.some(t => t.id === territory.id);
    const isMoveSource = hints.moveSource?.id === territory.id;

    if (isMoveTarget || isAttackTarget || isMoveSource) {
      ctx.save();
      ctx.globalAlpha = 0.35 + Math.sin(this._time * 4) * 0.12;
      this.drawHexPath(ctx, px, py, s);
      ctx.fillStyle = isAttackTarget ? '#ff5252' : '#58a6ff';
      ctx.fill();
      ctx.restore();
    }

    this.drawHexPath(ctx, px, py, s - 2);
    const grad = ctx.createRadialGradient(px, py - s * 0.25, s * 0.05, px, py, s);
    grad.addColorStop(0, terrain.colorLight || terrain.color);
    grad.addColorStop(0.65, terrain.color);
    grad.addColorStop(1, terrain.colorDark || terrain.color);
    ctx.fillStyle = grad;
    ctx.fill();

    this.drawTerrainTexture(ctx, px, py, s, territory.terrain, territory.id * 0.7);

    if (territory.owner !== 'neutral') {
      ctx.save();
      ctx.globalAlpha = 0.5;
      this.drawHexPath(ctx, px, py, s - 4);
      const fgrad = ctx.createLinearGradient(px - s, py, px + s, py);
      fgrad.addColorStop(0, faction.color);
      fgrad.addColorStop(1, faction.glow || faction.color);
      ctx.fillStyle = fgrad;
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = faction.color;
      ctx.fillRect(px - s * 0.55, py - s * 0.72, s * 1.1, 5 * this.mapScale);
    }

    const strokeColor = isSelected ? '#ffffff' : isHover ? '#ffe082' : 'rgba(0,0,0,0.55)';
    const lw = isSelected ? 3.5 : isHover ? 2.5 : 1.5;
    this.drawHexPath(ctx, px, py, s - 2);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lw;
    ctx.stroke();

    if (isSelected) {
      ctx.save();
      ctx.shadowColor = '#f0b429';
      ctx.shadowBlur = 18 + Math.sin(this._time * 3) * 4;
      this.drawHexPath(ctx, px, py, s - 2);
      ctx.strokeStyle = '#f0b429';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.restore();
    }

    if (this.pulseTerritoryId === territory.id) {
      ctx.save();
      const pulse = 0.45 + Math.sin(this._time * 8) * 0.25;
      ctx.globalAlpha = pulse;
      this.drawHexPath(ctx, px, py, s + 4);
      ctx.strokeStyle = this.pulseKind === 'conquer' ? '#ff5252' : '#f0b429';
      ctx.lineWidth = 5;
      ctx.stroke();
      ctx.restore();
    }

    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.font = `bold ${Math.max(10, 12 * this.mapScale)}px Cinzel, serif`;
    ctx.textAlign = 'center';
    ctx.fillText(territory.name.slice(0, 10), px + 1, py - s * 0.22 + 1);
    ctx.fillStyle = '#fff';
    ctx.fillText(territory.name.slice(0, 10), px, py - s * 0.22);

    ctx.font = `${Math.max(8, 9 * this.mapScale)}px Inter, sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.fillText(terrain.name, px, py - s * 0.05);

    let iconY = py + s * 0.12;
    for (const b of territory.buildings) {
      this.drawBuildingIcon(ctx, px, iconY, b, this.mapScale);
      iconY += 20 * this.mapScale;
    }

    const army = territory.units.reduce((sum, u) => sum + u.count, 0);
    if (army > 0) {
      this.drawUnitRow(ctx, px, py + s * 0.42, territory, this.mapScale);
    }
  }

  render(map, selectedTerritory, hints = {}) {
    if (!map) return;
    if (!this.syncCanvasSize()) {
      requestAnimationFrame(() => this.render(map, selectedTerritory, hints));
      return;
    }
    this._lastMap = map;
    this._lastSelected = selectedTerritory;
    this._lastHints = hints;
    this.computeOffset(map);
    this._drawMap(map, selectedTerritory, hints);
  }

  _drawMap(map, selectedTerritory, hints = {}) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    this.drawBackground(ctx, w, h);

    for (const t of map.territories) {
      const { x, y } = hexToPixel(t.col, t.row, HEX_SIZE);
      const { x: px, y: py } = this.toScreen(x, y);
      const isSelected = selectedTerritory?.id === t.id;
      const isHover = this.hoverId === t.id;
      this.drawHexTerritory(ctx, px, py, HEX_SIZE, t, isSelected, isHover, hints);
    }

    this.drawMapFrame(ctx, w, h);
    this.drawLegend(ctx, w, h);
  }

  drawMapFrame(ctx, w, h) {
    ctx.strokeStyle = 'rgba(240,180,41,0.25)';
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, w - 20, h - 20);
    ctx.strokeStyle = 'rgba(240,180,41,0.08)';
    ctx.lineWidth = 1;
    ctx.strokeRect(16, 16, w - 32, h - 32);
  }

  drawLegend(ctx, w, h) {
    const items = [
      { color: FACTIONS.player.color, label: 'You' },
      { color: FACTIONS.enemy1.color, label: 'Red Legion' },
      { color: FACTIONS.enemy2.color, label: 'Shadow Court' },
      { color: FACTIONS.neutral.color, label: 'Neutral' },
    ];
    ctx.font = '11px Inter, sans-serif';
    let lx = 14;
    const ly = h - 16;
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(10, h - 32, 340, 24);
    ctx.strokeStyle = 'rgba(240,180,41,0.3)';
    ctx.strokeRect(10, h - 32, 340, 24);
    for (const item of items) {
      ctx.fillStyle = item.color;
      ctx.fillRect(lx, ly - 9, 12, 12);
      ctx.fillStyle = '#ddd';
      ctx.fillText(item.label, lx + 16, ly);
      lx += ctx.measureText(item.label).width + 30;
    }
  }

  getTerritoryAt(map, clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const mx = clientX - rect.left;
    const my = clientY - rect.top;

    let closest = null;
    let minDist = HEX_SIZE * this.mapScale;

    for (const t of map.territories) {
      const { x, y } = hexToPixel(t.col, t.row, HEX_SIZE);
      const { x: px, y: py } = this.toScreen(x, y);
      const dist = Math.hypot(mx - px, my - py);
      if (dist < minDist) {
        minDist = dist;
        closest = t;
      }
    }
    return closest;
  }
}
