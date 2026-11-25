/**
 * Procedural high-resolution Christmas Frames (Canvas 2D)
 * Scales cleanly to any aspect ratio (3:4, 1:1, 9:16) and thumbnail size.
 */

function drawFourPointStar(ctx, cx, cy, outerR, innerR, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (i * Math.PI) / 4;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawSnowflake(ctx, cx, cy, radius, color, alpha = 0.85) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = color;
  ctx.globalAlpha = alpha;
  ctx.lineCap = 'round';
  ctx.lineWidth = Math.max(1.2, radius * 0.085);

  for (let i = 0; i < 6; i++) {
    ctx.rotate(Math.PI / 3);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -radius);
    ctx.stroke();

    // Inner & outer branches
    for (const frac of [0.46, 0.74]) {
      const y = -radius * frac;
      const bLen = radius * (frac === 0.46 ? 0.28 : 0.22);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(-bLen * 0.7, y - bLen * 0.65);
      ctx.moveTo(0, y);
      ctx.lineTo(bLen * 0.7, y - bLen * 0.65);
      ctx.stroke();
    }
  }

  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.14, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

function drawPineBranch(ctx, x1, y1, x2, y2, u) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx);
  const steps = Math.max(10, Math.floor(len / (u * 0.011)));

  ctx.save();
  ctx.translate(x1, y1);
  ctx.rotate(angle);

  // Branch stem
  ctx.strokeStyle = '#3b2416';
  ctx.lineWidth = Math.max(1.5, u * 0.006);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(len, 0);
  ctx.stroke();

  const colors = ['#0c3a24', '#145334', '#1d6b43', '#278252'];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const bx = t * len;
    const taper = 1 - t * 0.42;
    const nLen = u * 0.042 * taper;
    ctx.lineWidth = Math.max(1.1, u * 0.0042);

    for (const side of [-1, 1]) {
      ctx.strokeStyle = colors[(i + (side > 0 ? 1 : 0)) % colors.length];
      ctx.beginPath();
      ctx.moveTo(bx, 0);
      ctx.lineTo(bx + nLen * 0.55, side * nLen * 0.85);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawHollyCluster(ctx, cx, cy, scale) {
  ctx.save();
  ctx.translate(cx, cy);

  // Two stylized holly leaves
  const leafAngles = [-0.65, 0.55];
  for (const ang of leafAngles) {
    ctx.save();
    ctx.rotate(ang);
    const grad = ctx.createLinearGradient(0, 0, scale * 1.4, 0);
    grad.addColorStop(0, '#145432');
    grad.addColorStop(1, '#26804d');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(scale * 0.5, -scale * 0.45, scale * 1.35, 0);
    ctx.quadraticCurveTo(scale * 0.5, scale * 0.45, 0, 0);
    ctx.fill();
    ctx.strokeStyle = 'rgba(235, 199, 117, 0.35)';
    ctx.lineWidth = Math.max(1, scale * 0.04);
    ctx.beginPath();
    ctx.moveTo(scale * 0.1, 0);
    ctx.lineTo(scale * 1.15, 0);
    ctx.stroke();
    ctx.restore();
  }

  // Three glossy red berries
  const berries = [
    { x: -scale * 0.16, y: -scale * 0.12 },
    { x: scale * 0.18, y: -scale * 0.08 },
    { x: 0, y: scale * 0.15 },
  ];
  for (const b of berries) {
    const r = scale * 0.22;
    const bg = ctx.createRadialGradient(b.x - r * 0.35, b.y - r * 0.35, r * 0.1, b.x, b.y, r);
    bg.addColorStop(0, '#ff6e78');
    bg.addColorStop(0.5, '#cf1f30');
    bg.addColorStop(1, '#7c0c17');
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawHangingOrnament(ctx, x, topY, stringLen, radius, palette) {
  ctx.save();
  // Gold string
  ctx.strokeStyle = 'rgba(242, 211, 138, 0.85)';
  ctx.lineWidth = Math.max(1.2, radius * 0.08);
  ctx.beginPath();
  ctx.moveTo(x, topY);
  ctx.lineTo(x, topY + stringLen);
  ctx.stroke();

  const cy = topY + stringLen + radius;

  // Gold cap
  ctx.fillStyle = '#e8c166';
  ctx.fillRect(x - radius * 0.24, cy - radius * 1.12, radius * 0.48, radius * 0.24);

  // Bauble body
  const grad = ctx.createRadialGradient(
    x - radius * 0.34,
    cy - radius * 0.34,
    radius * 0.12,
    x,
    cy,
    radius
  );
  grad.addColorStop(0, palette[0]);
  grad.addColorStop(0.55, palette[1]);
  grad.addColorStop(1, palette[2]);

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  // Decorative gold equatorial band
  ctx.strokeStyle = 'rgba(250, 232, 178, 0.55)';
  ctx.lineWidth = Math.max(1, radius * 0.1);
  ctx.beginPath();
  ctx.arc(x, cy, radius * 0.86, 0.25, Math.PI - 0.25);
  ctx.stroke();

  // Specular highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.42)';
  ctx.beginPath();
  ctx.ellipse(
    x - radius * 0.32,
    cy - radius * 0.32,
    radius * 0.22,
    radius * 0.13,
    -Math.PI / 4,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.restore();
}

export const CHRISTMAS_FRAMES = [
  {
    id: 'none',
    name: 'Sin marco',
    draw() {},
  },
  {
    id: 'wreath',
    name: 'Guirnalda',
    draw(ctx, w, h) {
      const u = Math.min(w, h);
      const pad = u * 0.036;

      ctx.save();

      // Subtle dark festive vignette at bottom for caption readability
      const botGrad = ctx.createLinearGradient(0, h * 0.78, 0, h);
      botGrad.addColorStop(0, 'rgba(6, 20, 14, 0)');
      botGrad.addColorStop(1, 'rgba(6, 20, 14, 0.76)');
      ctx.fillStyle = botGrad;
      ctx.fillRect(0, h * 0.78, w, h * 0.22);

      // Elegant double gold inner frame
      ctx.strokeStyle = 'rgba(238, 204, 122, 0.85)';
      ctx.lineWidth = Math.max(2, u * 0.0055);
      ctx.strokeRect(pad, pad, w - pad * 2, h - pad * 2);

      ctx.strokeStyle = 'rgba(238, 204, 122, 0.4)';
      ctx.lineWidth = Math.max(1, u * 0.0025);
      ctx.strokeRect(pad * 1.45, pad * 1.45, w - pad * 2.9, h - pad * 2.9);

      // Hanging baubles across top
      drawHangingOrnament(ctx, w * 0.14, 0, h * 0.075, u * 0.038, ['#ff7e88', '#cc1e30', '#6d0914']);
      drawHangingOrnament(ctx, w * 0.25, 0, h * 0.045, u * 0.027, ['#fff3c4', '#e3b24c', '#8c6115']);
      drawHangingOrnament(ctx, w * 0.75, 0, h * 0.052, u * 0.029, ['#fff3c4', '#e3b24c', '#8c6115']);
      drawHangingOrnament(ctx, w * 0.86, 0, h * 0.082, u * 0.04, ['#ff7e88', '#cc1e30', '#6d0914']);

      // Pine boughs along top corners & top edge
      drawPineBranch(ctx, -u * 0.02, u * 0.03, w * 0.42, u * 0.04, u);
      drawPineBranch(ctx, w + u * 0.02, u * 0.03, w * 0.58, u * 0.04, u);
      drawPineBranch(ctx, u * 0.02, -u * 0.01, u * 0.045, h * 0.24, u);
      drawPineBranch(ctx, w - u * 0.02, -u * 0.01, w - u * 0.045, h * 0.24, u);

      // Holly berry clusters in corners
      drawHollyCluster(ctx, pad * 1.35, pad * 1.35, u * 0.052);
      ctx.save();
      ctx.translate(w - pad * 1.35, pad * 1.35);
      ctx.scale(-1, 1);
      drawHollyCluster(ctx, 0, 0, u * 0.052);
      ctx.restore();

      drawHollyCluster(ctx, pad * 1.4, h - pad * 1.4, u * 0.045);
      ctx.save();
      ctx.translate(w - pad * 1.4, h - pad * 1.4);
      ctx.scale(-1, 1);
      drawHollyCluster(ctx, 0, 0, u * 0.045);
      ctx.restore();

      // Bottom festive greeting
      const fontSize = Math.round(u * 0.064);
      ctx.font = `700 ${fontSize}px "Playfair Display", Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fae4aa';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.72)';
      ctx.shadowBlur = u * 0.022;
      ctx.fillText('¡Feliz Navidad!', w / 2, h - pad * 2.15);

      // Flanking stars
      ctx.shadowBlur = 0;
      drawFourPointStar(ctx, w / 2 - u * 0.27, h - pad * 2.18, u * 0.02, u * 0.007, '#fae4aa');
      drawFourPointStar(ctx, w / 2 + u * 0.27, h - pad * 2.18, u * 0.02, u * 0.007, '#fae4aa');

      ctx.restore();
    },
  },
  {
    id: 'frost',
    name: 'Nieve y Cristal',
    draw(ctx, w, h) {
      const u = Math.min(w, h);
      const pad = u * 0.038;

      ctx.save();

      // Translucent frosty ice edge glow
      const edgeW = u * 0.13;
      const topG = ctx.createLinearGradient(0, 0, 0, edgeW);
      topG.addColorStop(0, 'rgba(195, 232, 255, 0.45)');
      topG.addColorStop(1, 'rgba(195, 232, 255, 0)');
      ctx.fillStyle = topG;
      ctx.fillRect(0, 0, w, edgeW);

      const botG = ctx.createLinearGradient(0, h - edgeW * 1.5, 0, h);
      botG.addColorStop(0, 'rgba(12, 34, 56, 0)');
      botG.addColorStop(1, 'rgba(12, 34, 56, 0.72)');
      ctx.fillStyle = botG;
      ctx.fillRect(0, h - edgeW * 1.5, w, edgeW * 1.5);

      const leftG = ctx.createLinearGradient(0, 0, edgeW * 0.85, 0);
      leftG.addColorStop(0, 'rgba(205, 238, 255, 0.34)');
      leftG.addColorStop(1, 'rgba(205, 238, 255, 0)');
      ctx.fillStyle = leftG;
      ctx.fillRect(0, 0, edgeW * 0.85, h);

      const rightG = ctx.createLinearGradient(w - edgeW * 0.85, 0, w, 0);
      rightG.addColorStop(0, 'rgba(205, 238, 255, 0)');
      rightG.addColorStop(1, 'rgba(205, 238, 255, 0.34)');
      ctx.fillStyle = rightG;
      ctx.fillRect(w - edgeW * 0.85, 0, edgeW * 0.85, h);

      // Crisp crystal border
      ctx.strokeStyle = 'rgba(230, 247, 255, 0.85)';
      ctx.lineWidth = Math.max(2, u * 0.005);
      ctx.strokeRect(pad, pad, w - pad * 2, h - pad * 2);

      // Snowflakes around corners and perimeter
      const flakes = [
        [w * 0.1, h * 0.08, u * 0.068, 0.92],
        [w * 0.22, h * 0.055, u * 0.032, 0.72],
        [w * 0.9, h * 0.085, u * 0.062, 0.9],
        [w * 0.79, h * 0.05, u * 0.028, 0.68],
        [w * 0.09, h * 0.91, u * 0.055, 0.86],
        [w * 0.91, h * 0.91, u * 0.058, 0.86],
        [w * 0.06, h * 0.45, u * 0.026, 0.58],
        [w * 0.94, h * 0.55, u * 0.028, 0.58],
      ];
      for (const [fx, fy, fr, fa] of flakes) {
        drawSnowflake(ctx, fx, fy, fr, '#eef9ff', fa);
      }

      // Scattered fine snow dots
      ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
      const dots = [
        [0.16, 0.14, 0.005],
        [0.34, 0.06, 0.004],
        [0.66, 0.07, 0.0045],
        [0.86, 0.16, 0.005],
        [0.14, 0.82, 0.0045],
        [0.85, 0.81, 0.005],
        [0.28, 0.92, 0.004],
        [0.72, 0.92, 0.004],
      ];
      for (const [dx, dy, dr] of dots) {
        ctx.beginPath();
        ctx.arc(w * dx, h * dy, u * dr, 0, Math.PI * 2);
        ctx.fill();
      }

      // Luminous caption
      const fontSize = Math.round(u * 0.06);
      ctx.font = `700 ${fontSize}px "Playfair Display", Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(130, 210, 255, 0.9)';
      ctx.shadowBlur = u * 0.03;
      ctx.fillText('Felices Fiestas', w / 2, h - pad * 2.2);

      ctx.restore();
    },
  },
  {
    id: 'lights',
    name: 'Luces Doradas',
    draw(ctx, w, h) {
      const u = Math.min(w, h);
      const pad = u * 0.04;

      ctx.save();

      // Warm evening scrim at top and bottom
      const topScrim = ctx.createLinearGradient(0, 0, 0, h * 0.22);
      topScrim.addColorStop(0, 'rgba(14, 10, 4, 0.55)');
      topScrim.addColorStop(1, 'rgba(14, 10, 4, 0)');
      ctx.fillStyle = topScrim;
      ctx.fillRect(0, 0, w, h * 0.22);

      const botScrim = ctx.createLinearGradient(0, h * 0.8, 0, h);
      botScrim.addColorStop(0, 'rgba(14, 10, 4, 0)');
      botScrim.addColorStop(1, 'rgba(14, 10, 4, 0.75)');
      ctx.fillStyle = botScrim;
      ctx.fillRect(0, h * 0.8, w, h * 0.2);

      // Two draped string-light cords across top
      const swags = [
        { x0: -10, y0: h * 0.035, cx: w * 0.35, cy: h * 0.145, x1: w + 10, y1: h * 0.055, count: 9 },
        { x0: -10, y0: h * 0.075, cx: w * 0.68, cy: h * 0.165, x1: w + 10, y1: h * 0.025, count: 8 },
      ];

      const bulbColors = ['#fff2be', '#ffd26a', '#ff9f7f', '#ffe89c'];

      for (const s of swags) {
        ctx.strokeStyle = 'rgba(35, 32, 26, 0.85)';
        ctx.lineWidth = Math.max(1.5, u * 0.004);
        ctx.beginPath();
        ctx.moveTo(s.x0, s.y0);
        ctx.quadraticCurveTo(s.cx, s.cy, s.x1, s.y1);
        ctx.stroke();

        for (let i = 1; i <= s.count; i++) {
          const t = i / (s.count + 1);
          const bx = (1 - t) * (1 - t) * s.x0 + 2 * (1 - t) * t * s.cx + t * t * s.x1;
          const by = (1 - t) * (1 - t) * s.y0 + 2 * (1 - t) * t * s.cy + t * t * s.y1;
          const color = bulbColors[i % bulbColors.length];

          // Outer glow halo
          const glowR = u * 0.052;
          const glow = ctx.createRadialGradient(bx, by + u * 0.012, 0, bx, by + u * 0.012, glowR);
          glow.addColorStop(0, 'rgba(255, 224, 130, 0.85)');
          glow.addColorStop(0.35, 'rgba(255, 194, 78, 0.35)');
          glow.addColorStop(1, 'rgba(255, 194, 78, 0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(bx, by + u * 0.012, glowR, 0, Math.PI * 2);
          ctx.fill();

          // Bulb glass
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.ellipse(bx, by + u * 0.012, u * 0.0095, u * 0.014, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Art-deco champagne gold corner brackets
      const cornerLen = u * 0.1;
      ctx.strokeStyle = '#f2d38a';
      ctx.lineWidth = Math.max(2, u * 0.0055);
      const corners = [
        [pad, pad, 1, 1],
        [w - pad, pad, -1, 1],
        [pad, h - pad, 1, -1],
        [w - pad, h - pad, -1, -1],
      ];
      for (const [cx, cy, dx, dy] of corners) {
        ctx.beginPath();
        ctx.moveTo(cx, cy + dy * cornerLen);
        ctx.lineTo(cx, cy);
        ctx.lineTo(cx + dx * cornerLen, cy);
        ctx.stroke();
      }

      // Twinkling sparkles
      drawFourPointStar(ctx, w * 0.11, h * 0.24, u * 0.022, u * 0.006, '#fff3c4');
      drawFourPointStar(ctx, w * 0.89, h * 0.22, u * 0.026, u * 0.007, '#ffe08a');
      drawFourPointStar(ctx, w * 0.12, h * 0.78, u * 0.02, u * 0.005, '#ffe08a');
      drawFourPointStar(ctx, w * 0.88, h * 0.76, u * 0.022, u * 0.006, '#fff3c4');

      // Bottom title with hairline dividers
      const ty = h - pad * 2.15;
      const fontSize = Math.round(u * 0.056);
      ctx.font = `700 ${fontSize}px "Playfair Display", Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fae4aa';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
      ctx.shadowBlur = u * 0.02;
      ctx.fillText('Navidad Mágica', w / 2, ty);

      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(242, 211, 138, 0.7)';
      ctx.lineWidth = Math.max(1.2, u * 0.003);
      ctx.beginPath();
      ctx.moveTo(pad * 2.4, ty);
      ctx.lineTo(w / 2 - u * 0.25, ty);
      ctx.moveTo(w / 2 + u * 0.25, ty);
      ctx.lineTo(w - pad * 2.4, ty);
      ctx.stroke();

      ctx.restore();
    },
  },
  {
    id: 'polaroid',
    name: 'Polaroid',
    draw(ctx, w, h) {
      const u = Math.min(w, h);
      const side = u * 0.062;
      const top = u * 0.065;
      const bottom = h * 0.165;

      ctx.save();

      // Warm instant-film matte border (even-odd cutout)
      ctx.fillStyle = '#fbf6ea';
      ctx.beginPath();
      ctx.rect(0, 0, w, h);
      ctx.rect(side, top, w - side * 2, h - top - bottom);
      ctx.fill('evenodd');

      // Subtle inner photo bevel shadow
      ctx.strokeStyle = 'rgba(30, 22, 14, 0.22)';
      ctx.lineWidth = Math.max(2, u * 0.005);
      ctx.strokeRect(side, top, w - side * 2, h - top - bottom);

      // Festive candy-stripe accent bar along top edge
      const stripeH = Math.max(6, u * 0.018);
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, w, stripeH);
      ctx.clip();
      ctx.fillStyle = '#faf5ea';
      ctx.fillRect(0, 0, w, stripeH);
      ctx.fillStyle = '#c92a38';
      const step = u * 0.048;
      for (let x = -h; x < w + h; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + step * 0.45, 0);
        ctx.lineTo(x + step * 0.25, stripeH);
        ctx.lineTo(x - step * 0.2, stripeH);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // Gold hairline under stripe
      ctx.fillStyle = '#d4a64a';
      ctx.fillRect(0, stripeH, w, Math.max(1.5, u * 0.0035));

      // Holly garnish tucked into bottom-right corner
      drawHollyCluster(ctx, w - side * 1.6, h - bottom * 0.55, u * 0.056);

      // Handwritten-style festive caption on Polaroid chin
      const fontSize = Math.round(u * 0.064);
      ctx.font = `italic 700 ${fontSize}px "Playfair Display", Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#8e1b26';
      ctx.fillText('¡Felices Fiestas!', w / 2, h - bottom * 0.5);

      // Small gold star accent left
      drawFourPointStar(ctx, side * 1.75, h - bottom * 0.52, u * 0.022, u * 0.008, '#cfa043');

      ctx.restore();
    },
  },
  {
    id: 'candycane',
    name: 'Caramelo',
    draw(ctx, w, h) {
      const u = Math.min(w, h);
      const border = u * 0.052;
      const radius = u * 0.045;

      ctx.save();

      // Helper for rounded rect path
      const traceRoundedInner = () => {
        const x = border;
        const y = border;
        const rw = w - border * 2;
        const rh = h - border * 2;
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + rw - radius, y);
        ctx.quadraticCurveTo(x + rw, y, x + rw, y + radius);
        ctx.lineTo(x + rw, y + rh - radius);
        ctx.quadraticCurveTo(x + rw, y + rh, x + rw - radius, y + rh);
        ctx.lineTo(x + radius, y + rh);
        ctx.quadraticCurveTo(x, y + rh, x, y + rh - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
      };

      // Clip to outer candy-cane border ring
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, w, h);
      traceRoundedInner();
      ctx.clip('evenodd');

      ctx.fillStyle = '#fff9f2';
      ctx.fillRect(0, 0, w, h);

      const stripeW = u * 0.042;
      for (let d = -h; d < w + h; d += stripeW * 2.2) {
        ctx.fillStyle = '#d12434';
        ctx.beginPath();
        ctx.moveTo(d, 0);
        ctx.lineTo(d + stripeW, 0);
        ctx.lineTo(d + stripeW - h, h);
        ctx.lineTo(d - h, h);
        ctx.closePath();
        ctx.fill();

        // Thin festive emerald pinstripe
        ctx.fillStyle = '#1b6e42';
        ctx.beginPath();
        ctx.moveTo(d + stripeW * 1.18, 0);
        ctx.lineTo(d + stripeW * 1.38, 0);
        ctx.lineTo(d + stripeW * 1.38 - h, h);
        ctx.lineTo(d + stripeW * 1.18 - h, h);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // Crisp gold inner trim
      ctx.beginPath();
      traceRoundedInner();
      ctx.strokeStyle = '#f2ce78';
      ctx.lineWidth = Math.max(2.5, u * 0.008);
      ctx.stroke();

      // Cheerful crimson ribbon banner at bottom center
      const bw = u * 0.56;
      const bh = u * 0.115;
      const bx = (w - bw) / 2;
      const by = h - border - bh * 0.92;

      // Ribbon tails
      ctx.fillStyle = '#8b1420';
      ctx.beginPath();
      ctx.moveTo(bx - u * 0.06, by + bh * 0.25);
      ctx.lineTo(bx + u * 0.02, by + bh * 0.25);
      ctx.lineTo(bx + u * 0.02, by + bh * 1.12);
      ctx.lineTo(bx - u * 0.06, by + bh * 1.12);
      ctx.lineTo(bx - u * 0.025, by + bh * 0.68);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(bx + bw + u * 0.06, by + bh * 0.25);
      ctx.lineTo(bx + bw - u * 0.02, by + bh * 0.25);
      ctx.lineTo(bx + bw - u * 0.02, by + bh * 1.12);
      ctx.lineTo(bx + bw + u * 0.06, by + bh * 1.12);
      ctx.lineTo(bx + bw + u * 0.025, by + bh * 0.68);
      ctx.closePath();
      ctx.fill();

      // Main ribbon body
      const ribGrad = ctx.createLinearGradient(bx, by, bx, by + bh);
      ribGrad.addColorStop(0, '#e33544');
      ribGrad.addColorStop(1, '#a91926');
      ctx.fillStyle = ribGrad;
      ctx.strokeStyle = '#fae19c';
      ctx.lineWidth = Math.max(1.8, u * 0.005);

      ctx.beginPath();
      ctx.roundRect(bx, by, bw, bh, u * 0.02);
      ctx.fill();
      ctx.stroke();

      // Ribbon text
      const fontSize = Math.round(u * 0.052);
      ctx.font = `700 ${fontSize}px "Playfair Display", Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fff9e8';
      ctx.fillText('¡Jo, Jo, Jo!', w / 2, by + bh * 0.52);

      // Cute corner stars
      drawFourPointStar(ctx, border * 2.1, border * 2.1, u * 0.026, u * 0.009, '#fae19c');
      drawFourPointStar(ctx, w - border * 2.1, border * 2.1, u * 0.026, u * 0.009, '#fae19c');

      ctx.restore();
    },
  },
];

/**
 * Generates a small preview thumbnail canvas for a frame option card.
 */
export function renderFrameThumbnail(frame) {
  const canvas = document.createElement('canvas');
  canvas.width = 120;
  canvas.height = 120;
  const ctx = canvas.getContext('2d');

  // Subtle dark pine preview backdrop
  const bg = ctx.createLinearGradient(0, 0, 120, 120);
  bg.addColorStop(0, '#1e4a38');
  bg.addColorStop(1, '#0c2018');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 120, 120);

  if (frame.id === 'none') {
    ctx.strokeStyle = 'rgba(255,255,255,0.45)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(60, 60, 26, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(42, 42);
    ctx.lineTo(78, 78);
    ctx.stroke();
    return canvas;
  }

  frame.draw(ctx, 120, 120);
  return canvas;
}
