/**
 * QR Code Generator & Printable Poster Controller
 */

const urlInput = document.getElementById('urlInput');
const titleInput = document.getElementById('titleInput');
const subtitleInput = document.getElementById('subtitleInput');
const localUrlAlert = document.getElementById('localUrlAlert');
const detectedOriginCode = document.getElementById('detectedOriginCode');

const posterCard = document.getElementById('posterCard');
const posterTitle = document.getElementById('posterTitle');
const posterSubtitle = document.getElementById('posterSubtitle');
const posterUrlPill = document.getElementById('posterUrlPill');
const qrCanvas = document.getElementById('qrCanvas');
const qrCtx = qrCanvas.getContext('2d');

const downloadQrOnlyBtn = document.getElementById('downloadQrOnlyBtn');
const downloadPosterBtn = document.getElementById('downloadPosterBtn');
const printPosterBtn = document.getElementById('printPosterBtn');
const themeButtons = document.querySelectorAll('.theme-pill');
const toastEl = document.getElementById('toast');

let currentTheme = 'pine';
let toastTimer = null;

const THEME_PALETTES = {
  pine: {
    bgTop: '#184433',
    bgMid: '#0d261c',
    bgBot: '#091a13',
    text: '#faf5e8',
    muted: 'rgba(250, 245, 232, 0.85)',
    border: '#ebc775',
    qrDark: '#0d261c',
    pillBg: 'rgba(0, 0, 0, 0.25)',
  },
  crimson: {
    bgTop: '#a41c2a',
    bgMid: '#681019',
    bgBot: '#42090f',
    text: '#fff7eb',
    muted: 'rgba(255, 247, 235, 0.88)',
    border: '#f0cf80',
    qrDark: '#5b0d16',
    pillBg: 'rgba(0, 0, 0, 0.25)',
  },
  ivory: {
    bgTop: '#fffdf8',
    bgMid: '#faf3e5',
    bgBot: '#f2e6cf',
    text: '#163326',
    muted: 'rgba(22, 51, 38, 0.82)',
    border: '#c89f4b',
    qrDark: '#10281d',
    pillBg: 'rgba(22, 51, 38, 0.08)',
  },
};

function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2500);
}

function getDefaultBoothUrl() {
  const { protocol, host, pathname } = window.location;
  if (protocol === 'file:') {
    return 'https://tu-cabina-navidena.netlify.app/';
  }
  // Point to index.html in the same folder
  const baseDir = pathname.replace(/\/qr(\.html)?$/i, '/').replace(/\/+$/, '') + '/';
  return `${protocol}//${host}${baseDir}`;
}

function isLocalUrl(urlStr) {
  return (
    !urlStr ||
    urlStr.startsWith('file:') ||
    /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/i.test(
      urlStr
    ) ||
    urlStr.includes('tu-cabina-navidena.netlify.app')
  );
}

/**
 * Draws an ISO-compliant, high-contrast scannable QR code onto a canvas.
 */
function renderQrToCanvas(canvas, text, darkColor = '#0d261c') {
  const ctx = canvas.getContext('2d');
  const size = canvas.width;
  const safeText = (text || 'https://example.com').trim();

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);

  if (typeof window.qrcode !== 'function') {
    ctx.fillStyle = '#111';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Cargando generador QR...', size / 2, size / 2);
    return;
  }

  // Type 0 = auto-select optimal QR version; 'M' = 15% error correction (clean & fast scanning)
  const qr = window.qrcode(0, 'M');
  qr.addData(safeText, 'Byte');
  qr.make();

  const count = qr.getModuleCount();
  const quietModules = 3; // Generous ISO quiet zone for instant mobile scanning
  const totalModules = count + quietModules * 2;
  const cell = size / totalModules;

  ctx.fillStyle = darkColor;
  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (qr.isDark(r, c)) {
        const x = Math.floor((c + quietModules) * cell);
        const y = Math.floor((r + quietModules) * cell);
        const w = Math.ceil((c + quietModules + 1) * cell) - x;
        const h = Math.ceil((r + quietModules + 1) * cell) - y;
        ctx.fillRect(x, y, w, h);
      }
    }
  }
}

function updatePreview() {
  const url = urlInput.value.trim() || getDefaultBoothUrl();
  const title = titleInput.value.trim() || '¡Tómate tu Selfie Navideña!';
  const subtitle =
    subtitleInput.value.trim() ||
    'Escanea el QR, elige tu marco o fondo navideño y descarga tu foto al instante.';

  posterTitle.textContent = title;
  posterSubtitle.textContent = subtitle;
  posterUrlPill.textContent = url;

  const palette = THEME_PALETTES[currentTheme];
  renderQrToCanvas(qrCanvas, url, palette.qrDark);

  const local = isLocalUrl(url);
  localUrlAlert.classList.toggle('hidden', !local);
  if (local) {
    try {
      detectedOriginCode.textContent = new URL(url).host || 'local';
    } catch {
      detectedOriginCode.textContent = 'local';
    }
  }
}

function wrapTextLines(ctx, text, maxWidth) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function downloadQrOnlyPng() {
  const url = urlInput.value.trim() || getDefaultBoothUrl();
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = 1024;
  exportCanvas.height = 1024;
  renderQrToCanvas(exportCanvas, url, THEME_PALETTES[currentTheme].qrDark);

  const link = document.createElement('a');
  link.download = 'qr-selfie-navidena.png';
  link.href = exportCanvas.toDataURL('image/png');
  link.click();
  showToast('Código QR descargado (1024×1024) ✅');
}

function downloadPosterPng() {
  const url = urlInput.value.trim() || getDefaultBoothUrl();
  const title = titleInput.value.trim() || '¡Tómate tu Selfie Navideña!';
  const subtitle = subtitleInput.value.trim();
  const pal = THEME_PALETTES[currentTheme];

  const w = 1200;
  const h = 1600;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  // Background gradient
  const grad = ctx.createRadialGradient(w / 2, h * 0.15, 60, w / 2, h * 0.5, h * 0.88);
  grad.addColorStop(0, pal.bgTop);
  grad.addColorStop(0.65, pal.bgMid);
  grad.addColorStop(1, pal.bgBot);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Decorative double gold frame
  ctx.strokeStyle = pal.border;
  ctx.lineWidth = 8;
  ctx.strokeRect(46, 46, w - 92, h - 92);
  ctx.lineWidth = 2.5;
  ctx.globalAlpha = 0.5;
  ctx.strokeRect(66, 66, w - 132, h - 132);
  ctx.globalAlpha = 1;

  // Top festive ornament line
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = pal.border;
  ctx.font = '600 44px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('❄  ✦  🎄  ✦  ❄', w / 2, 150);

  // Title
  ctx.fillStyle = pal.text;
  ctx.font = '700 72px "Playfair Display", Georgia, serif';
  const titleLines = wrapTextLines(ctx, title, w - 180);
  let y = 260;
  for (const line of titleLines) {
    ctx.fillText(line, w / 2, y);
    y += 84;
  }

  // Subtitle
  ctx.fillStyle = pal.muted;
  ctx.font = '500 34px "Plus Jakarta Sans", sans-serif';
  const subLines = wrapTextLines(ctx, subtitle, w - 210);
  y += 14;
  for (const line of subLines) {
    ctx.fillText(line, w / 2, y);
    y += 46;
  }

  // White rounded QR frame box
  const qrBoxSize = 680;
  const qrBoxX = (w - qrBoxSize) / 2;
  const qrBoxY = Math.max(y + 40, 520);

  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = pal.border;
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 42);
  ctx.fill();
  ctx.stroke();

  // Render crisp QR inside box
  const qrOff = document.createElement('canvas');
  qrOff.width = 620;
  qrOff.height = 620;
  renderQrToCanvas(qrOff, url, pal.qrDark);
  ctx.drawImage(qrOff, qrBoxX + 30, qrBoxY + 30);

  // Steps footer
  const stepsY = qrBoxY + qrBoxSize + 88;
  ctx.fillStyle = pal.text;
  ctx.font = '700 34px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('1. Escanea   •   2. Elige fondo o marco   •   3. Descarga tu foto', w / 2, stepsY);

  // URL pill
  const pillY = stepsY + 72;
  ctx.font = '600 26px ui-monospace, Menlo, Consolas, monospace';
  const displayUrl = url.length > 52 ? `${url.slice(0, 49)}...` : url;
  const pillW = Math.min(w - 180, ctx.measureText(displayUrl).width + 64);
  ctx.fillStyle = pal.pillBg;
  ctx.beginPath();
  ctx.roundRect((w - pillW) / 2, pillY - 26, pillW, 52, 26);
  ctx.fill();
  ctx.fillStyle = pal.text;
  ctx.fillText(displayUrl, w / 2, pillY + 1);

  const link = document.createElement('a');
  link.download = 'poster-qr-selfie-navidena.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
  showToast('Póster QR descargado (1200×1600) 🎄');
}

// Event Listeners
urlInput.addEventListener('input', updatePreview);
titleInput.addEventListener('input', updatePreview);
subtitleInput.addEventListener('input', updatePreview);

for (const btn of themeButtons) {
  btn.addEventListener('click', () => {
    currentTheme = btn.dataset.theme;
    for (const b of themeButtons) b.classList.toggle('is-active', b === btn);
    posterCard.className = `poster-card theme-${currentTheme}`;
    updatePreview();
  });
}

downloadQrOnlyBtn.addEventListener('click', downloadQrOnlyPng);
downloadPosterBtn.addEventListener('click', downloadPosterPng);
printPosterBtn.addEventListener('click', () => window.print());

// Init
urlInput.value = getDefaultBoothUrl();
updatePreview();
