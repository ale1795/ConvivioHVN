/**
 * Festive Christmas AI Backgrounds
 * Renders rich, painterly, studio-lit holiday backdrops onto cached high-res offscreen
 * canvases (instant loading, zero broken assets) while also supporting optional custom
 * user-provided images placed in assets/backgrounds/.
 */

function seededRandom(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function drawBokehOrbs(ctx, w, h, count, palette, seed, minR = 0.015, maxR = 0.075) {
  const rand = seededRandom(seed);
  const u = Math.min(w, h);
  ctx.save();
  for (let i = 0; i < count; i++) {
    const x = rand() * w;
    const y = rand() * h;
    const r = u * (minR + rand() * (maxR - minR));
    const color = palette[Math.floor(rand() * palette.length)];
    const alpha = 0.08 + rand() * 0.28;

    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, `rgba(${color}, ${alpha})`);
    grad.addColorStop(0.65, `rgba(${color}, ${alpha * 0.65})`);
    grad.addColorStop(0.92, `rgba(${color}, ${alpha * 0.3})`);
    grad.addColorStop(1, `rgba(${color}, 0)`);

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawStylizedTree(ctx, cx, baseY, height, width, seed) {
  const rand = seededRandom(seed);
  ctx.save();

  // Layered evergreen boughs
  const tiers = 6;
  for (let i = 0; i < tiers; i++) {
    const t = i / (tiers - 1);
    const ty = baseY - height + t * height * 0.82;
    const tw = width * (0.24 + t * 0.76);
    const th = height * (0.24 + t * 0.05);

    const g = ctx.createLinearGradient(cx, ty, cx, ty + th);
    g.addColorStop(0, '#13462c');
    g.addColorStop(1, '#072214');
    ctx.fillStyle = g;

    ctx.beginPath();
    ctx.moveTo(cx, ty);
    ctx.lineTo(cx - tw * 0.52, ty + th);
    ctx.quadraticCurveTo(cx, ty + th * 0.88, cx + tw * 0.52, ty + th);
    ctx.closePath();
    ctx.fill();
  }

  // Warm fairy lights & baubles across tree
  for (let i = 0; i < 42; i++) {
    const frac = 0.08 + rand() * 0.88;
    const y = baseY - height + frac * height;
    const spread = (width * 0.44) * frac;
    const x = cx + (rand() * 2 - 1) * spread;
    const isGold = rand() > 0.32;
    const glowR = width * (0.045 + rand() * 0.055);

    const g = ctx.createRadialGradient(x, y, 0, x, y, glowR);
    if (isGold) {
      g.addColorStop(0, 'rgba(255, 240, 180, 0.95)');
      g.addColorStop(0.4, 'rgba(255, 195, 78, 0.45)');
      g.addColorStop(1, 'rgba(255, 180, 60, 0)');
    } else {
      g.addColorStop(0, 'rgba(255, 110, 120, 0.9)');
      g.addColorStop(0.45, 'rgba(215, 38, 56, 0.4)');
      g.addColorStop(1, 'rgba(215, 38, 56, 0)');
    }
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, glowR, 0, Math.PI * 2);
    ctx.fill();
  }

  // Glowing tree topper star
  const starY = baseY - height;
  const starGlow = ctx.createRadialGradient(cx, starY, 0, cx, starY, width * 0.24);
  starGlow.addColorStop(0, 'rgba(255, 248, 210, 1)');
  starGlow.addColorStop(0.3, 'rgba(255, 212, 102, 0.65)');
  starGlow.addColorStop(1, 'rgba(255, 200, 80, 0)');
  ctx.fillStyle = starGlow;
  ctx.beginPath();
  ctx.arc(cx, starY, width * 0.24, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function renderFireplaceBackdrop(ctx, w, h) {
  // Deep cozy parlor gradient
  const bg = ctx.createRadialGradient(w * 0.56, h * 0.68, w * 0.06, w * 0.5, h * 0.5, h * 0.95);
  bg.addColorStop(0, '#7c3217');
  bg.addColorStop(0.35, '#421912');
  bg.addColorStop(0.75, '#1d0e0d');
  bg.addColorStop(1, '#0e0708');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Wooden mantle & stone hearth on right/center
  const hearthX = w * 0.34;
  const hearthY = h * 0.44;
  const hearthW = w * 0.58;
  const hearthH = h * 0.56;

  ctx.fillStyle = '#241411';
  ctx.fillRect(hearthX, hearthY, hearthW, hearthH);

  // Mantle shelf
  const mantleG = ctx.createLinearGradient(0, hearthY - h * 0.035, 0, hearthY + h * 0.02);
  mantleG.addColorStop(0, '#5a3121');
  mantleG.addColorStop(1, '#2b140d');
  ctx.fillStyle = mantleG;
  ctx.fillRect(hearthX - w * 0.04, hearthY - h * 0.03, hearthW + w * 0.08, h * 0.05);

  // Firebox opening
  const fbX = hearthX + hearthW * 0.16;
  const fbY = hearthY + hearthH * 0.24;
  const fbW = hearthW * 0.68;
  const fbH = hearthH * 0.65;
  ctx.fillStyle = '#120705';
  ctx.beginPath();
  ctx.roundRect(fbX, fbY, fbW, fbH, [w * 0.06, w * 0.06, 0, 0]);
  ctx.fill();

  // Warm fire glow
  const fireCx = fbX + fbW * 0.5;
  const fireCy = fbY + fbH * 0.72;
  const fireGlow = ctx.createRadialGradient(fireCx, fireCy, w * 0.02, fireCx, fireCy, w * 0.48);
  fireGlow.addColorStop(0, 'rgba(255, 240, 170, 0.95)');
  fireGlow.addColorStop(0.22, 'rgba(255, 145, 42, 0.72)');
  fireGlow.addColorStop(0.55, 'rgba(205, 58, 18, 0.32)');
  fireGlow.addColorStop(1, 'rgba(180, 40, 10, 0)');
  ctx.fillStyle = fireGlow;
  ctx.fillRect(0, 0, w, h);

  // Stylized flame tongues
  const flames = [
    { dx: -0.06, h: 0.18, w: 0.075, c: 'rgba(255, 118, 28, 0.85)' },
    { dx: 0.05, h: 0.16, w: 0.07, c: 'rgba(255, 140, 38, 0.85)' },
    { dx: 0, h: 0.22, w: 0.085, c: 'rgba(255, 206, 92, 0.92)' },
  ];
  for (const f of flames) {
    ctx.fillStyle = f.c;
    ctx.beginPath();
    ctx.moveTo(fireCx + w * f.dx - w * f.w, fireCy + h * 0.04);
    ctx.quadraticCurveTo(fireCx + w * f.dx - w * f.w * 0.3, fireCy - h * f.h * 0.7, fireCx + w * f.dx, fireCy - h * f.h);
    ctx.quadraticCurveTo(fireCx + w * f.dx + w * f.w * 0.3, fireCy - h * f.h * 0.7, fireCx + w * f.dx + w * f.w, fireCy + h * 0.04);
    ctx.closePath();
    ctx.fill();
  }

  // Hanging red Christmas stockings on mantle
  const stockingXs = [hearthX + hearthW * 0.2, hearthX + hearthW * 0.48, hearthX + hearthW * 0.76];
  for (const sx of stockingXs) {
    ctx.fillStyle = '#b41e2d';
    ctx.beginPath();
    ctx.roundRect(sx - w * 0.028, hearthY + h * 0.015, w * 0.056, h * 0.11, w * 0.02);
    ctx.fill();
    ctx.fillStyle = '#f5eedc';
    ctx.fillRect(sx - w * 0.032, hearthY + h * 0.012, w * 0.064, h * 0.026);
  }

  // Decorated Christmas tree on the left
  drawStylizedTree(ctx, w * 0.17, h * 0.96, h * 0.76, w * 0.56, 101);

  // Creamy warm golden bokeh lights across scene
  drawBokehOrbs(
    ctx,
    w,
    h,
    38,
    ['255, 224, 140', '255, 178, 86', '255, 245, 200', '230, 86, 76'],
    202,
    0.018,
    0.085
  );
}

function renderWinterVillageBackdrop(ctx, w, h) {
  // Twilight alpine winter sky
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#07142b');
  sky.addColorStop(0.42, '#132d56');
  sky.addColorStop(0.72, '#275180');
  sky.addColorStop(1, '#dcebf7');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // Soft glowing full moon
  const moonX = w * 0.76;
  const moonY = h * 0.18;
  const moonGlow = ctx.createRadialGradient(moonX, moonY, w * 0.03, moonX, moonY, w * 0.34);
  moonGlow.addColorStop(0, 'rgba(255, 251, 232, 0.95)');
  moonGlow.addColorStop(0.2, 'rgba(218, 236, 255, 0.45)');
  moonGlow.addColorStop(1, 'rgba(180, 215, 255, 0)');
  ctx.fillStyle = moonGlow;
  ctx.beginPath();
  ctx.arc(moonX, moonY, w * 0.34, 0, Math.PI * 2);
  ctx.fill();

  // Twinkling stars
  const rand = seededRandom(303);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  for (let i = 0; i < 65; i++) {
    const sx = rand() * w;
    const sy = rand() * h * 0.48;
    const sr = 1 + rand() * 2.2;
    ctx.globalAlpha = 0.35 + rand() * 0.65;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Distant snowy mountain peaks
  ctx.fillStyle = '#1d3c67';
  ctx.beginPath();
  ctx.moveTo(0, h * 0.64);
  ctx.lineTo(w * 0.22, h * 0.44);
  ctx.lineTo(w * 0.46, h * 0.59);
  ctx.lineTo(w * 0.74, h * 0.41);
  ctx.lineTo(w, h * 0.58);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  // Rolling snowy hillside
  const hill = ctx.createLinearGradient(0, h * 0.58, 0, h);
  hill.addColorStop(0, '#96bbd9');
  hill.addColorStop(0.45, '#d3e6f5');
  hill.addColorStop(1, '#eef7ff');
  ctx.fillStyle = hill;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.66);
  ctx.quadraticCurveTo(w * 0.3, h * 0.58, w * 0.56, h * 0.66);
  ctx.quadraticCurveTo(w * 0.82, h * 0.72, w, h * 0.63);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  // Cozy wooden alpine chalets with warm glowing windows
  const chalets = [
    { x: w * 0.14, y: h * 0.66, cw: w * 0.22, ch: h * 0.14 },
    { x: w * 0.74, y: h * 0.69, cw: w * 0.24, ch: h * 0.15 },
  ];
  for (const c of chalets) {
    // Cabin body
    ctx.fillStyle = '#33221c';
    ctx.fillRect(c.x - c.cw / 2, c.y - c.ch, c.cw, c.ch);
    // Snowy pitched roof
    ctx.fillStyle = '#f5faff';
    ctx.beginPath();
    ctx.moveTo(c.x - c.cw * 0.64, c.y - c.ch + h * 0.01);
    ctx.lineTo(c.x, c.y - c.ch * 1.65);
    ctx.lineTo(c.x + c.cw * 0.64, c.y - c.ch + h * 0.01);
    ctx.closePath();
    ctx.fill();

    // Glowing amber windows
    const winW = c.cw * 0.22;
    const winH = c.ch * 0.34;
    for (const wx of [c.x - c.cw * 0.28, c.x + c.cw * 0.06]) {
      const wy = c.y - c.ch * 0.62;
      const wg = ctx.createRadialGradient(
        wx + winW / 2,
        wy + winH / 2,
        2,
        wx + winW / 2,
        wy + winH / 2,
        c.cw * 0.55
      );
      wg.addColorStop(0, 'rgba(255, 215, 118, 0.7)');
      wg.addColorStop(1, 'rgba(255, 190, 80, 0)');
      ctx.fillStyle = wg;
      ctx.beginPath();
      ctx.arc(wx + winW / 2, wy + winH / 2, c.cw * 0.55, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffe292';
      ctx.fillRect(wx, wy, winW, winH);
    }
  }

  // Snow-frosted pine trees along edges
  drawStylizedTree(ctx, w * 0.06, h * 0.88, h * 0.36, w * 0.26, 311);
  drawStylizedTree(ctx, w * 0.93, h * 0.9, h * 0.4, w * 0.28, 312);

  // Dreamy snowfall bokeh
  drawBokehOrbs(ctx, w, h, 55, ['255, 255, 255', '210, 236, 255', '255, 232, 170'], 315, 0.006, 0.045);
}

function renderNorthernLightsBackdrop(ctx, w, h) {
  // Deep Arctic night sky
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#020912');
  sky.addColorStop(0.5, '#071b26');
  sky.addColorStop(0.82, '#0b2c36');
  sky.addColorStop(1, '#123945');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // Crisp starfield
  const rand = seededRandom(404);
  for (let i = 0; i < 110; i++) {
    ctx.fillStyle = `rgba(235, 250, 255, ${0.25 + rand() * 0.75})`;
    ctx.beginPath();
    ctx.arc(rand() * w, rand() * h * 0.68, 0.8 + rand() * 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Sweeping Aurora Borealis ribbons
  const ribbons = [
    { yBase: h * 0.28, amp: h * 0.09, colors: ['rgba(30, 240, 175, 0.52)', 'rgba(20, 180, 220, 0.25)', 'rgba(130, 75, 255, 0)'] },
    { yBase: h * 0.4, amp: h * 0.075, colors: ['rgba(85, 255, 190, 0.42)', 'rgba(110, 80, 235, 0.24)', 'rgba(20, 180, 160, 0)'] },
    { yBase: h * 0.2, amp: h * 0.06, colors: ['rgba(145, 95, 255, 0.35)', 'rgba(42, 232, 186, 0.2)', 'rgba(42, 232, 186, 0)'] },
  ];

  for (const r of ribbons) {
    ctx.save();
    const grad = ctx.createLinearGradient(0, r.yBase - h * 0.22, 0, r.yBase + h * 0.12);
    grad.addColorStop(0, r.colors[2]);
    grad.addColorStop(0.52, r.colors[1]);
    grad.addColorStop(0.85, r.colors[0]);
    grad.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, r.yBase + h * 0.14);
    for (let x = 0; x <= w; x += w / 24) {
      const wave = Math.sin((x / w) * Math.PI * 2.2 + r.yBase) * r.amp;
      ctx.lineTo(x, r.yBase + wave);
    }
    ctx.lineTo(w, r.yBase - h * 0.24);
    ctx.lineTo(0, r.yBase - h * 0.24);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Snowy horizon glow
  const snowHill = ctx.createLinearGradient(0, h * 0.72, 0, h);
  snowHill.addColorStop(0, '#143c47');
  snowHill.addColorStop(0.4, '#4b8a99');
  snowHill.addColorStop(1, '#bfe6ee');
  ctx.fillStyle = snowHill;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.78);
  ctx.quadraticCurveTo(w * 0.5, h * 0.7, w, h * 0.8);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  // Silhouette evergreen treeline
  ctx.fillStyle = '#041419';
  for (let i = 0; i < 18; i++) {
    const tx = (i / 17) * w;
    const th = h * (0.14 + (i % 3) * 0.045);
    const tw = w * 0.095;
    const ty = h * 0.8;
    ctx.beginPath();
    ctx.moveTo(tx, ty - th);
    ctx.lineTo(tx - tw / 2, ty + h * 0.04);
    ctx.lineTo(tx + tw / 2, ty + h * 0.04);
    ctx.closePath();
    ctx.fill();
  }

  // Soft icy sparkles
  drawBokehOrbs(ctx, w, h, 36, ['120, 255, 215', '255, 255, 255', '150, 195, 255'], 410, 0.008, 0.045);
}

function renderSantaWorkshopBackdrop(ctx, w, h) {
  // Warm crimson & chestnut wood workshop backdrop
  const bg = ctx.createRadialGradient(w * 0.5, h * 0.42, w * 0.05, w * 0.5, h * 0.5, h * 0.85);
  bg.addColorStop(0, '#7a251c');
  bg.addColorStop(0.5, '#471513');
  bg.addColorStop(1, '#1d090a');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Subtle vertical wood paneling lines
  ctx.strokeStyle = 'rgba(255, 215, 160, 0.06)';
  ctx.lineWidth = Math.max(2, w * 0.003);
  for (let x = 0; x < w; x += w / 10) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }

  // Festive draped golden light garland at top
  const count = 14;
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    const x = t * w;
    const y = h * 0.08 + Math.sin(t * Math.PI) * h * 0.11;
    const r = w * 0.085;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(255, 242, 184, 0.92)');
    g.addColorStop(0.35, 'rgba(255, 196, 82, 0.42)');
    g.addColorStop(1, 'rgba(255, 180, 60, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Stacked wrapped Christmas gifts along bottom corners
  const drawGift = (gx, gy, gw, gh, bodyColor, ribbonColor) => {
    ctx.save();
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.roundRect(gx, gy, gw, gh, gw * 0.06);
    ctx.fill();
    // Ribbon cross
    ctx.fillStyle = ribbonColor;
    ctx.fillRect(gx + gw * 0.42, gy, gw * 0.16, gh);
    ctx.fillRect(gx, gy + gh * 0.4, gw, gh * 0.16);
    // Lid highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.fillRect(gx, gy, gw, gh * 0.14);
    ctx.restore();
  };

  drawGift(w * 0.02, h * 0.74, w * 0.24, h * 0.26, '#c72636', '#f2cf78');
  drawGift(w * 0.16, h * 0.82, w * 0.2, h * 0.18, '#1a6b43', '#f5e1a4');
  drawGift(w * 0.74, h * 0.73, w * 0.24, h * 0.27, '#18633d', '#e83e4c');
  drawGift(w * 0.64, h * 0.83, w * 0.2, h * 0.17, '#cf9430', '#b81d2c');

  // Warm fairy-light bokeh orbs
  drawBokehOrbs(
    ctx,
    w,
    h,
    46,
    ['255, 228, 145', '255, 180, 74', '235, 76, 88', '90, 210, 145'],
    505,
    0.02,
    0.09
  );
}

function renderGoldenBokehBackdrop(ctx, w, h) {
  // Rich ruby-crimson & deep garnet velvet studio backdrop
  const bg = ctx.createRadialGradient(w * 0.5, h * 0.44, w * 0.04, w * 0.5, h * 0.5, h * 0.88);
  bg.addColorStop(0, '#9d1b2b');
  bg.addColorStop(0.48, '#5f0d19');
  bg.addColorStop(0.85, '#2f060d');
  bg.addColorStop(1, '#190307');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Lush layered golden champagne bokeh orbs
  drawBokehOrbs(
    ctx,
    w,
    h,
    64,
    ['255, 232, 152', '246, 198, 92', '255, 248, 214', '255, 156, 128'],
    606,
    0.015,
    0.11
  );

  // Subtle evergreen & gold shimmer framing outer edges
  const cornerGlow = ctx.createRadialGradient(w * 0.5, h * 0.5, w * 0.25, w * 0.5, h * 0.5, h * 0.78);
  cornerGlow.addColorStop(0, 'rgba(255, 215, 120, 0.08)');
  cornerGlow.addColorStop(1, 'rgba(0, 0, 0, 0.36)');
  ctx.fillStyle = cornerGlow;
  ctx.fillRect(0, 0, w, h);
}

export const CHRISTMAS_BACKGROUNDS = [
  {
    id: 'original',
    name: 'Original',
    type: 'none',
    icon: '📷',
  },
  {
    id: 'blur',
    name: 'Bokeh Suave',
    type: 'blur',
    icon: '✨',
  },
  {
    id: 'fireplace',
    name: 'Chimenea',
    type: 'scene',
    render: renderFireplaceBackdrop,
  },
  {
    id: 'winter-village',
    name: 'Aldea Nevada',
    type: 'scene',
    render: renderWinterVillageBackdrop,
  },
  {
    id: 'northern-lights',
    name: 'Aurora Boreal',
    type: 'scene',
    render: renderNorthernLightsBackdrop,
  },
  {
    id: 'santa-workshop',
    name: 'Taller Santa',
    type: 'scene',
    render: renderSantaWorkshopBackdrop,
  },
  {
    id: 'golden-bokeh',
    name: 'Destellos',
    type: 'scene',
    render: renderGoldenBokehBackdrop,
  },
];

// Cache rendered high-res canvases by `${id}_${w}x${h}` for silky 60fps compositing
const sceneCache = new Map();

export function getBackgroundCanvas(bg, w, h) {
  if (!bg || bg.type !== 'scene' || typeof bg.render !== 'function') return null;
  const key = `${bg.id}_${w}x${h}`;
  if (sceneCache.has(key)) return sceneCache.get(key);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  bg.render(ctx, w, h);

  // Keep cache compact
  if (sceneCache.size > 18) {
    const firstKey = sceneCache.keys().next().value;
    sceneCache.delete(firstKey);
  }
  sceneCache.set(key, canvas);
  return canvas;
}

export function drawBackgroundCover(ctx, bg, w, h) {
  const cached = getBackgroundCanvas(bg, w, h);
  if (cached) {
    ctx.drawImage(cached, 0, 0, w, h);
  }
}

export function renderBackgroundThumbnail(bg) {
  const canvas = document.createElement('canvas');
  canvas.width = 120;
  canvas.height = 120;
  const ctx = canvas.getContext('2d');
  if (bg.type === 'scene') {
    bg.render(ctx, 120, 120);
  } else if (bg.type === 'blur') {
    const g = ctx.createLinearGradient(0, 0, 120, 120);
    g.addColorStop(0, '#1e503b');
    g.addColorStop(1, '#0d261c');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 120, 120);
    drawBokehOrbs(ctx, 120, 120, 14, ['255, 232, 160', '255, 255, 255'], 99, 0.08, 0.24);
  }
  return canvas;
}
