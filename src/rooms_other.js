// Corridor, entrance hall and the loft.
import * as THREE from 'three';
import { C } from './materials.js';
import { LVL } from './house.js';
import {
  picture, rug, lightSwitch, heater, basket, sheepskin, pillow, guitar, pendant, lantern, P, art,
} from './props.js';

const { U, H, LF } = LVL;
const W = Math.PI / 2;      // facing +x (things on a west wall)
const E = -Math.PI / 2;     // facing -x (things on an east wall)

function corridor(b, M) {
  // --- west wall, south to north
  guitar(b, M, 0.06, 1.45, 9.85, W, 'classical');
  b.cbox(0.03, 1.96, 9.85, 0.05, 0.03, 0.06, M.satin, { color: 0x151515, solid: false });
  picture(b, M, 0, 1.6, 9.12, W, 0.5, 0.68, 'forestGirl', () => art(M).forestGirl(), { mat: 0.06 });
  picture(b, M, 0, 1.6, 8.47, W, 0.5, 0.68, 'greenClouds', () => art(M).greenClouds(), { mat: 0.06 });
  // oak bench with a sheepskin
  b.box(0.02, 0.06, 6.8, 0.44, 0.45, 7.9, M.wood, { color: C.oakBench });
  b.box(0.05, 0, 6.84, 0.41, 0.06, 7.86, M.satin, { color: 0x3a3028, solid: false });
  b.box(0.44, 0.1, 6.82, 0.445, 0.41, 7.88, M.satin, { color: 0x4a4038, solid: false, cast: false });
  sheepskin(b, M, 0.25, 0.45, 7.3, 0.44, 0.95, { yaw: W });
  basket(b, M, 0.24, U, 6.47, 0.16, 0.3, { color: 0xb99a6a });
  b.sph(0.24, 0.3, 6.47, 0.13, M.fabric, { color: 0x6f7a80, scale: [1, 0.5, 1], solid: false });
  basket(b, M, 0.24, U, 6.08, 0.12, 0.2, { color: 0xc9a46a });
  P.rosette(b, M, 0.24, 0.18, 6.08, { n: 13, len: 0.62, wid: 0.06, elev: 1.5, elevSpread: 0.3, bend: 0.22, base: 0x2c5a2a, tip: 0x5a8a40, mid: 0x8fa85a, segs: 4, seed: 91 });
  lightSwitch(b, M, 0, 1.1, 5.95, W);

  // --- east wall, north to south
  b.box(1.15, 0.8, 5.5, 1.35, 0.82, 6.2, M.satin, { color: 0x151515 });
  b.cbox(1.25, 0.82, 5.72, 0.11, 0.16, 0.11, M.fabric, { color: 0x1c1c1e });
  b.cbox(1.26, 0.82, 6.0, 0.03, 0.12, 0.2, M.satin, { color: 0xe9e9e6, rz: 0.25 });
  b.quad(1.24, 0.885, 6.0, 0.17, 0.1, M.pic('clock', () => art(M).clock(), { emissive: 0.8 }), { ry: E, rx: 0, rz: 0 });
  picture(b, M, 1.35, 1.82, 5.87, E, 0.46, 0.34, 'fishRed', () => art(M).fish('red'), { mat: 0.035 });
  picture(b, M, 1.35, 1.4, 5.87, E, 0.46, 0.34, 'fishGreen', () => art(M).fish('green'), { mat: 0.035 });
  lightSwitch(b, M, 1.35, 1.2, 5.6, E);
  // woven band
  b.quad(1.342, 1.45, 6.75, 0.3, 1.3, M.pic('tapestry', () => art(M).tapestry(), { roughness: 1 }), { ry: E });
  b.cbox(1.34, 2.1, 6.75, 0.012, 0.012, 0.34, M.satin, { color: 0x151515 });
  picture(b, M, 1.35, 1.52, 7.75, E, 0.9, 1.05, 'ochre', () => art(M).ochre(), { color: 0x7a5a36, mat: 0.07, frame: 0.03 });
  picture(b, M, 1.35, 1.6, 8.9, E, 0.7, 0.7, 'stag', () => art(M).stag(), { color: 0x0b0b10, mat: 0, frame: 0.004 });
  lightSwitch(b, M, 1.35, 1.1, 10.52, E); lightSwitch(b, M, 1.35, 1.0, 10.52, E);
  picture(b, M, 1.35, 1.55, 11.08, E, 0.72, 0.72, 'cityNight', () => art(M).cityNight(), { color: 0x101010, mat: 0, frame: 0.02, depth: 0.04 });
  heater(b, M, 1.35, 0.12, 11.1, E, 0.75, 0.4);
  // fuse cabinet
  b.box(1.25, 1.15, 11.6, 1.35, 1.85, 12.12, M.gloss, { color: 0xf3f2ee });
  b.cyl(1.245, 1.5, 12.04, 0.02, 0.004, M.metal, { color: 0x555555, rz: W, solid: false, seg: 10 });
  // wardrobe with mirrored sliding doors
  b.box(0.74, U, 12.3, 1.35, 2.3, 13.9, M.satin, { color: 0xf1efe9 });
  b.box(0.74, 2.3, 12.3, 1.35, H, 13.9, M.plaster, { color: C.wall, cast: false });
  for (const [z0, z1] of [[12.33, 13.09], [13.11, 13.87]]) {
    b.box(0.728, 0.04, z0 + 0.02, 0.74, 2.27, z1 - 0.02, M.mirror, { color: 0xe6ecee, solid: false, cast: false });
    const fr = { color: 0xb9bcc0, solid: false, cast: false };
    b.box(0.722, 0.02, z0, 0.74, 2.29, z0 + 0.02, M.metal, fr); b.box(0.722, 0.02, z1 - 0.02, 0.74, 2.29, z1, M.metal, fr);
    b.box(0.722, 0.02, z0, 0.74, 0.04, z1, M.metal, fr); b.box(0.722, 2.27, z0, 0.74, 2.29, z1, M.metal, fr);
  }
  // ceiling lights
  b.cyl(0.67, H - 0.03, 8.6, 0.2, 0.03, M.satin, { color: 0xf5f5f2, seg: 20, solid: false, cast: false });
  const ringLamp = new THREE.TorusGeometry(0.15, 0.02, 6, 24);
  b.geo(ringLamp, { pos: [0.67, H - 0.04, 8.6], rot: [Math.PI / 2, 0, 0] }, M.glow, { color: new THREE.Color(3.4, 3.0, 2.3), cast: false });
  b.geo(ringLamp, { pos: [0.67, H - 0.045, 8.6], rot: [Math.PI / 2, 0, 0], scale: [0.55, 0.55, 1] }, M.glow, { color: new THREE.Color(3.4, 3.0, 2.3), cast: false });
  ringLamp.dispose();
  b.cbox(0.2, H - 0.03, 12.5, 0.3, 0.03, 0.08, M.satin, { color: 0xd9d9d6, solid: false, cast: false });
  for (const s of [-1, 1]) {
    b.cyl(0.2 + s * 0.1, H - 0.11, 12.5, 0.035, 0.08, M.metal, { color: 0xc8c8c8, solid: false, seg: 10, rz: s * 0.5, cast: false });
    b.sph(0.2 + s * 0.13, H - 0.1, 12.5, 0.025, M.glow, { color: new THREE.Color(3.6, 2.8, 1.6), solid: false, seg: 8, rings: 5, cast: false });
  }
  // rugs
  rug(b, M, 0.68, U, 7.95, 0.75, 3.0, 'rug-jute', () => M.T.rugJute());
  rug(b, M, 0.62, U, 11.5, 0.6, 0.95, 'rug-entry', () => M.T.rugEntry(), { yaw: 0.15 });
  rug(b, M, 0.34, U, 12.95, 0.62, 1.0, 'rug-grey', () => M.T.rugPlain('#a9a6a0', 'rgba(60,60,60,0.3)'));
}

function entry(b, M) {
  // white bench with a grey sheepskin and cushions under the purple painting
  b.box(-1.95, 0.0, 11.42, -0.75, 0.42, 11.84, M.satin, { color: 0xf1f0ec });
  sheepskin(b, M, -1.35, 0.42, 11.63, 1.15, 0.4, { color: 0xd9d6d0 });
  pillow(b, M, -1.5, 0.6, 11.54, 0.36, 0x5a5c62, { rx: -1.1 });
  pillow(b, M, -1.14, 0.58, 11.6, 0.38, 0xa9c8d2, { rx: -0.9, yaw: 0.3 });
  picture(b, M, -1.3, 1.62, 11.4, 0, 0.84, 0.7, 'purpleForest', () => art(M).purpleForest(), { mat: 0.08, frame: 0.025 });
  // shopping bag by the door
  b.cbox(-2.08, U, 11.62, 0.24, 0.3, 0.2, M.matte, { color: 0xe9eaf0 });
  b.cbox(-2.08, 0.12, 11.62, 0.245, 0.08, 0.205, M.matte, { color: 0x2f4fa8, solid: false });
  // dracaena at the corner of the blue wall
  let y = P.pot(b, M, -0.3, U, 11.8, 0.14, 0.26, { color: 0xe6e3dc });
  for (const [dx, dz, h, s] of [[0, 0, 0.75, 1], [0.05, 0.03, 0.4, 2], [-0.04, 0.04, 0.2, 3]]) {
    b.cyl(-0.3 + dx, y, 11.8 + dz, 0.014, h, M.matte, { color: 0x7a6a4a, solid: false, seg: 6 });
    P.rosette(b, M, -0.3 + dx, y + h, 11.8 + dz, { n: 26, len: 0.48, wid: 0.055, elev: 1.25, elevSpread: 1.3, bend: 1.3, base: 0x1f5a26, tip: 0x3a8a34, mid: 0xb9d86a, seed: 100 + s });
  }
  rug(b, M, -1.7, U, 12.55, 0.9, 0.6, 'rug-mat', () => M.T.rugPlain('#8f8a82', 'rgba(40,40,40,0.35)'));

  // --- south wall: coats, shoe bench, things under the window
  b.box(-2.1, 1.66, 13.87, -1.0, 1.74, 13.9, M.wood, { color: 0xc9a46a, solid: false });
  for (let k = 0; k < 5; k++) b.cbox(-2.0 + k * 0.23, 1.66, 13.84, 0.02, 0.03, 0.06, M.satin, { color: 0x151515, solid: false });
  b.sph(-1.25, 1.35, 13.76, 0.3, M.fabric, { color: 0x1c1d22, scale: [0.9, 1.25, 0.4] });
  b.sph(-1.6, 1.3, 13.78, 0.26, M.fabric, { color: 0x3a3020, scale: [0.8, 1.3, 0.35] });
  b.sph(-1.36, 0.95, 13.76, 0.16, M.fabric, { color: 0xe9e9e6, scale: [0.8, 1.2, 0.5], solid: false });
  b.box(-2.15, 0.4, 13.5, -1.2, 0.47, 13.88, M.fabric, { color: 0xe9dfc4 });
  for (const x of [-2.13, -1.22]) for (const z of [13.52, 13.86]) b.cbox(x, U, z, 0.02, 0.4, 0.02, M.satin, { color: 0xf3f3f0, solid: false });
  b.box(-2.13, 0.16, 13.52, -1.22, 0.175, 13.86, M.satin, { color: 0xf3f3f0, solid: false });
  const shoe = (x, z, c, yy = 0) => { b.sph(x, yy + 0.045, z, 0.07, M.matte, { color: c, scale: [0.65, 0.6, 1.7], solid: false, seg: 8, rings: 6 }); };
  shoe(-2.0, 13.7, 0xe6e6e2, 0.175); shoe(-1.86, 13.7, 0xe6e6e2, 0.175); shoe(-1.6, 13.7, 0x8a3a3a, 0.175); shoe(-1.46, 13.7, 0x8a3a3a, 0.175);
  b.box(-1.12, U, 13.45, -0.5, 0.015, 13.86, M.satin, { color: 0x1a1a1a, solid: false });
  shoe(-1.0, 13.66, 0x4a3a2a); shoe(-0.86, 13.66, 0x4a3a2a); shoe(-0.7, 13.7, 0x1c1c1c); shoe(-0.58, 13.7, 0x1c1c1c);
  b.cbox(0.1, U, 13.7, 0.36, 0.3, 0.34, M.fabric, { color: 0xe6d9b8 });
  b.cbox(-0.25, U, 13.82, 0.3, 0.26, 0.05, M.matte, { color: 0x5a4a3a, rx: -0.2 });

  // --- window sill (y = 0.95)
  const sy = 0.95;
  basket(b, M, 0.28, sy, 14.02, 0.085, 0.15, { color: 0xb9925a });
  b.cyl(0.28, sy + 0.14, 14.02, 0.018, 0.14, M.matte, { color: 0x5a4632, seg: 6, rz: 0.2 });
  P.bush(b, M, 0.25, sy + 0.2, 14.02, { trunk: 0.02, n: 70, rx: 0.2, ry: 0.13, leaf: 0.04, leafW: 0.028, base: 0x1f4f22, tip: 0x34782e, seed: 111, lift: 0.14 });
  rug(b, M, -0.12, sy, 14.02, 0.3, 0.2, 'runner', () => M.T.runner(), { lift: 0.002 });
  lantern(b, M, -0.1, sy, 14.02, 0.05, 0.1);
  b.cyl(-0.33, sy, 14.0, 0.035, 0.07, M.satin, { color: 0xf1efe8, seg: 12 });
}

// A row of clothes on a rail
function clothesRack(b, M, x0, x1, z, y) {
  const fr = { color: 0x1c1c1e, solid: false };
  b.cyl(x0, y, z, 0.012, 1.5, M.satin, { ...fr, seg: 6 }); b.cyl(x1, y, z, 0.012, 1.5, M.satin, { ...fr, seg: 6 });
  b.cbox((x0 + x1) / 2, y + 1.48, z, x1 - x0, 0.024, 0.024, M.satin, { color: 0x1c1c1e });
  b.cbox(x0, y, z, 0.03, 0.03, 0.5, M.satin, fr); b.cbox(x1, y, z, 0.03, 0.03, 0.5, M.satin, fr);
  const cols = [0x3a4a6a, 0xcfc8b8, 0x7a8a6a, 0x23262e, 0xe9e6de, 0x2a3a52, 0x1c1c20, 0xd9d2c4, 0x384a3a, 0x8a8f96, 0xf1efe8, 0x55606a, 0x7a2a34, 0x2a2a30];
  const n = cols.length;
  for (let i = 0; i < n; i++) {
    const x = x0 + 0.08 + (x1 - x0 - 0.16) * i / (n - 1);
    const h = 0.6 + ((i * 37) % 10) / 28;
    b.cbox(x, y + 1.44 - h, z, 0.075, h, 0.4 + (i % 3) * 0.03, M.fabric, { color: cols[i], solid: false });
    b.cbox(x, y + 1.44, z, 0.01, 0.04, 0.3, M.wood, { color: 0xd9b98a, solid: false, cast: false });
  }
  b.hit(x0, y + 0.55, z - 0.2, x1, y + 1.44, z + 0.2);
}

function loft(b, M) {
  b.castDefault = false;   // nothing up here should throw shadows through the floor
  // --- sideboard with ribbed fronts along the west wall
  const oak = { color: 0xdcc39a };
  b.push(-0.6, LF, 7.05, W);          // local x runs north
  const SW = 1.8, D = 0.45;
  b.box(0, 0.16, 0, SW, 0.76, D, M.wood, oak);
  b.box(-0.01, 0.76, 0, SW + 0.01, 0.785, D + 0.01, M.wood, { color: 0xd9bb8a });
  for (let k = 0; k < 72; k++) b.box(0.012 + k * 0.0247, 0.17, D, 0.026 + k * 0.0247, 0.75, D + 0.012, M.wood, { ...oak, solid: false, uvSwap: true });
  for (let i = 0; i < 2; i++) for (let j = 0; j < 3; j++) {
    b.cbox(0.72 + i * 0.36, 0.25 + j * 0.2, D + 0.018, 0.02, 0.02, 0.014, M.satin, { color: 0x1a1a1a, solid: false });
  }
  for (const x of [0.04, SW - 0.04]) for (const z of [0.04, D - 0.04]) b.cbox(x, 0, z, 0.02, 0.16, 0.02, M.satin, { color: 0x1a1a1a, solid: false });
  // plant in a basket + glowing bowl lamp on top
  basket(b, M, 1.5, 0.785, 0.22, 0.1, 0.16, { color: 0xc9a46a });
  P.bush(b, M, 1.5, 0.93, 0.22, { trunk: 0.14, n: 34, rx: 0.3, ry: 0.3, lift: 0.14, leaf: 0.09, leafW: 0.09, shape: 'heart', base: 0x1f4f22, tip: 0x2f6f2c, petiole: true, seed: 121, cast: false });
  b.sph(0.22, 0.84, 0.24, 0.085, M.glow, { color: new THREE.Color(3.6, 2.4, 1.0), scale: [1, 0.7, 1] });
  b.pop();

  // --- gallery wall (the family photos are replaced by neutral placeholders)
  const wy = LF;
  picture(b, M, -0.6, wy + 1.72, 6.75, W, 0.62, 0.74, 'tulips', () => art(M).tulips(), { color: 0xb9963a, mat: 0, frame: 0.035, frameMat: M.metal });
  picture(b, M, -0.6, wy + 2.0, 6.25, W, 0.22, 0.28, 'portrait4', () => art(M).portrait(4), { color: 0xf1efe8, mat: 0.02 });
  picture(b, M, -0.6, wy + 2.1, 5.8, W, 0.42, 0.3, 'underwater', () => art(M).underwater(), { color: 0x151515, mat: 0 });
  picture(b, M, -0.6, wy + 1.66, 5.86, W, 0.3, 0.4, 'portrait5', () => art(M).portrait(5), { color: 0xf1efe8, mat: 0.03 });
  picture(b, M, -0.6, wy + 1.95, 5.42, W, 0.17, 0.23, 'portrait6', () => art(M).portrait(6), { color: 0x9a6a3a, mat: 0.015 });
  picture(b, M, -0.6, wy + 1.58, 5.44, W, 0.22, 0.2, 'portrait7', () => art(M).portrait(7), { color: 0x9a6a3a, mat: 0.03 });
  picture(b, M, -0.6, wy + 1.8, 5.05, W, 0.26, 0.36, 'portrait8', () => art(M).portrait(8), { color: 0xb98a5a, mat: 0.01 });
  lightSwitch(b, M, -0.6, wy + 1.1, 7.6, W);

  // --- clothes rail under the sloping ceiling, big schefflera, chair, guitar
  clothesRack(b, M, 0.35, 2.15, 4.82, LF);
  b.sph(2.42, LF + 0.14, 4.7, 0.2, M.fabric, { color: 0x3a4a44, scale: [1.2, 0.7, 0.8] });
  basket(b, M, 0.45, LF, 5.7, 0.17, 0.28, { color: 0xc9a46a });
  P.bush(b, M, 0.45, LF + 0.26, 5.7, { trunk: 0.75, trunkR: 0.018, n: 150, rx: 0.48, ry: 0.5, lift: -0.05, leaf: 0.13, leafW: 0.05, shape: 'lance', base: 0x245a26, tip: 0x3f8a36, tip2: 0xd9d26a, lightChance: 0.35, seed: 122, cast: false });
  rug(b, M, 1.25, LF, 6.9, 1.7, 2.3, 'rug-loft', () => M.T.rugPlain('#d9cfb8', 'rgba(120,105,80,0.2)'));
  // electric guitar on a stand
  guitar(b, M, 2.3, LF + 0.42, 5.62, 0.3, 'electric', { tilt: -0.2 });
  for (const s of [-1, 1]) b.cbox(2.3 + s * 0.12, LF, 5.62, 0.015, 0.3, 0.015, M.satin, { color: 0x151515, solid: false, rz: s * 0.35 });
  b.cbox(2.3, LF, 5.5, 0.015, 0.75, 0.015, M.satin, { color: 0x151515, solid: false, rx: -0.2 });
  // high-backed leather swivel chair
  b.push(2.05, LF, 6.55, -2.2);
  const lea = { color: 0xb46a3a };
  b.cbox(0, 0.4, 0, 0.5, 0.1, 0.5, M.leather, lea);
  b.cbox(0, 0.5, -0.3, 0.48, 0.82, 0.1, M.leather, { ...lea, rx: -0.24, solid: false });
  b.hit(-0.24, 0.5, -0.5, 0.24, 1.3, -0.26);
  b.cbox(0, 1.08, -0.39, 0.26, 0.09, 0.07, M.leather, { color: 0xa85e30, rx: -0.24, solid: false });
  for (const s of [-1, 1]) {
    b.cbox(s * 0.27, 0.6, -0.02, 0.035, 0.03, 0.34, M.leather, { color: 0xa85e30 });
    b.cbox(s * 0.27, 0.42, 0.12, 0.015, 0.2, 0.015, M.satin, { color: 0x151515, solid: false });
  }
  b.cyl(0, 0.04, 0, 0.022, 0.36, M.satin, { color: 0x151515, solid: false, seg: 8 });
  for (let k = 0; k < 2; k++) b.cbox(0, 0.01, 0, 0.62, 0.025, 0.03, M.satin, { color: 0x151515, solid: false, ry: k * Math.PI / 2 + 0.6 });
  b.pop();
  // variegated plant on a black stand by the railing
  for (let k = 0; k < 3; k++) { const a = k * 2.1 + 0.4; b.cbox(2.42 + Math.cos(a) * 0.1, LF, 7.05 + Math.sin(a) * 0.1, 0.012, 0.5, 0.012, M.satin, { color: 0x151515, solid: false }); }
  b.cyl(2.42, LF + 0.5, 7.05, 0.12, 0.17, M.satin, { color: 0x4a4a48, seg: 14, rTop: 0.13 });
  P.bush(b, M, 2.42, LF + 0.66, 7.05, { trunk: 0.22, n: 60, rx: 0.3, ry: 0.28, lift: 0.08, leaf: 0.12, leafW: 0.055, base: 0x2a5f28, tip: 0x3f8236, tip2: 0xe0d86a, lightChance: 0.5, seed: 123, cast: false });

  // --- lamps and the forest print by the door
  pendant(b, M, 1.3, LF + 1.95, 6.6, 0.13, 0xc98a5e, LF + 2.5, { mat: M.metal, squash: 0.95 });
  pendant(b, M, 3.9, LF + 1.9, 7.0, 0.13, 0xc98a5e, LF + 2.5, { mat: M.metal, squash: 0.95 });
  picture(b, M, 2.75, LF + 1.5, 8.9, Math.PI, 0.72, 0.54, 'forestPrint', () => art(M).forestPrint(), { mat: 0.06 });
  b.castDefault = true;
}

export function buildOtherRooms(b, M) {
  corridor(b, M);
  entry(b, M);
  loft(b, M);
}
