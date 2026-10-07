/**
 * scrolly.js — GPU-Accelerated Scroll-to-Play Frame Animation
 *
 * Technique: WebGL full-screen quad, each frame is a GPU texture.
 * Scroll drives the frame index via requestAnimationFrame + lerp.
 * 800vh scroll space — ultra smooth buttery playback.
 */

(function () {
  'use strict';

  /* ─── Config ─────────────────────────────────────────────── */
  const TOTAL_FRAMES = 300;
  const SCROLL_VH    = 800;          // scroll container height in vh
  const IMAGE_AR     = 1920 / 1080;  // source frame aspect ratio
  const LERP         = 0.14;         // smoothing (higher = tighter scroll response)
  const MAX_LOADS    = 12;           // keep frame uploads steady instead of spiking
  const FRAME_BASE   = '/klchaimg/klh-intro-frame-';
  const FRAME_EXT    = '.png';
  const FRAME_VERSION = 'gpu-smooth-20260426';

  /* ─── State ──────────────────────────────────────────────── */
  let gl         = null;
  let program    = null;
  let textures   = new Array(TOTAL_FRAMES).fill(null);
  let loaded     = 0;
  let curFrame   = 0;    // float — lerp'd
  let tgtFrame   = 0;    // float — scroll-driven
  let rafId      = null;
  let finished   = false;
  let renderStarted = false;
  let loadCursor = 0;
  let activeLoads = 0;
  let loc        = {};   // uniform locations

  /* ─── GLSL Shaders ───────────────────────────────────────── */
  const VS = `
    attribute vec2 a_pos;
    varying vec2 v_uv;
    void main() {
      gl_Position = vec4(a_pos, 0.0, 1.0);
      /* Flip Y so image draws right-side-up */
      v_uv = vec2((a_pos.x + 1.0) * 0.5, (1.0 - a_pos.y) * 0.5);
    }
  `;

  /* Fit the whole animation frame so the KLH logo is never cropped */
  const FS = `
    precision highp float;
    uniform sampler2D u_tex;
    uniform sampler2D u_texNext;
    uniform float u_imgAR;
    uniform float u_cvAR;
    uniform float u_mix;
    varying vec2 v_uv;
    void main() {
      vec2 uv = v_uv;

      /* 1. Contain-fit the 16:9 source frame inside the current viewport */
      vec4 bg = mix(
        texture2D(u_tex, vec2(0.02, 0.02)),
        texture2D(u_texNext, vec2(0.02, 0.02)),
        u_mix
      );

      if (u_imgAR > u_cvAR) {
        float h = u_cvAR / u_imgAR;
        float y0 = (1.0 - h) * 0.5;
        if (uv.y < y0 || uv.y > y0 + h) {
          gl_FragColor = bg;
          return;
        }
        uv.y = (uv.y - y0) / h;
      } else {
        float w = u_imgAR / u_cvAR;
        float x0 = (1.0 - w) * 0.5;
        if (uv.x < x0 || uv.x > x0 + w) {
          gl_FragColor = bg;
          return;
        }
        uv.x = (uv.x - x0) / w;
      }

      /* 2. Clamp so we never sample outside the image */
      uv = clamp(uv, 0.0001, 0.9999);

      gl_FragColor = mix(texture2D(u_tex, uv), texture2D(u_texNext, uv), u_mix);
    }
  `;

  /* ─── WebGL Setup ────────────────────────────────────────── */
  function initGL() {
    const canvas = document.getElementById('sc-canvas');
    if (!canvas) return false;

    const opts = {
      antialias          : false,
      powerPreference    : 'high-performance',
      preserveDrawingBuffer: false,
      failIfMajorPerformanceCaveat: false,
    };

    gl = canvas.getContext('webgl2', opts)
      || canvas.getContext('webgl',  opts)
      || canvas.getContext('experimental-webgl', opts);

    if (!gl) return false;

    const vs = buildShader(gl.VERTEX_SHADER,   VS);
    const fs = buildShader(gl.FRAGMENT_SHADER, FS);
    if (!vs || !fs) return false;

    program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('[scrolly] Link error:', gl.getProgramInfoLog(program));
      return false;
    }
    gl.useProgram(program);

    /* Full-screen quad (2 triangles) */
    const verts = new Float32Array([-1,-1, 1,-1, -1,1,  -1,1, 1,-1, 1,1]);
    const buf   = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(program, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    loc.tex     = gl.getUniformLocation(program, 'u_tex');
    loc.texNext = gl.getUniformLocation(program, 'u_texNext');
    loc.imgAR   = gl.getUniformLocation(program, 'u_imgAR');
    loc.cvAR    = gl.getUniformLocation(program, 'u_cvAR');
    loc.mix     = gl.getUniformLocation(program, 'u_mix');
    gl.uniform1i(loc.tex, 0);
    gl.uniform1i(loc.texNext, 1);

    return true;
  }

  function buildShader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error('[scrolly] Shader error:', gl.getShaderInfoLog(s));
      gl.deleteShader(s);
      return null;
    }
    return s;
  }

  /* ─── Texture Loading ────────────────────────────────────── */
  function loadFrame(i) {
    const img = new Image();
    img.decoding = 'async';
    img.src   = FRAME_BASE + pad3(i + 1) + FRAME_EXT + '?v=' + FRAME_VERSION;
    img.onload = async function () {
      if (!gl) return finishFrameLoad();
      let source = img;
      let bitmap = null;
      try {
        if ('createImageBitmap' in window) {
          bitmap = await createImageBitmap(img);
          source = bitmap;
        }
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, source);
        /* Linear sampling for smooth interpolation between frames */
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        textures[i] = tex;
      } catch (err) {
        console.warn('[scrolly] Frame upload failed:', i + 1, err);
      } finally {
        if (bitmap) bitmap.close();
        finishFrameLoad();
      }
    };
    img.onerror = function () {
      finishFrameLoad();     // don't block on a missing frame
    };
  }

  function finishFrameLoad() {
    loaded++;
    activeLoads--;
    onFrameLoaded();
    pumpFrameLoads();
  }

  function pad3(n) {
    return String(n).padStart(3, '0');
  }

  function onFrameLoaded() {
    if (textures[0] || loaded === TOTAL_FRAMES) startIntroRender();
  }

  function startIntroRender() {
    if (renderStarted) return;
    renderStarted = true;

    /* Show scroll hint and skip button */
    const hint = document.getElementById('sc-hint');
    const skip = document.getElementById('sc-skip');
    if (hint) hint.style.opacity = '1';
    if (skip) skip.classList.add('ready');

    resizeCanvas();
    loop();   // start render loop
  }

  /* ─── Canvas Resize ──────────────────────────────────────── */
  function resizeCanvas() {
    const canvas = document.getElementById('sc-canvas');
    if (!canvas || !gl) return;
    /* Account for HiDPI / Retina — render at native pixel density */
    const dpr     = window.devicePixelRatio || 1;
    const w       = window.innerWidth;
    const h       = window.innerHeight;
    canvas.width  = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width  = w + 'px';
    canvas.style.height = h + 'px';
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  /* ─── Scroll → Frame ─────────────────────────────────────── */
  function getTargetFrame() {
    const spacer = document.getElementById('sc-spacer');
    if (!spacer) return 0;
    const maxScroll = spacer.offsetHeight - window.innerHeight;
    if (maxScroll <= 0) return 0;
    const progress = Math.max(0, Math.min(window.scrollY / maxScroll, 1));
    return progress * (TOTAL_FRAMES - 1);
  }

  function getNearestTexture(idx) {
    if (textures[idx]) return textures[idx];
    for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
      const prev = idx - offset;
      const next = idx + offset;
      if (prev >= 0 && textures[prev]) return textures[prev];
      if (next < TOTAL_FRAMES && textures[next]) return textures[next];
    }
    return null;
  }

  function getTexturePair(frame) {
    const frameA = Math.max(0, Math.min(Math.floor(frame), TOTAL_FRAMES - 1));
    const frameB = Math.max(0, Math.min(frameA + 1, TOTAL_FRAMES - 1));
    const texA = textures[frameA] || getNearestTexture(frameA);
    const texB = textures[frameB] || texA;
    return {
      texA,
      texB,
      mix: texA && texB && texA !== texB ? frame - frameA : 0,
    };
  }

  /* ─── Render Loop ────────────────────────────────────────── */
  function loop() {
    rafId = requestAnimationFrame(loop);

    tgtFrame  = getTargetFrame();
    curFrame += (tgtFrame - curFrame) * LERP;

    const pair = getTexturePair(curFrame);
    if (pair.texA && pair.texB && gl) {
      const canvasAR = window.innerWidth / window.innerHeight;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, pair.texA);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, pair.texB);
      gl.uniform1f(loc.imgAR, IMAGE_AR);
      gl.uniform1f(loc.cvAR,  canvasAR);
      gl.uniform1f(loc.mix, pair.mix);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    /* Update thin progress strip at bottom of canvas */
    const strip = document.getElementById('sc-progress-strip');
    if (strip) strip.style.width = (tgtFrame / (TOTAL_FRAMES - 1) * 100).toFixed(2) + '%';

    /* Trigger transition when scroll reaches the very end */
    if (!finished) {
      const spacer = document.getElementById('sc-spacer');
      if (spacer) {
        const maxScroll = spacer.offsetHeight - window.innerHeight;
        if (window.scrollY >= maxScroll - 8) {
          finished = true;
          transitionToApp();
        }
      }
    }
  }

  /* ─── Transition Out ─────────────────────────────────────── */
  function transitionToApp() {
    cancelAnimationFrame(rafId);

    const wrapper = document.getElementById('sc-wrapper');
    const spacer  = document.getElementById('sc-spacer');
    const app     = document.querySelector('.app-layout');

    if (wrapper) {
      wrapper.style.opacity = '0';
    }
    if (app) {
      app.style.display = 'flex';
      requestAnimationFrame(() => { app.style.opacity = '1'; });
    }

    setTimeout(() => {
      if (wrapper) wrapper.style.display = 'none';
      if (spacer)  spacer.remove();
      document.body.style.overflow   = '';
      document.body.style.overflowX  = '';
      document.documentElement.style.overflow = '';
      loadVapiWidget();
    }, 800);
  }

  function loadVapiWidget() {
    if (document.getElementById('vapi-widget-script')) return;
    const script = document.createElement('script');
    script.id = 'vapi-widget-script';
    script.src = 'https://unpkg.com/@vapi-ai/client-sdk-react/dist/embed/widget.umd.js';
    script.async = true;
    script.type = 'text/javascript';
    document.body.appendChild(script);
  }

  /* ─── Init ───────────────────────────────────────────────── */
  function init() {
    /* Allow body to scroll during intro */
    document.documentElement.style.overflow = 'auto';
    document.body.style.overflow    = 'auto';
    document.body.style.overflowX   = 'hidden';

    /* Set spacer height */
    const spacer = document.getElementById('sc-spacer');
    if (spacer) spacer.style.height = SCROLL_VH + 'vh';

    if (!initGL()) {
      /* Fallback: skip the intro entirely */
      skipIntro();
      return;
    }

    /* Wire skip button */
    const skip = document.getElementById('sc-skip');
    if (skip) skip.addEventListener('click', function () {
      if (!finished) { finished = true; transitionToApp(); }
    });

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    /* Load all frames — browser handles concurrency naturally */
    pumpFrameLoads();
  }

  function pumpFrameLoads() {
    while (activeLoads < MAX_LOADS && loadCursor < TOTAL_FRAMES) {
      activeLoads++;
      loadFrame(loadCursor);
      loadCursor++;
    }
  }

  function skipIntro() {
    document.body.style.overflow  = '';
    document.body.style.overflowX = '';
    document.documentElement.style.overflow = '';
    const wrapper = document.getElementById('sc-wrapper');
    const spacer  = document.getElementById('sc-spacer');
    const app     = document.querySelector('.app-layout');
    if (wrapper) wrapper.style.display = 'none';
    if (spacer)  spacer.remove();
    if (app) { app.style.display = 'flex'; app.style.opacity = '1'; }
    loadVapiWidget();
  }

  /* Boot */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
