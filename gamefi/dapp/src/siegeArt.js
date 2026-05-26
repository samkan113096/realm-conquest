import { CLASSES, ZOMBIE_TIERS } from './config';

const CLASS_THEME = [
  { skin: '#ffd4b8', hair: '#8b4513', armor: '#e85d4c', dark: '#b83a2f', accent: '#ffc940', cape: '#c0392b' },
  { skin: '#ffd4b8', hair: '#2d5016', armor: '#4ade80', dark: '#15803d', accent: '#86efac', cape: '#166534' },
  { skin: '#ffe8d6', hair: '#4c1d95', armor: '#818cf8', dark: '#4338ca', accent: '#c4b5fd', cape: '#5b21b6' },
  { skin: '#ffd4b8', hair: '#1e3a5f', armor: '#60a5fa', dark: '#2563eb', accent: '#93c5fd', cape: '#1d4ed8' },
  { skin: '#ffe0cc', hair: '#1a1a2e', armor: '#f472b6', dark: '#db2777', accent: '#fbcfe8', cape: '#831843' },
];

const TIER_ZOMBIES = [
  { body: '#7ec850', dark: '#4a8c32', cheek: '#ffb3ba', eye: '#2d1b4e', accent: '#a3e635', size: 1 },
  { body: '#6bb840', dark: '#3d7a28', cheek: '#ffb3ba', eye: '#ff6b00', accent: '#fde047', size: 1.08 },
  { body: '#5aa830', dark: '#2f6018', cheek: '#ff9aa2', eye: '#dc2626', accent: '#94a3b8', size: 1.18 },
  { body: '#489820', dark: '#245010', cheek: '#ff8fab', eye: '#a855f7', accent: '#fbbf24', size: 1.28 },
  { body: '#387818', dark: '#1a4010', cheek: '#e879f9', eye: '#06b6d4', accent: '#c084fc', size: 1.4 },
];

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawCuteEyes(ctx, x, y, spacing, size, pupilColor = '#2d1b4e') {
  [-1, 1].forEach(side => {
    const ex = x + side * spacing;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(ex, y, size, size * 1.15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = pupilColor;
    ctx.beginPath();
    ctx.arc(ex + side * 1.5, y + 1, size * 0.55, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(ex + side * 2.5, y - size * 0.3, size * 0.22, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawSparkle(ctx, x, y, size, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y - size);
  ctx.lineTo(x, y + size);
  ctx.moveTo(x - size, y);
  ctx.lineTo(x + size, y);
  ctx.stroke();
  ctx.restore();
}

export function drawBattleBackground(ctx, w, h, frame) {
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#0c1424');
  sky.addColorStop(0.45, '#152238');
  sky.addColorStop(0.72, '#1a3040');
  sky.addColorStop(1, '#243838');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  for (let i = 0; i < 40; i++) {
    const sx = (i * 137 + frame * 0.15) % w;
    const sy = (i * 89) % (h * 0.55);
    const tw = 0.5 + Math.sin(frame * 0.03 + i) * 0.5;
    ctx.globalAlpha = 0.3 + tw * 0.5;
    ctx.beginPath();
    ctx.arc(sx, sy, 0.8 + (i % 3) * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  ctx.fillStyle = 'rgba(255,220,150,0.12)';
  ctx.beginPath();
  ctx.arc(w * 0.85, h * 0.12, 36, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,240,200,0.25)';
  ctx.beginPath();
  ctx.arc(w * 0.85, h * 0.12, 28, 0, Math.PI * 2);
  ctx.fill();

  const groundY = h * 0.78;
  ctx.fillStyle = '#2a4038';
  ctx.fillRect(0, groundY, w, h - groundY);
  ctx.fillStyle = '#345048';
  ctx.fillRect(0, groundY, w, 6);

  for (let i = 0; i < 12; i++) {
    const gx = (i * 67 + 20) % w;
    const gh = 8 + (i % 4) * 3;
    ctx.fillStyle = '#3d6b50';
    ctx.beginPath();
    ctx.moveTo(gx, groundY);
    ctx.quadraticCurveTo(gx + 6, groundY - gh, gx + 12, groundY);
    ctx.fill();
  }
}

export function drawChibiHero(ctx, x, y, frame, heroClass, animating) {
  const theme = CLASS_THEME[heroClass ?? 0] ?? CLASS_THEME[0];
  const bob = Math.sin(frame * 0.06) * 3;
  const lx = x + bob;
  const attack = animating && frame % 28 < 14;
  const lunge = attack ? 8 : 0;

  ctx.save();
  ctx.translate(lx + lunge, y);

  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(0, 52, 28, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = theme.cape;
  ctx.beginPath();
  ctx.moveTo(-8, 8);
  ctx.quadraticCurveTo(-22, 20, -18, 44);
  ctx.lineTo(8, 44);
  ctx.quadraticCurveTo(4, 20, 8, 8);
  ctx.fill();

  const bodyGrad = ctx.createLinearGradient(-16, 10, 16, 50);
  bodyGrad.addColorStop(0, theme.armor);
  bodyGrad.addColorStop(1, theme.dark);
  ctx.fillStyle = bodyGrad;
  roundRect(ctx, -16, 12, 32, 34, 10);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = theme.accent;
  roundRect(ctx, -12, 18, 24, 8, 4);
  ctx.fill();

  ctx.fillStyle = theme.skin;
  ctx.beginPath();
  ctx.arc(0, -8, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = theme.hair;
  ctx.beginPath();
  ctx.arc(0, -14, 22, Math.PI, Math.PI * 2);
  ctx.fill();
  if (heroClass === 0) {
    ctx.fillStyle = theme.accent;
    ctx.beginPath();
    ctx.moveTo(-4, -28);
    ctx.lineTo(0, -38);
    ctx.lineTo(4, -28);
    ctx.fill();
  }
  if (heroClass === 1) {
    ctx.fillStyle = theme.armor;
    ctx.beginPath();
    ctx.moveTo(-20, -6);
    ctx.quadraticCurveTo(-24, 4, -18, 10);
    ctx.lineTo(-14, -2);
    ctx.fill();
  }

  drawCuteEyes(ctx, 0, -6, 9, 6);

  ctx.strokeStyle = '#c97a6a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 2, 5, 0.2, Math.PI - 0.2);
  ctx.stroke();

  ctx.fillStyle = '#ffb3ba';
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.ellipse(-12, 0, 5, 3, 0, 0, Math.PI * 2);
  ctx.ellipse(12, 0, 5, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  const swordAngle = attack ? -0.8 : -0.3;
  ctx.save();
  ctx.translate(18, 8);
  ctx.rotate(swordAngle);
  const blade = ctx.createLinearGradient(0, -40, 0, 0);
  blade.addColorStop(0, '#fff');
  blade.addColorStop(0.5, theme.accent);
  blade.addColorStop(1, '#ccc');
  ctx.fillStyle = blade;
  ctx.fillRect(-3, -42, 6, 36);
  ctx.fillStyle = '#8b6914';
  ctx.fillRect(-5, -4, 10, 6);
  ctx.fillStyle = theme.accent;
  ctx.beginPath();
  ctx.arc(0, 4, 5, 0, Math.PI * 2);
  ctx.fill();
  if (attack) {
    ctx.shadowColor = theme.accent;
    ctx.shadowBlur = 16;
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, -20, 30, -1.2, -0.4);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
  ctx.restore();

  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = 'bold 10px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(CLASSES[heroClass ?? 0]?.slice(0, 5).toUpperCase() || 'HERO', 0, 68);
  ctx.restore();
}

export function drawChibiZombie(ctx, x, y, frame, tier, animating) {
  const z = TIER_ZOMBIES[tier] ?? TIER_ZOMBIES[0];
  const wobble = animating ? Math.sin(frame * 0.2) * 6 : Math.sin(frame * 0.04) * 2;
  const s = z.size;

  ctx.save();
  ctx.translate(x + wobble, y);
  ctx.scale(s, s);

  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath();
  ctx.ellipse(0, 54, 30, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = z.dark;
  ctx.beginPath();
  ctx.ellipse(-22, 18, 8, 14, -0.4, 0, Math.PI * 2);
  ctx.ellipse(22, 18, 8, 14, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = z.body;
  ctx.beginPath();
  ctx.ellipse(-20, 16, 7, 12, -0.4, 0, Math.PI * 2);
  ctx.ellipse(20, 16, 7, 12, 0.4, 0, Math.PI * 2);
  ctx.fill();

  const bodyGrad = ctx.createLinearGradient(-20, 8, 20, 48);
  bodyGrad.addColorStop(0, z.body);
  bodyGrad.addColorStop(1, z.dark);
  ctx.fillStyle = bodyGrad;
  roundRect(ctx, -20, 8, 40, 38, 14);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.12)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = z.body;
  ctx.beginPath();
  ctx.arc(0, -14, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = z.dark;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = z.dark;
  ctx.beginPath();
  ctx.arc(0, -20, 24, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = z.body;
  ctx.beginPath();
  ctx.moveTo(-8, -28);
  ctx.lineTo(-4, -36);
  ctx.lineTo(0, -28);
  ctx.lineTo(4, -38);
  ctx.lineTo(8, -28);
  ctx.fill();

  if (tier >= 3) {
    ctx.strokeStyle = z.accent;
    ctx.lineWidth = 2;
    ctx.shadowColor = z.accent;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(0, 8, 38, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  if (tier === 4) {
    ctx.fillStyle = z.accent;
    ctx.beginPath();
    ctx.moveTo(-10, -38);
    ctx.lineTo(0, -48);
    ctx.lineTo(10, -38);
    ctx.fill();
    drawSparkle(ctx, 18, -30, 5, z.accent);
  }

  drawCuteEyes(ctx, 0, -12, 10, tier >= 2 ? 5 : 6, z.eye);

  ctx.fillStyle = z.cheek;
  ctx.globalAlpha = 0.55;
  ctx.beginPath();
  ctx.ellipse(-14, -4, 6, 4, 0, 0, Math.PI * 2);
  ctx.ellipse(14, -4, 6, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.fillStyle = z.dark;
  ctx.beginPath();
  ctx.arc(0, 0, 4, 0, Math.PI);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.moveTo(-6, 2);
  ctx.lineTo(-3, 6);
  ctx.lineTo(0, 2);
  ctx.lineTo(3, 6);
  ctx.lineTo(6, 2);
  ctx.fill();

  ctx.fillStyle = z.dark;
  ctx.beginPath();
  ctx.ellipse(-10, 48, 8, 5, 0, 0, Math.PI * 2);
  ctx.ellipse(10, 48, 8, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ccc';
  ctx.font = 'bold 10px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(ZOMBIE_TIERS[tier]?.name || 'Zombie', 0, 72);
  ctx.restore();
}

export function drawWeaponFx(ctx, hx, zx, y, frame, animating, accent = '#ffc940') {
  if (!animating || frame % 28 >= 14) return;
  const t = (frame % 28) / 14;
  ctx.save();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 3;
  ctx.shadowColor = accent;
  ctx.shadowBlur = 14;
  ctx.globalAlpha = 1 - t * 0.5;
  ctx.beginPath();
  ctx.moveTo(hx + 28, y - 10);
  ctx.quadraticCurveTo((hx + zx) / 2, y - 40, zx - 15, y - 5);
  ctx.stroke();

  for (let i = 0; i < 8; i++) {
    const px = hx + 30 + (zx - hx - 40) * (i / 8);
    const py = y - 25 + Math.sin(i * 1.2 + frame * 0.3) * 15;
    drawSparkle(ctx, px, py, 3 + (i % 2), accent);
  }
  ctx.restore();
}
