/**
 * Real-time AI Selfie Background Segmentation powered by MediaPipe Tasks Vision.
 * Lazy-loaded on demand when the user picks a Christmas background or Bokeh blur.
 */

const VISION_BUNDLE_URL =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/vision_bundle.mjs';
const WASM_BASE_URL =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm';
const SELFIE_MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite';

export class SelfieSegmenterEngine {
  constructor() {
    this.videoSegmenter = null;
    this.imageSegmenter = null;
    this.visionFileset = null;
    this.visionModule = null;
    this.initPromise = null;
    this.imageInitPromise = null;
    this.failed = false;

    // Reusable offscreen mask canvas (256x256 matches model output for super fast compositing)
    this.maskCanvas = document.createElement('canvas');
    this.maskCtx = this.maskCanvas.getContext('2d', { willReadFrequently: true });
    this.maskImageData = null;

    // Soft-feathered scaled mask canvas
    this.softMaskCanvas = document.createElement('canvas');
    this.softMaskCtx = this.softMaskCanvas.getContext('2d');

    // Foreground person extraction canvas
    this.personCanvas = document.createElement('canvas');
    this.personCtx = this.personCanvas.getContext('2d');
  }

  async _loadVision() {
    if (this.visionFileset && this.visionModule) return;
    this.visionModule = await import(VISION_BUNDLE_URL);
    this.visionFileset = await this.visionModule.FilesetResolver.forVisionTasks(WASM_BASE_URL);
  }

  async _createSegmenter(runningMode) {
    await this._loadVision();
    const { ImageSegmenter } = this.visionModule;

    const baseOpts = {
      modelAssetPath: SELFIE_MODEL_URL,
      delegate: 'GPU',
    };

    try {
      return await ImageSegmenter.createFromOptions(this.visionFileset, {
        baseOptions: baseOpts,
        runningMode,
        outputCategoryMask: false,
        outputConfidenceMasks: true,
      });
    } catch {
      // Fallback smoothly to CPU if WebGL GPU delegate is unavailable
      return await ImageSegmenter.createFromOptions(this.visionFileset, {
        baseOptions: {
          modelAssetPath: SELFIE_MODEL_URL,
          delegate: 'CPU',
        },
        runningMode,
        outputCategoryMask: false,
        outputConfidenceMasks: true,
      });
    }
  }

  async ensureVideoReady() {
    if (this.videoSegmenter) return true;
    if (!this.initPromise) {
      this.initPromise = this._createSegmenter('VIDEO')
        .then((seg) => {
          this.videoSegmenter = seg;
          this.failed = false;
          return true;
        })
        .catch((err) => {
          console.error('Error inicializando segmentador de video:', err);
          this.failed = true;
          this.initPromise = null;
          return false;
        });
    }
    return this.initPromise;
  }

  async ensureImageReady() {
    if (this.imageSegmenter) return true;
    if (!this.imageInitPromise) {
      this.imageInitPromise = this._createSegmenter('IMAGE')
        .then((seg) => {
          this.imageSegmenter = seg;
          this.failed = false;
          return true;
        })
        .catch((err) => {
          console.error('Error inicializando segmentador de imagen:', err);
          this.failed = true;
          this.imageInitPromise = null;
          return false;
        });
    }
    return this.imageInitPromise;
  }

  /**
   * Extract the person alpha confidence mask onto this.maskCanvas.
   * For selfie_segmenter.tflite:
   * - If 2 confidence masks: index 0 = background, index 1 = person.
   * - If 1 confidence mask: index 0 = person confidence.
   */
  _writeMaskFromResult(result) {
    const masks = result?.confidenceMasks;
    if (!masks || masks.length === 0) return false;

    const personMask = masks.length >= 2 ? masks[1] : masks[0];
    const mw = personMask.width;
    const mh = personMask.height;
    const floats = personMask.getAsFloat32Array();

    if (this.maskCanvas.width !== mw || this.maskCanvas.height !== mh) {
      this.maskCanvas.width = mw;
      this.maskCanvas.height = mh;
      this.maskImageData = this.maskCtx.createImageData(mw, mh);
    }

    const data = this.maskImageData.data;
    const len = floats.length;

    // Smooth S-curve threshold for clean hair & shoulder edges without harsh halos
    for (let i = 0; i < len; i++) {
      const c = floats[i];
      let alpha;
      if (c <= 0.28) {
        alpha = 0;
      } else if (c >= 0.72) {
        alpha = 255;
      } else {
        const t = (c - 0.28) / 0.44;
        const smooth = t * t * (3 - 2 * t);
        alpha = Math.round(smooth * 255);
      }
      const p = i * 4;
      data[p] = 255;
      data[p + 1] = 255;
      data[p + 2] = 255;
      data[p + 3] = alpha;
    }

    this.maskCtx.putImageData(this.maskImageData, 0, 0);

    // Close GPU/WASM mask resources
    for (const m of masks) {
      if (typeof m.close === 'function') m.close();
    }
    return true;
  }

  segmentVideoFrame(videoEl, timestampMs) {
    if (!this.videoSegmenter) return false;
    try {
      const result = this.videoSegmenter.segmentForVideo(videoEl, timestampMs);
      const ok = this._writeMaskFromResult(result);
      if (typeof result?.close === 'function') result.close();
      return ok;
    } catch (err) {
      console.warn('Segmentación de frame omitida:', err);
      return false;
    }
  }

  segmentStaticSource(sourceEl) {
    if (!this.imageSegmenter) return false;
    try {
      const result = this.imageSegmenter.segment(sourceEl);
      const ok = this._writeMaskFromResult(result);
      if (typeof result?.close === 'function') result.close();
      return ok;
    } catch (err) {
      console.warn('Segmentación de foto omitida:', err);
      return false;
    }
  }

  /**
   * Composites the foreground person (masked with soft edges) onto the target canvas
   * where the Christmas background (or blurred original) has already been drawn.
   */
  compositePersonOverBackground(targetCtx, sourceEl, cropRect, w, h, mirror) {
    if (this.personCanvas.width !== w || this.personCanvas.height !== h) {
      this.personCanvas.width = w;
      this.personCanvas.height = h;
      this.softMaskCanvas.width = w;
      this.softMaskCanvas.height = h;
    }

    const { sx, sy, sw, sh, srcW, srcH } = cropRect;

    // 1. Scale & gently feather the confidence mask to match crop & mirror
    const sCtx = this.softMaskCtx;
    sCtx.save();
    sCtx.clearRect(0, 0, w, h);
    sCtx.filter = 'blur(3px)';
    if (mirror) {
      sCtx.translate(w, 0);
      sCtx.scale(-1, 1);
    }
    const msx = (sx / srcW) * this.maskCanvas.width;
    const msy = (sy / srcH) * this.maskCanvas.height;
    const msw = (sw / srcW) * this.maskCanvas.width;
    const msh = (sh / srcH) * this.maskCanvas.height;
    sCtx.drawImage(this.maskCanvas, msx, msy, msw, msh, 0, 0, w, h);
    sCtx.restore();

    // 2. Cut out the person from the source frame using the feathered alpha mask
    const pCtx = this.personCtx;
    pCtx.save();
    pCtx.globalCompositeOperation = 'source-over';
    pCtx.clearRect(0, 0, w, h);
    if (mirror) {
      pCtx.translate(w, 0);
      pCtx.scale(-1, 1);
    }
    pCtx.drawImage(sourceEl, sx, sy, sw, sh, 0, 0, w, h);
    pCtx.restore();

    pCtx.save();
    pCtx.globalCompositeOperation = 'destination-in';
    pCtx.drawImage(this.softMaskCanvas, 0, 0);
    pCtx.restore();

    // 3. Draw person cleanly over the Christmas background
    targetCtx.drawImage(this.personCanvas, 0, 0);
  }
}
