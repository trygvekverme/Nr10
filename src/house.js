// The shell of the apartment: floors, walls, windows, doors, fireplace, stairs
// and the loft. Coordinates are metres: +x east, +z south, +y up. The north
// wall (dining window + terrace door) is at z = 0.
import * as THREE from 'three';
import { C } from './materials.js';

export const LVL = {
  U: 0,        // upper floor level (hall, corridor, living room)
  L: -0.14,    // kitchen / dining floor, one step down
  H: 2.45,     // ceiling height
  LF: 2.70,    // loft floor
};

// loft roof: knee wall at z = 4.1 (1.2 m high), slope up to z = 5.96, then flat
export const LOFT = { z0: 4.1, knee: 1.2, slope: 0.7, flat: 2.5, x0: -0.6, x1: 5.0, z1: 8.9 };
export function loftCeiling(z) {
  return LVL.LF + Math.min(LOFT.flat, LOFT.knee + (z - LOFT.z0) * LOFT.slope);
}

function wallX(b, M, x0, x1, z0, z1, y0, y1, color, openings = []) {
  const o = [...openings].sort((p, q) => p.a0 - q.a0);
  const opt = { color, cast: false };
  let x = x0;
  for (const op of o) {
    if (op.a0 > x) b.box(x, y0, z0, op.a0, y1, z1, M.plaster, opt);
    if (op.y0 > y0) b.box(op.a0, y0, z0, op.a1, op.y0, z1, M.plaster, opt);
    if (op.y1 < y1) b.box(op.a0, op.y1, z0, op.a1, y1, z1, M.plaster, opt);
    x = op.a1;
  }
  if (x < x1) b.box(x, y0, z0, x1, y1, z1, M.plaster, opt);
}

function wallZ(b, M, z0, z1, x0, x1, y0, y1, color, openings = []) {
  const o = [...openings].sort((p, q) => p.a0 - q.a0);
  const opt = { color, cast: false };
  let z = z0;
  for (const op of o) {
    if (op.a0 > z) b.box(x0, y0, z, x1, y1, op.a0, M.plaster, opt);
    if (op.y0 > y0) b.box(x0, y0, op.a0, x1, op.y0, op.a1, M.plaster, opt);
    if (op.y1 < y1) b.box(x0, op.y1, op.a0, x1, y1, op.a1, M.plaster, opt);
    z = op.a1;
  }
  if (z < z1) b.box(x0, y0, z, x1, y1, z1, M.plaster, opt);
}

// Window in a wall that runs along x. `out` is -1 when the outside is towards -z.
function windowX(b, M, x0, x1, y0, y1, zIn, zOut, out, o = {}) {
  const white = { color: C.trim, cast: false };
  const za = Math.min(zIn, zOut), zb = Math.max(zIn, zOut);
  const t = 0.02;
  // reveal lining
  b.box(x0, y0, za, x0 + t, y1, zb, M.satin, white);
  b.box(x1 - t, y0, za, x1, y1, zb, M.satin, white);
  b.box(x0, y1 - t, za, x1, y1, zb, M.satin, white);
  if (!o.door) {
    // sill board, sticks a little into the room so birds can sit on it
    const zi = zIn - out * 0.05;
    b.box(x0 - 0.04, y0 - 0.035, Math.min(zi, zOut), x1 + 0.04, y0, Math.max(zi, zOut), M.satin, white);
  }
  // casing on the room side
  const zc0 = zIn - out * 0.015, cw = 0.07;
  const zc = [Math.min(zIn, zc0), Math.max(zIn, zc0)];
  b.box(x0 - cw, y0 - (o.door ? 0 : 0.035), zc[0], x0, y1 + cw, zc[1], M.satin, { ...white, solid: false });
  b.box(x1, y0 - (o.door ? 0 : 0.035), zc[0], x1 + cw, y1 + cw, zc[1], M.satin, { ...white, solid: false });
  b.box(x0, y1, zc[0], x1, y1 + cw, zc[1], M.satin, { ...white, solid: false });
  // frame + glass close to the outside face
  const zf = zOut - out * 0.07, fd = 0.03, fw = 0.055;
  const fr = (ax0, ay0, ax1, ay1) => b.box(ax0, ay0, zf - fd, ax1, ay1, zf + fd, M.satin, { ...white, solid: false });
  fr(x0 + t, y0, x0 + t + fw, y1 - t); fr(x1 - t - fw, y0, x1 - t, y1 - t);
  fr(x0 + t, y1 - t - fw, x1 - t, y1 - t); fr(x0 + t, y0, x1 - t, y0 + fw + (o.door ? 0.05 : 0));
  for (const m of (o.mullions || [])) {
    const mx = x0 + (x1 - x0) * m;
    fr(mx - fw * (o.door ? 0.9 : 0.5), y0, mx + fw * (o.door ? 0.9 : 0.5), y1 - t);
  }
  for (const m of (o.transoms || [])) {
    const my = y0 + (y1 - y0) * m;
    fr(x0 + t, my - 0.012, x1 - t, my + 0.012);
  }
  for (const m of (o.bars || [])) { // thin glazing bars
    const mx = x0 + (x1 - x0) * m;
    fr(mx - 0.012, y0, mx + 0.012, y1 - t);
  }
  b.box(x0 + t, y0, zf - 0.004, x1 - t, y1 - t, zf + 0.004, M.glass, { cast: false, solid: false });
  b.hit(x0, y0, zf - 0.035, x1, y1, zf + 0.035, { perch: false });
  if (o.handles) {
    for (const hx of o.handles) {
      b.cbox(hx, y0 + 0.95, zf + out * -0.05, 0.02, 0.13, 0.03, M.metal, { color: 0xd8d8d8, solid: false });
    }
  }
}

// A white panelled interior door lying flat against a wall. Local +z points into the room.
export function door(b, M, cx, y0, cz, yaw, o = {}) {
  const w = o.w ?? 0.83, h = o.h ?? 2.02, hs = o.handleSide ?? 1;
  b.push(cx, y0, cz, yaw);
  const white = { color: C.trim, solid: false, cast: false };
  const cw = 0.075;
  b.box(-w / 2 - cw, 0, 0, -w / 2, h + cw, 0.022, M.satin, white);
  b.box(w / 2, 0, 0, w / 2 + cw, h + cw, 0.022, M.satin, white);
  b.box(-w / 2 - cw, h, 0, w / 2 + cw, h + cw, 0.03, M.satin, white);
  b.box(-w / 2, 0, 0, w / 2, h, 0.012, M.satin, { ...white, color: 0xf4f2ec });
  const pan = (x0, y0p, x1, y1p) => {
    b.box(x0, y0p, 0.012, x1, y1p, 0.02, M.satin, { ...white, color: 0xfdfdfb });
    b.box(x0 + 0.03, y0p + 0.03, 0.02, x1 - 0.03, y1p - 0.03, 0.026, M.satin, { ...white, color: 0xf8f7f2 });
  };
  if (o.window) {
    pan(-w / 2 + 0.1, 0.12, w / 2 - 0.1, 0.92);
    // four frosted panes glowing with daylight
    const g0 = 1.08, g1 = 1.82, mx = 0.0;
    b.box(-w / 2 + 0.14, g0, 0.012, w / 2 - 0.14, g1, 0.02, M.glow, { color: new THREE.Color(1.5, 1.6, 1.7), solid: false, cast: false });
    b.box(mx - 0.012, g0, 0.02, mx + 0.012, g1, 0.028, M.satin, white);
    b.box(-w / 2 + 0.14, (g0 + g1) / 2 - 0.012, 0.02, w / 2 - 0.14, (g0 + g1) / 2 + 0.012, 0.028, M.satin, white);
  } else {
    pan(-w / 2 + 0.1, 1.62, w / 2 - 0.1, h - 0.12);
    pan(-w / 2 + 0.1, 0.78, -0.03, 1.52); pan(0.03, 0.78, w / 2 - 0.1, 1.52);
    pan(-w / 2 + 0.1, 0.14, -0.03, 0.68); pan(0.03, 0.14, w / 2 - 0.1, 0.68);
  }
  // handle
  const hx = hs * (w / 2 - 0.07);
  b.cbox(hx, 1.0, 0.03, 0.045, 0.045, 0.02, M.metal, { color: 0xcfcfcf, solid: false });
  b.cbox(hx - hs * 0.055, 1.015, 0.055, 0.13, 0.018, 0.018, M.metal, { color: 0xcfcfcf, solid: true });
  if (o.lock) b.cbox(hx, 1.12, 0.03, 0.05, 0.16, 0.03, M.satin, { color: 0x2a2a2c, solid: false });
  b.pop();
}

function baseboards(b, M, segs, y) {
  const o = { color: C.trim, solid: false, cast: false };
  for (const [x0, z0, x1, z1] of segs) {
    if (Math.abs(x1 - x0) > Math.abs(z1 - z0)) b.box(x0, y, z0 - 0.014, x1, y + 0.07, z0 + 0.014, M.satin, o);
    else b.box(x0 - 0.014, y, z0, x0 + 0.014, y + 0.07, z1, M.satin, o);
  }
}

// Run of white balusters with a hand rail; one thin invisible collider for the lot.
function railing(b, M, x0, z0, x1, z1, y, h = 0.92) {
  const o = { color: C.trim, solid: false, cast: false };
  const len = Math.hypot(x1 - x0, z1 - z0);
  const n = Math.max(1, Math.round(len / 0.115));
  for (let i = 1; i < n; i++) {
    const t = i / n;
    b.cbox(x0 + (x1 - x0) * t, y + 0.06, z0 + (z1 - z0) * t, 0.03, h - 0.12, 0.03, M.satin, o);
  }
  const alongX = Math.abs(x1 - x0) > Math.abs(z1 - z0);
  if (alongX) {
    b.box(x0, y + h - 0.06, z0 - 0.035, x1, y + h, z0 + 0.035, M.satin, o);
    b.box(x0, y, z0 - 0.03, x1, y + 0.06, z0 + 0.03, M.satin, o);
    b.hit(x0, y, z0 - 0.035, x1, y + h, z0 + 0.035);
  } else {
    b.box(x0 - 0.035, y + h - 0.06, z0, x0 + 0.035, y + h, z1, M.satin, o);
    b.box(x0 - 0.03, y, z0, x0 + 0.03, y + 0.06, z1, M.satin, o);
    b.hit(x0 - 0.035, y, z0, x0 + 0.035, y + h, z1);
  }
}

function newel(b, M, x, z, y, h) {
  b.cbox(x, y, z, 0.09, h, 0.09, M.satin, { color: C.trim });
  b.cbox(x, y + h, z, 0.11, 0.025, 0.11, M.satin, { color: C.trim, solid: false });
}

export function buildHouse(b, M) {
  const { U, L, H, LF } = LVL;

  // ------------------------------------------------------------- floors
  const fl = { cast: false };
  b.box(-3.5, L - 0.2, 0, 0, L, 5.8, M.parquet, fl);                 // kitchen + dining
  b.box(0, U - 0.34, 0, 5.0, U, 8.2, M.parquet, fl);                 // living room + nook
  b.box(0, U - 0.2, 8.2, 1.35, U, 13.9, M.parquet, fl);              // corridor
  b.box(-2.3, U - 0.2, 11.4, 0, U, 13.9, M.parquet, fl);             // entrance
  // the step between dining room and living room
  b.box(-0.022, L, 0, 0, U - 0.004, 5.2, M.satin, { color: 0xe9e2d2, solid: false, cast: false });

  // ------------------------------------------------------------ ceiling
  const ce = { color: C.ceil, cast: false, perch: false };
  b.box(-3.8, H, -0.3, 5.3, H + 0.1, 5.9, M.ceiling, ce);
  b.box(-3.8, H, 5.9, 2.75, H + 0.1, 8.2, M.ceiling, ce);
  b.box(-3.8, H, 8.2, 5.3, H + 0.1, 14.2, M.ceiling, ce);
  // soffits / beams between dining and living room
  b.box(-0.14, H - 0.2, 0, 0.14, H, 5.8, M.ceiling, { color: C.ceil, cast: false });
  b.box(-3.5, H - 0.14, 3.28, -0.14, H, 3.46, M.ceiling, { color: C.ceil, cast: false });
  // loft floor on top of the ceiling slab
  b.box(-0.6, H + 0.1, 4.1, 5.0, LF, 5.9, M.parquet, fl);
  b.box(-0.6, H + 0.1, 5.9, 2.75, LF, 8.2, M.parquet, fl);
  b.box(-0.6, H + 0.1, 8.2, 5.0, LF, 8.9, M.parquet, fl);
  // white fascia around the stair opening
  const fa = { color: C.trim, solid: false, cast: false };
  b.box(2.75, H - 0.01, 5.9, 5.0, LF + 0.01, 5.915, M.satin, fa);
  b.box(2.75, H - 0.01, 5.9, 2.765, LF + 0.01, 7.3, M.satin, fa);
  b.box(2.75, H - 0.01, 8.185, 5.0, LF + 0.01, 8.2, M.satin, fa);

  // -------------------------------------------------------------- walls
  // north wall with dining window and terrace doors
  wallX(b, M, -3.8, 5.3, -0.3, 0, L - 0.2, H, C.olive, [
    { a0: -2.75, a1: -0.95, y0: 0.72, y1: 2.02 },
    { a0: 2.8, a1: 4.7, y0: 0.0, y1: 2.12 },
  ]);
  windowX(b, M, -2.75, -0.95, 0.72, 2.02, 0, -0.3, -1, { mullions: [0.36], handles: [-1.2] });
  windowX(b, M, 2.8, 4.7, 0.0, 2.12, 0, -0.3, -1, { door: true, mullions: [0.5], handles: [3.68, 3.82] });
  // west wall: olive behind the sideboard, white behind the kitchen
  wallZ(b, M, -0.3, 3.3, -3.8, -3.5, L - 0.2, H, C.olive);
  wallZ(b, M, 3.3, 5.92, -3.8, -3.5, L - 0.2, H, C.wall);
  // kitchen south wall
  wallX(b, M, -3.5, -0.12, 5.8, 5.92, L - 0.2, H, C.wall);
  // corridor west wall
  wallZ(b, M, 5.8, 11.28, -0.12, 0, U - 0.2, H, C.wall);
  // entrance: petrol blue walls
  wallX(b, M, -2.42, 0, 11.28, 11.4, U - 0.2, H, C.teal);
  wallZ(b, M, 11.4, 14.2, -2.42, -2.3, U - 0.2, H, C.teal);
  wallX(b, M, -2.3, 1.35, 13.9, 14.2, U - 0.2, H, C.teal, [{ a0: -0.5, a1: 0.5, y0: 0.95, y1: 2.0 }]);
  windowX(b, M, -0.5, 0.5, 0.95, 2.0, 13.9, 14.2, 1, { bars: [0.5], transoms: [0.45] });
  // long partition between corridor and music nook
  wallZ(b, M, 5.45, 14.2, 1.35, 1.47, U - 0.2, H, C.wall);
  // south wall of the nook (bookshelves)
  wallX(b, M, 1.47, 5.3, 8.2, 8.32, U - 0.2, H, C.wall);
  // east wall: olive behind the TV, white by the stairs, continues up to the loft
  wallZ(b, M, -0.3, 3.95, 5.0, 5.3, U - 0.34, H, C.olive);
  wallZ(b, M, 3.95, 8.32, 5.0, 5.3, U - 0.34, H, C.wall);
  wallZ(b, M, 3.98, 9.02, 5.0, 5.3, H, LF + 2.6, C.wall);

  baseboards(b, M, [
    [0, 0, 2.8, 0], [4.7, 0, 5.0, 0], [5.0, 0, 5.0, 3.95], [1.47, 8.2, 4.05, 8.2],
    [1.47, 5.45, 1.47, 8.2], [1.35, 5.45, 1.35, 12.3], [0, 5.8, 0, 11.28], [-2.3, 11.4, 0, 11.4],
    [-2.3, 11.4, -2.3, 13.9], [-2.3, 13.9, 1.35, 13.9], [5.0, 5.1, 5.0, 8.2],
  ], U);
  baseboards(b, M, [[-3.5, 0, 0, 0], [-3.5, 0, -3.5, 2.6]], L);
  // crown moulding in the corridor and living room
  const cm = { color: C.trim, solid: false, cast: false };
  b.box(0, H - 0.05, 5.8, 0.03, H, 11.28, M.satin, cm);
  b.box(1.32, H - 0.05, 5.45, 1.35, H, 13.9, M.satin, cm);
  b.box(0.14, H - 0.05, 0, 5.0, H, 0.03, M.satin, cm);
  b.box(4.97, H - 0.05, 0, 5.0, H, 3.95, M.satin, cm);
  b.box(-3.5, H - 0.05, 0, -0.14, H, 0.03, M.satin, cm);
  b.box(-3.5, H - 0.05, 0, -3.47, H, 3.28, M.satin, cm);

  // -------------------------------------------------------------- doors
  door(b, M, -2.3, U, 12.55, Math.PI / 2, { window: true, lock: true, w: 0.92, h: 2.06, handleSide: -1 }); // front door
  door(b, M, 0, U, 10.75, Math.PI / 2, { handleSide: 1 });      // west side of corridor
  door(b, M, 1.35, U, 9.95, -Math.PI / 2, { handleSide: 1 });   // east side of corridor

  // ---------------------------------------------------------- fireplace
  const sand = { color: C.sand, cast: false };
  b.box(4.5, U, 3.95, 5.0, 0.12, 5.1, M.plaster, sand);
  b.box(4.5, 0.56, 3.95, 5.0, 0.74, 5.1, M.plaster, sand);
  b.box(4.5, 1.44, 3.95, 5.0, H, 5.1, M.plaster, sand);
  b.box(4.5, 0.12, 3.95, 5.0, 1.44, 4.18, M.plaster, sand);
  b.box(4.5, 0.12, 4.88, 5.0, 1.44, 5.1, M.plaster, sand);
  b.box(4.86, 0.12, 4.18, 5.0, 1.44, 4.88, M.matte, { color: 0x1a1512, cast: false });
  // insert: black frame, dark glass, vents
  b.box(4.47, 0.72, 4.14, 4.52, 1.47, 4.92, M.satin, { color: 0x1c1c1e });
  b.box(4.455, 0.82, 4.22, 4.475, 1.36, 4.84, M.gloss, { color: 0x0b0b0c, solid: false });
  for (let i = 0; i < 4; i++) b.box(4.462, 1.385 + i * 0.018, 4.2, 4.472, 1.395 + i * 0.018, 4.86, M.satin, { color: 0x050505, solid: false });
  b.box(4.44, 0.86, 4.78, 4.46, 0.88, 4.86, M.metal, { color: 0x999999, solid: false });
  // logs in the niche below
  const logCols = [0xb98a58, 0xa67845, 0xc79b66, 0x8a6238, 0xd0a572];
  let li = 0;
  for (let row = 0; row < 4; row++) {
    for (let k = 0; k < 6 - (row % 2); k++) {
      const z = 4.25 + k * 0.105 + (row % 2) * 0.05, y = 0.17 + row * 0.095;
      b.cyl(4.68, y - 0.05, z, 0.05, 0.3, M.matte, { color: logCols[li++ % 5], rz: Math.PI / 2, seg: 8, solid: false });
      b.cyl(4.527, y - 0.05, z, 0.036, 0.004, M.matte, { color: 0xe6cfa4, rz: Math.PI / 2, seg: 8, solid: false });
    }
  }
  b.hit(4.52, 0.12, 4.2, 4.86, 0.52, 4.86);
  // slate hearth
  b.box(3.3, U, 3.8, 4.5, U + 0.012, 5.3, M.slate, { cast: false });
  b.box(4.5, U, 5.1, 5.0, U + 0.012, 5.3, M.slate, { cast: false });

  // -------------------------------------------------------------- stairs
  const white = { color: C.trim };
  const run1 = 1.6 / 7, rise = 0.18;
  for (let i = 1; i <= 7; i++) {
    const z = 5.7 + (i - 1) * run1;
    b.box(4.12, rise * i - 0.045, z - 0.02, 4.98, rise * i, z + run1 + 0.03, M.satin, white);
    // side guard (stringer + balusters) on the open side
    b.hit(4.085, rise * i - 0.2, z, 4.125, rise * i + 0.92, z + run1, { perch: true });
  }
  // stringers (sloped boards) of the first flight
  const a1 = Math.atan2(1.44, 1.6), l1 = Math.hypot(1.44, 1.6) + 0.35;
  for (const x of [4.105, 4.99]) {
    b.cbox(x, 0.72 - 0.21, 6.47, 0.035, 0.3, l1, M.satin, { ...white, rx: -a1, solid: false });
  }
  // balusters + hand rail of the first flight
  for (let i = 0; i < 15; i++) {
    const t = (i + 0.5) / 15, z = 5.72 + t * 1.55, y = 0.1 + t * 1.42;
    b.cbox(4.105, y, z, 0.03, 0.86, 0.03, M.satin, { ...white, solid: false });
  }
  b.cbox(4.105, 0.72 + 0.9, 6.5, 0.06, 0.05, l1 - 0.25, M.satin, { ...white, rx: -a1, solid: false });
  newel(b, M, 4.105, 5.62, U, 1.05);
  // landing
  b.box(4.06, 1.44 - 0.08, 7.3, 5.0, 1.44, 8.2, M.satin, white);
  newel(b, M, 4.105, 7.34, U, LF + 0.98);
  // second flight, climbing west along the south wall
  const run2 = 1.35 / 6;
  for (let j = 1; j <= 6; j++) {
    const x1 = 4.06 - (j - 1) * run2, y = 1.44 + rise * j;
    b.box(x1 - run2 - 0.03, y - 0.045, 7.32, x1 + 0.02, y, 8.18, M.satin, white);
    b.hit(x1 - run2, y - 0.2, 7.28, x1, y + 0.92, 7.32, { perch: true });
    // fairy lights under the treads
    b.sph(x1 - run2 / 2, y - 0.07, 7.36, 0.012, M.glow, { color: new THREE.Color(3.2, 2.2, 0.9), solid: false, cast: false, seg: 6, rings: 4 });
    b.sph(x1 - run2 / 2, y - 0.07, 8.12, 0.012, M.glow, { color: new THREE.Color(3.2, 2.2, 0.9), solid: false, cast: false, seg: 6, rings: 4 });
  }
  const a2 = Math.atan2(1.26, 1.35), l2 = Math.hypot(1.26, 1.35) + 0.3;
  for (const z of [7.305, 8.19]) {
    b.cbox(3.4, 2.07 - 0.2, z, l2, 0.3, 0.035, M.satin, { ...white, rz: -a2, solid: false });
  }
  for (let i = 0; i < 12; i++) {
    const t = (i + 0.5) / 12, x = 4.02 - t * 1.25, y = 1.44 + (4.06 - x) * 0.8 + 0.08;
    b.cbox(x, y, 7.305, 0.03, 0.86, 0.03, M.satin, { ...white, solid: false });
  }
  b.cbox(3.4, 1.968 + 0.9, 7.305, l2 - 0.25, 0.05, 0.06, M.satin, { ...white, rz: -a2, solid: false });
  // little post under the landing corner
  b.cbox(4.105, U, 8.14, 0.07, 1.36, 0.07, M.satin, white);

  // ---------------------------------------------------------------- loft
  wallX(b, M, -0.72, 5.0, 3.98, 4.1, LF - 0.25, LF + LOFT.knee, C.wall);
  wallZ(b, M, 3.98, 9.02, -0.72, -0.6, LF - 0.25, LF + 2.6, C.wall);
  wallX(b, M, -0.72, 5.0, 8.9, 9.02, LF - 0.25, LF + 2.6, C.wall);
  // sloped ceiling + flat ceiling (white boards)
  const sl = Math.atan(LOFT.slope);
  const zr = LOFT.z0 + (LOFT.flat - LOFT.knee) / LOFT.slope;      // where the slope meets the flat part
  const slLen = Math.hypot(zr - LOFT.z0, LOFT.flat - LOFT.knee) + 0.1;
  const sc = { color: 0xffffff, cast: false, solid: false };
  // the slope, split in three so there is a hole for the skylight
  const slopeAt = (x0, x1, t0, t1) => {
    const len = (t1 - t0) * slLen, tm = (t0 + t1) / 2;
    const z = LOFT.z0 + (zr - LOFT.z0) * tm, y = LF + LOFT.knee + (LOFT.flat - LOFT.knee) * tm;
    b.cbox((x0 + x1) / 2, y + 0.0, z, x1 - x0, 0.08, len, M.panel, { ...sc, rx: -sl });
  };
  slopeAt(-0.6, 3.0, 0, 1); slopeAt(3.8, 5.0, 0, 1); slopeAt(3.0, 3.8, 0, 0.3); slopeAt(3.0, 3.8, 0.78, 1);
  {
    const tm = 0.54, z = LOFT.z0 + (zr - LOFT.z0) * tm, y = LF + LOFT.knee + (LOFT.flat - LOFT.knee) * tm;
    b.cbox(3.4, y + 0.06, z, 0.8, 0.02, 0.48 * slLen, M.glow, { color: new THREE.Color(2.6, 2.8, 3.0), rx: -sl, solid: false, cast: false });
  }
  b.box(-0.6, LF + LOFT.flat, zr - 0.05, 5.0, LF + LOFT.flat + 0.08, 8.9, M.panel, { color: 0xffffff, cast: false, perch: false });
  baseboards(b, M, [[-0.6, 4.1, 5.0, 4.1], [-0.6, 4.1, -0.6, 8.9], [-0.6, 8.9, 5.0, 8.9]], LF);
  // railing around the stair opening
  railing(b, M, 2.75, 5.9, 5.0, 5.9, LF);
  railing(b, M, 2.75, 5.9, 2.75, 7.3, LF);
  railing(b, M, 2.75, 8.2, 5.0, 8.2, LF);
  newel(b, M, 2.75, 5.9, LF, 1.0);
  newel(b, M, 2.75, 8.2, LF, 1.0);
  newel(b, M, 2.75, 7.3, LF, 1.0);
  // doors on the loft
  door(b, M, 0.1, LF, 8.9, Math.PI, { handleSide: -1 });
  door(b, M, 4.3, LF, 8.9, Math.PI, { handleSide: 1 });

  // -------------------------------------------------------------- terrace
  const dk = { cast: false };
  b.box(0.8, -0.2, -3.0, 5.6, -0.04, -0.3, M.deck, dk);
  const rl = { color: C.trim, solid: false, cast: false };
  const railSeg = (x0, z0, x1, z1) => {
    const len = Math.hypot(x1 - x0, z1 - z0), n = Math.round(len / 0.13);
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      b.cbox(x0 + (x1 - x0) * t, -0.04, z0 + (z1 - z0) * t, 0.035, 0.95, 0.035, M.satin, rl);
    }
    const ax = Math.abs(x1 - x0) > Math.abs(z1 - z0);
    b.box(ax ? x0 : x0 - 0.045, 0.9, ax ? z0 - 0.045 : z0, ax ? x1 : x0 + 0.045, 0.96, ax ? z0 + 0.045 : z1, M.satin, rl);
  };
  railSeg(0.8, -3.0, 5.6, -3.0); railSeg(0.8, -3.0, 0.8, -0.3); railSeg(5.6, -3.0, 5.6, -0.3);
  for (const [x, z] of [[0.8, -3.0], [5.6, -3.0], [3.2, -3.0]]) b.cbox(x, -0.04, z, 0.1, 2.6, 0.1, M.satin, rl);
  // firewood stacked against the wall
  for (let row = 0; row < 4; row++) for (let k = 0; k < 9; k++) {
    b.cyl(1.5 + k * 0.12 + (row % 2) * 0.06, -0.04 + row * 0.1, -0.52, 0.055, 0.32, M.matte,
      { color: logCols[(row * 3 + k) % 5], rx: Math.PI / 2, seg: 7, solid: false, cast: false });
  }
  // aluminium ladder lying on the deck
  b.cbox(3.6, -0.03, -2.4, 2.2, 0.04, 0.05, M.metal, { color: 0xc8ccd0, solid: false, cast: false });
  b.cbox(3.6, -0.03, -2.0, 2.2, 0.04, 0.05, M.metal, { color: 0xc8ccd0, solid: false, cast: false });
  for (let i = 0; i < 8; i++) b.cbox(2.65 + i * 0.27, -0.03, -2.2, 0.03, 0.03, 0.4, M.metal, { color: 0xc8ccd0, solid: false, cast: false });
}
