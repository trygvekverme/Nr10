// Kitchen, dining room, living room and the music nook.
import * as THREE from 'three';
import { C } from './materials.js';
import { LVL } from './house.js';
import {
  picture, rug, lightSwitch, heater, basket, pillow, guitar, bookcase, diningChair, pendant,
  lantern, candlestick, ladderRail, jar, P, art,
} from './props.js';

const { U, L, H } = LVL;
const glowWarm = new THREE.Color(3.4, 2.4, 1.1);

// ---------------------------------------------------------------- kitchen

// Shaker style cabinet front in a local frame: lower-left corner at (x, y), facing +z at depth z.
function shakerDoor(b, M, x, y, w, h, z, o = {}) {
  const col = o.color ?? C.oakCab;
  const f = 0.055, g = 0.003;
  const wo = { color: col, solid: false, uvSwap: true };
  if (o.glass) {
    b.box(x + g, y + g, z, x + f, y + h - g, z + 0.02, M.wood, wo);
    b.box(x + w - f, y + g, z, x + w - g, y + h - g, z + 0.02, M.wood, wo);
    b.box(x + f, y + g, z, x + w - f, y + f, z + 0.02, M.wood, { ...wo, uvSwap: false });
    b.box(x + f, y + h - f, z, x + w - f, y + h - g, z + 0.02, M.wood, { ...wo, uvSwap: false });
    b.box(x + f, y + f, z + 0.008, x + w - f, y + h - f, z + 0.012, M.glass, { solid: false, cast: false });
    // leaded pattern
    for (let k = 1; k < 3; k++) b.box(x + f + (w - 2 * f) * k / 3 - 0.002, y + f, z + 0.012, x + f + (w - 2 * f) * k / 3 + 0.002, y + h - f, z + 0.014, M.satin, { color: 0x77726a, solid: false, cast: false });
    for (let k = 1; k < 6; k++) b.box(x + f, y + f + (h - 2 * f) * k / 6 - 0.002, z + 0.012, x + w - f, y + f + (h - 2 * f) * k / 6 + 0.002, z + 0.014, M.satin, { color: 0x77726a, solid: false, cast: false });
  } else {
    b.box(x + g, y + g, z, x + w - g, y + h - g, z + 0.014, M.wood, { ...wo, color: new THREE.Color(col).multiplyScalar(0.93) });
    b.box(x + g, y + g, z + 0.014, x + f, y + h - g, z + 0.022, M.wood, wo);
    b.box(x + w - f, y + g, z + 0.014, x + w - g, y + h - g, z + 0.022, M.wood, wo);
    b.box(x + f, y + g, z + 0.014, x + w - f, y + f, z + 0.022, M.wood, { ...wo, uvSwap: false });
    b.box(x + f, y + h - f, z + 0.014, x + w - f, y + h - g, z + 0.022, M.wood, { ...wo, uvSwap: false });
  }
  // steel handle
  if (o.handle !== false) {
    const hx = o.handleSide === -1 ? x + 0.035 : x + w - 0.035;
    const hy = o.upper ? y + 0.05 : y + h - 0.2;
    b.cbox(hx, hy, z + 0.035, 0.022, 0.15, 0.012, M.metal, { color: 0xd0d0d0, solid: false });
  }
}

function drawerFront(b, M, x, y, w, h, z, color = C.oakCab) {
  b.box(x + 0.003, y + 0.003, z, x + w - 0.003, y + h - 0.003, z + 0.02, M.wood, { color, solid: false });
  b.cbox(x + w / 2, y + h - 0.06, z + 0.034, w * 0.6, 0.014, 0.014, M.metal, { color: 0xd0d0d0, solid: false });
}

function kitchen(b, M) {
  const top = L + 0.9;           // worktop height
  const oak = { color: C.oakCab };
  // --- base cabinets along the south wall (fronts face north)
  b.push(-0.03, L, 5.8, Math.PI);
  b.box(0, 0.1, 0, 3.47, 0.87, 0.57, M.wood, oak);
  b.box(0, 0, 0, 3.47, 0.1, 0.52, M.satin, { color: 0x2a2520, solid: false });
  b.box(-0.005, 0.1, 0, 0, 0.87, 0.6, M.wood, { ...oak, solid: false, uvSwap: true });
  let x = 0;
  for (const [w, kind] of [[0.58, 'door'], [0.58, 'drawers'], [0.58, 'door'], [0.58, 'door'], [0.55, 'door']]) {
    if (kind === 'drawers') { for (let k = 0; k < 3; k++) drawerFront(b, M, x, 0.1 + k * 0.257, w, 0.255, 0.57); }
    else shakerDoor(b, M, x, 0.1, w, 0.77, 0.57, { handleSide: (x / 0.58) % 2 < 1 ? 1 : -1 });
    x += w;
  }
  b.box(-0.02, 0.87, -0.0, 3.47, 0.9, 0.62, M.counter, {});
  // hob
  b.box(1.08, 0.9, 0.06, 1.66, 0.905, 0.56, M.gloss, { color: 0x0c0c0e, solid: false });
  for (const [hx, hz, r] of [[1.22, 0.2, 0.09], [1.5, 0.2, 0.07], [1.22, 0.43, 0.07], [1.5, 0.43, 0.09]]) {
    b.cyl(hx, 0.905, hz, r, 0.001, M.satin, { color: 0x26262a, solid: false, seg: 20, cast: false });
  }
  b.pop();
  // --- base cabinets along the west wall (fronts face east)
  b.push(-3.5, L, 5.2, Math.PI / 2);
  b.box(-0.6, 0.1, 0, 1.3, 0.87, 0.57, M.wood, oak);
  b.box(0, 0, 0, 1.3, 0.1, 0.52, M.satin, { color: 0x2a2520, solid: false });
  shakerDoor(b, M, 0, 0.1, 0.7, 0.77, 0.57, { handleSide: 1 });
  b.box(0.703, 0.1, 0.57, 1.297, 0.87, 0.59, M.gloss, { color: 0x141416, solid: false });      // dishwasher
  b.cbox(1.0, 0.8, 0.6, 0.5, 0.02, 0.02, M.metal, { color: 0xd0d0d0, solid: false });
  b.box(-0.02, 0.87, 0, 1.3, 0.9, 0.62, M.counter, {});
  // sink
  b.box(0.12, 0.9, 0.08, 1.2, 0.906, 0.56, M.metal, { color: 0xc4c7c9, solid: false });
  b.box(0.18, 0.906, 0.13, 0.58, 0.908, 0.5, M.metal, { color: 0x8d9092, solid: false });
  b.box(0.62, 0.906, 0.2, 0.8, 0.908, 0.5, M.metal, { color: 0x8d9092, solid: false });
  for (let k = 0; k < 7; k++) b.box(0.86 + k * 0.045, 0.906, 0.14, 0.875 + k * 0.045, 0.909, 0.5, M.metal, { color: 0xa9acae, solid: false, cast: false });
  // tap with a yellow cloth over it
  b.cyl(0.6, 0.9, 0.09, 0.014, 0.26, M.chrome, { color: 0xdedede, seg: 8 });
  b.cbox(0.6, 1.15, 0.17, 0.02, 0.02, 0.18, M.chrome, { color: 0xdedede });
  b.cbox(0.68, 0.93, 0.08, 0.1, 0.014, 0.014, M.chrome, { color: 0xdedede, solid: false });
  b.cbox(0.6, 1.06, 0.16, 0.13, 0.12, 0.03, M.fabric, { color: 0xe8d23a, solid: false });
  b.pop();

  // --- backsplash tiles
  b.box(-3.5, top, 5.79, -0.12, top + 0.55, 5.8, M.tiles, { solid: false, cast: false });
  b.box(-3.5, top, 3.9, -3.49, top + 0.55, 5.8, M.tiles, { solid: false, cast: false });
  b.box(-0.5, top + 0.55, 5.795, -0.12, H, 5.8, M.plaster, { color: C.wall, solid: false, cast: false });

  // --- wall cabinets on the south wall
  const uy = top + 0.55, uh = 0.85, ud = 0.34;
  b.push(-0.5, uy, 5.8, Math.PI);
  b.box(0, 0, 0, 0.6, uh, ud, M.wood, oak);
  shakerDoor(b, M, 0, 0, 0.6, uh, ud, { upper: true, handleSide: 1 });
  b.box(1.2, 0, 0, 3.0, uh, ud, M.wood, oak);
  shakerDoor(b, M, 1.2, 0, 0.6, uh, ud, { upper: true, handleSide: -1 });
  shakerDoor(b, M, 1.8, 0, 0.6, uh, ud, { upper: true, handleSide: 1 });
  b.box(0, uh, 0, 3.0, uh + 0.05, ud + 0.03, M.wood, { ...oak, solid: false });
  // extractor hood between the cabinets
  const hood = new THREE.CylinderGeometry(0.16, 0.42, 0.2, 4, 1);
  b.geo(hood, { pos: [0.9, 0.2, 0.25], rot: [0, Math.PI / 4, 0], scale: [1, 1, 0.82] }, M.metal, { color: 0xb9bcbe, hit: [0.28, 0.1, 0.24] });
  hood.dispose();
  b.box(0.61, 0.07, 0.01, 1.19, 0.1, 0.5, M.metal, { color: 0xb9bcbe, solid: false });
  b.box(0.77, 0.3, 0.02, 1.03, H - uy, 0.3, M.metal, { color: 0xb9bcbe });
  b.cbox(0.75, 0.06, 0.3, 0.06, 0.012, 0.06, M.glow, { color: glowWarm, solid: false, cast: false });
  b.cbox(1.05, 0.06, 0.3, 0.06, 0.012, 0.06, M.glow, { color: glowWarm, solid: false, cast: false });
  // under-cabinet light strips
  b.box(0.02, -0.012, 0.05, 0.58, -0.002, 0.09, M.glow, { color: glowWarm, solid: false, cast: false });
  b.box(1.22, -0.012, 0.05, 2.9, -0.002, 0.09, M.glow, { color: glowWarm, solid: false, cast: false });
  b.pop();
  // paper notes on the bit of wall left of the cabinets
  b.cbox(-0.31, 1.62, 5.792, 0.14, 0.2, 0.004, M.matte, { color: 0xf3f1ea, solid: false, cast: false });
  b.cbox(-0.31, 1.32, 5.792, 0.13, 0.18, 0.004, M.matte, { color: 0xe9ecdf, solid: false, cast: false });

  // --- wall cabinets on the west wall: two glass doors and an open white shelf
  b.push(-3.5, uy, 5.2, Math.PI / 2);
  b.box(-0.6, 0, 0, 0.9, uh, ud, M.wood, oak);
  b.box(0.01, 0.02, 0.012, 0.89, uh - 0.02, ud - 0.02, M.matte, { color: 0xe9e1cf, solid: false });
  for (const sy of [0.28, 0.55]) b.box(0.01, sy, 0.012, 0.89, sy + 0.015, ud - 0.03, M.satin, { color: 0xddd, solid: false });
  for (let k = 0; k < 6; k++) { // crockery
    b.cyl(0.12 + k * 0.14, 0.035 + (k % 3) * 0.265, 0.17, 0.05, 0.05 + (k % 2) * 0.04, M.satin, { color: [0xf2efe8, 0xd9e2e6, 0xe6d6c6][k % 3], solid: false, seg: 10 });
  }
  shakerDoor(b, M, 0, 0, 0.45, uh, ud, { upper: true, glass: true, handleSide: 1 });
  shakerDoor(b, M, 0.45, 0, 0.45, uh, ud, { upper: true, glass: true, handleSide: -1 });
  b.box(-0.6, uh, 0, 0.9, uh + 0.05, ud + 0.03, M.wood, { ...oak, solid: false });
  b.box(0.02, -0.012, 0.05, 0.88, -0.002, 0.09, M.glow, { color: glowWarm, solid: false, cast: false });
  // open shelf unit
  const w0 = 0.9, w1 = 1.3, wh = { color: 0xf5f3ee, solid: false };
  b.box(w0, 0, 0, w0 + 0.02, uh, ud - 0.02, M.satin, wh); b.box(w1 - 0.02, 0, 0, w1, uh, ud - 0.02, M.satin, wh);
  b.box(w0, 0, 0, w1, uh, 0.01, M.satin, wh);
  for (const sy of [0, 0.3, 0.58, uh - 0.02]) b.box(w0, sy, 0, w1, sy + 0.02, ud - 0.02, M.satin, wh);
  b.hit(w0, 0, 0, w1, uh, ud - 0.02);
  b.box(w0 + 0.04, 0.02, 0.04, w1 - 0.05, 0.26, 0.26, M.pic('books-novels1', () => M.T.books(1, 'novels')), { uvFit: [0.6, 1], solid: false });
  b.cyl(1.1, 0.32, 0.17, 0.09, 0.12, M.satin, { color: 0xf3f1ea, solid: false, seg: 12 });
  b.cyl(1.1, 0.6, 0.17, 0.12, 0.09, M.satin, { color: 0x2f6f7f, solid: false, seg: 12 });
  b.cyl(1.1, 0.69, 0.17, 0.125, 0.03, M.satin, { color: 0x2a6472, solid: false, seg: 12 });
  b.pop();

  // --- tall oven cabinet + fridge
  b.push(-3.5, L, 3.9, Math.PI / 2);
  b.box(0, 0, 0, 0.6, 2.34, 0.6, M.wood, { ...oak, uvSwap: true });
  drawerFront(b, M, 0, 0.1, 0.6, 0.3, 0.6); drawerFront(b, M, 0, 0.4, 0.6, 0.3, 0.6);
  b.box(0.01, 0.74, 0.6, 0.59, 1.34, 0.625, M.gloss, { color: 0x0e0e10, solid: false });
  b.cbox(0.3, 1.24, 0.65, 0.46, 0.018, 0.018, M.metal, { color: 0xc8c8c8 });
  b.box(0.05, 0.8, 0.626, 0.55, 1.16, 0.628, M.gloss, { color: 0x1c1c20, solid: false, cast: false });
  shakerDoor(b, M, 0, 1.38, 0.6, 0.94, 0.6, { handleSide: 1 });
  // towel hanging from the oven handle
  b.cbox(0.42, 0.86, 0.665, 0.16, 0.4, 0.012, M.fabric, { color: 0xe9ecef, solid: false });
  for (let k = 0; k < 3; k++) b.cbox(0.37 + k * 0.05, 0.86, 0.672, 0.015, 0.4, 0.002, M.fabric, { color: 0x7fa39a, solid: false, cast: false });
  // fridge
  b.box(0.62, 0, 0, 1.28, 1.86, 0.63, M.metal, { color: C.steel });
  b.box(0.625, 0.03, 0.63, 1.275, 0.68, 0.655, M.metal, { color: 0xb2b5b7, solid: false });
  b.box(0.625, 0.7, 0.63, 1.275, 1.84, 0.655, M.metal, { color: 0xb2b5b7, solid: false });
  b.quad(0.95, 1.27, 0.657, 0.64, 1.12, M.pic('fridge', () => art(M).fridge('bottom'), { roughness: 0.45 }));
  b.box(0.62, 1.9, 0, 1.28, 2.34, 0.6, M.wood, oak);
  shakerDoor(b, M, 0.62, 1.9, 0.66, 0.44, 0.6, { handle: false });
  b.pop();

  // --- things on the worktops
  // east end of the south run: kettle, oil bottles in a rack, chopsticks
  const ct = top;
  b.sph(-0.55, ct + 0.07, 5.45, 0.085, M.metal, { color: 0x9a9da0, scale: [1, 0.85, 1] });
  b.cbox(-0.55, ct + 0.12, 5.34, 0.012, 0.012, 0.16, M.metal, { color: 0x9a9da0, solid: false, rx: 0.5 });
  b.cbox(-0.55, ct + 0.14, 5.52, 0.012, 0.012, 0.12, M.metal, { color: 0x2a2a2a, solid: false });
  b.box(-0.42, ct, 5.55, -0.14, ct + 0.02, 5.75, M.satin, { color: 0x1a1a1a, solid: false });
  const bottles = [[0xd9c66a, 0.2], [0x2a3a22, 0.26], [0x6a2a1e, 0.18], [0xc8a23a, 0.24], [0x3a2a1a, 0.15], [0xe8e2c8, 0.21]];
  bottles.forEach(([c, h], i) => b.cyl(-0.4 + (i % 3) * 0.1, ct + 0.02, 5.6 + ((i / 3) | 0) * 0.1, 0.03, h, M.gloss, { color: c, solid: false, seg: 8 }));
  b.hit(-0.42, ct, 5.55, -0.14, ct + 0.24, 5.75);
  b.cyl(-0.78, ct, 5.68, 0.035, 0.12, M.satin, { color: 0xe8e2d4, seg: 8 });
  for (let k = 0; k < 5; k++) b.cbox(-0.78 + (k - 2) * 0.012, ct + 0.1, 5.68, 0.005, 0.16, 0.005, M.matte, { color: 0xd9bb86, solid: false, rz: (k - 2) * 0.08 });
  // south-west corner: tray with herb, jars, thermos; coffee machine by the sink
  b.box(-3.42, ct, 5.3, -3.05, ct + 0.02, 5.72, M.satin, { color: 0x1a1a1c, solid: false });
  P.pot(b, M, -3.33, ct + 0.02, 5.62, 0.055, 0.09, { color: 0x3a3a3a });
  P.bush(b, M, -3.33, ct + 0.1, 5.62, { trunk: 0.02, n: 60, rx: 0.1, ry: 0.07, leaf: 0.035, leafW: 0.012, shape: 'lance', seed: 71, lift: 0.04 });
  jar(b, M, -3.2, ct + 0.02, 5.62, 0.04, 0.11, 0x6a3a22);
  b.cyl(-3.1, ct + 0.02, 5.58, 0.04, 0.2, M.satin, { color: 0x18181a, seg: 10 });
  b.cbox(-3.1, ct + 0.1, 5.5, 0.03, 0.1, 0.03, M.matte, { color: 0xc8a070, solid: false });
  // coffee machine
  b.box(-3.44, ct, 4.86, -3.2, ct + 0.03, 5.12, M.satin, { color: 0x161618, solid: false });
  b.box(-3.44, ct + 0.03, 5.02, -3.34, ct + 0.36, 5.12, M.satin, { color: 0x161618 });
  b.cyl(-3.27, ct + 0.22, 5.07, 0.055, 0.14, M.glass, { solid: false, seg: 10, cast: false });
  b.cyl(-3.3, ct + 0.03, 4.94, 0.06, 0.13, M.gloss, { color: 0x2a1a10, seg: 10 });
  // right of the sink: utensil crock, soap, tin, knife rack, chopping board
  b.cyl(-3.3, ct, 3.98, 0.06, 0.13, M.gloss, { color: 0x5aa04a, seg: 12 });
  for (let k = 0; k < 6; k++) b.cbox(-3.3 + (k - 2.5) * 0.015, ct + 0.1, 3.98, 0.012, 0.2, 0.006, M.metal, { color: k % 2 ? 0xc8c8c8 : 0x3a3a3a, solid: false, rz: (k - 2.5) * 0.1, rx: (k % 3 - 1) * 0.1 });
  b.cyl(-3.3, ct, 4.18, 0.028, 0.16, M.gloss, { color: 0x4fbf8a, solid: false, seg: 8 });
  b.cyl(-3.32, ct, 4.32, 0.05, 0.1, M.metal, { color: 0xc8c8c8, seg: 10 });
  b.box(-3.49, ct + 0.32, 3.95, -3.47, ct + 0.36, 4.45, M.satin, { color: 0x1a1a1a, solid: false });
  for (let k = 0; k < 5; k++) {
    b.cbox(-3.465, ct + 0.14, 4.0 + k * 0.09, 0.004, 0.18, 0.03, M.metal, { color: 0xd8d8d8, solid: false });
    b.cbox(-3.465, ct + 0.32, 4.0 + k * 0.09, 0.012, 0.1, 0.022, M.satin, { color: 0x1a1a1a, solid: false });
  }
  const board = new THREE.CylinderGeometry(0.16, 0.16, 0.02, 20);
  b.geo(board, { pos: [-3.45, top + 0.17, 3.98], rot: [0, 0, Math.PI / 2 - 0.12] }, M.wood, { color: 0xc8904e });
  board.dispose();
}

// ----------------------------------------------------------------- dining

function sideboard(b, M) {
  // String-style sideboard along the west wall, z 0.15 .. 2.55
  const oak = { color: C.oakLight };
  b.push(-3.5, L, 2.55, Math.PI / 2);     // local x runs north, +z is into the room
  const W = 2.4, D = 0.42;
  for (let s = 0; s < 2; s++) {
    const x0 = s * 1.2;
    b.box(x0, 0.14, 0, x0 + 1.2, 0.56, D, M.wood, oak);
    b.box(x0, 0.8, 0, x0 + 1.2, 0.83, D, M.wood, oak);
    b.box(x0, 0.56, 0, x0 + 1.2, 0.8, 0.012, M.wood, { ...oak, solid: false });
    if (s === 1) { // drawers with finger holes
      for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
        b.box(x0 + 0.01 + i * 0.595, 0.15 + j * 0.205, D, x0 + 0.59 + i * 0.595, 0.35 + j * 0.205, D + 0.015, M.wood, { ...oak, solid: false });
        b.cyl(x0 + 0.3 + i * 0.595, 0.25 + j * 0.205, D + 0.015, 0.014, 0.002, M.matte, { color: 0x1a1612, rx: Math.PI / 2, solid: false, seg: 10, cast: false });
      }
    } else {    // sliding doors
      for (let i = 0; i < 2; i++) {
        b.box(x0 + 0.01 + i * 0.595, 0.15, D, x0 + 0.59 + i * 0.595, 0.555, D + 0.012 + i * 0.006, M.wood, { ...oak, solid: false });
        b.cyl(x0 + 0.08 + i * 1.04, 0.36, D + 0.02, 0.014, 0.002, M.matte, { color: 0x1a1612, rx: Math.PI / 2, solid: false, seg: 10, cast: false });
      }
    }
  }
  // black wire side panels and legs
  for (const x of [0, 1.2, W]) {
    b.box(x - 0.004, 0, 0.01, x + 0.004, 0.83, 0.018, M.satin, { color: 0x151515, solid: false });
    b.box(x - 0.004, 0, D - 0.018, x + 0.004, 0.83, D - 0.01, M.satin, { color: 0x151515, solid: false });
    b.box(x - 0.004, 0.0, 0.01, x + 0.004, 0.008, D - 0.01, M.satin, { color: 0x151515, solid: false });
  }
  // open compartment: stacks of books, board games, an orange pot
  const stack = (x, w, cols) => cols.forEach((c, i) => b.box(x + (i % 2) * 0.01, 0.565 + i * 0.03, 0.06, x + w - (i % 3) * 0.015, 0.593 + i * 0.03, 0.36, M.matte, { color: c, solid: false }));
  stack(0.06, 0.3, [0xe9e4d6, 0x25303f, 0xd9d2c0, 0x8a2f2a, 0x2f2a25]);
  stack(0.42, 0.3, [0x2a3a66, 0xb03030, 0xd8cdb8, 0x3a3a3a]);
  b.cyl(0.9, 0.565, 0.2, 0.075, 0.13, M.gloss, { color: 0xe08a1e, solid: false, seg: 14 });
  b.box(1.3, 0.565, 0.05, 1.72, 0.625, 0.38, M.matte, { color: 0xc23a30, solid: false });
  b.box(1.32, 0.625, 0.06, 1.7, 0.67, 0.37, M.matte, { color: 0xd9c9a6, solid: false });
  stack(1.85, 0.32, [0xd9d2c0, 0x3f5a4a, 0xe6e0d0, 0x2a2a2a, 0xb8a888]);
  b.hit(0, 0.56, 0.02, W, 0.8, 0.38);

  // --- on top of the sideboard (top surface at y = 0.83)
  const T = 0.83;
  // dried grasses in a glass vase
  b.cyl(0.22, T, 0.2, 0.045, 0.2, M.glass, { seg: 10, cast: false });
  P.plumes(b, M, 0.22, T + 0.05, 0.2, { n: 14, h: 0.5, plume: 0.09, fat: 0.25, color: 0xcdb98c, lean: 0.3, seed: 31 });
  // mushroom lamp
  b.cyl(0.6, T, 0.22, 0.05, 0.02, M.satin, { color: 0xb9bd8a, seg: 14, rTop: 0.035 });
  b.cyl(0.6, T + 0.02, 0.22, 0.01, 0.2, M.satin, { color: 0xb9bd8a, seg: 6, solid: false });
  const cap = new THREE.SphereGeometry(0.1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  b.geo(cap, { pos: [0.6, T + 0.2, 0.22], scale: [1, 0.75, 1] }, M.satin, { color: 0xb9bd8a, hit: [0.07, 0.04, 0.07] });
  cap.dispose();
  // mortar
  b.cyl(0.95, T, 0.2, 0.06, 0.07, M.satin, { color: 0x1c1a18, seg: 12, rTop: 0.075 });
  b.sph(0.97, T + 0.08, 0.2, 0.025, M.matte, { color: 0xb98a5e, solid: false, seg: 8, rings: 6 });
  // slate trivet with two small plants
  b.box(1.22, T, 0.08, 1.62, T + 0.008, 0.36, M.slate, { solid: false });
  let y = P.pot(b, M, 1.33, T + 0.008, 0.22, 0.06, 0.11, { color: 0xeeeae2 });
  P.bush(b, M, 1.33, y, 0.22, { trunk: 0.1, n: 40, rx: 0.12, ry: 0.1, leaf: 0.06, leafW: 0.035, seed: 32 });
  y = P.pot(b, M, 1.5, T + 0.008, 0.22, 0.06, 0.11, { color: 0xeeeae2 });
  P.rosette(b, M, 1.5, y, 0.22, { n: 9, len: 0.24, wid: 0.045, elev: 1.45, elevSpread: 0.25, bend: 0.25, base: 0x35602c, tip: 0x6a9a48, mid: 0xb9c670, seed: 33 });
  // tablet and magazines
  b.box(1.76, T, 0.1, 1.98, T + 0.012, 0.36, M.gloss, { color: 0xeeeeee, solid: false });
  b.box(1.775, T + 0.012, 0.115, 1.965, T + 0.014, 0.345, M.gloss, { color: 0x1a2a22, solid: false, cast: false });
  b.box(2.02, T, 0.06, 2.24, T + 0.05, 0.36, M.matte, { color: 0xd9d4c6, solid: false });
  // coffee plant in a woven pot at the far end
  basket(b, M, 2.26, T, 0.2, 0.085, 0.14, { color: 0x4a5a48 });
  P.bush(b, M, 2.26, T + 0.13, 0.2, { trunk: 0.18, n: 45, rx: 0.2, ry: 0.16, leaf: 0.1, leafW: 0.05, base: 0x265a26, tip: 0x3f8a3a, seed: 34 });
  b.pop();

  // --- wall shelves above the sideboard
  for (const z of [0.15, 0.95, 1.75, 2.55]) ladderRail(b, M, -3.5, L + 0.83, 2.25, z, Math.PI / 2, 0.2);
  const shelf = (z0, z1, yy) => b.box(-3.5, yy, z0, -3.3, yy + 0.02, z1, M.wood, { color: 0xc9925a });
  shelf(1.75, 2.55, 1.32); shelf(1.75, 2.55, 1.84);
  shelf(0.95, 1.75, 1.46); shelf(0.95, 1.75, 2.02);
  shelf(0.15, 0.95, 1.2); shelf(0.15, 0.95, 1.7);
  const X = -3.4;
  // south bay, lower shelf: books, wicker lantern, ceramic house, elephant
  b.box(X - 0.07, 1.34, 2.36, X + 0.07, 1.52, 2.5, M.pic('books-novels2', () => M.T.books(2, 'novels')), { uvFit: [0.3, 1], solid: false });
  b.sph(X, 1.42, 2.22, 0.075, M.weave, { color: 0xd99a62, scale: [1, 1.15, 1] });
  b.cyl(X, 1.34, 2.07, 0.035, 0.12, M.matte, { color: 0xeee8dc, seg: 8, rTop: 0.02 });
  b.sph(X, 1.41, 1.93, 0.05, M.satin, { color: 0x2a1c14, scale: [0.7, 1.2, 1.3] });      // elephant body
  b.cbox(X, 1.34, 1.9, 0.03, 0.1, 0.03, M.satin, { color: 0x2a1c14, solid: false });
  b.cbox(X, 1.42, 1.985, 0.02, 0.12, 0.02, M.satin, { color: 0x2a1c14, solid: false, rx: -0.5 });
  // south bay, upper shelf: jars, bowl, trailing plant
  jar(b, M, X, 1.86, 2.3, 0.045, 0.12, 0x8a5a3a); jar(b, M, X, 1.86, 2.16, 0.045, 0.12, 0x6a3a2a);
  b.cyl(X, 1.86, 1.98, 0.08, 0.07, M.satin, { color: 0x1c1c1c, seg: 12, rTop: 0.09 });
  b.cyl(X, 1.86, 2.43, 0.05, 0.05, M.matte, { color: 0xe9e2d2, seg: 10 });
  P.strands(b, M, X + 0.03, 1.9, 2.46, { n: 22, len: 0.95, r: 0.06, seed: 35 });
  // middle bay: ship model, barometer, bottle, herringbone pot with a coffee plant
  b.cbox(X, 1.48, 1.62, 0.05, 0.03, 0.2, M.wood, { color: 0x8a5a36, solid: false });
  for (let k = 0; k < 3; k++) {
    b.cbox(X, 1.51, 1.56 + k * 0.06, 0.004, 0.12, 0.004, M.satin, { color: 0x6a4a30, solid: false });
    b.cbox(X, 1.54, 1.56 + k * 0.06, 0.07, 0.07, 0.004, M.matte, { color: 0xe6c8c2, solid: false });
  }
  b.hit(X - 0.04, 1.48, 1.52, X + 0.04, 1.63, 1.72);
  const baro = new THREE.CylinderGeometry(0.085, 0.085, 0.04, 20);
  b.geo(baro, { pos: [X - 0.05, 1.57, 1.42], rot: [0, 0, Math.PI / 2 - 0.2] }, M.satin, { color: 0x7a4a2a, hit: [0.03, 0.085, 0.085] });
  baro.dispose();
  b.quad(X - 0.026, 1.573, 1.42, 0.16, 0.16, M.pic('barometer', () => art(M).barometer()), { ry: Math.PI / 2, rx: 0 });
  b.cbox(X, 1.48, 1.7, 0.04, 0.07, 0.04, M.glass, { solid: false });
  b.cyl(X, 1.48, 1.2, 0.075, 0.13, M.satin, { color: 0x3f5548, seg: 12, rTop: 0.085 });
  P.bush(b, M, X, 1.6, 1.2, { trunk: 0.2, n: 55, rx: 0.24, ry: 0.2, leaf: 0.12, leafW: 0.055, base: 0x235a25, tip: 0x3a8a38, seed: 36, cast: false });
  // middle bay upper: jars and a dark pot
  for (let k = 0; k < 4; k++) jar(b, M, X, 2.04, 1.1 + k * 0.11, 0.04, 0.1, [0x4a2a1a, 0x8a6a3a, 0x3a2a1a, 0xb98a5a][k]);
  b.cyl(X, 2.04, 1.62, 0.09, 0.08, M.satin, { color: 0x1a1a1a, seg: 12 });
  // north bay: glowing dome lamp, jars
  const dome = new THREE.SphereGeometry(0.075, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  b.geo(dome, { pos: [X, 1.22, 0.35], scale: [1, 0.9, 1] }, M.glow, { color: new THREE.Color(3.0, 2.2, 1.2), hit: [0.05, 0.04, 0.05] });
  dome.dispose();
  jar(b, M, X, 1.22, 0.6, 0.05, 0.14, 0xc8a070); jar(b, M, X, 1.22, 0.78, 0.04, 0.1, 0x5a3a2a);
  jar(b, M, X, 1.72, 0.3, 0.045, 0.12, 0x6a4a2a); jar(b, M, X, 1.72, 0.5, 0.045, 0.12, 0xa67a4a);
  P.pot(b, M, X, 1.72, 0.75, 0.06, 0.1, { color: 0x2a2a2a });
  // pothos vines wandering along the shelves
  P.vine(b, M, [[X, 1.84, 0.75], [X + 0.08, 1.7, 0.95], [X + 0.1, 1.6, 1.3], [X + 0.12, 1.36, 1.6], [X + 0.16, 1.2, 1.9], [X + 0.14, 1.06, 2.2], [X + 0.18, 0.98, 2.5]], { seed: 37, tip2: 0xd9d98a });
  P.vine(b, M, [[X, 1.84, 0.75], [X + 0.1, 1.5, 0.6], [X + 0.14, 1.1, 0.42], [X + 0.2, 0.85, 0.3], [X + 0.22, 0.6, 0.22]], { seed: 38, tip2: 0xd9d98a });
  P.vine(b, M, [[X, 2.1, 1.62], [X + 0.1, 2.2, 1.9], [X + 0.1, 2.14, 2.3], [X + 0.14, 2.0, 2.52]], { seed: 39 });
  P.vine(b, M, [[X, 1.66, 1.2], [X + 0.14, 1.38, 1.0], [X + 0.2, 1.16, 0.8], [X + 0.24, 0.98, 0.72]], { seed: 40, tip2: 0xe6e09a });
}

function dining(b, M) {
  sideboard(b, M);
  // table
  const ty = L + 0.75;
  b.box(-2.3, ty - 0.04, 0.8, -1.35, ty, 2.7, M.wood, { color: 0xd9c4a4, uvSwap: true });
  for (const z of [1.0, 2.5]) {
    const o = { color: 0x151515, solid: false };
    b.box(-2.2, L, z - 0.03, -2.14, ty - 0.04, z + 0.03, M.satin, o);
    b.box(-1.51, L, z - 0.03, -1.45, ty - 0.04, z + 0.03, M.satin, o);
    b.box(-2.2, L, z - 0.03, -1.45, L + 0.05, z + 0.03, M.satin, o);
    b.box(-2.2, ty - 0.09, z - 0.03, -1.45, ty - 0.04, z + 0.03, M.satin, o);
  }
  rug(b, M, -1.82, ty, 1.75, 0.6, 0.34, 'runner', () => M.T.runner(), { yaw: Math.PI / 2 + 0.25, lift: 0.002 });
  // vase with flowers, wooden candle holders
  b.cyl(-1.78, ty, 1.95, 0.05, 0.17, M.glass, { seg: 10, cast: false });
  P.flowers(b, M, -1.78, ty + 0.05, 1.95, { n: 10, h: 0.3, seed: 41 });
  for (const [x, z] of [[-1.9, 1.55], [-1.72, 1.48]]) {
    b.cyl(x, ty, z, 0.04, 0.06, M.wood, { color: 0xd9b27c, seg: 10 });
    b.cyl(x, ty + 0.06, z, 0.025, 0.04, M.wood, { color: 0xd9b27c, seg: 10, solid: false });
    b.sph(x, ty + 0.12, z, 0.03, M.matte, { color: 0x6a2a1e, solid: false, seg: 8, rings: 6 });
  }
  diningChair(b, M, -2.62, L, 1.25, Math.PI / 2); diningChair(b, M, -2.62, L, 2.2, Math.PI / 2);
  diningChair(b, M, -1.03, L, 1.25, -Math.PI / 2 + 0.25); diningChair(b, M, -1.03, L, 2.2, -Math.PI / 2);
  pendant(b, M, -1.82, 1.42, 1.75, 0.21, 0x161616, H, { squash: 0.6 });
  heater(b, M, -1.85, L + 0.12, 0, 0, 1.0, 0.42);
  lightSwitch(b, M, -0.55, 1.1, 0, 0);

  // --- the deep window sill (top at y = 0.72)
  const sy = 0.72;
  basket(b, M, -2.52, sy, -0.14, 0.09, 0.17, { color: 0xb99a6a });
  P.bush(b, M, -2.52, sy + 0.16, -0.14, { trunk: 0.3, n: 70, rx: 0.2, ry: 0.22, leaf: 0.045, leafW: 0.025, base: 0x2a5a26, tip: 0x4a8a3a, seed: 42, lift: 0.05 });
  lantern(b, M, -2.2, sy, -0.12, 0.05, 0.1);
  b.cyl(-2.33, sy, -0.05, 0.035, 0.07, M.satin, { color: 0x4a3a30, seg: 10 });
  candlestick(b, M, -2.0, sy, -0.13, 0.12); candlestick(b, M, -1.86, sy, -0.06, 0.07);
  rug(b, M, -1.45, sy, -0.12, 0.46, 0.26, 'runner', () => M.T.runner(), { lift: 0.002 });
  // red vase with pampas grass
  b.sph(-1.45, sy + 0.05, -0.12, 0.05, M.gloss, { color: 0xb0222a, scale: [1, 0.8, 1] });
  b.sph(-1.45, sy + 0.115, -0.12, 0.04, M.gloss, { color: 0xb0222a, scale: [1, 0.8, 1], solid: false });
  b.cyl(-1.45, sy + 0.14, -0.12, 0.022, 0.04, M.gloss, { color: 0xb0222a, solid: false, seg: 10 });
  P.plumes(b, M, -1.45, sy + 0.17, -0.12, { n: 11, h: 0.36, plume: 0.26, fat: 0.3, lean: 0.5, seed: 43 });
  // LED light bar
  b.cbox(-1.04, sy, -0.1, 0.07, 0.07, 0.05, M.satin, { color: 0x6a6a6a });
  b.cbox(-1.04, sy + 0.07, -0.1, 0.022, 1.0, 0.022, M.satin, { color: 0x8a8a8a, solid: false });
  b.cbox(-1.028, sy + 0.07, -0.1, 0.006, 1.0, 0.016, M.glow, { color: new THREE.Color(3.2, 2.5, 1.5), solid: false, cast: false });

  // --- globe on a little black table next to the sofa
  b.cbox(-0.42, L + 0.42, 0.42, 0.4, 0.025, 0.4, M.satin, { color: 0x1a1a1a });
  b.cbox(-0.42, L + 0.15, 0.42, 0.38, 0.02, 0.38, M.satin, { color: 0x1a1a1a });
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) b.cbox(-0.42 + dx * 0.18, L, 0.42 + dz * 0.18, 0.02, 0.42, 0.02, M.satin, { color: 0x1a1a1a, solid: false });
  b.box(-0.58, L + 0.17, 0.28, -0.3, L + 0.25, 0.56, M.matte, { color: 0x8a5a3a, solid: false });
  const gy = L + 0.445;
  b.cyl(-0.42, gy, 0.42, 0.07, 0.02, M.wood, { color: 0x9a6a3a, seg: 14 });
  b.cyl(-0.42, gy + 0.02, 0.42, 0.01, 0.05, M.metal, { color: 0xb9a060, solid: false, seg: 6 });
  const globe = new THREE.SphereGeometry(0.135, 20, 14);
  b.geo(globe, { pos: [-0.42, gy + 0.2, 0.42], rot: [0.3, 1, 0] }, M.pic('globe', () => art(M).globe(), { roughness: 0.35 }), { hit: [0.1, 0.13, 0.1] });
  globe.dispose();
}

// ----------------------------------------------------------------- living

function sofa(b, M) {
  const col = C.sofa, f = { color: col };
  const dark = { color: 0xaaa499 };
  // section 1 (back towards the dining room)
  b.box(0.08, 0.05, 0.1, 1.08, 0.3, 3.3, M.fabric, f);
  b.box(0.08, 0.3, 0.1, 0.3, 0.74, 3.3, M.fabric, f);
  b.box(0.08, 0.3, 3.12, 1.08, 0.58, 3.3, M.fabric, f);
  for (let i = 0; i < 2; i++) {
    b.box(0.3, 0.3, 1.1 + i * 1.0, 1.1, 0.43, 2.1 + i * 1.0 - 0.01, M.fabric, i ? f : dark);
    b.cbox(0.44, 0.43, 1.6 + i * 1.0, 0.2, 0.42, 0.94, M.fabric, { ...f, rz: 0.18, solid: false });
    b.hit(0.3, 0.43, 1.12 + i * 1.0, 0.52, 0.86, 2.08 + i * 1.0);
  }
  // section 2 (along the north wall) with a chaise by the terrace door
  b.box(0.08, 0.05, 0.1, 3.1, 0.3, 1.1, M.fabric, f);
  b.box(0.08, 0.3, 0.1, 2.15, 0.74, 0.32, M.fabric, f);
  b.box(0.3, 0.3, 0.32, 1.25, 0.43, 1.1, M.fabric, dark);
  b.box(1.26, 0.3, 0.32, 2.14, 0.43, 1.1, M.fabric, f);
  b.box(2.15, 0.05, 1.1, 3.1, 0.3, 1.75, M.fabric, f);
  b.box(2.15, 0.3, 0.1, 3.1, 0.43, 1.75, M.fabric, dark);
  for (let i = 0; i < 2; i++) {
    b.cbox(0.78 + i * 0.92, 0.43, 0.44, 0.88, 0.42, 0.2, M.fabric, { ...f, rx: -0.18, solid: false });
    b.hit(0.34 + i * 0.92, 0.43, 0.32, 1.22 + i * 0.92, 0.86, 0.54);
  }
  for (const [x, z] of [[0.14, 0.16], [3.04, 0.16], [3.04, 1.68], [0.14, 3.24], [1.02, 3.24], [2.2, 1.68]]) {
    b.cbox(x, 0, z, 0.04, 0.05, 0.04, M.satin, { color: 0x2a2a2a, solid: false });
  }
  pillow(b, M, 1.25, 0.55, 1.5, 0.46, 0xc9a25a, { yaw: 0.6, rx: 0.3 });
  pillow(b, M, 0.85, 0.52, 2.3, 0.44, 0x9a9478, { yaw: 0.2, rz: -0.4 });
  pillow(b, M, 2.2, 0.6, 0.5, 0.48, 0xb3ada2, { yaw: 0.1, rx: -0.9 });
  pillow(b, M, 0.62, 0.6, 2.95, 0.46, 0xb9b3a8, { rz: -0.9 });
}

function recliner(b, M, x, z, yaw) {
  const lea = { color: C.cognac };
  b.push(x, U, z, yaw);
  b.cbox(0, 0.3, 0, 0.56, 0.14, 0.56, M.leather, lea);
  b.cbox(0, 0.4, -0.36, 0.56, 0.74, 0.14, M.leather, { ...lea, rx: -0.42, solid: false });
  b.hit(-0.28, 0.44, -0.62, 0.28, 0.98, -0.3);
  b.cbox(0, 0.98, -0.6, 0.4, 0.14, 0.12, M.leather, { ...lea, rx: -0.42, solid: false });
  for (const s of [-1, 1]) {
    b.cbox(s * 0.33, 0.44, -0.02, 0.09, 0.07, 0.5, M.leather, lea);
    b.cbox(s * 0.33, 0.2, 0.05, 0.03, 0.26, 0.03, M.chrome, { color: 0xcfcfcf, solid: false });
  }
  for (let k = 0; k < 3; k++) b.cbox(0, 0.438, -0.18 + k * 0.17, 0.5, 0.004, 0.006, M.leather, { color: 0x8a5026, solid: false, cast: false });
  b.cyl(0, 0.06, 0, 0.03, 0.26, M.chrome, { color: 0xcfcfcf, solid: false, seg: 8 });
  const ring = new THREE.TorusGeometry(0.3, 0.015, 6, 24);
  b.geo(ring, { pos: [0, 0.03, 0], rot: [Math.PI / 2, 0, 0] }, M.chrome, { color: 0xcfcfcf });
  ring.dispose();
  for (let k = 0; k < 4; k++) b.cbox(0, 0.03, 0, 0.6, 0.02, 0.025, M.chrome, { color: 0xcfcfcf, solid: false, ry: k * Math.PI / 4 });
  // footstool
  b.cbox(0, 0.28, 0.78, 0.5, 0.13, 0.4, M.leather, lea);
  const r2 = new THREE.TorusGeometry(0.2, 0.012, 6, 20);
  b.geo(r2, { pos: [0, 0.03, 0.78], rot: [Math.PI / 2, 0, 0] }, M.chrome, { color: 0xcfcfcf });
  r2.dispose();
  b.cyl(0, 0.03, 0.78, 0.022, 0.26, M.chrome, { color: 0xcfcfcf, solid: false, seg: 8 });
  b.pop();
}

function aquarium(b, M) {
  const x0 = 1.2, x1 = 1.62, z0 = 4.4, z1 = 5.4, y0 = 0.78, y1 = 1.3;
  b.box(x0, U, z0, x1, y0, z1, M.satin, { color: 0x2b2c30 });
  b.box(x0 - 0.01, y1, z0 - 0.01, x1 + 0.01, y1 + 0.08, z1 + 0.01, M.satin, { color: 0x1a1a1c });
  b.box(x0, y0, z0, x1, y0 + 0.03, z1, M.satin, { color: 0x1a1a1c, solid: false });
  b.box(x0 + 0.01, y0 + 0.03, z0 + 0.01, x1 - 0.01, y0 + 0.075, z1 - 0.01, M.matte, { color: 0x5a5140, solid: false });
  // glass panes + water
  const gl = { solid: false, cast: false };
  b.box(x0, y0, z0, x0 + 0.008, y1, z1, M.glass, gl); b.box(x1 - 0.008, y0, z0, x1, y1, z1, M.glass, gl);
  b.box(x0, y0, z0, x1, y1, z0 + 0.008, M.glass, gl); b.box(x0, y0, z1 - 0.008, x1, y1, z1, M.glass, gl);
  b.box(x0 + 0.01, y0 + 0.075, z0 + 0.01, x1 - 0.01, y1 - 0.03, z1 - 0.01, M.water, gl);
  b.hit(x0, y0, z0, x1, y1, z1);
  // rocks, moss, plants and bamboo inside
  const cx = (x0 + x1) / 2;
  const rocks = [[cx - 0.04, 4.62, 0.07], [cx + 0.06, 4.85, 0.09], [cx - 0.02, 5.02, 0.075], [cx + 0.05, 5.2, 0.06], [cx - 0.08, 4.78, 0.05]];
  rocks.forEach(([rx, rz, r], i) => b.sph(rx, y0 + 0.075 + r * 0.5, rz, r, M.matte, { color: i % 2 ? 0x4a5a2a : 0x3a4030, scale: [1, 0.75, 1.2], solid: false, seg: 9, rings: 6, cast: false }));
  P.rosette(b, M, cx - 0.06, y0 + 0.08, 4.55, { n: 14, len: 0.26, wid: 0.035, elev: 1.3, elevSpread: 0.5, bend: 0.5, base: 0x3a8a2a, tip: 0x8ac84a, shape: 'lance', seed: 51, cast: false });
  P.rosette(b, M, cx + 0.05, y0 + 0.08, 4.72, { n: 10, len: 0.2, wid: 0.04, elev: 1.3, elevSpread: 0.6, bend: 0.6, base: 0x4a8a2a, tip: 0x9ad05a, shape: 'lance', seed: 52, cast: false });
  P.rosette(b, M, cx, y0 + 0.08, 5.28, { n: 12, len: 0.28, wid: 0.03, elev: 1.35, elevSpread: 0.4, bend: 0.4, base: 0x2f7a2a, tip: 0x7ab848, shape: 'lance', seed: 53, cast: false });
  P.rosette(b, M, cx - 0.05, y0 + 0.08, 4.95, { n: 7, len: 0.16, wid: 0.045, elev: 1.2, elevSpread: 0.6, bend: 0.7, base: 0x7a4a2a, tip: 0xa86a3a, shape: 'lance', seed: 54, cast: false });
  for (const [bz, lean] of [[5.08, 0.12], [5.14, 0.2], [5.19, 0.06]]) {
    b.cbox(cx + 0.08, y0 + 0.05, bz, 0.016, 0.46, 0.016, M.matte, { color: 0x2a2a20, solid: false, rx: lean, cast: false });
  }
}

function tvBench(b, M) {
  b.push(5.0, U, 0.8, -Math.PI / 2);  // local x runs south, +z faces the room
  const W = 3.05, D = 0.45, Ht = 0.42;
  const white = { color: 0xe9e4d8 };
  b.box(0, Ht - 0.025, 0, W, Ht, D, M.wood, { color: 0xe0cfae });
  b.box(0, 0.04, 0, W, 0.065, D, M.satin, white);
  b.box(0, 0.04, 0, W, Ht, 0.012, M.satin, { ...white, solid: false });
  for (let i = 0; i <= 4; i++) b.box(Math.min(W - 0.02, i * W / 4), 0.04, 0, Math.min(W, i * W / 4 + 0.02), Ht, D, M.satin, { ...white, solid: false });
  const bay = W / 4;
  for (const i of [0, 2]) b.box(i * bay + 0.02, 0.065, D - 0.02, (i + 1) * bay, Ht - 0.025, D, M.satin, { color: 0x4a4744, solid: false });
  b.box(bay + 0.03, 0.065, 0.05, bay * 2 - 0.01, 0.38, D - 0.06, M.pic('records', () => M.T.records()), { uvFit: [1, 1], solid: false });
  b.box(bay * 3 + 0.03, 0.065, 0.05, bay * 3 + 0.45, 0.36, D - 0.08, M.pic('books-novels3', () => M.T.books(3, 'novels')), { uvFit: [0.7, 1], solid: false });
  b.box(bay * 3 + 0.46, 0.065, 0.05, bay * 4 - 0.02, 0.38, D - 0.06, M.pic('records', () => M.T.records()), { uvFit: [0.5, 1], solid: false });
  b.hit(0, 0, 0, W, Ht, D);
  // TV
  const tx = 1.85, tw = 1.24, th = 0.72;
  b.box(tx - tw / 2, Ht + 0.07, 0.13, tx + tw / 2, Ht + 0.07 + th, 0.165, M.satin, { color: 0xc9c9c6 });
  b.box(tx - tw / 2 + 0.012, Ht + 0.082, 0.165, tx + tw / 2 - 0.012, Ht + 0.058 + th, 0.168, M.gloss, { color: 0x060607, solid: false, cast: false });
  for (const s of [-1, 1]) b.cbox(tx + s * 0.4, Ht, 0.15, 0.03, 0.07, 0.2, M.satin, { color: 0x2a2a2a, solid: false });
  b.cbox(tx, Ht, 0.3, 0.9, 0.06, 0.09, M.satin, { color: 0x151517 });
  b.cbox(tx - 0.75, Ht, 0.3, 0.14, 0.02, 0.05, M.satin, { color: 0xe9e9e9, solid: false });
  // plants at the north end
  let y = P.pot(b, M, 0.3, Ht, 0.22, 0.12, 0.2, { color: C.terracotta });
  for (const [dx, dz, h] of [[0, 0, 0.5], [0.03, 0.02, 0.32], [-0.03, 0.01, 0.42]]) {
    b.cyl(0.3 + dx, y, 0.22 + dz, 0.012, h, M.matte, { color: 0x7a6a4a, solid: false, seg: 6 });
    P.rosette(b, M, 0.3 + dx, y + h, 0.22 + dz, { n: 22, len: 0.42, wid: 0.05, elev: 1.2, elevSpread: 1.2, bend: 1.3, base: 0x245a26, tip: 0x3f8a3a, seed: 60 + h * 100 });
  }
  y = P.pot(b, M, 0.85, Ht, 0.24, 0.07, 0.1, { color: 0x6a8a5a });
  P.bush(b, M, 0.85, y, 0.24, { trunk: 0.1, n: 9, rx: 0.3, ry: 0.22, leaf: 0.2, leafW: 0.2, shape: 'heart', base: 0x3f9a34, tip: 0x6ac84a, tip2: 0x86d85a, petiole: true, seed: 61, lift: 0.14, elev: 0.5, bend: 0.9, segs: 3 });
  b.pop();
  // floor light and a guitar in the corner
  b.cyl(4.72, U, 0.5, 0.05, 0.14, M.satin, { color: 0x1a1a1a, seg: 12 });
  b.cyl(4.72, U + 0.14, 0.5, 0.012, 1.45, M.satin, { color: 0x1a1a1a, seg: 6, solid: false });
  b.hit(4.7, U, 0.48, 4.74, U + 1.59, 0.52);
  b.cbox(4.708, U + 0.3, 0.5, 0.004, 1.25, 0.012, M.glow, { color: new THREE.Color(2.6, 1.9, 1.0), solid: false, cast: false });
  guitar(b, M, 4.82, 0.42, 0.22, -0.5, 'classical', { tilt: -0.16 });
}

function coffeeTable(b, M) {
  const oak = { color: 0xc99752 };
  b.box(1.75, 0.415, 1.5, 2.5, 0.45, 2.8, M.wood, { ...oak, uvSwap: true });
  for (const [x, z] of [[1.79, 1.54], [2.46, 1.54], [1.79, 2.76], [2.46, 2.76]]) b.cbox(x, 0, z, 0.06, 0.415, 0.06, M.wood, { ...oak, solid: false });
  b.box(1.77, 0.36, 1.52, 2.48, 0.415, 1.55, M.wood, { ...oak, solid: false }); b.box(1.77, 0.36, 2.75, 2.48, 0.415, 2.78, M.wood, { ...oak, solid: false });
  for (let k = 0; k < 9; k++) b.box(1.8 + k * 0.075, 0.13, 1.55, 1.85 + k * 0.075, 0.15, 2.75, M.wood, { ...oak, solid: false, uvSwap: true });
  b.hit(1.78, 0.12, 1.55, 2.47, 0.16, 2.75);
  b.box(1.9, 0.15, 1.7, 2.3, 0.19, 2.1, M.matte, { color: 0xe9e6dc, solid: false });
  rug(b, M, 2.12, 0.45, 2.15, 0.36, 0.7, 'runner', () => M.T.runner(), { lift: 0.002 });
  for (const z of [2.0, 2.3]) {
    b.cyl(2.12, 0.45, z, 0.03, 0.03, M.satin, { color: 0x1a1a1a, solid: false, seg: 8 });
    b.cyl(2.12, 0.48, z, 0.04, 0.07, M.satin, { color: 0x6fc0aa, seg: 12 });
  }
  b.cbox(1.92, 0.45, 2.55, 0.05, 0.02, 0.17, M.satin, { color: 0x1a1a1a, solid: false, ry: 0.4 });
}

function living(b, M) {
  rug(b, M, 2.3, U, 2.25, 2.3, 3.0, 'rug-plain', () => M.T.rugPlain());
  sofa(b, M);
  coffeeTable(b, M);
  tvBench(b, M);
  recliner(b, M, 2.95, 3.95, 2.3);
  rug(b, M, 1.95, U, 4.25, 1.0, 1.45, 'rug-berber', () => M.T.rugBerber(), { yaw: 0.12 });
  rug(b, M, 0.68, U, 5.05, 0.95, 1.7, 'rug-striped', () => M.T.rugStriped());
  aquarium(b, M);

  // print + shelf on the north wall above the sofa
  picture(b, M, 0.78, 1.55, 0, 0, 0.52, 0.72, 'warmPrint', () => art(M).warmPrint(), { color: 0xd9c4a0, mat: 0.04 });
  ladderRail(b, M, 1.3, 1.1, 1.95, 0, 0, 0.2); ladderRail(b, M, 2.32, 1.1, 1.95, 0, 0, 0.2);
  b.box(1.3, 1.26, 0, 2.32, 1.28, 0.2, M.wood, { color: 0xc9925a });
  b.box(1.3, 1.72, 0, 2.32, 1.74, 0.2, M.wood, { color: 0xc9925a });
  b.box(1.36, 1.28, 0.03, 1.8, 1.47, 0.17, M.pic('books-white0', () => M.T.books(0, 'white')), { uvFit: [0.6, 1] });
  b.cbox(1.92, 1.28, 0.1, 0.02, 0.2, 0.05, M.satin, { color: 0x151515 });
  b.sph(2.14, 1.34, 0.1, 0.07, M.glow, { color: new THREE.Color(3.6, 2.4, 1.1), scale: [1, 0.85, 0.7] });
  // framed photo (generic placeholder), red figurines and a small plant on the top shelf
  b.cbox(1.5, 1.74, 0.08, 0.2, 0.26, 0.02, M.satin, { color: 0x1a1a1a, rx: -0.12 });
  b.quad(1.5, 1.87, 0.095, 0.16, 0.22, M.pic('portrait0', () => art(M).portrait(0)), { rx: -0.12 });
  b.cyl(1.82, 1.74, 0.1, 0.03, 0.1, M.matte, { color: 0xc8283a, rTop: 0.005, seg: 8 });
  b.cyl(1.92, 1.74, 0.1, 0.025, 0.07, M.matte, { color: 0xd8344a, rTop: 0.005, seg: 8 });
  b.cyl(2.15, 1.74, 0.1, 0.04, 0.06, M.matte, { color: 0xc23a4a, seg: 8 });
  lightSwitch(b, M, 0.32, 1.1, 0, 0);
  lightSwitch(b, M, 2.7, 1.1, 0, 0);

  // antlers above the fireplace
  b.push(4.5, 1.98, 4.52, -Math.PI / 2);
  b.sph(0, 0, 0.02, 0.11, M.wood, { color: 0x9a5a34, scale: [0.9, 1.3, 0.25], solid: false });
  b.sph(0, 0.02, 0.07, 0.05, M.matte, { color: 0xe9e2d0, scale: [1, 1.2, 0.8], solid: false });
  for (const s of [-1, 1]) {
    b.cbox(s * 0.1, 0.03, 0.1, 0.022, 0.26, 0.022, M.matte, { color: 0xdccfb2, rz: -s * 1.0, rx: 0.3, solid: false });
    b.cbox(s * 0.22, 0.14, 0.14, 0.02, 0.2, 0.02, M.matte, { color: 0xdccfb2, rz: -s * 0.3, solid: false });
    b.cbox(s * 0.3, 0.1, 0.14, 0.018, 0.16, 0.018, M.matte, { color: 0xdccfb2, rz: -s * 1.2, solid: false });
    b.hit(s * 0.05, 0.0, 0.05, s * 0.36, 0.26, 0.18);
  }
  b.pop();
}

// ------------------------------------------------------------------- nook

function nook(b, M) {
  // keyboard under a striped cloth, on an X stand
  b.box(1.52, 0.76, 5.75, 1.86, 0.87, 7.08, M.fabric, { color: 0xe3d8be });
  b.quad(1.69, 0.872, 6.415, 0.34, 1.33, M.pic('cloth', () => M.T.clothStriped(), { roughness: 1 }), { up: true });
  b.box(1.855, 0.6, 5.75, 1.862, 0.87, 7.08, M.fabric, { color: 0xd9ccb0, solid: false });
  for (const z of [6.05, 6.8]) for (const s of [-1, 1]) {
    b.cbox(1.69, 0.0, z, 0.03, 0.86, 0.03, M.satin, { color: 0x151515, rz: s * 0.42, solid: false });
  }
  b.box(1.5, 0.02, 6.0, 1.9, 0.05, 6.03, M.satin, { color: 0x151515, solid: false });
  b.box(1.5, 0.02, 6.82, 1.9, 0.05, 6.85, M.satin, { color: 0x151515, solid: false });
  // music stand with a sheet
  b.cyl(1.66, U, 7.32, 0.008, 1.0, M.satin, { color: 0x151515, solid: false, seg: 6 });
  b.cbox(1.66, 0.98, 7.32, 0.02, 0.3, 0.36, M.satin, { color: 0x151515, rz: 0.35 });
  b.quad(1.676, 1.14, 7.32, 0.24, 0.3, M.pic('sheet', () => art(M).sheet()), { ry: Math.PI / 2, rx: 0, rz: 0 });
  for (const a of [0, 2.1, 4.2]) b.cbox(1.66 + Math.cos(a) * 0.12, 0.0, 7.32 + Math.sin(a) * 0.12, 0.012, 0.012, 0.26, M.satin, { color: 0x151515, solid: false, ry: Math.PI / 2 - a });
  // stool
  b.cyl(2.28, 0.46, 6.4, 0.17, 0.07, M.leather, { color: 0x232326, seg: 18 });
  b.cyl(2.28, 0.26, 6.4, 0.02, 0.2, M.metal, { color: 0x8a8d90, solid: false, seg: 8 });
  for (let k = 0; k < 3; k++) {
    const a = k * Math.PI * 2 / 3;
    b.cbox(2.28 + Math.cos(a) * 0.1, 0.0, 6.4 + Math.sin(a) * 0.1, 0.02, 0.36, 0.02, M.metal, { color: 0x8a8d90, solid: false, ry: -a, rz: -0.5 });
  }
  const ring = new THREE.TorusGeometry(0.15, 0.008, 6, 20);
  b.geo(ring, { pos: [2.28, 0.14, 6.4], rot: [Math.PI / 2, 0, 0] }, M.metal, { color: 0x8a8d90 });
  ring.dispose();
  rug(b, M, 2.85, U, 6.35, 1.1, 1.95, 'rug-kelim', () => M.T.rugKelim());

  // rya rug on the wall
  b.cbox(1.478, 1.02, 7.62, 0.016, 1.0, 0.5, M.matte, { color: 0x3a1a10 });
  b.quad(1.488, 1.52, 7.62, 0.5, 1.0, M.pic('rya', () => art(M).rya(), { roughness: 1 }), { ry: Math.PI / 2 });
  lightSwitch(b, M, 1.47, 1.1, 7.98, Math.PI / 2);

  // bookcases along the south wall
  const kinds = [['novels', 'novels', 'novels', 'novels'], ['novels', 'boxes', 'novels', 'novels'], ['games', 'games', 'novels', 'games']];
  [1.9, 2.72, 3.54].forEach((x, i) => bookcase(b, M, x, U, 8.2, Math.PI, 0.81, 1.3, 0.3, 4, { seed: i + 1, kinds: kinds[i] }));
  // things on top of the bookcases (generic placeholders for the family photos)
  const top = 1.3;
  const frame = (x, w, h, n, lean = 0.1) => {
    b.cbox(x, top, 8.1, w, h, 0.02, M.satin, { color: n % 2 ? 0x9a6a3a : 0x1a1a1a, rx: lean });
    b.quad(x, top + h / 2, 8.085 - 0.004, w - 0.04, h - 0.04, M.pic('portrait' + n, () => art(M).portrait(n)), { ry: Math.PI, rx: -lean });
  };
  frame(2.42, 0.2, 0.26, 1); frame(3.02, 0.22, 0.28, 2); frame(1.62, 0.16, 0.2, 3);
  b.cbox(2.72, top, 8.1, 0.5, 0.4, 0.03, M.satin, { color: 0x121214, rx: 0.12 });
  b.quad(2.72, top + 0.2, 8.068, 0.48, 0.38, M.pic('zither', () => art(M).zither()), { ry: Math.PI, rx: -0.12 });
  b.cbox(3.45, top, 8.05, 0.32, 0.12, 0.16, M.satin, { color: 0xe9e6de });
  guitar(b, M, 1.95, 1.98, 8.14, Math.PI, 'black');
  b.cbox(1.95, 2.42, 8.17, 0.05, 0.03, 0.06, M.satin, { color: 0x151515, solid: false });

  // tall ficus in a rattan pot on a stand
  for (let k = 0; k < 3; k++) { const a = k * 2.1; b.cbox(3.72 + Math.cos(a) * 0.1, U, 5.56 + Math.sin(a) * 0.1, 0.015, 0.14, 0.015, M.satin, { color: 0x151515, solid: false }); }
  basket(b, M, 3.72, 0.14, 5.56, 0.14, 0.26, { color: 0xc9a46a });
  P.bush(b, M, 3.72, 0.38, 5.56, { trunk: 1.25, trunkR: 0.016, n: 300, rx: 0.3, ry: 0.66, lift: -0.5, leaf: 0.1, leafW: 0.065, base: 0x1f5a24, tip: 0x347a30, tip2: 0x4a9a3c, seed: 81 });

  // robot vacuum parked under the stairs
  b.cyl(4.55, U, 6.75, 0.17, 0.08, M.satin, { color: 0xf1f0ec, seg: 22 });
  b.cyl(4.55, U + 0.08, 6.75, 0.05, 0.02, M.satin, { color: 0xd9d6ce, seg: 14, solid: false });
  b.cbox(4.86, U, 6.95, 0.12, 0.1, 0.14, M.satin, { color: 0xf1f0ec });

  // pictures along the stairs (watercolour town views) and above the landing
  const east = -Math.PI / 2;
  const gold = { color: 0x7a5a36, mat: 0.03, frame: 0.018 };
  picture(b, M, 5.0, 1.88, 5.98, east, 0.3, 0.25, 'town1', () => art(M).town(1), gold);
  picture(b, M, 5.0, 1.93, 6.36, east, 0.3, 0.25, 'town2', () => art(M).town(2), gold);
  picture(b, M, 5.0, 2.22, 5.9, east, 0.3, 0.25, 'town3', () => art(M).town(3), gold);
  picture(b, M, 5.0, 2.27, 6.28, east, 0.3, 0.25, 'town4', () => art(M).town(4), gold);
  picture(b, M, 5.0, 2.56, 6.1, east, 0.26, 0.22, 'town5', () => art(M).town(5), gold);
  picture(b, M, 5.0, 2.72, 7.82, east, 0.62, 0.48, 'winter', () => art(M).winter(), { color: 0x6a4630, mat: 0.045 });
  picture(b, M, 5.0, 2.74, 7.18, east, 0.46, 0.38, 'town6', () => art(M).town(6), { color: 0x5a4636, mat: 0.04 });
  rug(b, M, 4.53, 1.44, 7.75, 0.82, 0.82, 'mandala', () => M.T.rugMandala(), { alpha: true, lift: 0.004 });
}

export function buildMainRooms(b, M) {
  kitchen(b, M);
  dining(b, M);
  living(b, M);
  nook(b, M);
}
