// Very small collision world: yaw-rotated boxes, a sphere that is pushed out
// of them, and queries for "what is underneath me" used for perching.
import { LVL, LOFT, loftCeiling } from './house.js';

export class CollisionWorld {
  constructor(colliders) {
    this.c = colliders;
    for (const b of colliders) {
      b.top = b.cy + b.hy;
      b.rad = Math.hypot(b.hx, b.hz);     // horizontal bounding radius
    }
    this._push = { x: 0, y: 0, z: 0 };
  }

  // Push a sphere out of everything it overlaps. Mutates `p`. Returns a bit
  // mask: 1 = touched something, 2 = pushed up (standing on), 4 = pushed down (ceiling), 8 = pushed sideways
  resolve(p, r) {
    let flags = 0;
    for (let iter = 0; iter < 2; iter++) {
      let any = false;
      for (let i = 0; i < this.c.length; i++) {
        const b = this.c[i];
        const dy = p.y - b.cy;
        if (dy > b.hy + r || dy < -b.hy - r) continue;
        const wx = p.x - b.cx, wz = p.z - b.cz;
        if (Math.abs(wx) > b.rad + r || Math.abs(wz) > b.rad + r) continue;
        // into the box's own frame
        const lx = wx * b.cos - wz * b.sin, lz = wx * b.sin + wz * b.cos;
        const qx = Math.max(-b.hx, Math.min(b.hx, lx));
        const qy = Math.max(-b.hy, Math.min(b.hy, dy));
        const qz = Math.max(-b.hz, Math.min(b.hz, lz));
        let nx = lx - qx, ny = dy - qy, nz = lz - qz;
        const d2 = nx * nx + ny * ny + nz * nz;
        if (d2 > r * r) continue;
        let push;
        if (d2 > 1e-12) {
          const d = Math.sqrt(d2);
          push = r - d; nx /= d; ny /= d; nz /= d;
        } else {
          // centre is inside the box: leave through the nearest face
          const px = b.hx - Math.abs(lx), py = b.hy - Math.abs(dy), pz = b.hz - Math.abs(lz);
          nx = ny = nz = 0;
          if (py <= px && py <= pz) { ny = dy >= 0 ? 1 : -1; push = py + r; }
          else if (px <= pz) { nx = lx >= 0 ? 1 : -1; push = px + r; }
          else { nz = lz >= 0 ? 1 : -1; push = pz + r; }
        }
        // back to world
        p.x += (nx * b.cos + nz * b.sin) * push;
        p.z += (-nx * b.sin + nz * b.cos) * push;
        p.y += ny * push;
        flags |= 1;
        if (ny > 0.6) flags |= 2; else if (ny < -0.6) flags |= 4; else flags |= 8;
        any = true;
      }
      if (!any) break;
    }
    // sloping loft ceiling
    if (p.y > LVL.LF && p.z > LOFT.z0 - 0.2 && p.z < LOFT.z1 && p.x > LOFT.x0 - 0.2) {
      const top = loftCeiling(Math.max(LOFT.z0, p.z)) - r * 1.25;
      if (p.y > top) { p.y = top; flags |= 5; }
    }
    return flags;
  }

  inside(x, y, z, m = 0) {
    for (let i = 0; i < this.c.length; i++) {
      const b = this.c[i];
      const dy = y - b.cy;
      if (dy > b.hy + m || dy < -b.hy - m) continue;
      const wx = x - b.cx, wz = z - b.cz;
      if (Math.abs(wx) > b.rad + m || Math.abs(wz) > b.rad + m) continue;
      const lx = wx * b.cos - wz * b.sin, lz = wx * b.sin + wz * b.cos;
      if (Math.abs(lx) <= b.hx + m && Math.abs(lz) <= b.hz + m) return true;
    }
    if (y > LVL.LF && z > LOFT.z0 - 0.2 && z < LOFT.z1 && x > LOFT.x0 - 0.2 && y > loftCeiling(Math.max(LOFT.z0, z)) - m) return true;
    return false;
  }

  // Highest surface below (x, y, z). `reach` lets the point be slightly
  // outside the top face (for thin perches); the result then carries the
  // nearest point on that face.
  below(x, y, z, maxDrop = 100, reach = 0, out = {}) {
    let best = null, bestTop = -Infinity, bx = x, bz = z;
    for (let i = 0; i < this.c.length; i++) {
      const b = this.c[i];
      if (!b.perch) continue;
      const top = b.top;
      if (top > y + 0.012 || top < y - maxDrop || top <= bestTop) continue;
      const wx = x - b.cx, wz = z - b.cz;
      if (Math.abs(wx) > b.rad + reach || Math.abs(wz) > b.rad + reach) continue;
      const lx = wx * b.cos - wz * b.sin, lz = wx * b.sin + wz * b.cos;
      const ox = Math.abs(lx) - b.hx, oz = Math.abs(lz) - b.hz;
      if (ox > reach || oz > reach) continue;
      // nearest point on the face, kept a little away from the edge when there is room
      const mx = Math.min(0.018, b.hx * 0.6), mz = Math.min(0.018, b.hz * 0.6);
      const qx = Math.max(-b.hx + mx, Math.min(b.hx - mx, lx));
      const qz = Math.max(-b.hz + mz, Math.min(b.hz - mz, lz));
      best = b; bestTop = top;
      if (ox > -mx || oz > -mz) {
        bx = b.cx + qx * b.cos + qz * b.sin;
        bz = b.cz - qx * b.sin + qz * b.cos;
      } else { bx = x; bz = z; }
    }
    if (!best) return null;
    out.y = bestTop; out.x = bx; out.z = bz; out.box = best;
    return out;
  }
}
