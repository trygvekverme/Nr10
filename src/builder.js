// Geometry builder: collects static geometry into a few merged meshes (one per
// material) and records simple box colliders that the bird can bump into and
// perch on.
import * as THREE from 'three';

const _mat = new THREE.Matrix4();
const _local = new THREE.Matrix4();
const _nrm = new THREE.Matrix3();
const _v = new THREE.Vector3();
const _n = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _e = new THREE.Euler();
const _c = new THREE.Color();
const WHITE = new THREE.Color(1, 1, 1);

function toColor(c) {
  if (c === undefined || c === null) return WHITE;
  if (c.isColor) return c;
  return _c.set(c);
}

export class Builder {
  constructor() {
    this.batches = new Map();
    this.colliders = [];
    this.stack = [{ m: new THREE.Matrix4(), yaw: 0 }];
    this.castDefault = true;
    this.solidDefault = true;
  }

  get top() { return this.stack[this.stack.length - 1]; }

  // Enter a local frame (translation + rotation around the vertical axis).
  push(x = 0, y = 0, z = 0, yaw = 0) {
    const t = this.top;
    const m = new THREE.Matrix4().makeRotationY(yaw).setPosition(x, y, z);
    this.stack.push({ m: t.m.clone().multiply(m), yaw: t.yaw + yaw });
    return this;
  }
  pop() { this.stack.pop(); return this; }

  _batch(mat, cast, receive) {
    const key = mat.uuid + (cast ? 'c' : '-') + (receive ? 'r' : '-');
    let b = this.batches.get(key);
    if (!b) {
      b = { mat, cast, receive, pos: [], nrm: [], uv: [], col: [], idx: [] };
      this.batches.set(key, b);
    }
    return b;
  }

  // Append an arbitrary BufferGeometry (already positioned by `local`).
  addGeometry(geom, local, mat, opts = {}) {
    const cast = opts.cast ?? this.castDefault;
    const receive = opts.receive ?? true;
    const b = this._batch(mat, cast, receive);
    _mat.multiplyMatrices(this.top.m, local);
    _nrm.getNormalMatrix(_mat);
    const flip = _mat.determinant() < 0;
    const p = geom.attributes.position, n = geom.attributes.normal, uv = geom.attributes.uv;
    const gc = geom.attributes.color;
    const base = b.pos.length / 3;
    const col = toColor(opts.color);
    const cr = col.r, cg = col.g, cb = col.b;
    for (let i = 0; i < p.count; i++) {
      _v.fromBufferAttribute(p, i).applyMatrix4(_mat);
      b.pos.push(_v.x, _v.y, _v.z);
      if (n) { _n.fromBufferAttribute(n, i).applyMatrix3(_nrm).normalize(); } else _n.set(0, 1, 0);
      b.nrm.push(_n.x, _n.y, _n.z);
      if (uv) b.uv.push(uv.getX(i), uv.getY(i)); else b.uv.push(0, 0);
      if (gc) b.col.push(gc.getX(i) * cr, gc.getY(i) * cg, gc.getZ(i) * cb);
      else b.col.push(cr, cg, cb);
    }
    if (geom.index) {
      const ix = geom.index;
      for (let i = 0; i < ix.count; i += 3) {
        const a = ix.getX(i) + base, bb = ix.getX(i + 1) + base, cc = ix.getX(i + 2) + base;
        if (flip) b.idx.push(a, cc, bb); else b.idx.push(a, bb, cc);
      }
    } else {
      for (let i = 0; i < p.count; i += 3) {
        if (flip) b.idx.push(base + i, base + i + 2, base + i + 1);
        else b.idx.push(base + i, base + i + 1, base + i + 2);
      }
    }
  }

  _collider(cx, cy, cz, hx, hy, hz, yawLocal, opts) {
    _v.set(cx, cy, cz).applyMatrix4(this.top.m);
    const yaw = this.top.yaw + yawLocal;
    this.colliders.push({
      cx: _v.x, cy: _v.y, cz: _v.z, hx, hy, hz,
      cos: Math.cos(yaw), sin: Math.sin(yaw),
      perch: opts.perch ?? true,
      tag: opts.tag || null,
    });
  }

  // Axis aligned box given by its two corners (in the current frame).
  box(x0, y0, z0, x1, y1, z1, mat, opts = {}) {
    if (x1 < x0) [x0, x1] = [x1, x0];
    if (y1 < y0) [y0, y1] = [y1, y0];
    if (z1 < z0) [z0, z1] = [z1, z0];
    return this.cbox((x0 + x1) / 2, y0, (z0 + z1) / 2, x1 - x0, y1 - y0, z1 - z0, mat, opts);
  }

  // Box given by the centre of its bottom face and its size.
  // opts: color, ry (yaw), rx/rz (tilt), solid, perch, cast, uv (scale), uvFit, uvSwap
  cbox(cx, y0, cz, w, h, d, mat, opts = {}) {
    const cy = y0 + h / 2;
    const hx = w / 2, hy = h / 2, hz = d / 2;
    const s = opts.uv ?? 1;
    const fit = opts.uvFit;
    const swap = opts.uvSwap;
    const b = this._batch(mat, opts.cast ?? this.castDefault, opts.receive ?? true);
    _e.set(opts.rx || 0, opts.ry || 0, opts.rz || 0, 'YXZ');
    _q.setFromEuler(_e);
    _local.compose(_v.set(cx, cy, cz), _q, new THREE.Vector3(1, 1, 1));
    _mat.multiplyMatrices(this.top.m, _local);
    _nrm.getNormalMatrix(_mat);
    const col = toColor(opts.color);
    const cr = col.r, cg = col.g, cb = col.b;
    // faces: [normal, u axis, v axis]
    const F = [
      [1, 0, 0, 2, 1, -1], [-1, 0, 0, 2, 1, 1],
      [0, 1, 0, 0, 2, 1], [0, -1, 0, 0, 2, -1],
      [0, 0, 1, 0, 1, 1], [0, 0, -1, 0, 1, -1],
    ];
    const half = [hx, hy, hz];
    const ctr = [cx, cy, cz];
    for (let f = 0; f < 6; f++) {
      const [nx, ny, nz, ua, va, us] = F[f];
      const na = nx ? 0 : ny ? 1 : 2;
      const ns = nx + ny + nz;
      const base = b.pos.length / 3;
      for (let k = 0; k < 4; k++) {
        const su = (k === 1 || k === 2) ? 1 : -1;
        const sv = (k >= 2) ? 1 : -1;
        const pt = [0, 0, 0];
        pt[na] = ns * half[na];
        pt[ua] = su * us * half[ua];
        pt[va] = sv * half[va];
        _v.set(pt[0], pt[1], pt[2]).applyMatrix4(_mat);
        b.pos.push(_v.x, _v.y, _v.z);
        _n.set(nx, ny, nz).applyMatrix3(_nrm).normalize();
        b.nrm.push(_n.x, _n.y, _n.z);
        let u, v;
        if (fit) {
          u = (su + 1) / 2 * (fit[0] ?? 1); v = (sv + 1) / 2 * (fit[1] ?? 1);
        } else {
          u = (ctr[ua] + su * us * half[ua]) * s;
          v = (ctr[va] + sv * half[va]) * s;
        }
        if (swap) b.uv.push(v, u); else b.uv.push(u, v);
        b.col.push(cr, cg, cb);
      }
      // winding: make sure triangles face along the normal
      const cross = this._faceSign(na, ua, va) * ns * us;
      if (cross > 0) b.idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
      else b.idx.push(base, base + 2, base + 1, base, base + 3, base + 2);
    }
    const solid = opts.solid ?? (this.solidDefault && !opts.rx && !opts.rz);
    if (solid) this._collider(cx, cy, cz, hx, hy, hz, opts.ry || 0, opts);
    return this;
  }

  _faceSign(na, ua, va) {
    // sign of (u x v) . n for unit axes
    const perm = `${ua}${va}${na}`;
    return (perm === '012' || perm === '120' || perm === '201') ? 1 : -1;
  }

  // Vertical cylinder standing on (cx, y0, cz).
  cyl(cx, y0, cz, r, h, mat, opts = {}) {
    const rTop = opts.rTop ?? r;
    const seg = opts.seg ?? 14;
    const g = new THREE.CylinderGeometry(rTop, r, h, seg, 1, opts.open || false);
    _e.set(opts.rx || 0, opts.ry || 0, opts.rz || 0, 'YXZ');
    _q.setFromEuler(_e);
    _local.compose(new THREE.Vector3(cx, y0 + h / 2, cz), _q, new THREE.Vector3(1, 1, 1));
    this.addGeometry(g, _local.clone(), mat, opts);
    g.dispose();
    const solid = opts.solid ?? (this.solidDefault && !opts.rx && !opts.rz);
    if (solid) {
      const rr = Math.max(r, rTop) * 0.8;
      this._collider(cx, y0 + h / 2, cz, rr, h / 2, rr, 0, opts);
    }
    return this;
  }

  // Sphere / ellipsoid centred on (cx, cy, cz).
  sph(cx, cy, cz, r, mat, opts = {}) {
    const sc = opts.scale || [1, 1, 1];
    const g = new THREE.SphereGeometry(r, opts.seg ?? 14, opts.rings ?? 10);
    _e.set(opts.rx || 0, opts.ry || 0, opts.rz || 0, 'YXZ');
    _q.setFromEuler(_e);
    _local.compose(new THREE.Vector3(cx, cy, cz), _q, new THREE.Vector3(sc[0], sc[1], sc[2]));
    this.addGeometry(g, _local.clone(), mat, opts);
    g.dispose();
    const solid = opts.solid ?? (this.solidDefault && !opts.rx && !opts.rz);
    if (solid) this._collider(cx, cy, cz, r * sc[0] * 0.75, r * sc[1] * 0.9, r * sc[2] * 0.75, 0, opts);
    return this;
  }

  // Any geometry with position / rotation / scale. No collider unless opts.hit = [hx,hy,hz].
  geo(g, t, mat, opts = {}) {
    const p = t.pos || [0, 0, 0], r = t.rot || [0, 0, 0], s = t.scale || [1, 1, 1];
    _e.set(r[0], r[1], r[2], 'YXZ');
    _q.setFromEuler(_e);
    _local.compose(new THREE.Vector3(p[0], p[1], p[2]), _q,
      new THREE.Vector3(...(typeof s === 'number' ? [s, s, s] : s)));
    this.addGeometry(g, _local.clone(), mat, opts);
    if (opts.hit) this._collider(p[0], p[1], p[2], opts.hit[0], opts.hit[1], opts.hit[2], r[1], opts);
    return this;
  }

  // Flat textured rectangle. `facing`: 'up' or a yaw angle for vertical quads.
  quad(cx, cy, cz, w, h, mat, opts = {}) {
    const g = new THREE.PlaneGeometry(w, h);
    const rot = opts.up ? [-Math.PI / 2, opts.ry || 0, 0] : [opts.rx || 0, opts.ry || 0, opts.rz || 0];
    if (opts.uvRect) {
      const [u0, v0, u1, v1] = opts.uvRect;
      const uv = g.attributes.uv;
      for (let i = 0; i < uv.count; i++) {
        uv.setXY(i, u0 + uv.getX(i) * (u1 - u0), v0 + uv.getY(i) * (v1 - v0));
      }
    }
    this.geo(g, { pos: [cx, cy, cz], rot }, mat, { cast: false, ...opts });
    g.dispose();
    return this;
  }

  // Invisible collider only.
  hit(x0, y0, z0, x1, y1, z1, opts = {}) {
    this._collider((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2,
      Math.abs(x1 - x0) / 2, Math.abs(y1 - y0) / 2, Math.abs(z1 - z0) / 2, 0, opts);
    return this;
  }

  // Turn everything collected so far into meshes.
  build(parent) {
    const meshes = [];
    for (const b of this.batches.values()) {
      if (!b.pos.length) continue;
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(b.pos, 3));
      g.setAttribute('normal', new THREE.Float32BufferAttribute(b.nrm, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(b.uv, 2));
      g.setAttribute('color', new THREE.Float32BufferAttribute(b.col, 3));
      g.setIndex(b.pos.length / 3 > 65535 ? new THREE.Uint32BufferAttribute(b.idx, 1)
        : new THREE.Uint16BufferAttribute(b.idx, 1));
      g.computeBoundingSphere();
      const mesh = new THREE.Mesh(g, b.mat);
      mesh.castShadow = b.cast;
      mesh.receiveShadow = b.receive;
      mesh.matrixAutoUpdate = false;
      parent.add(mesh);
      meshes.push(mesh);
    }
    this.batches.clear();
    return meshes;
  }
}
