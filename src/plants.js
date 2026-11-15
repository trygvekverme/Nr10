// Procedural house plants. Leaves are small curved strips with vertex colours,
// all merged into the shared "leaf" material.
import * as THREE from 'three';
import { rng } from './textures.js';

const _col = new THREE.Color();
const _col2 = new THREE.Color();

// A curved blade: starts at the origin heading along +z at elevation `elev`,
// bends down by `bend` radians along its length. shape: 'lance' | 'oval' | 'heart' | 'blade'
function leafGeometry({ len, wid, elev = 0.6, bend = 0.8, segs = 4, shape = 'lance', base = 0x3f7a35, tip = 0x5e9a44, mid = null, fold = 0.25 }) {
  const pos = [], col = [], idx = [];
  let y = 0, z = 0, a = elev;
  const seg = len / segs;
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    let w;
    if (shape === 'blade') w = wid * (0.55 + 0.45 * Math.sin(Math.PI * Math.min(1, t * 1.6) * 0.5)) * (t > 0.75 ? (1 - t) / 0.25 : 1);
    else if (shape === 'oval') w = wid * Math.sin(Math.PI * Math.pow(t, 0.8)) + (t === 0 ? wid * 0.08 : 0);
    else if (shape === 'heart') w = wid * (t < 0.3 ? 0.35 + t / 0.3 * 0.65 : Math.pow(Math.max(0, (1 - t) / 0.7), 0.7));
    else w = wid * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.65)), 0.9) + (t === 0 ? wid * 0.1 : 0);
    const lift = w * fold;
    pos.push(-w / 2, y + lift, z, 0, y, z, w / 2, y + lift, z);
    _col.set(base).lerp(_col2.set(tip), t);
    const edge = _col.clone();
    const m = mid ? _col2.set(mid).lerp(_col, t * 0.5) : _col;
    col.push(edge.r, edge.g, edge.b, m.r, m.g, m.b, edge.r, edge.g, edge.b);
    if (i < segs) {
      const k = i * 3;
      idx.push(k, k + 1, k + 3, k + 1, k + 4, k + 3, k + 1, k + 2, k + 4, k + 2, k + 5, k + 4);
    }
    y += Math.sin(a) * seg; z += Math.cos(a) * seg;
    a -= bend / segs;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

export function pot(b, M, x, y, z, r, h, o = {}) {
  const mat = o.mat || M.matte;
  b.cyl(x, y, z, r * (o.taper ?? 0.8), h, mat, { color: o.color ?? 0xeeeae2, rTop: r, seg: 16 });
  b.cyl(x, y + h - 0.012, z, r * 0.9, 0.006, M.matte, { color: 0x2e241b, solid: false, seg: 12 });
  return y + h - 0.01;
}

// Rosette of strap leaves (dracaena, snake plant ...)
export function rosette(b, M, x, y, z, o = {}) {
  const R = rng(o.seed ?? 1);
  const n = o.n ?? 24;
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const len = (o.len ?? 0.4) * (0.65 + R() * 0.5);
    const g = leafGeometry({
      len, wid: (o.wid ?? 0.04) * (0.8 + R() * 0.4),
      elev: (o.elev ?? 1.0) - t * (o.elevSpread ?? 0.7) + (R() - 0.5) * 0.2,
      bend: (o.bend ?? 1.2) * (0.6 + R() * 0.8), segs: o.segs ?? 5, shape: o.shape ?? 'blade',
      base: o.base ?? 0x2f6b2c, tip: o.tip ?? 0x4f9a3c, mid: o.mid ?? null, fold: o.fold ?? 0.2,
    });
    b.geo(g, { pos: [x, y + (o.stem ?? 0) * R(), z], rot: [0, R() * Math.PI * 2, 0] }, M.leaf, { cast: o.cast ?? true });
    g.dispose();
  }
}

// Trunk with a cloud of leaves (ficus, schefflera, monstera, bonsai ...)
export function bush(b, M, x, y, z, o = {}) {
  const R = rng(o.seed ?? 2);
  const h = o.trunk ?? 0.5;
  if (h > 0.02) {
    b.cyl(x, y, z, o.trunkR ?? 0.012, h, M.matte, { color: o.trunkColor ?? 0x6a4a30, seg: 7, solid: o.solidTrunk ?? true, rTop: (o.trunkR ?? 0.012) * 0.7 });
  }
  const n = o.n ?? 80;
  const rx = o.rx ?? 0.25, ry = o.ry ?? 0.25, cy = y + h + (o.lift ?? 0);
  for (let i = 0; i < n; i++) {
    // random point in an ellipsoid shell, leaf points outwards
    const yaw = R() * Math.PI * 2;
    const v = R() * 2 - 1;
    const rad = 0.45 + 0.55 * Math.sqrt(R());
    const hr = Math.sqrt(1 - v * v) * rad;
    const px = x + Math.cos(yaw) * hr * rx, pz = z + Math.sin(yaw) * hr * rx, py = cy + v * rad * ry;
    const g = leafGeometry({
      len: (o.leaf ?? 0.07) * (0.7 + R() * 0.6), wid: (o.leafW ?? 0.035) * (0.7 + R() * 0.6),
      elev: (o.elev ?? 0.3) + v * 0.5 + (R() - 0.5) * 0.5, bend: o.bend ?? 0.6, segs: o.segs ?? 3,
      shape: o.shape ?? 'oval', base: o.base ?? 0x2e6a2a, tip: R() < (o.lightChance ?? 0.3) ? (o.tip2 ?? 0x6aa84a) : (o.tip ?? 0x3f8236),
      mid: o.mid ?? null, fold: o.fold ?? 0.15,
    });
    b.geo(g, { pos: [px, py, pz], rot: [0, Math.PI / 2 - yaw + (R() - 0.5) * 0.8, 0] }, M.leaf, { cast: o.cast ?? true });
    g.dispose();
    if (o.petiole) { // thin stalk back to the trunk top
      const dx = px - x, dz = pz - z, dy = py - (y + h * 0.6);
      const L = Math.hypot(dx, dy, dz);
      b.cbox((px + x) / 2, (py + y + h * 0.6) / 2 - 0.002, (pz + z) / 2, 0.004, 0.004, L, M.matte,
        { color: 0x4f7a3a, solid: false, ry: Math.atan2(dx, dz), rx: -Math.asin(dy / L), cast: false });
    }
  }
}

// A trailing vine along a list of [x,y,z] points.
export function vine(b, M, pts, o = {}) {
  const R = rng(o.seed ?? 3);
  const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(p[0], p[1], p[2])));
  const len = curve.getLength();
  const tube = new THREE.TubeGeometry(curve, Math.max(8, Math.round(len * 30)), o.r ?? 0.0025, 4, false);
  b.geo(tube, {}, M.matte, { color: o.stem ?? 0x6f8a3a, cast: false });
  tube.dispose();
  const n = Math.round(len / (o.every ?? 0.07));
  const p = new THREE.Vector3(), tan = new THREE.Vector3();
  for (let i = 1; i <= n; i++) {
    const t = i / (n + 0.5);
    curve.getPointAt(t, p); curve.getTangentAt(t, tan);
    const side = i % 2 ? 1 : -1;
    const yaw = Math.atan2(tan.x, tan.z) + side * (1.2 + R() * 0.5);
    const g = leafGeometry({
      len: (o.leaf ?? 0.06) * (0.7 + R() * 0.6), wid: (o.leafW ?? 0.045) * (0.7 + R() * 0.6),
      elev: -0.2 + R() * 0.5, bend: 0.7, segs: 3, shape: 'heart',
      base: o.base ?? 0x3d7a34, tip: R() < 0.4 ? (o.tip2 ?? 0xb9cc6a) : (o.tip ?? 0x5c9a40), mid: o.mid ?? null, fold: 0.12,
    });
    b.geo(g, { pos: [p.x, p.y, p.z], rot: [0, yaw, 0] }, M.leaf, { cast: false });
    g.dispose();
  }
}

// Thin strands hanging straight down (string-of-hearts and similar).
export function strands(b, M, x, y, z, o = {}) {
  const R = rng(o.seed ?? 4);
  const n = o.n ?? 14;
  for (let i = 0; i < n; i++) {
    const a = R() * Math.PI * 2, r = (o.r ?? 0.06) * Math.sqrt(R());
    const L = (o.len ?? 0.5) * (0.4 + R() * 0.6);
    const sx = x + Math.cos(a) * r, sz = z + Math.sin(a) * r;
    b.cbox(sx, y - L, sz, 0.003, L, 0.003, M.matte, { color: o.stem ?? 0x4f7a3a, solid: false, cast: false });
    const m = Math.round(L / 0.035);
    for (let k = 0; k < m; k++) {
      const g = leafGeometry({ len: 0.018, wid: 0.016, elev: -0.6, bend: 0.3, segs: 2, shape: 'heart', base: o.base ?? 0x3a7a3a, tip: o.tip ?? 0x5a9a4a });
      b.geo(g, { pos: [sx, y - k * 0.035 - R() * 0.02, sz], rot: [0, R() * 6.28, 0] }, M.leaf, { cast: false });
      g.dispose();
    }
  }
}

// Pampas / dried grasses in a vase.
export function plumes(b, M, x, y, z, o = {}) {
  const R = rng(o.seed ?? 5);
  const n = o.n ?? 9;
  for (let i = 0; i < n; i++) {
    const a = R() * Math.PI * 2, lean = (o.lean ?? 0.35) * (0.3 + R());
    const h = (o.h ?? 0.5) * (0.75 + R() * 0.4);
    const tx = x + Math.cos(a) * Math.sin(lean) * h, tz = z + Math.sin(a) * Math.sin(lean) * h, ty = y + Math.cos(lean) * h;
    const L = Math.hypot(tx - x, ty - y, tz - z);
    b.cbox((x + tx) / 2, (y + ty) / 2 - 0.002, (z + tz) / 2, 0.004, 0.004, L, M.matte,
      { color: o.stem ?? 0xb9a06a, solid: false, ry: Math.atan2(tx - x, tz - z), rx: -Math.asin((ty - y) / L), cast: false });
    const pl = (o.plume ?? 0.16) * (0.7 + R() * 0.6);
    b.sph(tx, ty + pl * 0.2, tz, pl / 2, M.matte, {
      color: o.color ?? 0xd9c7a8, scale: [o.fat ?? 0.32, 1, o.fat ?? 0.32], rz: Math.cos(a) * -lean * 1.6, rx: Math.sin(a) * lean * 1.6,
      solid: false, seg: 7, rings: 6, cast: o.cast ?? true,
    });
  }
}

// A bunch of flowers on stalks.
export function flowers(b, M, x, y, z, o = {}) {
  const R = rng(o.seed ?? 6);
  const cols = o.colors ?? [0xf2a6b4, 0xf6c1c8, 0xfbe3d6, 0xe98aa0];
  for (let i = 0; i < (o.n ?? 8); i++) {
    const a = R() * 6.28, lean = 0.15 + R() * 0.4, h = (o.h ?? 0.22) * (0.7 + R() * 0.5);
    const tx = x + Math.cos(a) * Math.sin(lean) * h, tz = z + Math.sin(a) * Math.sin(lean) * h, ty = y + Math.cos(lean) * h;
    const L = Math.hypot(tx - x, ty - y, tz - z);
    b.cbox((x + tx) / 2, (y + ty) / 2, (z + tz) / 2, 0.004, 0.004, L, M.matte,
      { color: 0x3f7a35, solid: false, ry: Math.atan2(tx - x, tz - z), rx: -Math.asin((ty - y) / L), cast: false });
    b.sph(tx, ty, tz, o.size ?? 0.022, M.matte, { color: cols[(R() * cols.length) | 0], solid: false, seg: 7, rings: 5, scale: [1, 1.15, 1] });
    const g = leafGeometry({ len: 0.09, wid: 0.03, elev: 0.5, bend: 0.8, segs: 2, shape: 'lance' });
    b.geo(g, { pos: [(x + tx) / 2, (y + ty) / 2, (z + tz) / 2], rot: [0, R() * 6.28, 0] }, M.leaf, { cast: false });
    g.dispose();
  }
}
