// What you see through the windows: sky, ground and a small neighbourhood of
// wooden houses with tiled roofs.
import * as THREE from 'three';
import { rng } from './textures.js';

const GROUND = -3.2;

function roofGeometries(w, d, rh, over = 0.35) {
  const hw = w / 2 + over, hd = d / 2 + over;
  const sl = Math.hypot(hw, rh);
  const slopes = new THREE.BufferGeometry();
  slopes.setAttribute('position', new THREE.Float32BufferAttribute([
    -hw, 0, -hd, -hw, 0, hd, 0, rh, hd, -hw, 0, -hd, 0, rh, hd, 0, rh, -hd,
    hw, 0, hd, hw, 0, -hd, 0, rh, -hd, hw, 0, hd, 0, rh, -hd, 0, rh, hd,
  ], 3));
  slopes.setAttribute('uv', new THREE.Float32BufferAttribute([
    0, 0, hd * 2, 0, hd * 2, sl, 0, 0, hd * 2, sl, 0, sl,
    0, 0, hd * 2, 0, hd * 2, sl, 0, 0, hd * 2, sl, 0, sl,
  ], 2));
  slopes.computeVertexNormals();
  const y1 = rh * over / hw;
  const gables = new THREE.BufferGeometry();
  const P = [];
  const tri = (a, b, c) => P.push(...a, ...b, ...c);
  for (const s of [1, -1]) {
    const z = s * d / 2;
    const A = [-w / 2, 0, z], B = [w / 2, 0, z], Cc = [w / 2, y1, z], D = [0, rh, z], Ee = [-w / 2, y1, z];
    if (s > 0) { tri(A, B, Cc); tri(A, Cc, D); tri(A, D, Ee); } else { tri(B, A, Cc); tri(Cc, A, D); tri(D, A, Ee); }
  }
  gables.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  const uv = [];
  for (let i = 0; i < P.length; i += 3) uv.push(P[i], P[i + 1]);
  gables.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  gables.computeVertexNormals();
  return [slopes, gables];
}

function house(b, M, o) {
  const { x, z, w, d, h, color, yaw = 0, rh = 2.2 } = o;
  const y0 = o.y0 ?? GROUND;
  b.push(x, y0, z, yaw);
  b.cbox(0, 0, 0, w, h, d, M.cladding, { color });
  const [slopes, gables] = roofGeometries(w, d, rh);
  b.geo(slopes, { pos: [0, h, 0] }, o.roof ?? M.roofRed, {});
  b.geo(gables, { pos: [0, h, 0] }, M.cladding, { color });
  slopes.dispose(); gables.dispose();
  // white corner boards and a few windows
  const trim = { color: 0xf3f1ea };
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.cbox(sx * w / 2, 0, sz * d / 2, 0.14, h, 0.14, M.matte, trim);
  const win = (wx, wy, face) => {
    const zz = face * (d / 2 + 0.02);
    b.cbox(wx, wy, zz, 0.95, 1.15, 0.05, M.matte, trim);
    b.cbox(wx, wy + 0.08, zz + face * 0.02, 0.8, 1.0, 0.03, M.gloss, { color: 0x2a3440 });
  };
  const winX = (wz, wy, face) => {
    const xx = face * (w / 2 + 0.02);
    b.cbox(xx, wy, wz, 0.05, 1.15, 0.95, M.matte, trim);
    b.cbox(xx + face * 0.02, wy + 0.08, wz, 0.03, 1.0, 0.8, M.gloss, { color: 0x2a3440 });
  };
  const floors = h > 4.2 ? 2 : 1;
  for (let f = 0; f < floors; f++) {
    const wy = 0.9 + f * 2.6;
    for (let k = -1; k <= 1; k++) {
      if (Math.abs(k * w / 3.2) < w / 2 - 0.8) { win(k * w / 3.2, wy, 1); win(k * w / 3.2, wy, -1); }
      if (Math.abs(k * d / 3.2) < d / 2 - 0.8) { winX(k * d / 3.2, wy, 1); winX(k * d / 3.2, wy, -1); }
    }
  }
  b.pop();
}

function tree(b, M, x, z, s, color) {
  b.cyl(x, GROUND, z, 0.14 * s, 2.2 * s, M.matte, { color: 0x4a3a2a, seg: 6 });
  b.sph(x, GROUND + 3.0 * s, z, 1.5 * s, M.matte, { color, seg: 8, rings: 6, scale: [1, 1.15, 1] });
  b.sph(x + 0.7 * s, GROUND + 2.5 * s, z + 0.4 * s, 1.0 * s, M.matte, { color, seg: 7, rings: 5 });
}

export function buildOutside(b, M, scene) {
  const savedSolid = b.solidDefault, savedCast = b.castDefault;
  b.solidDefault = false; b.castDefault = false;
  const R = rng(900);

  // ground, a lawn, a gravel yard and two roads
  b.box(-150, GROUND - 1, -150, 150, GROUND, 150, M.grass, {});
  b.box(-3, GROUND, -9.5, 9, GROUND + 0.02, -3.2, M.matte, { color: 0x9a968c });
  b.box(-60, GROUND, -17.5, 60, GROUND + 0.03, -13.5, M.matte, { color: 0x6f7072 });
  b.box(-0.9, GROUND, 14.6, 1.4, GROUND + 0.03, 80, M.matte, { color: 0x77787a });
  b.box(-60, GROUND, 15.0, 60, GROUND + 0.025, 18.0, M.matte, { color: 0x77787a });

  const reds = [0xa8342c, 0x9c2f2a, 0xb33a30];
  const pale = [0xf1efe8, 0xe9e6dc, 0xd9dde0, 0xa9b4bc, 0xe6d9a8, 0xf3f1ea, 0xc9b28a];

  // --- north: seen from the dining window and the terrace
  house(b, M, { x: 4.2, z: -7.4, w: 7.5, d: 3.6, h: 2.4, rh: 1.2, color: 0xf1efe8, yaw: Math.PI / 2 });           // garage roof right below
  house(b, M, { x: -12.5, z: -11, w: 7, d: 8, h: 5.0, rh: 2.3, color: 0xf3f1ea, roof: M.roofGrey });
  // outdoor staircase on the white house
  for (let k = 0; k < 10; k++) b.cbox(-8.4, GROUND + k * 0.28, -8.5 - k * 0.3, 1.0, 0.06, 0.3, M.matte, { color: 0xf3f1ea });
  house(b, M, { x: 15, z: -12, w: 7, d: 9, h: 5.0, rh: 2.4, color: 0xa9b4bc, roof: M.roofGrey, yaw: 0.1 });
  for (let row = 0; row < 5; row++) {
    for (let k = -5; k <= 5; k++) {
      const x = k * 12 + (R() - 0.5) * 4 + (row % 2) * 5, z = -25 - row * 12 + (R() - 0.5) * 3;
      const isRed = R() < 0.3;
      house(b, M, {
        x, z, w: 6.5 + R() * 3, d: 7 + R() * 3, h: R() < 0.7 ? 5.2 : 2.8, rh: 2 + R() * 0.8,
        color: isRed ? reds[(R() * 3) | 0] : pale[(R() * pale.length) | 0],
        roof: R() < 0.55 ? M.roofRed : M.roofGrey, yaw: (R() < 0.5 ? 0 : Math.PI / 2) + (R() - 0.5) * 0.2,
      });
    }
  }
  // --- south: the lane seen from the hall window, red houses on both sides
  for (let k = 0; k < 4; k++) {
    house(b, M, { x: -6.2, z: 23 + k * 11, w: 7, d: 8.5, h: 5.2, rh: 2.4, color: reds[k % 3], yaw: Math.PI / 2 });
    house(b, M, { x: 7.5, z: 22 + k * 11.5, w: 7, d: 8, h: k % 2 ? 5.2 : 2.9, rh: 2.2, color: k % 2 ? 0xf1efe8 : reds[(k + 1) % 3], yaw: Math.PI / 2 });
    b.cbox(-1.6, GROUND, 22 + k * 11, 0.5, 1.0, 6, M.matte, { color: 0x4a6a34 });      // hedges
    b.cbox(2.3, GROUND, 24 + k * 11, 0.5, 0.9, 5, M.matte, { color: 0x557a3a });
  }
  for (const [x, z] of [[-1.5, 17.5], [-1.2, 17.6]]) b.cbox(x, GROUND, z, 0.5, 1.0, 0.55, M.matte, { color: 0x2f6a3a });
  for (let k = -4; k <= 4; k++) {
    house(b, M, { x: k * 13 + 2, z: 68 + (R() - 0.5) * 6, w: 7, d: 8, h: 5.2, rh: 2.4, color: R() < 0.5 ? reds[0] : pale[(R() * pale.length) | 0], roof: R() < 0.6 ? M.roofRed : M.roofGrey });
    if (Math.abs(k) > 1) house(b, M, { x: k * 12, z: 30 + (R() - 0.5) * 10, w: 7, d: 8, h: 5.2, rh: 2.4, color: pale[(R() * pale.length) | 0], roof: R() < 0.6 ? M.roofRed : M.roofGrey, yaw: Math.PI / 2 });
  }
  // trees
  const greens = [0x4a7a34, 0x5a8a3a, 0x6a8a3a, 0xb98a3a, 0x8a7a34, 0x3f6a30];
  for (let i = 0; i < 70; i++) {
    const x = (R() - 0.5) * 120, z = (R() < 0.6 ? -14 - R() * 60 : 20 + R() * 60);
    if (Math.abs(x) < 3 && z > 0) continue;
    tree(b, M, x, z, 0.8 + R() * 0.9, greens[(R() * greens.length) | 0]);
  }
  tree(b, M, -9.5, -4.5, 0.8, 0x5a8a3a); tree(b, M, 9.5, -4.2, 0.7, 0xb98a3a);

  // sky dome
  const sky = new THREE.Mesh(new THREE.SphereGeometry(160, 32, 16), M.sky);
  sky.geometry.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(sky.geometry.attributes.position.count * 3).fill(1), 3));
  sky.position.set(0, GROUND, 5);
  sky.rotation.y = 1.2;
  scene.add(sky);

  b.solidDefault = savedSolid; b.castDefault = savedCast;
}
