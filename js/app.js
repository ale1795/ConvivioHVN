import { CHRISTMAS_FRAMES, renderFrameThumbnail } from './frames.js';
import {
  CHRISTMAS_BACKGROUNDS,
  drawBackgroundCover,
  renderBackgroundThumbnail,
} from './backgrounds.js';
import { SelfieSegmenterEngine } from './segmenter.js';

const ASPECT_CONFIGS = {
  '3:4': { previewW: 720, previewH: 960, captureW: 1080, captureH: 1440 },
  '1:1': { previewW: 800, previewH: 800, captureW: 1080, captureH: 1080 },
  '9:16': { previewW: 540, previewH: 960, captureW: 1080, captureH: 1920 },
};

const RATIO_ORDER = ['3:4', '1:1', '9:16'];

// DOM Elements
const videoEl = document.getElementById('cameraVideo');
const previewCanvas = document.getElementById('previewCanvas');
const previewCtx = previewCanvas.getContext('2d');
const viewportFrame = document.getElementById('viewportFrame');

const statusPill = document.getElementById('statusPill');
const statusText = document.getElementById('statusText');
const photoModeBar = document.getElementById('photoModeBar');
const backToCameraBtn = document.getElementById('backToCameraBtn');

const countdownOverlay = document.getElementById('countdownOverlay');
const shutterFlash = document.getElementById('shutterFlash');

const cameraPrompt = document.getElementById('cameraPrompt');
const promptTitle = document.getElementById('promptTitle');
const promptMessage = document.getElementById('promptMessage');
const startCameraBtn = document.getElementById('startCameraBtn');
const promptUploadBtn = document.getElementById('promptUploadBtn');

const ratioBtn = document.getElementById('ratioBtn');
const timerBtn = document.getElementById('timerBtn');
const timerLabel = document.getElementById('timerLabel');
const flipCameraBtn = document.getElementById('flipCameraBtn');
const mirrorBtn = document.getElementById('mirrorBtn');
const uploadBtn = document.getElementById('uploadBtn');
const photoUploadInput = document.getElementById('photoUploadInput');
const shutterBtn = document.getElementById('shutterBtn');

const tabFrames = document.getElementById('tabFrames');
const tabBackgrounds = document.getElementById('tabBackgrounds');
const framesStrip = document.getElementById('framesStrip');
const backgroundsStrip = document.getElementById('backgroundsStrip');
const activeSelectionLabel = document.getElementById('activeSelectionLabel');

const captureModal = document.getElementById('captureModal');
const capturedImage = document.getElementById('capturedImage');
const closeModalBtn = document.getElementById('closeModalBtn');
const downloadBtn = document.getElementById('downloadBtn');
const shareBtn = document.getElementById('shareBtn');
const retakeBtn = document.getElementById('retakeBtn');
const toastEl = document.getElementById('toast');

// App State
const state = {
  ratio: '3:4',
  timerSeconds: 0,
  facingMode: 'user',
  mirror: true,
  selectedFrameId: 'wreath',
  selectedBgId: 'original',
  activeTab: 'frames',
  sourceMode: 'camera', // 'camera' | 'image'
  stream: null,
  uploadedImg: null,
  uploadedMaskReady: false,
  isCapturing: false,
  lastVideoTime: -1,
  lastSegTimestamp: 0,
  hasMaskForCurrentVideo: false,
  capturedBlob: null,
  capturedUrl: null,
  toastTimer: null,
};

const segmenter = new SelfieSegmenterEngine();

// Helpers
function showToast(msg, duration = 2600) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => toastEl.classList.remove('show'), duration);
}

function showStatus(msg) {
  statusText.textContent = msg;
  statusPill.classList.remove('hidden');
}

function hideStatus() {
  statusPill.classList.add('hidden');
}

function getSelectedFrame() {
  return CHRISTMAS_FRAMES.find((f) => f.id === state.selectedFrameId) || CHRISTMAS_FRAMES[0];
}

function getSelectedBg() {
  return CHRISTMAS_BACKGROUNDS.find((b) => b.id === state.selectedBgId) || CHRISTMAS_BACKGROUNDS[0];
}

function updateSelectionLabel() {
  if (state.activeTab === 'frames') {
    activeSelectionLabel.textContent = `Marco: ${getSelectedFrame().name}`;
  } else {
    activeSelectionLabel.textContent = `Fondo: ${getSelectedBg().name}`;
  }
}

function applyAspectRatio(ratio) {
  state.ratio = ratio;
  const cfg = ASPECT_CONFIGS[ratio];
  previewCanvas.width = cfg.previewW;
  previewCanvas.height = cfg.previewH;
  viewportFrame.dataset.ratio = ratio;
  ratioBtn.textContent = ratio;
  if (state.sourceMode === 'image') {
    renderStaticFrame();
  }
}

function computeCoverCrop(srcW, srcH, targetW, targetH) {
  const srcRatio = srcW / srcH;
  const targetRatio = targetW / targetH;
  let sw, sh, sx, sy;

  if (srcRatio > targetRatio) {
    sh = srcH;
    sw = sh * targetRatio;
    sx = (srcW - sw) / 2;
    sy = 0;
  } else {
    sw = srcW;
    sh = sw / targetRatio;
    sx = 0;
    sy = (srcH - sh) / 2;
  }
  return { sx, sy, sw, sh, srcW, srcH };
}

function drawMirroredImage(ctx, sourceEl, crop, w, h, mirror, blurPx = 0) {
  ctx.save();
  if (blurPx > 0) ctx.filter = `blur(${blurPx}px)`;
  if (mirror) {
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(sourceEl, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, w, h);
  ctx.restore();
}

// Build Picker Carousels
function buildFrameCarousel() {
  framesStrip.innerHTML = '';
  for (const frame of CHRISTMAS_FRAMES) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `option-card${frame.id === state.selectedFrameId ? ' is-selected' : ''}`;
    btn.dataset.id = frame.id;
    btn.setAttribute('role', 'option');
    btn.setAttribute('aria-selected', String(frame.id === state.selectedFrameId));

    const thumbWrap = document.createElement('div');
    thumbWrap.className = 'option-thumb';
    thumbWrap.appendChild(renderFrameThumbnail(frame));

    const label = document.createElement('span');
    label.className = 'option-label';
    label.textContent = frame.name;

    btn.append(thumbWrap, label);
    btn.addEventListener('click', () => selectFrame(frame.id));
    framesStrip.appendChild(btn);
  }
}

function buildBackgroundCarousel() {
  backgroundsStrip.innerHTML = '';
  for (const bg of CHRISTMAS_BACKGROUNDS) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `option-card${bg.id === state.selectedBgId ? ' is-selected' : ''}`;
    btn.dataset.id = bg.id;
    btn.setAttribute('role', 'option');
    btn.setAttribute('aria-selected', String(bg.id === state.selectedBgId));

    const thumbWrap = document.createElement('div');
    thumbWrap.className = 'option-thumb';
    if (bg.type === 'none') {
      thumbWrap.innerHTML = `<span style="font-size:1.45rem">${bg.icon}</span>`;
    } else {
      thumbWrap.appendChild(renderBackgroundThumbnail(bg));
    }

    const label = document.createElement('span');
    label.className = 'option-label';
    label.textContent = bg.name;

    btn.append(thumbWrap, label);
    btn.addEventListener('click', () => selectBackground(bg.id));
    backgroundsStrip.appendChild(btn);
  }
}

function selectFrame(id) {
  state.selectedFrameId = id;
  for (const el of framesStrip.children) {
    const active = el.dataset.id === id;
    el.classList.toggle('is-selected', active);
    el.setAttribute('aria-selected', String(active));
  }
  updateSelectionLabel();
  if (state.sourceMode === 'image') renderStaticFrame();
}

async function selectBackground(id) {
  state.selectedBgId = id;
  for (const el of backgroundsStrip.children) {
    const active = el.dataset.id === id;
    el.classList.toggle('is-selected', active);
    el.setAttribute('aria-selected', String(active));
  }
  updateSelectionLabel();

  const bg = getSelectedBg();
  if (bg.type !== 'none') {
    await prepareSegmentationForCurrentMode();
  } else {
    hideStatus();
  }

  if (state.sourceMode === 'image') renderStaticFrame();
}

async function prepareSegmentationForCurrentMode() {
  if (state.sourceMode === 'image') {
    if (!state.uploadedImg) return;
    if (!state.uploadedMaskReady) {
      showStatus('Recortando fondo con IA...');
      const ready = await segmenter.ensureImageReady();
      if (ready) {
        state.uploadedMaskReady = segmenter.segmentStaticSource(state.uploadedImg);
        hideStatus();
      } else {
        hideStatus();
        showToast('No se pudo cargar el motor IA (requiere internet).');
      }
    }
    return;
  }

  if (!segmenter.videoSegmenter) {
    showStatus('Cargando fondos IA...');
    const ready = await segmenter.ensureVideoReady();
    hideStatus();
    if (!ready) {
      showToast('No se pudo cargar el motor IA. Puedes seguir usando los marcos.');
    }
  }
}

// Camera Setup
function stopCamera() {
  if (state.stream) {
    for (const track of state.stream.getTracks()) track.stop();
    state.stream = null;
  }
}

async function startCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    promptTitle.textContent = 'Cámara no disponible aquí';
    promptMessage.textContent =
      'Para usar la cámara desde tu celular necesitas abrir esta página con HTTPS, o puedes subir una foto desde tu galería.';
    cameraPrompt.classList.remove('hidden');
    return;
  }

  stopCamera();
  showStatus('Iniciando cámara...');

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: state.facingMode },
        width: { ideal: 1280 },
        height: { ideal: 1600 },
      },
      audio: false,
    });

    state.stream = stream;
    state.sourceMode = 'camera';
    state.hasMaskForCurrentVideo = false;
    state.lastVideoTime = -1;
    videoEl.srcObject = stream;
    await videoEl.play();

    cameraPrompt.classList.add('hidden');
    photoModeBar.classList.add('hidden');
    hideStatus();

    if (getSelectedBg().type !== 'none') {
      prepareSegmentationForCurrentMode();
    }
  } catch (err) {
    hideStatus();
    console.warn('No se pudo iniciar la cámara:', err);
    promptTitle.textContent = 'Activa tu cámara o sube una foto';
    promptMessage.textContent =
      err?.name === 'NotAllowedError'
        ? 'Permite el acceso a la cámara en tu navegador para tomarte la selfie, o sube una foto de tu galería.'
        : 'No detectamos una cámara activa en este dispositivo. Puedes subir cualquier foto para agregar marcos y fondos navideños.';
    cameraPrompt.classList.remove('hidden');
  }
}

// Rendering Pipeline
function renderComposite(targetCtx, sourceEl, srcW, srcH, w, h, mirror, hasValidMask) {
  const crop = computeCoverCrop(srcW, srcH, w, h);
  const bg = getSelectedBg();
  const frame = getSelectedFrame();

  targetCtx.clearRect(0, 0, w, h);

  if (bg.type === 'none' || !hasValidMask) {
    drawMirroredImage(targetCtx, sourceEl, crop, w, h, mirror, 0);
  } else if (bg.type === 'blur') {
    drawMirroredImage(targetCtx, sourceEl, crop, w, h, mirror, Math.round(w * 0.016));
    segmenter.compositePersonOverBackground(targetCtx, sourceEl, crop, w, h, mirror);
  } else {
    drawBackgroundCover(targetCtx, bg, w, h);
    segmenter.compositePersonOverBackground(targetCtx, sourceEl, crop, w, h, mirror);
  }

  frame.draw(targetCtx, w, h);
}

function renderStaticFrame() {
  if (!state.uploadedImg) return;
  const w = previewCanvas.width;
  const h = previewCanvas.height;
  renderComposite(
    previewCtx,
    state.uploadedImg,
    state.uploadedImg.naturalWidth,
    state.uploadedImg.naturalHeight,
    w,
    h,
    state.mirror,
    state.uploadedMaskReady
  );
}

function animationLoop() {
  if (state.sourceMode === 'camera' && videoEl.readyState >= 2 && videoEl.videoWidth > 0) {
    const bg = getSelectedBg();
    if (bg.type !== 'none' && segmenter.videoSegmenter) {
      if (videoEl.currentTime !== state.lastVideoTime) {
        state.lastVideoTime = videoEl.currentTime;
        const now = Math.max(performance.now(), state.lastSegTimestamp + 1);
        state.lastSegTimestamp = now;
        const ok = segmenter.segmentVideoFrame(videoEl, now);
        if (ok) state.hasMaskForCurrentVideo = true;
      }
    }

    renderComposite(
      previewCtx,
      videoEl,
      videoEl.videoWidth,
      videoEl.videoHeight,
      previewCanvas.width,
      previewCanvas.height,
      state.mirror,
      state.hasMaskForCurrentVideo
    );
  }

  requestAnimationFrame(animationLoop);
}

// Photo Capture
function triggerFlash() {
  shutterFlash.classList.remove('flash-go');
  void shutterFlash.offsetWidth;
  shutterFlash.classList.add('flash-go');
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function captureSelfie() {
  if (state.isCapturing) return;

  const hasCamera = state.sourceMode === 'camera' && videoEl.readyState >= 2 && videoEl.videoWidth > 0;
  const hasImage = state.sourceMode === 'image' && state.uploadedImg;

  if (!hasCamera && !hasImage) {
    showToast('Primero activa la cámara o sube una foto 📷');
    return;
  }

  state.isCapturing = true;

  try {
    if (state.timerSeconds > 0 && state.sourceMode === 'camera') {
      countdownOverlay.classList.remove('hidden');
      for (let n = state.timerSeconds; n >= 1; n--) {
        countdownOverlay.textContent = String(n);
        await sleep(950);
      }
      countdownOverlay.classList.add('hidden');
    }

    triggerFlash();

    const cfg = ASPECT_CONFIGS[state.ratio];
    const captureCanvas = document.createElement('canvas');
    captureCanvas.width = cfg.captureW;
    captureCanvas.height = cfg.captureH;
    const captureCtx = captureCanvas.getContext('2d');

    if (hasImage) {
      renderComposite(
        captureCtx,
        state.uploadedImg,
        state.uploadedImg.naturalWidth,
        state.uploadedImg.naturalHeight,
        cfg.captureW,
        cfg.captureH,
        state.mirror,
        state.uploadedMaskReady
      );
    } else {
      renderComposite(
        captureCtx,
        videoEl,
        videoEl.videoWidth,
        videoEl.videoHeight,
        cfg.captureW,
        cfg.captureH,
        state.mirror,
        state.hasMaskForCurrentVideo
      );
    }

    const blob = await new Promise((resolve) => captureCanvas.toBlob(resolve, 'image/png', 0.96));
    if (!blob) throw new Error('Error al generar la imagen');

    if (state.capturedUrl) URL.revokeObjectURL(state.capturedUrl);
    state.capturedBlob = blob;
    state.capturedUrl = URL.createObjectURL(blob);
    capturedImage.src = state.capturedUrl;
    captureModal.classList.remove('hidden');
  } catch (err) {
    console.error('Error capturando selfie:', err);
    showToast('No se pudo guardar la foto. Intenta de nuevo.');
  } finally {
    state.isCapturing = false;
  }
}

function downloadCapturedPhoto() {
  if (!state.capturedUrl) return;
  const link = document.createElement('a');
  const stamp = new Date().toISOString().slice(0, 10);
  link.download = `selfie-navidena-${stamp}.png`;
  link.href = state.capturedUrl;
  link.click();
  showToast('¡Foto descargada! 🎄');
}

async function shareCapturedPhoto() {
  if (!state.capturedBlob) return;
  const file = new File([state.capturedBlob], 'selfie-navidena.png', { type: 'image/png' });

  if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title: 'Mi Selfie Navideña 🎄',
        text: '¡Mira mi selfie navideña!',
        files: [file],
      });
      return;
    } catch (err) {
      if (err?.name === 'AbortError') return;
    }
  }

  // Fallback on desktop browsers without Web Share file support
  downloadCapturedPhoto();
  showToast('Descargada para que la compartas por WhatsApp o redes ✨');
}

// Photo Upload Flow
function handleUploadedFile(file) {
  if (!file) return;
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = async () => {
    URL.revokeObjectURL(url);
    stopCamera();
    state.uploadedImg = img;
    state.uploadedMaskReady = false;
    state.sourceMode = 'image';
    state.mirror = false;
    cameraPrompt.classList.add('hidden');
    photoModeBar.classList.remove('hidden');

    renderStaticFrame();
    if (getSelectedBg().type !== 'none') {
      await prepareSegmentationForCurrentMode();
      renderStaticFrame();
    }
    showToast('¡Foto cargada! Elige tu marco y fondo navideño 🎄');
  };
  img.onerror = () => {
    URL.revokeObjectURL(url);
    showToast('No se pudo abrir esa imagen.');
  };
  img.src = url;
}

// UI Events
tabFrames.addEventListener('click', () => {
  state.activeTab = 'frames';
  tabFrames.classList.add('is-active');
  tabFrames.setAttribute('aria-selected', 'true');
  tabBackgrounds.classList.remove('is-active');
  tabBackgrounds.setAttribute('aria-selected', 'false');
  framesStrip.classList.remove('hidden');
  backgroundsStrip.classList.add('hidden');
  updateSelectionLabel();
});

tabBackgrounds.addEventListener('click', () => {
  state.activeTab = 'backgrounds';
  tabBackgrounds.classList.add('is-active');
  tabBackgrounds.setAttribute('aria-selected', 'true');
  tabFrames.classList.remove('is-active');
  tabFrames.setAttribute('aria-selected', 'false');
  backgroundsStrip.classList.remove('hidden');
  framesStrip.classList.add('hidden');
  updateSelectionLabel();
});

ratioBtn.addEventListener('click', () => {
  const nextIdx = (RATIO_ORDER.indexOf(state.ratio) + 1) % RATIO_ORDER.length;
  applyAspectRatio(RATIO_ORDER[nextIdx]);
  showToast(`Formato ${RATIO_ORDER[nextIdx]}`);
});

timerBtn.addEventListener('click', () => {
  state.timerSeconds = state.timerSeconds === 0 ? 3 : 0;
  timerLabel.textContent = state.timerSeconds === 0 ? 'Off' : '3s';
  timerBtn.classList.toggle('is-active', state.timerSeconds > 0);
  showToast(state.timerSeconds > 0 ? 'Temporizador de 3 segundos activado' : 'Temporizador desactivado');
});

flipCameraBtn.addEventListener('click', () => {
  state.facingMode = state.facingMode === 'user' ? 'environment' : 'user';
  state.mirror = state.facingMode === 'user';
  startCamera();
});

mirrorBtn.addEventListener('click', () => {
  state.mirror = !state.mirror;
  if (state.sourceMode === 'image') renderStaticFrame();
  showToast(state.mirror ? 'Efecto espejo activado' : 'Efecto espejo desactivado');
});

uploadBtn.addEventListener('click', () => photoUploadInput.click());
promptUploadBtn.addEventListener('click', () => photoUploadInput.click());
photoUploadInput.addEventListener('change', (e) => {
  const file = e.target.files?.[0];
  if (file) handleUploadedFile(file);
  photoUploadInput.value = '';
});

startCameraBtn.addEventListener('click', startCamera);
backToCameraBtn.addEventListener('click', () => {
  state.mirror = state.facingMode === 'user';
  startCamera();
});

shutterBtn.addEventListener('click', captureSelfie);
downloadBtn.addEventListener('click', downloadCapturedPhoto);
shareBtn.addEventListener('click', shareCapturedPhoto);

function closeCaptureModal() {
  captureModal.classList.add('hidden');
}

closeModalBtn.addEventListener('click', closeCaptureModal);
retakeBtn.addEventListener('click', closeCaptureModal);
captureModal.addEventListener('click', (e) => {
  if (e.target === captureModal) closeCaptureModal();
});

// Optional URL params (?frame=polaroid&bg=fireplace)
function applyUrlPresets() {
  const params = new URLSearchParams(window.location.search);
  const frameParam = params.get('frame');
  const bgParam = params.get('bg');
  if (frameParam && CHRISTMAS_FRAMES.some((f) => f.id === frameParam)) {
    state.selectedFrameId = frameParam;
  }
  if (bgParam && CHRISTMAS_BACKGROUNDS.some((b) => b.id === bgParam)) {
    state.selectedBgId = bgParam;
  }
}

// Init
applyUrlPresets();
applyAspectRatio('3:4');
buildFrameCarousel();
buildBackgroundCarousel();
updateSelectionLabel();
requestAnimationFrame(animationLoop);

// Attempt to auto-start camera smoothly when opened on HTTPS / localhost
if (window.isSecureContext && navigator.mediaDevices?.getUserMedia) {
  startCamera();
}
