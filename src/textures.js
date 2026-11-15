// All textures are painted in code on 2D canvases.
import * as THREE from 'three';

export function rng(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function cv(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d')];
}

let maxAniso = 4;
export function setMaxAnisotropy(a) { maxAniso = a; }

function tex(canvas, { repeat = true, aniso = false, size } = {}) {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; }
  if (size) t.repeat.set(1 / size[0], 1 / size[1]);
  t.anisotropy = aniso ? maxAniso : Math.min(2, maxAniso);
  return t;
}

const rgb = (r, g, b, a = 1) => `rgba(${r | 0},${g | 0},${b | 0},${a})`;
const pick = (R, arr) => arr[(R() * arr.length) | 0];

function speckle(g, R, w, h, n, dark, light, a, size = 1.5) {
  for (let i = 0; i < n; i++) {
    g.fillStyle = R() < 0.5 ? rgb(dark[0], dark[1], dark[2], a * R()) : rgb(light[0], light[1], light[2], a * R());
    const s = size * (0.5 + R());
    g.fillRect(R() * w, R() * h, s, s);
  }
}

function blotches(g, R, w, h, n, colors, rMin, rMax, alpha) {
  for (let i = 0; i < n; i++) {
    const x = R() * w, y = R() * h, r = rMin + R() * (rMax - rMin);
    const c = pick(R, colors);
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, rgb(c[0], c[1], c[2], alpha));
    gr.addColorStop(1, rgb(c[0], c[1], c[2], 0));
    g.fillStyle = gr;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }
}

// Short paint strokes, used for the "paintings".
function dabs(g, R, n, x0, y0, x1, y1, colors, len, wid, alpha = 0.8, angle = null, spread = 0.6) {
  for (let i = 0; i < n; i++) {
    const x = x0 + R() * (x1 - x0), y = y0 + R() * (y1 - y0);
    const c = pick(R, colors);
    const a = (angle === null ? R() * Math.PI : angle + (R() - 0.5) * spread);
    const l = len * (0.5 + R());
    g.strokeStyle = rgb(c[0], c[1], c[2], alpha * (0.5 + 0.5 * R()));
    g.lineWidth = wid * (0.5 + R());
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(x - Math.cos(a) * l / 2, y - Math.sin(a) * l / 2);
    g.lineTo(x + Math.cos(a) * l / 2, y + Math.sin(a) * l / 2);
    g.stroke();
  }
}

// ---------------------------------------------------------------- surfaces

export function parquet() {
  const S = 1024, [c, g] = cv(S, S), R = rng(11);
  const N = 24, strip = S / N; // 1024 px = 1.6 m, 6.7 cm staves
  for (let i = 0; i < N; i++) {
    let y = -R() * 320;
    while (y < S) {
      const len = 210 + R() * 170;
      const l = 0.88 + R() * 0.22;
      const hue = R();
      g.fillStyle = rgb(170 * l + hue * 10, 98 * l + hue * 5, 44 * l);
      g.fillRect(i * strip, y, strip + 0.5, len);
      for (let k = 0; k < 9; k++) {
        g.fillStyle = rgb(70, 30, 8, 0.05 + R() * 0.1);
        g.fillRect(i * strip + R() * strip, y, 0.8 + R() * 1.6, len);
      }
      if (R() < 0.25) {
        g.fillStyle = rgb(255, 200, 140, 0.07);
        g.fillRect(i * strip, y, strip, len);
      }
      g.fillStyle = rgb(45, 20, 6, 0.55);
      g.fillRect(i * strip, y + len - 1.2, strip, 1.4);
      y += len;
    }
    g.fillStyle = rgb(45, 20, 6, i % 3 === 0 ? 0.55 : 0.3);
    g.fillRect(i * strip - 0.6, 0, 1.2, S);
  }
  return tex(c, { aniso: true, size: [1.6, 1.6] });
}

// Light, tintable wood grain. Grain runs along U.
export function wood() {
  const S = 512, [c, g] = cv(S, S), R = rng(5);
  g.fillStyle = '#f1ebe0'; g.fillRect(0, 0, S, S);
  for (let i = 0; i < 26; i++) {
    g.fillStyle = rgb(170, 140, 100, 0.05 + R() * 0.08);
    g.fillRect(0, R() * S, S, 6 + R() * 30);
  }
  for (let i = 0; i < 260; i++) {
    const y = R() * S;
    g.strokeStyle = rgb(120, 85, 50, 0.06 + R() * 0.16);
    g.lineWidth = 0.6 + R() * 1.4;
    g.beginPath();
    g.moveTo(0, y);
    const w1 = (R() - 0.5) * 10, w2 = (R() - 0.5) * 10;
    g.bezierCurveTo(S * 0.33, y + w1, S * 0.66, y + w2, S, y);
    g.stroke();
  }
  return tex(c, { size: [1.0, 1.0] });
}

export function plaster() {
  const S = 256, [c, g] = cv(S, S), R = rng(3);
  g.fillStyle = '#fbfaf8'; g.fillRect(0, 0, S, S);
  blotches(g, R, S, S, 60, [[200, 198, 192], [255, 255, 255]], 20, 70, 0.10);
  speckle(g, R, S, S, 5000, [205, 202, 196], [255, 255, 255], 0.35, 1.2);
  return tex(c, { size: [1.5, 1.5] });
}

export function fabric() {
  const S = 256, [c, g] = cv(S, S), R = rng(8);
  g.fillStyle = '#f3f1ec'; g.fillRect(0, 0, S, S);
  for (let i = 0; i < S; i += 2) {
    g.fillStyle = rgb(120, 115, 105, 0.02 + R() * 0.06);
    g.fillRect(i, 0, 1, S);
    g.fillStyle = rgb(120, 115, 105, 0.02 + R() * 0.06);
    g.fillRect(0, i, S, 1);
  }
  blotches(g, R, S, S, 30, [[160, 155, 145], [255, 255, 255]], 20, 60, 0.08);
  return tex(c, { size: [0.25, 0.25] });
}

export function leather() {
  const S = 256, [c, g] = cv(S, S), R = rng(9);
  g.fillStyle = '#f0e8de'; g.fillRect(0, 0, S, S);
  blotches(g, R, S, S, 120, [[150, 120, 90], [255, 250, 240]], 8, 40, 0.12);
  speckle(g, R, S, S, 4000, [140, 110, 80], [255, 255, 255], 0.25, 1.5);
  return tex(c, { size: [0.4, 0.4] });
}

export function weave() { // baskets / rattan
  const S = 128, [c, g] = cv(S, S), R = rng(10);
  g.fillStyle = '#e9dcc3'; g.fillRect(0, 0, S, S);
  for (let y = 0; y < S; y += 8) {
    for (let x = 0; x < S; x += 16) {
      const off = (y / 8) % 2 ? 8 : 0;
      g.fillStyle = rgb(120, 90, 50, 0.25 + R() * 0.2);
      g.fillRect(x + off, y, 7, 7);
      g.fillStyle = rgb(255, 245, 220, 0.3);
      g.fillRect(x + off + 8, y + 1, 7, 2);
    }
  }
  return tex(c, { size: [0.08, 0.08] });
}

export function tiles() { // small tumbled backsplash tiles
  const S = 512, [c, g] = cv(S, S), R = rng(21);
  g.fillStyle = '#cbbfa9'; g.fillRect(0, 0, S, S);
  const n = 8, t = S / n;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const l = 0.93 + R() * 0.1;
    g.fillStyle = rgb(236 * l, 226 * l, 206 * l);
    g.fillRect(i * t + 2, j * t + 2, t - 4, t - 4);
    const gr = g.createLinearGradient(0, j * t, 0, j * t + t);
    gr.addColorStop(0, 'rgba(255,255,255,0.25)'); gr.addColorStop(1, 'rgba(120,100,70,0.12)');
    g.fillStyle = gr; g.fillRect(i * t + 2, j * t + 2, t - 4, t - 4);
  }
  speckle(g, R, S, S, 2500, [170, 150, 120], [255, 255, 255], 0.2, 2);
  return tex(c, { size: [0.42, 0.42] });
}

export function counter() {
  const S = 256, [c, g] = cv(S, S), R = rng(22);
  g.fillStyle = '#34353a'; g.fillRect(0, 0, S, S);
  speckle(g, R, S, S, 7000, [15, 15, 18], [120, 120, 125], 0.5, 1.6);
  return tex(c, { size: [0.5, 0.5] });
}

export function slate() {
  const S = 512, [c, g] = cv(S, S), R = rng(23);
  g.fillStyle = '#15171a'; g.fillRect(0, 0, S, S);
  const n = 2, t = S / n;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const l = 0.85 + R() * 0.3;
    g.fillStyle = rgb(44 * l, 47 * l, 52 * l);
    g.fillRect(i * t + 2, j * t + 2, t - 4, t - 4);
  }
  blotches(g, R, S, S, 90, [[20, 22, 26], [90, 95, 105]], 20, 90, 0.15);
  speckle(g, R, S, S, 5000, [10, 10, 12], [150, 155, 165], 0.3, 1.5);
  return tex(c, { size: [0.76, 0.76] });
}

export function deck() {
  const S = 512, [c, g] = cv(S, S), R = rng(24);
  const n = 6, t = S / n;
  for (let i = 0; i < n; i++) {
    const l = 0.85 + R() * 0.25;
    g.fillStyle = rgb(168 * l, 160 * l, 146 * l);
    g.fillRect(i * t, 0, t, S);
    for (let k = 0; k < 14; k++) {
      g.fillStyle = rgb(80, 72, 60, 0.06 + R() * 0.1);
      g.fillRect(i * t + R() * t, 0, 1 + R() * 2, S);
    }
    g.fillStyle = 'rgba(40,35,28,0.8)'; g.fillRect(i * t, 0, 3, S);
  }
  return tex(c, { size: [0.72, 0.72] });
}

export function panel() { // white painted ceiling boards on the loft
  const S = 256, [c, g] = cv(S, S);
  g.fillStyle = '#fbfaf7'; g.fillRect(0, 0, S, S);
  for (let i = 0; i < 4; i++) {
    g.fillStyle = 'rgba(120,115,105,0.45)'; g.fillRect(0, i * 64, S, 2);
    g.fillStyle = 'rgba(255,255,255,0.9)'; g.fillRect(0, i * 64 + 2, S, 2);
  }
  return tex(c, { size: [0.56, 0.56] });
}

export function grass() {
  const S = 256, [c, g] = cv(S, S), R = rng(31);
  g.fillStyle = '#5d7a3c'; g.fillRect(0, 0, S, S);
  blotches(g, R, S, S, 80, [[70, 100, 40], [110, 130, 70], [80, 95, 50]], 10, 50, 0.3);
  speckle(g, R, S, S, 4000, [40, 60, 25], [150, 170, 90], 0.3, 2);
  return tex(c, { size: [6, 6] });
}

export function roofTiles(color = [176, 72, 50]) {
  const S = 128, [c, g] = cv(S, S), R = rng(32);
  for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) {
    const l = 0.8 + R() * 0.3;
    g.fillStyle = rgb(color[0] * l, color[1] * l, color[2] * l);
    g.fillRect(i * 16, j * 16, 16, 16);
    g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(i * 16, j * 16 + 13, 16, 3);
    g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(i * 16, j * 16, 2, 16);
  }
  return tex(c, { size: [1.6, 1.6] });
}

export function cladding() { // horizontal wooden boards for the neighbours
  const S = 128, [c, g] = cv(S, S);
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, S, S);
  for (let j = 0; j < 8; j++) {
    g.fillStyle = 'rgba(0,0,0,0.22)'; g.fillRect(0, j * 16 + 14, S, 2);
  }
  return tex(c, { size: [1.2, 1.2] });
}

export function sky() {
  const W = 1024, H = 512, [c, g] = cv(W, H), R = rng(40);
  const gr = g.createLinearGradient(0, 0, 0, H);
  gr.addColorStop(0, '#a9bccb'); gr.addColorStop(0.35, '#cdd8df'); gr.addColorStop(0.5, '#e6e9e8');
  gr.addColorStop(0.52, '#8fa08d'); gr.addColorStop(1, '#6f8562');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  // soft overcast clouds
  for (let i = 0; i < 140; i++) {
    const x = R() * W, y = R() * H * 0.48, r = 30 + R() * 110;
    const gg = g.createRadialGradient(x, y, 0, x, y, r);
    const l = R() < 0.5 ? 255 : 150;
    gg.addColorStop(0, rgb(l, l + 3, l + 8, 0.16)); gg.addColorStop(1, rgb(l, l, l, 0));
    g.fillStyle = gg; g.fillRect(x - r, y - r * 0.5, r * 2, r);
  }
  // distant hills with tiny houses along the horizon
  g.fillStyle = '#7d8f8a';
  g.beginPath(); g.moveTo(0, H * 0.5);
  for (let x = 0; x <= W; x += 8) g.lineTo(x, H * 0.5 - 10 - 14 * Math.sin(x * 0.012) - 8 * Math.sin(x * 0.031 + 1));
  g.lineTo(W, H * 0.53); g.lineTo(0, H * 0.53); g.fill();
  g.fillStyle = '#62775f'; g.fillRect(0, H * 0.5, W, H * 0.04);
  for (let i = 0; i < 260; i++) {
    const x = R() * W, y = H * 0.485 + R() * 22;
    g.fillStyle = pick(R, ['#e9e6dd', '#b9503d', '#d8d2c4', '#8c97a0', '#c96f4c', '#556b4a', '#46603d']);
    g.fillRect(x, y, 3 + R() * 5, 2 + R() * 3);
  }
  const t = tex(c, { repeat: false });
  t.wrapS = THREE.RepeatWrapping;
  return t;
}

// ------------------------------------------------------------------- books

export function books(seed = 1, kind = 'novels') {
  const W = 512, H = 128, [c, g] = cv(W, H), R = rng(100 + seed);
  g.fillStyle = '#17120e'; g.fillRect(0, 0, W, H);
  const pal = kind === 'white'
    ? ['#efe9dc', '#e2dccd', '#f5f0e6', '#d9d2c2', '#c9c0ad', '#ebe3d0']
    : ['#7a1f24', '#1d2b4a', '#16161a', '#e8dfc9', '#2f5d50', '#c2572b', '#31708e', '#a8323a', '#d9b34a',
      '#3a2a55', '#b98aa8', '#101418', '#8f2a2a', '#e9c9a6', '#27456b', '#5a7f3a'];
  if (kind === 'games') {
    let y = H;
    while (y > 10) {
      const h = 14 + R() * 16, w = 300 + R() * 200, x = R() * (W - w);
      y -= h;
      g.fillStyle = pick(R, ['#c62d2a', '#e3c53c', '#2b56a3', '#d9d2c0', '#b5272c', '#3a8a8f']);
      g.fillRect(x, y, w, h - 1);
      g.fillStyle = 'rgba(255,255,255,0.75)';
      g.fillRect(x + 20 + R() * 60, y + h * 0.3, 60 + R() * 80, h * 0.35);
    }
    return tex(c, { repeat: false });
  }
  let x = 2;
  while (x < W - 8) {
    const w = 9 + R() * 20, h = 84 + R() * 40;
    g.fillStyle = pick(R, pal);
    g.fillRect(x, H - h, w - 1, h);
    g.fillStyle = `rgba(255,255,255,${0.05 + R() * 0.1})`;
    g.fillRect(x, H - h, 1.5, h);
    if (R() < 0.75) {
      g.fillStyle = R() < 0.5 ? 'rgba(240,225,180,0.75)' : 'rgba(20,20,20,0.55)';
      g.fillRect(x + w * 0.3, H - h + 10 + R() * 10, Math.max(1.5, w * 0.3), h * (0.3 + R() * 0.3));
    }
    if (R() < 0.4) {
      g.fillStyle = pick(R, pal);
      g.fillRect(x, H - 12 - R() * 14, w - 1, 6);
    }
    x += w;
  }
  return tex(c, { repeat: false });
}

export function records() { // vinyl sleeves seen edge-on
  const W = 256, H = 128, [c, g] = cv(W, H), R = rng(77);
  g.fillStyle = '#1a1512'; g.fillRect(0, 0, W, H);
  let x = 1;
  while (x < W) {
    const w = 2 + R() * 3;
    g.fillStyle = pick(R, ['#e6dcc6', '#c9b79a', '#8a2f2a', '#2c3e50', '#d7c7a1', '#3c3c3c', '#b9773e', '#f0ead8', '#6b8a8f']);
    g.fillRect(x, 6 + R() * 6, w, H);
    x += w + 0.5;
  }
  return tex(c, { repeat: false });
}

// -------------------------------------------------------------------- rugs

function fringe(g, W, H, color = '#efe6d2', n = 60, len = 10) {
  g.strokeStyle = color; g.lineWidth = 1.5;
  for (let i = 0; i < n; i++) {
    const x = (i + 0.5) / n * W;
    g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 1, len); g.stroke();
    g.beginPath(); g.moveTo(x, H); g.lineTo(x - 1, H - len); g.stroke();
  }
}

export function rugStriped() {
  const W = 256, H = 512, [c, g] = cv(W, H), R = rng(50);
  g.clearRect(0, 0, W, H);
  const n = 17;
  for (let i = 0; i < n; i++) {
    g.fillStyle = i % 2 ? '#1c1c1e' : '#ece7dc';
    g.fillRect(0, 10 + i * (H - 20) / n, W, (H - 20) / n + 1);
  }
  speckle(g, R, W, H, 3000, [0, 0, 0], [255, 255, 255], 0.12, 2);
  fringe(g, W, H);
  return tex(c, { repeat: false });
}

export function rugJute() {
  const W = 256, H = 512, [c, g] = cv(W, H), R = rng(51);
  g.fillStyle = '#b79a6c'; g.fillRect(0, 10, W, H - 20);
  for (let y = 10; y < H - 10; y += 4) {
    g.fillStyle = rgb(90, 70, 40, 0.15 + R() * 0.25); g.fillRect(0, y, W, 1.5);
    if (R() < 0.12) { g.fillStyle = 'rgba(60,50,40,0.5)'; g.fillRect(0, y, W, 3); }
  }
  for (let x = 0; x < W; x += 3) { g.fillStyle = rgb(230, 210, 170, 0.08 + R() * 0.1); g.fillRect(x, 10, 1, H - 20); }
  fringe(g, W, H, '#e9dfc8');
  return tex(c, { repeat: false });
}

function meander(g, x, y, s, color, lw) {
  g.strokeStyle = color; g.lineWidth = lw; g.lineJoin = 'miter';
  g.beginPath();
  g.moveTo(x, y + s); g.lineTo(x, y); g.lineTo(x + s, y); g.lineTo(x + s, y + s * 0.75);
  g.lineTo(x + s * 0.3, y + s * 0.75); g.lineTo(x + s * 0.3, y + s * 0.35); g.lineTo(x + s * 0.7, y + s * 0.35);
  g.stroke();
}

function diamond(g, x, y, rx, ry, color, lw, fill) {
  g.beginPath(); g.moveTo(x, y - ry); g.lineTo(x + rx, y); g.lineTo(x, y + ry); g.lineTo(x - rx, y); g.closePath();
  if (fill) { g.fillStyle = fill; g.fill(); }
  if (color) { g.strokeStyle = color; g.lineWidth = lw; g.stroke(); }
}

export function rugKelim() { // red/cream rug with key pattern in the music nook
  const W = 256, H = 512, [c, g] = cv(W, H), R = rng(52);
  g.fillStyle = '#93402f'; g.fillRect(0, 8, W, H - 16);
  const cream = '#eadfcb';
  for (let j = 0; j < 9; j++) for (let i = 0; i < 4; i++) {
    const x = 14 + i * 60, y = 22 + j * 53;
    if ((i + j) % 2 === 0) meander(g, x, y, 44, cream, 6);
    else { diamond(g, x + 22, y + 22, 22, 22, cream, 5); diamond(g, x + 22, y + 22, 9, 9, null, 0, cream); }
  }
  g.strokeStyle = cream; g.lineWidth = 4; g.strokeRect(6, 14, W - 12, H - 28);
  speckle(g, R, W, H, 3000, [60, 20, 10], [255, 240, 220], 0.15, 2);
  fringe(g, W, H, cream);
  return tex(c, { repeat: false });
}

export function rugBerber() { // pale rug with diamonds near the recliner
  const W = 256, H = 384, [c, g] = cv(W, H), R = rng(53);
  g.fillStyle = '#e4dccb'; g.fillRect(0, 8, W, H - 16);
  speckle(g, R, W, H, 5000, [150, 140, 120], [255, 255, 255], 0.2, 2);
  const dark = '#6d5f52';
  diamond(g, W / 2, H / 2, 60, 46, dark, 5); diamond(g, W / 2, H / 2, 36, 26, '#a2775a', 4);
  diamond(g, W / 2, H / 2, 12, 9, null, 0, dark);
  for (const [x, y] of [[50, 70], [206, 70], [50, 314], [206, 314], [128, 50], [128, 334]]) {
    diamond(g, x, y, 16, 12, dark, 3);
    g.fillStyle = dark; g.fillRect(x - 2, y - 2, 4, 4);
  }
  for (let i = 0; i < 9; i++) { g.fillStyle = dark; g.fillRect(20 + i * 27, 22, 10, 4); g.fillRect(20 + i * 27, H - 26, 10, 4); }
  fringe(g, W, H, '#efe8d8');
  return tex(c, { repeat: false });
}

export function rugPlain(base = '#c9c2b4', line = 'rgba(90,85,75,0.25)') {
  const W = 128, H = 256, [c, g] = cv(W, H), R = rng(54);
  g.fillStyle = base; g.fillRect(0, 0, W, H);
  for (let y = 0; y < H; y += 4) { g.fillStyle = line; g.fillRect(0, y, W, 1 + R()); }
  speckle(g, R, W, H, 2500, [80, 75, 65], [255, 255, 255], 0.15, 2);
  return tex(c, { repeat: false });
}

export function rugEntry() { // small grey/cream geometric rug in the hall
  const W = 256, H = 384, [c, g] = cv(W, H), R = rng(55);
  g.fillStyle = '#8b7b70'; g.fillRect(0, 8, W, H - 16);
  const cream = '#e8e0d0';
  g.strokeStyle = cream; g.lineWidth = 5; g.strokeRect(16, 24, W - 32, H - 48);
  for (let j = 0; j < 5; j++) for (let i = 0; i < 3; i++) meander(g, 40 + i * 62, 50 + j * 60, 40, cream, 5);
  speckle(g, R, W, H, 2500, [50, 40, 35], [255, 250, 240], 0.15, 2);
  fringe(g, W, H, cream);
  return tex(c, { repeat: false });
}

export function rugMandala() {
  const S = 512, [c, g] = cv(S, S);
  const cx = S / 2, cy = S / 2;
  g.clearRect(0, 0, S, S);
  // fringe
  g.strokeStyle = '#efe7d6'; g.lineWidth = 2;
  for (let i = 0; i < 180; i++) {
    const a = i / 180 * Math.PI * 2;
    g.beginPath(); g.moveTo(cx + Math.cos(a) * 232, cy + Math.sin(a) * 232);
    g.lineTo(cx + Math.cos(a + 0.01) * 254, cy + Math.sin(a + 0.01) * 254); g.stroke();
  }
  const rings = [[236, '#f0ebe0'], [228, '#1b1b1d'], [214, '#f0ebe0'], [196, '#1b1b1d'], [188, '#f0ebe0'],
    [150, '#1b1b1d'], [142, '#f0ebe0'], [104, '#1b1b1d'], [96, '#f0ebe0'], [60, '#1b1b1d'], [52, '#f0ebe0'], [20, '#1b1b1d']];
  for (const [r, col] of rings) { g.fillStyle = col; g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill(); }
  const petals = (r0, r1, n, col, w) => {
    g.strokeStyle = col; g.lineWidth = w;
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2, b = (i + 0.5) / n * Math.PI * 2, d = (i + 1) / n * Math.PI * 2;
      g.beginPath();
      g.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
      g.quadraticCurveTo(cx + Math.cos(b) * (r1 * 1.12), cy + Math.sin(b) * (r1 * 1.12),
        cx + Math.cos(d) * r0, cy + Math.sin(d) * r0);
      g.stroke();
    }
  };
  petals(152, 184, 28, '#1b1b1d', 4); petals(152, 172, 28, '#1b1b1d', 2);
  petals(106, 138, 20, '#1b1b1d', 4); petals(62, 92, 14, '#1b1b1d', 4); petals(22, 48, 10, '#1b1b1d', 3);
  for (let i = 0; i < 48; i++) {
    const a = i / 48 * Math.PI * 2;
    g.fillStyle = '#1b1b1d'; g.beginPath();
    g.arc(cx + Math.cos(a) * 205, cy + Math.sin(a) * 205, 4, 0, Math.PI * 2); g.fill();
  }
  return tex(c, { repeat: false });
}

export function clothStriped() { // the cloth covering the keyboard
  const W = 128, H = 256, [c, g] = cv(W, H), R = rng(57);
  g.fillStyle = '#e6dcc2'; g.fillRect(0, 0, W, H);
  for (const [x, w] of [[22, 22], [60, 30], [100, 14]]) { g.fillStyle = '#b06a4c'; g.fillRect(x, 0, w, H); }
  for (const x of [20, 46, 56, 92, 98, 116]) { g.fillStyle = 'rgba(250,245,230,0.9)'; g.fillRect(x, 0, 2, H); }
  speckle(g, R, W, H, 2000, [90, 60, 40], [255, 255, 255], 0.15, 2);
  return tex(c, { repeat: false });
}

export function runner() { // table runner with a faded pattern
  const W = 256, H = 128, [c, g] = cv(W, H), R = rng(58);
  g.fillStyle = '#e3d6bd'; g.fillRect(0, 0, W, H);
  blotches(g, R, W, H, 90, [[170, 110, 80], [200, 160, 120], [120, 90, 70]], 6, 22, 0.35);
  g.strokeStyle = 'rgba(120,80,60,0.6)'; g.lineWidth = 3; g.strokeRect(8, 8, W - 16, H - 16);
  return tex(c, { repeat: false });
}

// --------------------------------------------------------------------- art

function artBase(w, h, seed) {
  const [c, g] = cv(w, h);
  return [c, g, rng(seed)];
}

export const art = {
  purpleForest() {
    const [c, g, R] = artBase(320, 256, 201);
    const gr = g.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, '#6d5aa8'); gr.addColorStop(0.45, '#d9b7d6'); gr.addColorStop(1, '#3c2c66');
    g.fillStyle = gr; g.fillRect(0, 0, 320, 256);
    dabs(g, R, 500, 0, 0, 320, 120, [[80, 60, 150], [120, 90, 180], [50, 40, 110], [200, 150, 210]], 16, 6, 0.6);
    dabs(g, R, 120, 110, 40, 230, 130, [[255, 225, 235], [250, 200, 220], [255, 240, 200]], 14, 7, 0.55);
    for (let i = 0; i < 14; i++) {
      const x = R() * 320;
      g.strokeStyle = rgb(35 + R() * 30, 25 + R() * 20, 70 + R() * 40, 0.8); g.lineWidth = 2 + R() * 5;
      g.beginPath(); g.moveTo(x, 20 + R() * 40); g.lineTo(x + (R() - 0.5) * 20, 190 + R() * 40); g.stroke();
    }
    dabs(g, R, 300, 0, 150, 320, 256, [[60, 45, 120], [150, 110, 190], [225, 190, 230], [40, 30, 90]], 20, 6, 0.6, 0, 0.5);
    dabs(g, R, 90, 0, 120, 320, 256, [[220, 70, 110], [240, 130, 150]], 6, 5, 0.8);
    return tex(c, { repeat: false });
  },
  cityNight() {
    const [c, g, R] = artBase(256, 256, 202);
    g.fillStyle = '#1b2026'; g.fillRect(0, 0, 256, 256);
    const gr = g.createRadialGradient(128, 60, 5, 128, 60, 150);
    gr.addColorStop(0, 'rgba(225,225,220,0.95)'); gr.addColorStop(1, 'rgba(40,48,58,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
    dabs(g, R, 260, 0, 0, 90, 256, [[20, 24, 30], [45, 52, 62], [10, 12, 16]], 30, 7, 0.7, Math.PI / 2, 0.5);
    dabs(g, R, 260, 166, 0, 256, 256, [[20, 24, 30], [45, 52, 62], [10, 12, 16]], 30, 7, 0.7, Math.PI / 2, 0.5);
    dabs(g, R, 220, 10, 135, 246, 185, [[235, 150, 40], [255, 190, 70], [190, 95, 20], [255, 220, 130]], 10, 5, 0.85, 0, 0.8);
    dabs(g, R, 120, 60, 185, 196, 256, [[200, 120, 40], [120, 110, 100], [230, 230, 220]], 26, 4, 0.45, Math.PI / 2, 0.3);
    dabs(g, R, 60, 0, 190, 256, 256, [[10, 12, 16]], 30, 8, 0.6, 0, 0.3);
    return tex(c, { repeat: false });
  },
  forestGirl() {
    const [c, g, R] = artBase(224, 300, 203);
    const gr = g.createLinearGradient(0, 0, 0, 300);
    gr.addColorStop(0, '#e9f0c0'); gr.addColorStop(0.6, '#8fb24a'); gr.addColorStop(1, '#2c4a22');
    g.fillStyle = gr; g.fillRect(0, 0, 224, 300);
    blotches(g, R, 224, 180, 60, [[250, 255, 210], [200, 230, 120]], 8, 26, 0.5);
    for (let i = 0; i < 22; i++) {
      const x = R() * 224;
      g.fillStyle = rgb(40 + R() * 40, 60 + R() * 50, 20 + R() * 20, 0.75);
      g.fillRect(x, 0, 2 + R() * 7, 230 + R() * 40);
    }
    dabs(g, R, 200, 0, 220, 224, 300, [[30, 70, 30], [70, 110, 40], [140, 90, 170], [20, 40, 20]], 12, 5, 0.8);
    g.fillStyle = '#c8281e'; g.beginPath(); g.moveTo(88, 232); g.lineTo(104, 232); g.lineTo(110, 262); g.lineTo(82, 262); g.fill();
    g.fillStyle = '#3a2418'; g.beginPath(); g.arc(96, 226, 6, 0, 7); g.fill();
    return tex(c, { repeat: false });
  },
  greenClouds() {
    const [c, g, R] = artBase(224, 300, 204);
    g.fillStyle = '#f2f1e8'; g.fillRect(0, 0, 224, 300);
    blotches(g, R, 224, 300, 70, [[120, 165, 120], [150, 190, 150], [100, 150, 110]], 14, 46, 0.4);
    blotches(g, R, 224, 300, 30, [[250, 250, 245]], 20, 50, 0.6);
    g.strokeStyle = '#2b2b2b'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(40, 160); g.lineTo(130, 150); g.stroke();
    g.fillStyle = '#23303a'; g.fillRect(104, 138, 5, 14); g.beginPath(); g.arc(106.5, 135, 3.5, 0, 7); g.fill();
    return tex(c, { repeat: false });
  },
  ochre() {
    const [c, g, R] = artBase(256, 300, 205);
    const gr = g.createLinearGradient(0, 0, 0, 300);
    gr.addColorStop(0, '#8a6a2c'); gr.addColorStop(0.35, '#d9b464'); gr.addColorStop(0.55, '#3a2c2a'); gr.addColorStop(1, '#161a2a');
    g.fillStyle = gr; g.fillRect(0, 0, 256, 300);
    dabs(g, R, 300, 0, 0, 256, 150, [[215, 180, 95], [170, 125, 50], [240, 215, 150], [120, 80, 40]], 26, 9, 0.5);
    blotches(g, R, 256, 110, 12, [[250, 235, 180]], 20, 50, 0.5);
    dabs(g, R, 300, 0, 150, 256, 300, [[20, 22, 40], [50, 35, 35], [12, 14, 24], [90, 60, 50]], 24, 9, 0.6);
    dabs(g, R, 60, 60, 200, 200, 290, [[230, 215, 170], [200, 180, 140]], 18, 4, 0.5, Math.PI / 2, 0.4);
    return tex(c, { repeat: false });
  },
  stag() {
    const [c, g] = artBase(256, 256, 206);
    g.fillStyle = '#0b0b10'; g.fillRect(0, 0, 256, 256);
    g.strokeStyle = '#c9c7c2'; g.lineWidth = 1.6; g.lineJoin = 'round';
    const L = (pts) => { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke(); };
    const half = (s) => {
      const X = (x) => 128 + s * x;
      L([[X(0), 250], [X(22), 205], [X(30), 170], [X(46), 150], [X(26), 140], [X(10), 150], [X(0), 172]]);
      L([[X(22), 205], [X(8), 190], [X(0), 172]]); L([[X(30), 170], [X(10), 150]]); L([[X(8), 190], [X(30), 170]]);
      L([[X(0), 250], [X(8), 190]]); L([[X(26), 140], [X(14), 128], [X(0), 136]]); L([[X(14), 128], [X(10), 150]]);
      // ear
      L([[X(46), 150], [X(70), 136], [X(52), 128], [X(26), 140]]);
      // antler
      L([[X(16), 128], [X(26), 96], [X(52), 78], [X(74), 40], [X(84), 12]]);
      L([[X(22), 128], [X(34), 100], [X(58), 84], [X(80), 46], [X(84), 12]]);
      L([[X(26), 96], [X(14), 60], [X(18), 30]]); L([[X(34), 100], [X(22), 62], [X(18), 30]]);
      L([[X(52), 78], [X(42), 44], [X(50), 18]]); L([[X(58), 84], [X(52), 48], [X(50), 18]]);
      L([[X(64), 62], [X(96), 50], [X(108), 26]]); L([[X(70), 70], [X(100), 58], [X(108), 26]]);
      L([[X(26), 96], [X(34), 100]]); L([[X(52), 78], [X(58), 84]]); L([[X(74), 40], [X(80), 46]]);
    };
    half(1); half(-1);
    return tex(c, { repeat: false });
  },
  fish(color) {
    const [c, g, R] = artBase(256, 180, color === 'red' ? 207 : 208);
    g.fillStyle = '#f4f1ea'; g.fillRect(0, 0, 256, 180);
    g.fillStyle = color === 'red' ? '#8a2c2c' : '#2f9a78'; g.fillRect(14, 12, 228, 156);
    speckle(g, R, 256, 180, 2500, [0, 0, 0], [255, 255, 255], 0.2, 2);
    g.strokeStyle = 'rgba(240,238,230,0.85)'; g.lineWidth = 1.5;
    for (const [fx, fy, s] of [[90, 60, 1], [160, 90, -1], [100, 125, 1]]) {
      g.beginPath(); g.moveTo(fx - 40 * s, fy); g.lineTo(fx + 40 * s, fy); g.stroke();
      for (let k = -4; k <= 4; k++) {
        const x = fx + k * 8 * s, l = 16 - Math.abs(k) * 2.5;
        g.beginPath(); g.moveTo(x - 4 * s, fy - l); g.lineTo(x, fy); g.lineTo(x - 4 * s, fy + l); g.stroke();
      }
      g.beginPath(); g.moveTo(fx - 40 * s, fy); g.lineTo(fx - 54 * s, fy - 12); g.lineTo(fx - 54 * s, fy + 12); g.closePath(); g.stroke();
      g.beginPath(); g.arc(fx + 44 * s, fy, 7, 0, 7); g.stroke();
    }
    return tex(c, { repeat: false });
  },
  warmPrint() {
    const [c, g, R] = artBase(200, 280, 209);
    g.fillStyle = '#efe4d2'; g.fillRect(0, 0, 200, 280);
    blotches(g, R, 200, 280, 26, [[190, 110, 80], [215, 160, 120], [150, 120, 100], [225, 190, 150], [120, 90, 80]], 20, 60, 0.6);
    dabs(g, R, 40, 20, 20, 180, 260, [[110, 70, 55], [240, 225, 205]], 40, 5, 0.6);
    return tex(c, { repeat: false });
  },
  tulips() {
    const [c, g, R] = artBase(256, 256, 210);
    const gr = g.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, '#3fa6e0'); gr.addColorStop(0.62, '#9ed8f0'); gr.addColorStop(0.63, '#7cc04a'); gr.addColorStop(1, '#4f9a32');
    g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
    g.fillStyle = '#5fae4a'; g.beginPath(); g.moveTo(92, 150); g.lineTo(164, 150); g.lineTo(152, 212); g.lineTo(104, 212); g.fill();
    for (let i = 0; i < 13; i++) {
      const x = 70 + R() * 116, y = 52 + R() * 70;
      g.strokeStyle = '#2f7a2c'; g.lineWidth = 3; g.beginPath(); g.moveTo(128 + (x - 128) * 0.3, 152); g.lineTo(x, y + 12); g.stroke();
      g.fillStyle = pick(R, ['#e0261e', '#f04a2a', '#f7c21e', '#e8372a']);
      g.beginPath(); g.ellipse(x, y, 10, 15, 0, 0, 7); g.fill();
      g.fillStyle = 'rgba(255,220,60,0.55)'; g.beginPath(); g.ellipse(x - 3, y + 4, 4, 8, 0, 0, 7); g.fill();
    }
    for (const x of [70, 96, 170, 190]) { g.fillStyle = '#e66a2c'; g.beginPath(); g.ellipse(x, 222, 12, 9, 0, 0, 7); g.fill(); }
    return tex(c, { repeat: false });
  },
  town(seed) {
    const [c, g, R] = artBase(220, 170, 220 + seed);
    g.fillStyle = '#f3efe4'; g.fillRect(0, 0, 220, 170);
    g.fillStyle = 'rgba(190,210,225,0.7)'; g.fillRect(14, 14, 192, 60);
    let x = 14;
    while (x < 200) {
      const w = 22 + R() * 34, h = 40 + R() * 50;
      g.fillStyle = pick(R, ['#d8c6a6', '#c9a98a', '#b9c0c4', '#e2d6bd', '#a9b59a', '#c88f72', '#d9d2c6']);
      g.fillRect(x, 130 - h, Math.min(w, 206 - x), h);
      g.fillStyle = pick(R, ['#8a4a3a', '#5f6a70', '#7a5a48']);
      g.beginPath(); g.moveTo(x - 2, 130 - h); g.lineTo(x + w / 2, 118 - h); g.lineTo(x + w + 2, 130 - h); g.fill();
      g.fillStyle = 'rgba(60,60,70,0.55)';
      for (let wy = 138 - h; wy < 122; wy += 12) for (let wx = x + 4; wx < x + w - 6; wx += 9) g.fillRect(wx, wy, 4, 6);
      x += w + 1;
    }
    g.fillStyle = 'rgba(170,160,140,0.6)'; g.fillRect(14, 130, 192, 26);
    return tex(c, { repeat: false });
  },
  winter() {
    const [c, g, R] = artBase(300, 220, 230);
    g.fillStyle = '#eef1f2'; g.fillRect(0, 0, 300, 220);
    g.fillStyle = '#d9e3e8'; g.fillRect(0, 0, 300, 70);
    g.fillStyle = '#5f8fae'; g.fillRect(170, 50, 100, 110);
    g.fillStyle = '#e9eef0'; g.beginPath(); g.moveTo(160, 52); g.lineTo(220, 22); g.lineTo(280, 52); g.fill();
    g.fillStyle = '#a23a30'; g.fillRect(40, 84, 60, 50); g.fillRect(104, 96, 40, 38);
    g.fillStyle = '#e9eef0'; g.beginPath(); g.moveTo(34, 86); g.lineTo(70, 64); g.lineTo(106, 86); g.fill();
    g.fillStyle = 'rgba(40,50,60,0.6)';
    for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) g.fillRect(182 + i * 22, 64 + j * 28, 9, 14);
    g.strokeStyle = 'rgba(120,150,170,0.7)'; g.lineWidth = 8;
    g.beginPath(); g.moveTo(20, 215); g.quadraticCurveTo(110, 160, 150, 140); g.stroke();
    dabs(g, R, 20, 100, 150, 200, 200, [[200, 60, 40], [60, 60, 70], [210, 150, 60]], 5, 4, 0.9);
    return tex(c, { repeat: false });
  },
  forestPrint() {
    const [c, g, R] = artBase(300, 220, 231);
    const gr = g.createLinearGradient(0, 0, 0, 220);
    gr.addColorStop(0, '#9cc9bd'); gr.addColorStop(1, '#1f4a4a');
    g.fillStyle = gr; g.fillRect(0, 0, 300, 220);
    for (let i = 0; i < 16; i++) {
      const x = R() * 300, w = 6 + R() * 22;
      g.fillStyle = rgb(18 + R() * 30, 52 + R() * 40, 56 + R() * 30, 0.75); g.fillRect(x, 0, w, 220);
    }
    blotches(g, R, 300, 220, 30, [[180, 225, 210]], 20, 60, 0.25);
    const gl = g.createRadialGradient(225, 70, 2, 225, 70, 40);
    gl.addColorStop(0, 'rgba(255,190,90,1)'); gl.addColorStop(1, 'rgba(255,150,50,0)');
    g.fillStyle = gl; g.fillRect(180, 30, 90, 90);
    g.fillStyle = '#13282c'; g.fillRect(150, 150, 150, 6);
    for (let x = 156; x < 300; x += 14) g.fillRect(x, 150, 3, 50);
    g.fillRect(70, 128, 6, 16); g.beginPath(); g.arc(73, 124, 4, 0, 7); g.fill();
    return tex(c, { repeat: false });
  },
  // Generic, featureless portrait placeholder (no real person is depicted).
  portrait(seed) {
    const [c, g, R] = artBase(128, 160, 300 + seed);
    const bg = pick(R, [[120, 130, 140], [70, 80, 95], [150, 140, 125], [90, 110, 100], [60, 66, 78]]);
    const gr = g.createRadialGradient(64, 60, 10, 64, 80, 120);
    gr.addColorStop(0, rgb(bg[0] + 40, bg[1] + 40, bg[2] + 40)); gr.addColorStop(1, rgb(bg[0] - 30, bg[1] - 30, bg[2] - 30));
    g.fillStyle = gr; g.fillRect(0, 0, 128, 160);
    const top = pick(R, ['#3b3f48', '#8a8f96', '#2f3b52', '#6d6f72', '#b9b3aa']);
    g.fillStyle = top; g.beginPath(); g.ellipse(64, 170, 52, 62, 0, 0, 7); g.fill();
    g.fillStyle = '#d9b9a3'; g.beginPath(); g.ellipse(64, 70, 21, 26, 0, 0, 7); g.fill();
    g.fillStyle = pick(R, ['#4a3526', '#2a2019', '#7a5a3a', '#96703f']);
    g.beginPath(); g.ellipse(64, 54, 23, 17, 0, Math.PI, 0); g.fill();
    return tex(c, { repeat: false });
  },
  underwater() {
    const [c, g, R] = artBase(200, 140, 320);
    const gr = g.createLinearGradient(0, 0, 0, 140);
    gr.addColorStop(0, '#49b3e0'); gr.addColorStop(1, '#0e5f9a');
    g.fillStyle = gr; g.fillRect(0, 0, 200, 140);
    blotches(g, R, 200, 140, 40, [[200, 240, 255]], 5, 20, 0.3);
    for (const x of [60, 100, 140]) {
      g.fillStyle = '#d9b9a3'; g.beginPath(); g.ellipse(x, 70, 12, 22, 0, 0, 7); g.fill();
      g.fillStyle = pick(R, ['#e0503a', '#f2a23a', '#3a3a3a']); g.fillRect(x - 12, 62, 24, 16);
    }
    return tex(c, { repeat: false });
  },
  tapestry() { // woven band with eight-petal stars
    const [c, g] = artBase(96, 416, 240);
    g.fillStyle = '#16130f'; g.fillRect(0, 0, 96, 416);
    const cols = ['#c8332a', '#e1862a', '#e8c23a', '#2f6a3a', '#d95a2a', '#3a5a8a'];
    for (let j = 0; j < 8; j++) {
      const cy = 26 + j * 52, cx = 48;
      diamond(g, cx, cy, 34, 26, null, 0, cols[j % cols.length]);
      diamond(g, cx, cy, 24, 18, null, 0, '#efe6cc');
      diamond(g, cx, cy, 15, 11, null, 0, cols[(j + 2) % cols.length]);
      diamond(g, cx, cy, 6, 5, null, 0, '#16130f');
      for (const s of [-1, 1]) {
        diamond(g, cx + s * 36, cy - 26, 9, 7, null, 0, cols[(j + 1) % cols.length]);
        diamond(g, cx + s * 36, cy + 26, 9, 7, null, 0, cols[(j + 4) % cols.length]);
      }
    }
    for (let y = 0; y < 416; y += 12) {
      g.fillStyle = (y / 12) % 2 ? '#c8332a' : '#e8c23a';
      g.beginPath(); g.moveTo(0, y); g.lineTo(8, y + 6); g.lineTo(0, y + 12); g.fill();
      g.beginPath(); g.moveTo(96, y); g.lineTo(88, y + 6); g.lineTo(96, y + 12); g.fill();
    }
    for (let y = 0; y < 416; y += 3) { g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(0, y, 96, 1); }
    return tex(c, { repeat: false });
  },
  rya() { // long-pile wall rug in brown / orange / yellow
    const [c, g, R] = artBase(128, 256, 241);
    g.fillStyle = '#5a2414'; g.fillRect(0, 0, 128, 256);
    blotches(g, R, 128, 256, 40, [[20, 10, 8], [40, 16, 10]], 12, 34, 0.9);
    blotches(g, R, 128, 256, 34, [[200, 80, 20], [226, 120, 24]], 8, 22, 0.9);
    blotches(g, R, 128, 256, 22, [[240, 190, 40]], 4, 12, 0.9);
    blotches(g, R, 128, 256, 26, [[16, 8, 6]], 6, 16, 0.85);
    dabs(g, R, 1500, 0, 0, 128, 256, [[30, 12, 8], [210, 100, 30], [120, 40, 16], [240, 180, 50]], 5, 1.5, 0.5, Math.PI / 2, 0.8);
    return tex(c, { repeat: false });
  },
  fridge(part) {
    const [c, g, R] = artBase(256, part === 'top' ? 256 : 384, 250 + (part === 'top' ? 0 : 1));
    const H = c.height;
    const gr = g.createLinearGradient(0, 0, 256, 0);
    gr.addColorStop(0, '#8b8e90'); gr.addColorStop(0.5, '#b4b7b8'); gr.addColorStop(1, '#8f9294');
    g.fillStyle = gr; g.fillRect(0, 0, 256, H);
    for (let y = 0; y < H; y += 2) { g.fillStyle = `rgba(255,255,255,${R() * 0.06})`; g.fillRect(0, y, 256, 1); }
    const note = (x, y, w, h, col, rot, lines = true) => {
      g.save(); g.translate(x, y); g.rotate(rot);
      g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(-w / 2 + 2, -h / 2 + 3, w, h);
      g.fillStyle = col; g.fillRect(-w / 2, -h / 2, w, h);
      if (lines) { g.fillStyle = 'rgba(60,70,110,0.45)'; for (let ly = -h / 2 + 8; ly < h / 2 - 6; ly += 7) g.fillRect(-w / 2 + 6, ly, (w - 12) * (0.5 + R() * 0.5), 1.5); }
      g.fillStyle = '#5a5a5e'; g.beginPath(); g.arc(0, -h / 2 + 7, 6, 0, 7); g.fill();
      g.restore();
    };
    if (part === 'top') {
      note(70, 80, 64, 80, '#f1ede2', -0.2); note(150, 60, 50, 66, '#2c3a52', 0.05, false);
      note(205, 70, 56, 62, '#f4f2ec', 0); note(96, 170, 60, 74, '#f0e23a', 0.5, false);
      note(180, 150, 40, 30, '#e9e2d0', 0); note(214, 190, 46, 32, '#7a7f86', 0, false);
      note(40, 200, 44, 40, '#46484c', 0.2, false); note(150, 210, 56, 40, '#f2efe8', -0.1);
    } else {
      note(60, 60, 70, 70, '#cfe6da', -0.1); note(140, 50, 60, 54, '#7a4ab0', 0.1, false);
      note(205, 70, 50, 70, '#2f7a4a', 0.05, false); note(80, 160, 66, 90, '#f3f0e8', 0.25);
      note(170, 150, 60, 44, '#dfe8ee', 0); note(190, 215, 52, 56, '#f2efe8', 0);
    }
    return tex(c, { repeat: false });
  },
  clock() {
    const [c, g] = artBase(128, 96, 260);
    g.fillStyle = '#1c2a44'; g.fillRect(0, 0, 128, 96);
    g.fillStyle = '#e8eef8'; g.font = 'bold 22px sans-serif'; g.fillText('10:30', 10, 28);
    g.strokeStyle = '#e8eef8'; g.lineWidth = 4; g.beginPath(); g.moveTo(40, 32); g.lineTo(96, 84); g.stroke();
    return tex(c, { repeat: false });
  },
  sheet() {
    const [c, g] = artBase(128, 160, 261);
    g.fillStyle = '#f4f1e8'; g.fillRect(0, 0, 128, 160);
    g.strokeStyle = '#333'; g.lineWidth = 1;
    for (let s = 0; s < 6; s++) for (let l = 0; l < 5; l++) {
      const y = 14 + s * 24 + l * 3; g.beginPath(); g.moveTo(8, y); g.lineTo(120, y); g.stroke();
    }
    const R = rng(262); g.fillStyle = '#222';
    for (let s = 0; s < 6; s++) for (let i = 0; i < 12; i++) {
      g.beginPath(); g.ellipse(14 + i * 9, 14 + s * 24 + R() * 12, 2.4, 1.8, -0.4, 0, 7); g.fill();
    }
    return tex(c, { repeat: false });
  },
  barometer() {
    const [c, g] = artBase(128, 128, 263);
    g.fillStyle = '#7a4a2a'; g.fillRect(0, 0, 128, 128);
    g.fillStyle = '#c9a24a'; g.beginPath(); g.arc(64, 64, 50, 0, 7); g.fill();
    g.fillStyle = '#f2ecd8'; g.beginPath(); g.arc(64, 64, 44, 0, 7); g.fill();
    g.strokeStyle = '#333'; g.lineWidth = 1.5;
    for (let i = 0; i < 40; i++) {
      const a = Math.PI * 0.75 + i / 39 * Math.PI * 1.5;
      g.beginPath(); g.moveTo(64 + Math.cos(a) * 36, 64 + Math.sin(a) * 36); g.lineTo(64 + Math.cos(a) * 42, 64 + Math.sin(a) * 42); g.stroke();
    }
    g.fillStyle = '#c9a24a'; g.beginPath(); g.arc(64, 64, 14, 0, 7); g.fill();
    g.strokeStyle = '#222'; g.lineWidth = 2; g.beginPath(); g.moveTo(64, 64); g.lineTo(88, 40); g.stroke();
    return tex(c, { repeat: false });
  },
  globe() {
    const [c, g, R] = artBase(256, 128, 264);
    g.fillStyle = '#3aa6b4'; g.fillRect(0, 0, 256, 128);
    blotches(g, R, 256, 128, 40, [[60, 190, 200], [30, 130, 160]], 10, 40, 0.3);
    const land = ['#d9c06a', '#9ab85a', '#e0a65a', '#c9d08a', '#e6c98a'];
    for (let i = 0; i < 26; i++) {
      g.fillStyle = pick(R, land);
      const x = R() * 256, y = 18 + R() * 86;
      g.beginPath(); g.ellipse(x, y, 8 + R() * 22, 6 + R() * 14, R() * 3, 0, 7); g.fill();
      g.beginPath(); g.ellipse(x + (R() - 0.5) * 30, y + (R() - 0.5) * 20, 6 + R() * 14, 5 + R() * 10, R() * 3, 0, 7); g.fill();
    }
    g.strokeStyle = 'rgba(255,255,255,0.25)'; g.lineWidth = 1;
    for (let i = 1; i < 6; i++) { g.beginPath(); g.moveTo(0, i * 21); g.lineTo(256, i * 21); g.stroke(); }
    for (let i = 0; i < 12; i++) { g.beginPath(); g.moveTo(i * 21.3, 0); g.lineTo(i * 21.3, 128); g.stroke(); }
    return tex(c, { repeat: false });
  },
  zither() {
    const [c, g, R] = artBase(160, 128, 265);
    g.fillStyle = '#121214'; g.fillRect(0, 0, 160, 128);
    g.strokeStyle = '#c9b48a'; g.lineWidth = 2; g.strokeRect(5, 5, 150, 118);
    g.fillStyle = '#d9d0b8'; g.beginPath(); g.arc(96, 70, 15, 0, 7); g.fill();
    g.fillStyle = '#121214'; g.beginPath(); g.arc(96, 70, 10, 0, 7); g.fill();
    for (let i = 0; i < 9; i++) {
      g.fillStyle = pick(R, ['#c8332a', '#e06a8a', '#d94a3a']);
      g.beginPath(); g.arc(40 + R() * 50, 26 + R() * 50, 6, 0, 7); g.fill();
    }
    dabs(g, R, 30, 30, 20, 100, 84, [[60, 130, 60]], 10, 2, 0.9);
    g.strokeStyle = 'rgba(220,220,220,0.5)'; g.lineWidth = 1;
    for (let i = 0; i < 14; i++) { g.beginPath(); g.moveTo(10, 14 + i * 7); g.lineTo(150, 14 + i * 7); g.stroke(); }
    g.fillStyle = '#e8e2d0'; for (let i = 0; i < 6; i++) g.fillRect(14 + i * 23, 104, 20, 12);
    return tex(c, { repeat: false });
  },
};
