// Third-person camera that trails behind the budgie and never goes through walls.
import * as THREE from 'three';

const { clamp, lerp } = THREE.MathUtils;
const damp = (a, b, lambda, dt) => a + (b - a) * (1 - Math.exp(-lambda * dt));
const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));

export class ChaseCamera {
  constructor(camera, world) {
    this.camera = camera;
    this.world = world;
    this.baseYaw = 0;
    this.yawOff = 0;
    this.pitch = 0.3;
    this.zoom = 1;
    this.dist = 0.8;
    this.idle = 10;
    this.target = new THREE.Vector3();
    this.lookAt = new THREE.Vector3();
    this.first = true;
  }

  snap(bird) { this.baseYaw = bird.yaw; this.yawOff = 0; this.first = true; }

  update(dt, bird, inp) {
    const flying = bird.flying;
    if (inp.lookX || inp.lookY || inp.looking) this.idle = 0; else this.idle += dt;
    this.yawOff = wrap(this.yawOff - inp.lookX);
    this.pitch = clamp(this.pitch + inp.lookY, -0.6, 1.3);
    this.zoom = clamp(this.zoom + inp.zoom, 0.6, 2.2);

    // while flying the view drifts back behind the bird
    const steering = Math.abs(inp.x) > 0.1 || Math.abs(inp.y) > 0.1;
    if (this.idle > 0.8 && (flying || steering)) {
      this.yawOff = damp(this.yawOff, 0, flying ? 2.6 : 1.2, dt);
      if (flying) this.pitch = damp(this.pitch, 0.26 - clamp(bird.vy, -1.5, 1.5) * 0.12, 1.2, dt);
    }
    this.baseYaw += wrap(bird.yaw - this.baseYaw) * (1 - Math.exp(-(flying ? 5.5 : 3.5) * dt));
    const yaw = this.baseYaw + this.yawOff;

    const want = (flying ? lerp(0.56, 0.78, bird.speedFrac) : 0.44) * this.zoom;
    const t = this.target;
    if (this.first) t.copy(bird.pos); else t.lerp(bird.pos, 1 - Math.exp(-22 * dt));
    const ty = t.y + 0.045;
    const cp = Math.cos(this.pitch), sp = Math.sin(this.pitch);
    const dx = -Math.sin(yaw) * cp, dy = sp, dz = -Math.cos(yaw) * cp;

    // march outwards from the bird until something is in the way
    let d = want;
    const steps = 16;
    for (let i = 1; i <= steps; i++) {
      const s = (i / steps) * want;
      if (this.world.inside(t.x + dx * s, ty + dy * s, t.z + dz * s, 0.045)) { d = Math.max(0.1, s - want / steps * 1.2); break; }
    }
    this.dist = this.first ? d : (d < this.dist ? damp(this.dist, d, 28, dt) : damp(this.dist, d, 3.5, dt));
    this.first = false;

    this.camera.position.set(t.x + dx * this.dist, ty + dy * this.dist, t.z + dz * this.dist);
    const ahead = flying ? 0.18 * bird.speedFrac : 0;
    this.lookAt.set(t.x + Math.sin(bird.yaw) * ahead, ty + 0.01, t.z + Math.cos(bird.yaw) * ahead);
    this.camera.lookAt(this.lookAt);
  }
}
