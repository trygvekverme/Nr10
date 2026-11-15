// Small reusable building blocks for the furniture.
import * as THREE from 'three';
import { C } from './materials.js';
import * as P from './plants.js';

const art = (M) => M.T.art;

// Framed picture hanging on a wall. (x, y, z) is the centre on the wall face,
// yaw points out of the wall.
export function picture(b, M, x, y, z, yaw, w, h, name, make, o = {}) {
  const fw = o.frame ?? 0.022, mat = o.mat ?? 0.05, d = o.depth ?? 0.025;
  b.push(x, y, z, yaw);
  b.cbox(0, -h / 2, d / 2, w, h, d, o.frameMat ?? M.satin, { color: o.color ?? 0x161616, cast: false });
  if (mat > 0) b.cbox(0, -h / 2 + fw, d + 0.001, w - fw * 2, h - fw * 2, 0.002, M.matte, { color: o.matColor ?? 0xf3f1ea, solid: false, cast: false });
  b.quad(0, 0, d + 0.004, w - (fw + mat) * 2, h - (fw + mat) * 2, M.pic(name, make));
  b.pop();
}

export function rug(b, M, cx, y, cz, w, d, name, make, o = {}) {
  b.quad(cx, y + (o.lift ?? 0.006), cz, w, d, M.pic(name, make, { alpha: o.alpha, roughness: 1 }), { up: true, ry: o.yaw ?? 0 });
}

export function lightSwitch(b, M, x, y, z, yaw) {
  b.push(x, y, z, yaw);
  b.cbox(0, -0.04, 0.006, 0.08, 0.08, 0.012, M.satin, { color: 0xf3f0e6, solid: false, cast: false });
  b.cbox(0, -0.025, 0.014, 0.04, 0.05, 0.006, M.satin, { color: 0xfbfaf4, solid: false, cast: false });
  b.pop();
}

export function heater(b, M, x, y, z, yaw, w = 0.7, h = 0.4) {
  b.push(x, y, z, yaw);
  b.cbox(0, 0, 0.05, w, h, 0.03, M.satin, { color: 0xf6f5f1 });
  b.cbox(-w * 0.35, 0.05, 0.02, 0.03, 0.05, 0.04, M.satin, { color: 0xf0f0ee, solid: false });
  b.cbox(w * 0.35, 0.05, 0.02, 0.03, 0.05, 0.04, M.satin, { color: 0xf0f0ee, solid: false });
  b.pop();
}

// Woven basket (open cylinder)
export function basket(b, M, x, y, z, r, h, o = {}) {
  b.cyl(x, y, z, r * 0.85, h, M.weave, { color: o.color ?? C.basket, rTop: r, seg: 16 });
  b.cyl(x, y + h - 0.01, z, r * 0.92, 0.004, M.matte, { color: o.inside ?? 0x4a3a28, solid: false, seg: 12 });
}

// Sheepskin / fur throw: a few flattened lumps
export function sheepskin(b, M, x, y, z, w, d, o = {}) {
  const col = o.color ?? 0xe9e2d2;
  b.cbox(x, y, z, w, 0.035, d, M.fabric, { color: col, ry: o.yaw ?? 0 });
  const n = 9;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1) - 0.5;
    b.sph(x + t * w * 0.8 * Math.cos(o.yaw ?? 0), y + 0.03, z + (i % 2 ? 0.2 : -0.2) * d - t * w * 0.8 * Math.sin(o.yaw ?? 0), 0.11, M.fabric,
      { color: i % 3 ? col : 0xd8cdb8, scale: [1.2, 0.3, 1.0], solid: false, seg: 8, rings: 5 });
  }
}

export function pillow(b, M, x, y, z, s, color, o = {}) {
  b.sph(x, y, z, s / 2, M.fabric, { color, scale: [1, o.thick ?? 0.42, 1], ry: o.yaw ?? 0, rx: o.rx ?? 0, rz: o.rz ?? 0, solid: o.solid ?? true, seg: 12, rings: 8 });
}

// Guitar. kind: 'classical' | 'black' | 'electric'. Local frame: body centre at
// the origin, neck pointing up (+y), front facing +z.
export function guitar(b, M, x, y, z, yaw, kind = 'classical', o = {}) {
  b.push(x, y, z, yaw);
  const tilt = o.tilt ?? 0;
  const body = kind === 'classical' ? 0xb86a32 : kind === 'black' ? 0x16161a : 0x1b1b20;
  const top = kind === 'classical' ? 0xd99a4e : body;
  const g = new THREE.CylinderGeometry(1, 1, 1, 20);
  const disc = (cx, cy, r, d, mat, color, zc = 0, solid = false) => b.geo(g,
    { pos: [cx, cy * Math.cos(tilt) - zc * Math.sin(tilt), zc * Math.cos(tilt) + cy * Math.sin(tilt)], rot: [Math.PI / 2 + tilt, 0, 0], scale: [r, d, r] }, mat,
    { color, hit: solid ? [r * 0.8, r * 0.8, d / 2] : undefined });
  if (kind === 'electric') {
    disc(0, -0.02, 0.15, 0.045, M.gloss, body, 0, true);
    disc(0.05, 0.1, 0.1, 0.045, M.gloss, body);
    b.cbox(0, 0.1, 0.03 + 0.25 * Math.sin(tilt), 0.045, 0.62, 0.022, M.satin, { color: 0x3a2a1e, rx: tilt, solid: false });
    b.cbox(0, 0.72 * Math.cos(tilt), 0.03 + 0.72 * Math.sin(tilt), 0.07, 0.16, 0.02, M.satin, { color: 0x15151a, rx: tilt, solid: true });
    b.cbox(0, -0.06, 0.026, 0.07, 0.03, 0.012, M.metal, { color: 0xbbbbbb, solid: false });
    b.cbox(0, 0.03, 0.026, 0.07, 0.03, 0.012, M.metal, { color: 0xbbbbbb, solid: false });
  } else {
    disc(0, -0.08, 0.185, 0.095, M.satin, body, 0, true);
    disc(0, 0.13, 0.14, 0.095, M.satin, body, 0, true);
    disc(0, -0.08, 0.178, 0.004, M.satin, top, 0.049);
    disc(0, 0.13, 0.134, 0.004, M.satin, top, 0.049);
    disc(0, 0.06, 0.045, 0.004, M.matte, 0x120c08, 0.052);
    b.cbox(0, -0.2, 0.055, 0.09, 0.018, 0.012, M.satin, { color: 0x2a1a10, solid: false, rx: tilt });
    b.cbox(0, 0.2 * Math.cos(tilt), 0.03 + 0.2 * Math.sin(tilt), 0.05, 0.46, 0.022, M.satin, { color: kind === 'classical' ? 0x3a2416 : 0x24160e, rx: tilt, solid: false });
    b.cbox(0, 0.66 * Math.cos(tilt), 0.03 + 0.66 * Math.sin(tilt), 0.065, 0.16, 0.02, M.satin, { color: kind === 'classical' ? 0x8a5a30 : 0x16161a, rx: tilt, solid: true });
  }
  g.dispose();
  b.pop();
}

// White bookcase full of books. Local frame: back against z = 0, front towards +z.
export function bookcase(b, M, x, y, z, yaw, w, h, d, rows, o = {}) {
  b.push(x, y, z, yaw);
  const white = { color: 0xf7f6f2 };
  const t = 0.02;
  b.box(-w / 2, 0, 0, -w / 2 + t, h, d, M.satin, white);
  b.box(w / 2 - t, 0, 0, w / 2, h, d, M.satin, white);
  b.box(-w / 2, h - t, 0, w / 2, h, d, M.satin, white);
  b.box(-w / 2, 0, 0, w / 2, 0.06, d, M.satin, white);
  b.box(-w / 2, 0, 0, w / 2, h, 0.008, M.satin, { ...white, solid: false });
  const rh = (h - 0.06 - t) / rows;
  for (let r = 0; r < rows; r++) {
    const y0 = 0.06 + r * rh;
    if (r > 0) b.box(-w / 2 + t, y0 - 0.018, 0.008, w / 2 - t, y0, d, M.satin, { ...white, solid: false });
    const kind = o.kinds?.[r] ?? 'novels';
    const seed = (o.seed ?? 0) * 7 + r;
    if (kind === 'boxes') {
      b.box(-w / 2 + t + 0.01, y0, 0.03, w / 2 - t - 0.01, y0 + rh * 0.78, d - 0.01, M.fabric, { color: 0x3a3a3a, solid: false });
      b.box(-w / 2 + t + 0.03, y0 + 0.03, d - 0.011, w / 2 - t - 0.03, y0 + rh * 0.7, d - 0.008, M.fabric, { color: 0xe6e2d6, solid: false });
    } else {
      const bh = rh * (kind === 'games' ? 0.85 : 0.8);
      b.box(-w / 2 + t + 0.005, y0, 0.03, w / 2 - t - 0.005, y0 + bh, d - 0.03, M.pic('books-' + kind + (seed % 5), () => M.T.books(seed % 5, kind)),
        { uvFit: [1, 1], solid: false });
    }
  }
  b.hit(-w / 2, 0, 0, w / 2, h, d);
  b.pop();
}

// Dark leather dining chair on black steel legs. Faces local +z.
export function diningChair(b, M, x, y, z, yaw) {
  b.push(x, y, z, yaw);
  const lea = { color: 0x4a3328 };
  b.cbox(0, 0.42, 0, 0.44, 0.05, 0.42, M.leather, lea);
  b.cbox(0, 0.44, -0.21, 0.42, 0.42, 0.04, M.leather, { ...lea, rx: -0.14, solid: false });
  b.hit(-0.21, 0.44, -0.26, 0.21, 0.86, -0.2);
  const leg = { color: 0x151515, solid: false };
  for (const sx of [-1, 1]) {
    b.cbox(sx * 0.2, 0, 0.17, 0.02, 0.42, 0.02, M.satin, leg);
    b.cbox(sx * 0.2, 0, -0.17, 0.02, 0.42, 0.02, M.satin, leg);
    b.cbox(sx * 0.2, 0, 0, 0.02, 0.02, 0.36, M.satin, leg);
  }
  b.pop();
}

// Hanging dome lamp. (x, y, z) is the bottom rim centre.
export function pendant(b, M, x, y, z, r, color, ceilingY, o = {}) {
  const g = new THREE.SphereGeometry(r, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  b.geo(g, { pos: [x, y, z], scale: [1, o.squash ?? 0.7, 1] }, o.mat ?? M.satin, { color, hit: [r * 0.7, 0.02, r * 0.7] });
  b._collider(x, y + r * (o.squash ?? 0.7) * 0.5, z, r * 0.6, r * (o.squash ?? 0.7) * 0.5, r * 0.6, 0, {});
  g.dispose();
  b.cyl(x, y + r * (o.squash ?? 0.7) - 0.01, z, 0.004, ceilingY - y - r * (o.squash ?? 0.7) + 0.01, M.satin, { color: 0x1a1a1a, solid: false, seg: 5, cast: false });
  b.cyl(x, y + 0.03, z, r * 0.96, 0.004, M.matte, { color: 0xf1ede2, solid: false, cast: false, seg: 16 });
  b.cyl(x, y + 0.01, z, r * 0.55, 0.005, M.glow, { color: new THREE.Color(...(o.glow ?? [3.2, 2.5, 1.5])), solid: false, cast: false, seg: 14 });
}

// Small black wire candle lantern
export function lantern(b, M, x, y, z, r = 0.05, h = 0.1) {
  const o = { color: 0x1a1a1a, solid: false, seg: 10, cast: false };
  b.cyl(x, y, z, r * 0.7, 0.008, M.satin, o);
  b.cyl(x, y + h, z, r * 0.5, 0.008, M.satin, o);
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * Math.PI * 2;
    b.cbox(x + Math.cos(a) * r * 0.85, y, z + Math.sin(a) * r * 0.85, 0.004, h, 0.004, M.satin, o);
  }
  b.cyl(x, y + 0.008, z, r * 0.35, h * 0.5, M.matte, { color: 0xf3efe2, solid: false, seg: 8 });
  b.hit(x - r * 0.6, y, z - r * 0.6, x + r * 0.6, y + h + 0.01, z + r * 0.6);
}

// Candle in a black stick holder
export function candlestick(b, M, x, y, z, h = 0.1) {
  b.cyl(x, y, z, 0.04, 0.008, M.satin, { color: 0x1a1a1a, solid: false, seg: 12 });
  b.cyl(x, y, z, 0.006, h, M.satin, { color: 0x1a1a1a, solid: false, seg: 6 });
  b.cyl(x, y + h, z, 0.011, 0.13, M.matte, { color: 0xf2ecda, seg: 8 });
}

// Black "String"-style wall ladder (two rods + rungs). Local +z out of the wall.
export function ladderRail(b, M, x, y0, y1, z, yaw, depth = 0.2) {
  b.push(x, 0, z, yaw);
  const o = { color: 0x151515, solid: false, cast: false };
  b.box(-0.004, y0, 0.004, 0.004, y1, 0.012, M.satin, o);
  b.box(-0.004, y0, depth - 0.012, 0.004, y1, depth - 0.004, M.satin, o);
  for (let y = y0 + 0.03; y < y1; y += 0.05) b.box(-0.003, y, 0.008, 0.003, y + 0.005, depth - 0.008, M.satin, o);
  b.pop();
}

export function jar(b, M, x, y, z, r, h, fill) {
  b.cyl(x, y, z, r, h * 0.78, M.matte, { color: fill, solid: false, seg: 10 });
  b.cyl(x, y, z, r * 1.04, h, M.glass, { solid: false, seg: 10, cast: false });
  b.cyl(x, y + h, z, r * 0.8, 0.015, M.metal, { color: 0xb8b8b8, solid: false, seg: 10 });
  b.hit(x - r * 0.8, y, z - r * 0.8, x + r * 0.8, y + h + 0.015, z + r * 0.8);
}

export { P, art };
