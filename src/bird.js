// Flight, landing, perching and idle behaviour of the budgie.
import * as THREE from 'three';
import { Budgie, createBlobShadow } from './budgie.js';

const R_BODY = 0.05;            // collision radius in flight (metres)
const MAX_SPEED = 3.3;
const TAU = Math.PI * 2;
const { lerp, clamp, smoothstep } = THREE.MathUtils;
const damp = (a, b, lambda, dt) => a + (b - a) * (1 - Math.exp(-lambda * dt));
const rand = (a, b) => a + Math.random() * (b - a);

export class Bird {
  constructor(scene, world, audio) {
    this.world = world;
    this.audio = audio;
    this.model = new Budgie();
    scene.add(this.model.group);
    this.shadow = createBlobShadow();
    scene.add(this.shadow);

    this.pos = new THREE.Vector3();
    this.yaw = 0;
    this.yawRate = 0;
    this.speed = 0;
    this.vy = 0;
    this.mode = 'perch';
    this.time = 0;
    this.flapPhase = 0;
    this.flapCount = 0;
    this.tuck = 0;
    this.boundT = 0;
    this.airTime = 0;
    this.perchT = 10;
    this.ground = { y: 0, x: 0, z: 0, box: null };
    this.hop = null;
    this.edgeT = 0;
    this.takeoff = -1;
    this.landBlend = 1;
    this.landFrom = new THREE.Vector3();
    this.landTo = new THREE.Vector3();
    this.idleT = 0;
    this.look = { yaw: 0, pitch: 0, roll: 0, timer: 1 };
    this.act = null;
    this.actTimer = rand(4, 8);
    this.blinkT = rand(1, 3);
    this.blink = 0;
    this.chirpQueued = false;
    this._g = {};
    this._t = new THREE.Vector3();
  }

  // Put the bird down on whatever is below the given point.
  placeAt(x, y, z, yaw) {
    const g = this.world.below(x, y, z, 5, 0.05, this._g);
    this.yaw = yaw;
    this.mode = 'perch';
    this.model.pose.fold = 1; this.model.pose.legs = 1; this.model.pose.pitchUp = 0.9;
    if (g) { this.ground = { ...g }; this.pos.set(g.x, g.y + this.model.standHeight(), g.z); }
    else this.pos.set(x, y, z);
    this.landBlend = 1;
    this.perchT = 10;
  }

  get flying() { return this.mode === 'fly'; }
  get speedFrac() { return clamp(this.speed / MAX_SPEED, 0, 1); }

  update(dt, inp) {
    this.time += dt;
    if (inp.chirp) this.startAct('chirp');
    if (this.mode === 'fly') this.updateFly(dt, inp); else this.updatePerch(dt, inp);
    this.updateFace(dt);
    const m = this.model;
    m.group.position.copy(this.pos);
    m.group.rotation.y = this.yaw;
    m.update();
    this.updateShadow();
  }

  // ------------------------------------------------------------- flying
  updateFly(dt, inp) {
    const p = this.model.pose;
    this.airTime += dt;
    this.yawRate = damp(this.yawRate, -inp.x * 2.5, 8, dt);
    this.yaw += this.yawRate * dt;

    const target = inp.y > 0 ? inp.y * MAX_SPEED : inp.y * 0.55;
    this.speed = damp(this.speed, target, target > this.speed ? 2.0 : 2.8, dt);
    const sp = this.speedFrac;

    // climb / descend, plus the gentle flap-and-bound of a budgie at speed
    let vyT = inp.v > 0 ? inp.v * 1.7 : inp.v * 1.9;
    const cruise = clamp((this.speed - 1.5) / 1.4, 0, 1);
    this.boundT += dt;
    const ph = (this.boundT % 0.8) / 0.8;
    const wantTuck = cruise > 0.35 && ph > 0.74 && inp.v === 0 && Math.abs(this.yawRate) < 1.0;
    this.tuck = damp(this.tuck, wantTuck ? 1 : 0, 24, dt);
    vyT += cruise * (wantTuck ? -0.45 : 0.16);
    this.vy = damp(this.vy, vyT, 7, dt);

    const fx = Math.sin(this.yaw), fz = Math.cos(this.yaw);
    const ox = this.pos.x, oz = this.pos.z;
    this.pos.x += fx * this.speed * dt;
    this.pos.z += fz * this.speed * dt;
    this.pos.y += this.vy * dt;
    const flags = this.world.resolve(this.pos, R_BODY);
    if (flags & 8) {
      const wanted = Math.abs(this.speed) * dt;
      if (wanted > 1e-5) {
        const got = Math.hypot(this.pos.x - ox, this.pos.z - oz);
        const k = clamp(got / wanted, 0, 1);
        this.speed *= lerp(1 - Math.min(1, dt * 6), 1, k);       // bleed speed when blocked
      }
    }
    if ((flags & 4) && this.vy > 0) this.vy *= 0.5;

    // --- landing
    const descending = inp.v < -0.2 || this.vy < -0.3;
    let nearGround = false;
    if (this.airTime > 0.3) {
      const g = this.world.below(this.pos.x, this.pos.y - 0.01, this.pos.z, 0.34, 0.07, this._g);
      if (g) {
        const h = this.pos.y - g.y;
        nearGround = descending && h < 0.34;
        if (descending && h < 0.125 && Math.abs(this.speed) < 2.6 && this.roomAt(g)) { this.land(g); return; }
      }
    }

    // --- pose
    const hoverPitch = 0.72;
    const pitchT = lerp(hoverPitch, 0.07, smoothstep(sp, 0, 0.8)) + clamp(this.vy * 0.2, -0.28, 0.36) + (nearGround ? 0.25 : 0);
    p.pitchUp = damp(p.pitchUp, pitchT, 8, dt);
    p.roll = damp(p.roll, clamp(-this.yawRate * (0.15 + 0.2 * sp), -0.75, 0.75), 8, dt);
    p.fold = damp(p.fold, 0, 22, dt);
    p.crouch = damp(p.crouch, 0, 15, dt);

    const boost = this.airTime < 0.35 ? 1 : 0;
    const effort = clamp(0.55 + this.vy * 0.28 + (1 - sp) * 0.3 + boost * 0.4 + (nearGround ? 0.25 : 0), 0.3, 1.3);
    const freq = lerp(14.5, 10.5, sp) + Math.max(0, this.vy) * 0.9 + boost * 2;
    this.flapPhase += dt * freq * TAU * (1 - this.tuck);
    const s = Math.sin(this.flapPhase);
    const amp = lerp(1.02, 0.76, sp) * (0.8 + 0.3 * effort);
    p.flap = (s * amp + 0.16) * (1 - this.tuck) - this.tuck * 0.25;
    p.flapVel = Math.cos(this.flapPhase) * (1 - this.tuck);
    p.sweep = this.tuck * 0.9;
    p.bob = -s * 0.0035 * (1 - sp * 0.5) * (1 - this.tuck);
    const n = Math.floor((this.flapPhase - Math.PI / 2) / TAU);
    if (n !== this.flapCount) { this.flapCount = n; this.audio?.flap(0.35 + 0.5 * effort, sp); }

    const braking = clamp((this.speed - target) / 2, 0, 1);
    p.tailFan = damp(p.tailFan, clamp((1 - sp) * 0.75 + Math.abs(this.yawRate) * 0.14 + braking * 0.6 + (nearGround ? 0.5 : 0), 0, 1.2), 8, dt);
    p.tailPitch = damp(p.tailPitch, lerp(-0.35, 0.03, sp) - braking * 0.25 + this.tuck * 0.05, 8, dt);
    p.tailYaw = damp(p.tailYaw, clamp(-this.yawRate * 0.12, -0.4, 0.4), 8, dt);
    p.legs = damp(p.legs, nearGround ? 1 : 0, nearGround ? 16 : 7, dt);
    p.reach = damp(p.reach, nearGround ? 1 : 0, 14, dt);
    p.stretch = 0;
    // head: look into the turn, slightly down when descending
    p.headYaw = damp(p.headYaw, clamp(this.yawRate * 0.22, -0.6, 0.6), 7, dt);
    p.headPitch = damp(p.headPitch, clamp(-this.vy * 0.12, -0.25, 0.3), 6, dt);
    p.headRoll = damp(p.headRoll, 0, 6, dt);
    p.fluff = damp(p.fluff, 0, 8, dt);
  }

  // Is there actually space for a bird on that spot (not hidden inside something)?
  roomAt(g) {
    const t = this._t.set(g.x, g.y + 0.045, g.z);
    this.world.resolve(t, 0.03);
    return Math.hypot(t.x - g.x, t.z - g.z) < 0.012 && Math.abs(t.y - g.y - 0.045) < 0.02;
  }

  land(g) {
    this.mode = 'perch';
    this.ground = { y: g.y, x: g.x, z: g.z, box: g.box };
    this.landFrom.copy(this.pos);
    this.landBlend = 0;
    this.landSpeed = this.speed;
    this.speed = 0; this.vy = 0; this.yawRate = 0;
    this.perchT = 0;
    this.hop = null;
    this.takeoff = -1;
    this.edgeT = 0;
    this.idleT = 0;
    this.act = null;
    this.actTimer = rand(2.5, 5);
    this.settle = 0.9;                    // little tail wag once the feet are down
    this.audio?.land();
  }

  startTakeoff(forward = 0.3, up = 1.9) {
    this.takeoff = 0;
    this.takeoffFwd = forward;
    this.takeoffUp = up;
    this.act = null;
  }

  liftOff() {
    this.mode = 'fly';
    this.takeoff = -1;
    this.hop = null;
    this.airTime = 0;
    this.vy = this.takeoffUp;
    this.speed = this.takeoffFwd;
    this.boundT = 0;
    this.pos.y += 0.012;
    this.audio?.flutter();
  }

  // ----------------------------------------------------------- perching
  updatePerch(dt, inp) {
    const p = this.model.pose;
    const m = this.model;
    this.perchT += dt;
    const moving = Math.abs(inp.x) > 0.15 || Math.abs(inp.y) > 0.2;
    this.idleT = moving || inp.v !== 0 ? 0 : this.idleT + dt;

    // touch down: glide the last few centimetres onto the perch
    if (this.landBlend < 1) {
      this.landBlend = Math.min(1, this.landBlend + dt / 0.16);
      const e = 1 - Math.pow(1 - this.landBlend, 2);
      this.landTo.set(this.ground.x, this.ground.y + m.standHeight(), this.ground.z);
      this.pos.lerpVectors(this.landFrom, this.landTo, e);
      // wings keep beating while braking
      this.flapPhase += dt * 16 * TAU;
      p.flap = Math.sin(this.flapPhase) * 0.95 + 0.25;
      p.flapVel = Math.cos(this.flapPhase);
      p.sweep = 0;
      p.fold = damp(p.fold, 0.15, 10, dt);
      p.pitchUp = damp(p.pitchUp, 1.05, 14, dt);
      p.tailFan = damp(p.tailFan, 1.1, 14, dt);
      p.legs = damp(p.legs, 1, 20, dt);
      p.reach = damp(p.reach, 0.6 * (1 - e), 14, dt);
      p.crouch = damp(p.crouch, e > 0.8 ? 0.8 : 0, 20, dt);
      return;
    }

    // turning on the spot with quick little shuffles
    if (!this.hop && this.takeoff < 0) {
      this.yawRate = damp(this.yawRate, -inp.x * 3.2, 14, dt);
      this.yaw += this.yawRate * dt;
    }
    const fx = Math.sin(this.yaw), fz = Math.cos(this.yaw);
    const shuffle = Math.abs(this.yawRate) > 0.4 && !this.hop ? Math.abs(Math.sin(this.time * 21)) : 0;

    // --- take off
    if (this.takeoff >= 0) {
      this.takeoff += dt;
      p.crouch = damp(p.crouch, 1, 30, dt);
      p.pitchUp = damp(p.pitchUp, 0.6, 20, dt);
      p.fold = damp(p.fold, 0.2, 26, dt);
      p.flap = 0.9; p.flapVel = 0;
      this.pos.y = this.ground.y + m.standHeight();
      if (this.takeoff > 0.085) this.liftOff();
      return;
    }
    if (inp.v > 0.2 && this.perchT > 0.2 && !this.hop) { this.startTakeoff(Math.max(0.25, inp.y * 1.4), 1.9); return; }

    // --- hopping
    if (this.hop) {
      const h = this.hop;
      h.t += dt / h.dur;
      const t = Math.min(1, h.t);
      this.pos.lerpVectors(h.from, h.to, t);
      this.pos.y += Math.sin(t * Math.PI) * h.height;
      p.fold = damp(p.fold, 0.88, 30, dt);
      p.flap = 0.35; p.flapVel = 0; p.sweep = 0.3;
      p.pitchUp = damp(p.pitchUp, 0.62, 18, dt);
      p.crouch = t < 0.15 || t > 0.85 ? 0.6 : 0;
      p.tailPitch = damp(p.tailPitch, -0.1 + Math.sin(t * Math.PI) * 0.2, 20, dt);
      if (h.t >= 1) {
        this.ground = h.ground;
        this.hop = null;
        this.hopRest = 0.045;
        this.audio?.tap(0.5);
      }
    } else {
      this.hopRest = Math.max(0, (this.hopRest || 0) - dt);
      if (Math.abs(inp.y) > 0.25 && this.hopRest <= 0 && this.perchT > 0.25) {
        const dir = inp.y > 0 ? 1 : -1;
        const len = dir > 0 ? lerp(0.05, 0.1, clamp(inp.y, 0, 1)) : 0.04;
        if (!this.tryHop(fx * len * dir, fz * len * dir)) {
          this.edgeT += dt;
          // keep pushing against an edge and the bird flutters off it
          if (dir > 0 && inp.y > 0.55 && this.edgeT > 0.28) { this.startTakeoff(1.3, 0.5); return; }
        } else this.edgeT = 0;
      } else if (Math.abs(inp.y) <= 0.25) this.edgeT = 0;
      this.pos.y = damp(this.pos.y, this.ground.y + m.standHeight(), 30, dt);
    }

    // --- resting pose
    if (!this.hop) {
      const alert = moving ? 1 : 0;
      p.pitchUp = damp(p.pitchUp, 0.95 - alert * 0.18, 9, dt);
      p.fold = damp(p.fold, 1, 16, dt);
      if (p.fold < 0.9) { this.flapPhase += dt * 16 * TAU; p.flap = Math.sin(this.flapPhase) * 0.8; p.flapVel = Math.cos(this.flapPhase); }
      p.crouch = damp(p.crouch, 0, 14, dt);
      p.sweep = damp(p.sweep, 0, 10, dt);
      p.tailPitch = damp(p.tailPitch, -0.12, 8, dt);
    }
    p.roll = damp(p.roll, 0, 12, dt);
    p.legs = damp(p.legs, 1, 20, dt);
    p.reach = damp(p.reach, 0, 14, dt);
    p.tailFan = damp(p.tailFan, 0, 7, dt);
    p.bob = shuffle * 0.003 + Math.sin(this.time * 2.3) * 0.0004;       // breathing
    let tailYawT = 0;
    if (this.settle > 0) { this.settle -= dt; if (this.settle < 0.6) tailYawT = Math.sin(this.time * 34) * 0.32 * (this.settle / 0.6); }
    p.tailYaw = damp(p.tailYaw, tailYawT, 30, dt);

    this.updateIdle(dt, inp, moving);
  }

  tryHop(dx, dz) {
    const m = this.model;
    const tx = this.pos.x + dx, tz = this.pos.z + dz;
    const g = this.world.below(tx, this.ground.y + 0.085, tz, 0.27, 0, this._g);
    if (!g) return false;
    // is there room for the bird at the destination?
    const t = this._t.set(tx, g.y + m.standHeight() + 0.01, tz);
    const before = t.x + t.z;
    const hx = t.x, hz = t.z;
    this.world.resolve(t, 0.032);
    if (Math.hypot(t.x - hx, t.z - hz) > 0.008 || before !== before) return false;
    this.hop = {
      t: 0, dur: 0.15 + Math.abs(g.y - this.ground.y) * 0.5, height: 0.02 + Math.max(0, g.y - this.ground.y) * 0.6,
      from: this.pos.clone(), to: new THREE.Vector3(tx, g.y + m.standHeight(), tz),
      ground: { y: g.y, x: tx, z: tz, box: g.box },
    };
    return true;
  }

  // ----------------------------------------------- idle life while perched
  startAct(type) {
    if (type === 'chirp') { this.audio?.chirp(); }
    if (this.mode !== 'perch' && type !== 'chirp') return;
    const dur = { preen: 2.6, fluff: 1.8, stretch: 2.2, chirp: 0.9, tilt: 1.4, wag: 0.5 }[type] || 1;
    this.act = { type, t: 0, dur, side: Math.random() < 0.5 ? 1 : -1 };
  }

  updateIdle(dt, inp, moving) {
    const p = this.model.pose;
    const lk = this.look;
    let hy = 0, hp = 0, hr = 0, fluff = 0, stretch = 0, quick = 26;

    if (moving) {
      // attentive: look where we are turning
      hy = clamp(-inp.x * 0.5, -0.6, 0.6);
      if (this.act && this.act.type !== 'chirp') this.act = null;
      lk.timer = 0.3;
    } else {
      // quick saccades, the way small birds look around
      lk.timer -= dt;
      if (lk.timer <= 0) {
        lk.timer = Math.random() < 0.3 ? rand(0.15, 0.4) : rand(0.6, 2.4);
        lk.yaw = rand(-1.15, 1.15);
        lk.pitch = rand(-0.3, 0.35);
        lk.roll = Math.random() < 0.3 ? rand(-0.45, 0.45) : rand(-0.08, 0.08);
      }
      hy = lk.yaw; hp = lk.pitch; hr = lk.roll;
      this.actTimer -= dt;
      if (!this.act && this.actTimer <= 0 && this.idleT > 1.5) {
        this.actTimer = rand(4.5, 10);
        const r = Math.random();
        this.startAct(r < 0.3 ? 'preen' : r < 0.5 ? 'fluff' : r < 0.65 ? 'stretch' : r < 0.85 ? 'chirp' : 'tilt');
      }
    }

    const a = this.act;
    if (a) {
      a.t += dt;
      const t = a.t / a.dur;
      const env = Math.sin(Math.min(1, t) * Math.PI);                  // 0 -> 1 -> 0
      const hold = smoothstep(t, 0, 0.2) * (1 - smoothstep(t, 0.8, 1));
      if (a.type === 'preen') {
        hy = a.side * 2.35 * hold; hp = 0.55 * hold + Math.sin(a.t * 24) * 0.1 * hold; hr = a.side * 0.2 * hold;
        stretch = 0.12 * hold; p.stretchSide = a.side; quick = 12;
      } else if (a.type === 'fluff') {
        fluff = hold;
        if (t > 0.45 && t < 0.85) { p.roll += Math.sin(a.t * 46) * 0.05; p.tailYaw += Math.sin(a.t * 46) * 0.2; hr = Math.sin(a.t * 46) * 0.12; }
      } else if (a.type === 'stretch') {
        stretch = hold; p.stretchSide = a.side; hp = 0.15 * hold; hy = -a.side * 0.3 * hold; quick = 8;
      } else if (a.type === 'chirp') {
        hp = -0.3 * env - Math.abs(Math.sin(a.t * 17)) * 0.12; hy = p.headYaw; quick = 30;
        p.beak = 0.5 + 0.5 * Math.sin(a.t * 38);
      } else if (a.type === 'tilt') {
        hr = a.side * 0.5 * hold; hy = a.side * -0.5 * hold; hp = -0.1 * hold;
      }
      if (a.t >= a.dur) { this.act = null; p.beak = 0; }
    } else {
      p.beak = damp(p.beak, 0, 20, dt);
    }
    p.headYaw = damp(p.headYaw, hy, quick, dt);
    p.headPitch = damp(p.headPitch, hp, quick, dt);
    p.headRoll = damp(p.headRoll, hr, quick, dt);
    p.fluff = damp(p.fluff, fluff, 6, dt);
    p.stretch = damp(p.stretch, stretch, 7, dt);
    if (p.stretch < 0.01 && stretch === 0) p.stretch = 0;
  }

  updateFace(dt) {
    const p = this.model.pose;
    this.blinkT -= dt;
    if (this.blinkT <= 0) { this.blinkT = rand(1.5, 5); this.blink = 0.14; }
    if (this.blink > 0) { this.blink -= dt; p.blink = Math.sin(clamp(this.blink / 0.14, 0, 1) * Math.PI); } else p.blink = 0;
    if (this.mode === 'fly') {
      if (this.act && this.act.type === 'chirp') {
        this.act.t += dt;
        p.beak = 0.5 + 0.5 * Math.sin(this.act.t * 38);
        if (this.act.t > this.act.dur) { this.act = null; p.beak = 0; }
      } else p.beak = damp(p.beak, 0, 20, dt);
    }
  }

  updateShadow() {
    const g = this.world.below(this.pos.x, this.pos.y, this.pos.z, 8, 0, this._g);
    if (!g) { this.shadow.visible = false; return; }
    const h = Math.max(0, this.pos.y - g.y - 0.03);
    this.shadow.visible = true;
    this.shadow.position.set(this.pos.x, g.y + 0.004, this.pos.z);
    const s = 0.1 + h * 0.1;
    this.shadow.scale.set(s, s, 1);
    this.shadow.material.opacity = clamp(0.62 - h * 0.22, 0.14, 0.62);
  }
}
