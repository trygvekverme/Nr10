// The budgie: a procedurally modelled green budgerigar with a small rig
// (wings in two segments, tail, legs, head, beak, eyelids) driven by a set
// of pose parameters.
import * as THREE from 'three';
import { rng } from './textures.js';

export const BIRD_SCALE = 1.2;

function canvasTex(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  t.anisotropy = 4;
  return t;
}

// u wraps around the body (0.25 = belly, 0.75 = back), v runs tail (0) -> head (1)
function bodyTexture() {
  return canvasTex(256, 256, (g, W, H) => {
    const R = rng(7);
    g.fillStyle = '#5fc03a'; g.fillRect(0, 0, W, H);
    // lighter belly, darker towards the tail
    let gr = g.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, 'rgba(244,224,64,1)'); gr.addColorStop(0.16, 'rgba(238,222,60,0.9)');
    gr.addColorStop(0.3, 'rgba(150,210,60,0)'); gr.addColorStop(0.8, 'rgba(60,170,70,0)'); gr.addColorStop(1, 'rgba(30,120,110,0.9)');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    // fine feather texture
    for (let i = 0; i < 2600; i++) {
      g.fillStyle = `rgba(${R() < 0.5 ? '20,90,20' : '220,255,150'},${0.05 + R() * 0.08})`;
      g.fillRect(R() * W, R() * H, 1.5, 3 + R() * 4);
    }
    // the scalloped mantle on the back
    const x0 = W * 0.53, x1 = W * 0.97, y0 = H * 0.06, y1 = H * 0.62;
    gr = g.createLinearGradient(0, y0, 0, y1);
    gr.addColorStop(0, 'rgba(240,222,66,1)'); gr.addColorStop(0.5, 'rgba(214,214,70,1)'); gr.addColorStop(1, 'rgba(150,200,70,0.0)');
    g.fillStyle = gr;
    g.beginPath(); g.ellipse((x0 + x1) / 2, (y0 + y1) / 2 - 10, (x1 - x0) / 2, (y1 - y0) / 2 + 12, 0, 0, Math.PI * 2); g.fill();
    g.lineCap = 'round';
    let row = 0;
    for (let y = y0 + 4; y < y1; y += 7 + row * 0.9) {
      const t = (y - y0) / (y1 - y0);
      const half = (x1 - x0) / 2 * Math.sqrt(Math.max(0.05, 1 - Math.pow(t * 2 - 1, 2) * 0.75));
      const sw = 9 + t * 9;
      g.strokeStyle = `rgba(22,24,20,${0.95 - t * 0.25})`;
      g.lineWidth = 2.2 + t * 2.6;
      for (let x = (x0 + x1) / 2 - half + ((row % 2) * sw) / 2; x < (x0 + x1) / 2 + half; x += sw) {
        g.beginPath(); g.arc(x, y, sw * 0.46, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke();
      }
      row++;
    }
  });
}

// u: 0.25 = face, 0.75 = back of the head; v: 0 = chin, 1 = crown
function headTexture() {
  return canvasTex(128, 128, (g, W, H) => {
    g.fillStyle = '#f5e145'; g.fillRect(0, 0, W, H);
    const gr = g.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, 'rgba(255,238,90,0.6)'); gr.addColorStop(1, 'rgba(235,205,40,0.5)');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.strokeStyle = 'rgba(24,24,20,0.92)'; g.lineWidth = 2.2; g.lineCap = 'round';
    for (let y = H * 0.06; y < H * 0.86; y += 6.5) {
      g.beginPath();
      for (let x = W * 0.56; x <= W * 0.95; x += 3) {
        const yy = y + Math.sin(x * 0.55) * 1.6;
        if (x === W * 0.56) g.moveTo(x, yy); else g.lineTo(x, yy);
      }
      g.stroke();
    }
  });
}

// u: 0 = shoulder, 1 = wing tip; v: 0 = leading edge, 1 = trailing edge
function wingTexture() {
  return canvasTex(256, 128, (g, W, H) => {
    g.fillStyle = '#23241f'; g.fillRect(0, 0, W, H);
    // flight feathers
    for (let x = 0; x < W; x += 13) {
      g.fillStyle = '#2f322a'; g.fillRect(x + 1, H * 0.42, 11, H);
      g.fillStyle = 'rgba(190,206,70,0.9)'; g.fillRect(x + 11, H * 0.46, 2, H);
      g.fillStyle = 'rgba(90,150,60,0.35)'; g.fillRect(x + 1, H * 0.8, 11, H * 0.2);
    }
    g.fillStyle = 'rgba(214,214,80,0.85)'; g.fillRect(0, H * 0.4, W, 4);
    // scalloped coverts
    g.lineCap = 'round';
    let row = 0;
    for (let y = 6; y < H * 0.42; y += 11) {
      for (let x = (row % 2) * 8; x < W + 8; x += 16) {
        g.fillStyle = '#1c1d19';
        g.beginPath(); g.ellipse(x, y, 7.5, 6.5, 0, 0, Math.PI * 2); g.fill();
        g.strokeStyle = '#e4dc52'; g.lineWidth = 2.4;
        g.beginPath(); g.arc(x, y, 7, 0.1 * Math.PI, 0.9 * Math.PI); g.stroke();
      }
      row++;
    }
    const gr = g.createLinearGradient(0, 0, W, 0);
    gr.addColorStop(0, 'rgba(120,190,60,0.35)'); gr.addColorStop(0.35, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
  });
}

function flatShape(pts, uvFn, yFn = () => 0) {
  // triangle fan around the centroid, in the XZ plane
  let cx = 0, cz = 0;
  for (const p of pts) { cx += p[0]; cz += p[1]; }
  cx /= pts.length; cz /= pts.length;
  const pos = [], uv = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    for (const p of [[cx, cz], a, b]) {
      pos.push(p[0], yFn(p[0], p[1]), p[1]);
      const t = uvFn(p[0], p[1]); uv.push(t[0], t[1]);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.computeVertexNormals();
  return g;
}

export class Budgie {
  constructor() {
    this.group = new THREE.Group();            // position + yaw
    this.group.scale.setScalar(BIRD_SCALE);
    this.body = new THREE.Group();             // pitch + roll
    this.body.rotation.order = 'YXZ';
    this.group.add(this.body);

    const feather = (map, o = {}) => new THREE.MeshStandardMaterial({ map, roughness: 0.78, ...o });
    const plain = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.7, ...o });

    // ---- torso: a sphere stretched into a teardrop along z
    const tg = new THREE.SphereGeometry(1, 28, 18);
    tg.rotateX(Math.PI / 2);
    const tp = tg.attributes.position;
    for (let i = 0; i < tp.count; i++) {
      const x = tp.getX(i), y = tp.getY(i), z = tp.getZ(i);
      const s = z < 0 ? 1 - 0.42 * z * z : 1 - 0.12 * z * z;        // taper towards the tail
      const belly = y < 0 ? 1.06 : 0.96;                              // slightly flat back, full chest
      tp.setXYZ(i, x * 0.0215 * s, y * 0.0235 * s * belly + (z > 0 ? z * 0.004 : 0), z * 0.041);
    }
    tg.computeVertexNormals();
    this.torso = new THREE.Mesh(tg, feather(bodyTexture()));
    this.body.add(this.torso);

    // ---- head
    this.neck = new THREE.Group();
    this.neck.position.set(0, 0.013, 0.027);
    this.neck.rotation.order = 'YXZ';
    this.body.add(this.neck);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.0168, 22, 16), feather(headTexture()));
    head.position.set(0, 0.0105, 0.0085);
    head.scale.set(1, 0.96, 1.04);
    this.neck.add(head);
    this.head = head;
    // cere (blue) and beak
    const cere = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), plain(0x5f86d8, { roughness: 0.45 }));
    cere.scale.set(0.0046, 0.0027, 0.003); cere.position.set(0, 0.0032, 0.0166);
    head.add(cere);
    const beakMat = plain(0xcdb96a, { roughness: 0.4 });
    const upper = new THREE.Mesh(new THREE.ConeGeometry(0.0047, 0.011, 10), beakMat);
    upper.rotation.x = Math.PI * 0.86; upper.position.set(0, -0.0018, 0.0169); upper.scale.set(1, 1, 0.8);
    head.add(upper);
    this.lowerBeak = new THREE.Mesh(new THREE.ConeGeometry(0.0028, 0.005, 8), beakMat);
    this.lowerBeak.rotation.x = Math.PI * 0.95; this.lowerBeak.position.set(0, -0.0052, 0.0138);
    head.add(this.lowerBeak);
    // eyes with a pale iris ring and eyelids
    this.eyes = [];
    for (const s of [-1, 1]) {
      const ring = new THREE.Mesh(new THREE.SphereGeometry(0.0037, 10, 8), plain(0xe9e6da));
      ring.position.set(s * 0.0136, 0.0034, 0.0088); ring.scale.set(0.45, 1, 1);
      head.add(ring);
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.0027, 10, 8), plain(0x050505, { roughness: 0.08 }));
      pupil.position.set(s * 0.0147, 0.0034, 0.0089); pupil.scale.set(0.5, 1, 1);
      head.add(pupil);
      const lid = new THREE.Mesh(new THREE.SphereGeometry(0.004, 10, 8), plain(0xe9d94a));
      lid.position.set(s * 0.0143, 0.0034, 0.0088); lid.scale.set(0.5, 0.01, 1.05);
      head.add(lid);
      this.eyes.push({ ring, pupil, lid });
      // violet cheek patch and black throat spots
      const cheek = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), plain(0x5a43c8));
      cheek.scale.set(0.002, 0.0042, 0.0034); cheek.position.set(s * 0.0122, -0.0072, 0.0082); cheek.rotation.z = s * 0.5;
      head.add(cheek);
      for (let k = 0; k < 3; k++) {
        const spot = new THREE.Mesh(new THREE.SphereGeometry(0.00155, 8, 6), plain(0x0c0c0c));
        const a = 0.25 + k * 0.34;
        spot.position.set(s * Math.sin(a) * 0.0135, -0.0105 + k * 0.0012, Math.cos(a) * 0.0118 + 0.001);
        head.add(spot);
      }
    }

    // ---- wings
    const wingTex = wingTexture();
    const wingMat = feather(wingTex, { side: THREE.DoubleSide });
    const SPAN = 0.128, IN = 0.05;
    const camber = (x, z) => -0.006 * Math.pow((z - 0.0) / 0.04, 2) * 0.4;
    const uvIn = (x, z) => [x / SPAN, (0.016 - z) / 0.054];
    const uvOut = (x, z) => [(IN + x) / SPAN, (0.016 - z) / 0.054];
    const innerGeo = flatShape([[0, 0.013], [IN, 0.016], [IN, -0.037], [IN * 0.5, -0.039], [0, -0.034]], uvIn, camber);
    const outerGeo = flatShape([[0, 0.016], [0.03, 0.013], [0.058, 0.002], [0.078, -0.016], [0.068, -0.024], [0.045, -0.032], [0.02, -0.037], [0, -0.037]], uvOut, camber);
    this.wings = [];
    for (const s of [1, -1]) {
      const side = new THREE.Group();
      side.scale.x = s;                        // mirror for the right wing
      this.body.add(side);
      const shoulder = new THREE.Group();
      shoulder.position.set(0.0165, 0.0125, 0.012);
      shoulder.rotation.order = 'ZYX';
      side.add(shoulder);
      const inner = new THREE.Mesh(innerGeo, wingMat);
      shoulder.add(inner);
      const wrist = new THREE.Group();
      wrist.position.set(IN, 0, 0);
      wrist.rotation.order = 'ZYX';
      shoulder.add(wrist);
      const outer = new THREE.Mesh(outerGeo, wingMat);
      wrist.add(outer);
      // folded wing lying along the flank (shown when perched)
      const fg = new THREE.SphereGeometry(1, 14, 10);
      const folded = new THREE.Mesh(fg, feather(wingTex));
      folded.scale.set(0.0062, 0.0155, 0.036);
      folded.position.set(0.0178, 0.0045, -0.009);
      folded.rotation.set(-0.2, -0.16, -0.12);
      side.add(folded);
      this.wings.push({ shoulder, wrist, folded, inner, outer });
    }

    // ---- tail
    this.tail = new THREE.Group();
    this.tail.position.set(0, -0.002, -0.035);
    this.body.add(this.tail);
    const tailMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.6, side: THREE.DoubleSide });
    const mk = (pts, c0, c1, y) => {
      const g = flatShape(pts, () => [0, 0], () => y);
      const col = [];
      const p = g.attributes.position;
      const a = new THREE.Color(c0), b = new THREE.Color(c1), c = new THREE.Color();
      for (let i = 0; i < p.count; i++) { c.copy(a).lerp(b, Math.min(1, -p.getZ(i) / 0.09)); col.push(c.r, c.g, c.b); }
      g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
      return new THREE.Mesh(g, tailMat);
    };
    this.tailOuter = mk([[-0.0085, 0], [0.0085, 0], [0.0165, -0.03], [0.012, -0.056], [0, -0.05], [-0.012, -0.056], [-0.0165, -0.03]], 0x4fae48, 0xd9d85a, -0.0012);
    this.tailInner = mk([[-0.006, 0], [0.006, 0], [0.0085, -0.035], [0.0035, -0.098], [0, -0.104], [-0.0035, -0.098], [-0.0085, -0.035]], 0x2d6aa8, 0x16306e, 0.0);
    this.tail.add(this.tailOuter, this.tailInner);

    // ---- legs
    const legMat = plain(0xa7a3b4, { roughness: 0.6 });
    this.legs = [];
    for (const s of [1, -1]) {
      const hip = new THREE.Group();
      hip.position.set(s * 0.0085, -0.0165, 0.002);
      this.body.add(hip);
      const thigh = new THREE.Mesh(new THREE.SphereGeometry(0.0062, 8, 6), this.torso.material);
      thigh.scale.set(0.9, 1.25, 1); thigh.position.y = -0.002;
      hip.add(thigh);
      const tarsus = new THREE.Mesh(new THREE.CylinderGeometry(0.0013, 0.0015, 0.014, 6), legMat);
      tarsus.position.y = -0.012;
      hip.add(tarsus);
      const foot = new THREE.Group();
      foot.position.y = -0.019;
      hip.add(foot);
      const toe = (len, yaw) => {
        const t = new THREE.Mesh(new THREE.CylinderGeometry(0.0011, 0.0008, len, 5), legMat);
        t.rotation.x = Math.PI / 2; t.position.z = len / 2;
        const g = new THREE.Group(); g.rotation.y = yaw; g.add(t);
        foot.add(g);
        return g;
      };
      const toes = [toe(0.012, s * 0.22), toe(0.011, -s * 0.28), toe(0.008, Math.PI + s * 0.3), toe(0.0075, Math.PI - s * 0.35)];
      this.legs.push({ hip, foot, toes });
    }

    this.group.traverse((o) => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; } });

    // pose parameters, written by the controller
    this.pose = {
      pitchUp: 0.9, roll: 0, bob: 0,
      fold: 1,             // 0 = wings spread, 1 = wings folded
      flap: 0,             // wing stroke angle (radians, + is up)
      flapVel: 0,          // direction the wing is moving, -1..1
      sweep: 0,            // wings pulled back (bounding / gliding tuck)
      tailFan: 0, tailPitch: 0, tailYaw: 0,
      legs: 1,             // 0 = tucked, 1 = standing
      reach: 0,            // legs swung forward before touchdown
      crouch: 0,
      headYaw: 0, headPitch: 0, headRoll: 0,
      fluff: 0, beak: 0, blink: 0, stretch: 0, stretchSide: 1,
    };
  }

  // height of the body centre above the surface the feet stand on
  standHeight() {
    const p = this.pose;
    return (0.0165 * Math.cos(p.pitchUp) - 0.002 * Math.sin(p.pitchUp) + 0.0195 * (1 - 0.28 * p.crouch)) * BIRD_SCALE;
  }

  update() {
    const p = this.pose;
    const body = this.body;
    body.rotation.set(-p.pitchUp, 0, p.roll);
    body.position.y = p.bob / BIRD_SCALE;
    const fl = 1 + p.fluff * 0.14;
    this.torso.scale.set(fl, fl, 1 + p.fluff * 0.03);

    // head stays fairly level whatever the body does
    this.neck.rotation.set(p.pitchUp * 0.86 + p.headPitch, p.headYaw, -p.roll * 0.8 + p.headRoll);
    this.neck.position.y = 0.013 - p.fluff * 0.002 - p.crouch * 0.002;
    this.lowerBeak.rotation.x = Math.PI * 0.95 - p.beak * 0.5;
    this.lowerBeak.position.y = -0.0052 - p.beak * 0.0012;
    for (const e of this.eyes) e.lid.scale.y = 0.01 + p.blink * 1.0;

    // wings
    const spread = 1 - p.fold;
    for (let i = 0; i < 2; i++) {
      const w = this.wings[i];
      const side = i === 0 ? 1 : -1;
      const st = (p.stretch > 0 && p.stretchSide === side) ? p.stretch : 0;
      const open = Math.max(spread, st * 0.75);
      const showSpread = open > 0.04;
      w.inner.visible = w.outer.visible = showSpread;
      w.folded.visible = open < 0.55;
      const fs = THREE.MathUtils.clamp(1 - open * 1.6, 0.001, 1);
      w.folded.scale.set(0.0062 * (0.4 + 0.6 * fs) * fl, 0.0155 * fs, 0.036 * (0.6 + 0.4 * fs));
      if (!showSpread) continue;
      const fold = 1 - open;
      // stroke: shoulder flaps, the hand lags behind on the upstroke
      const lag = p.flapVel > 0 ? -0.75 * p.flapVel : -0.12 * p.flapVel;
      const flap = st > 0 ? -0.5 * st : p.flap;
      w.shoulder.rotation.set(
        st > 0 ? 0 : -p.flapVel * 0.22 * spread,           // feathering twist
        fold * 1.25 + p.sweep * 0.9 + st * 0.9,            // swept back
        flap * open - fold * 0.75,
      );
      w.wrist.rotation.set(0, fold * 1.5 + p.sweep * 1.5 + st * 0.5, lag * spread);
      const sc = 0.35 + 0.65 * open;
      w.shoulder.scale.set(sc, 1, 0.6 + 0.4 * open);
    }

    // tail
    this.tail.rotation.set(p.tailPitch, p.tailYaw, 0);
    this.tailOuter.scale.x = 1 + p.tailFan * 1.5;
    this.tailInner.scale.x = 1 + p.tailFan * 0.9;

    // legs: tucked against the belly in flight, vertical when standing
    for (let i = 0; i < 2; i++) {
      const l = this.legs[i];
      const side = i === 0 ? 1 : -1;
      const st = (p.stretch > 0 && p.stretchSide === side) ? p.stretch : 0;
      const standing = p.pitchUp - p.reach * 0.75 + st * 1.1;
      l.hip.rotation.x = THREE.MathUtils.lerp(1.45, standing, p.legs);
      l.hip.scale.y = 1 - 0.28 * p.crouch * p.legs;
      const curl = (1 - p.legs) * 0.9;
      for (let k = 0; k < 4; k++) l.toes[k].rotation.x = (k < 2 ? 1 : -1) * curl;
    }
  }
}

// Soft round shadow that sits under the bird on whatever is below it.
export function createBlobShadow() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(32, 32, 2, 32, 32, 31);
  gr.addColorStop(0, 'rgba(0,0,0,0.75)'); gr.addColorStop(0.5, 'rgba(0,0,0,0.35)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0.6, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
  m.rotation.x = -Math.PI / 2;
  m.renderOrder = 2;
  return m;
}
