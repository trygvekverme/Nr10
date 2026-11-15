// Keyboard + mouse on desktop, virtual stick + buttons on touch screens.
// Everything ends up in the same small state object:
//   x  : turn        (-1 left .. 1 right)
//   y  : fly forward (-1 back .. 1 forward)
//   v  : climb       (-1 down .. 1 up)
//   lookX / lookY : camera orbit deltas (radians) since the last frame
export class Input {
  constructor(root) {
    this.keys = new Set();
    this.stick = { id: null, ox: 0, oy: 0, x: 0, y: 0 };
    this.lookId = null;
    this.lookLast = [0, 0];
    this.lookX = 0; this.lookY = 0; this.zoom = 0;
    this.btn = { up: false, down: false };
    this.chirp = false;
    this.touch = false;
    this.onTouchMode = null;
    this.enabled = false;

    const el = (id) => root.querySelector(id);
    this.elStick = el('#stick'); this.elKnob = el('#knob');
    const surface = el('#surface');

    addEventListener('keydown', (e) => {
      if (e.repeat) return;
      this.keys.add(e.code);
      if (e.code === 'KeyE') this.chirp = true;
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
    });
    addEventListener('keyup', (e) => this.keys.delete(e.code));
    addEventListener('blur', () => { this.keys.clear(); this.btn.up = this.btn.down = false; this.releaseStick(); });

    surface.addEventListener('contextmenu', (e) => e.preventDefault());
    surface.addEventListener('pointerdown', (e) => {
      if (!this.enabled) return;
      if (e.pointerType === 'touch') {
        this.setTouch(true);
        if (e.clientX < innerWidth * 0.45 && this.stick.id === null) {
          this.stick.id = e.pointerId; this.stick.ox = e.clientX; this.stick.oy = e.clientY;
          this.stick.x = this.stick.y = 0;
          this.elStick.style.left = e.clientX + 'px'; this.elStick.style.top = e.clientY + 'px';
          this.elStick.classList.add('on');
          document.body.classList.add('stickused');
          this.elKnob.style.transform = 'translate(-50%,-50%)';
        } else if (this.lookId === null) {
          this.lookId = e.pointerId; this.lookLast = [e.clientX, e.clientY];
        }
      } else {
        this.lookId = e.pointerId; this.lookLast = [e.clientX, e.clientY];
      }
      try { surface.setPointerCapture(e.pointerId); } catch (err) { /* synthetic pointer */ }
      e.preventDefault();
    });
    surface.addEventListener('pointermove', (e) => {
      if (e.pointerId === this.stick.id) {
        const R = 58;
        let dx = e.clientX - this.stick.ox, dy = e.clientY - this.stick.oy;
        const d = Math.hypot(dx, dy);
        if (d > R) { dx *= R / d; dy *= R / d; }
        this.stick.x = dx / R; this.stick.y = -dy / R;
        this.elKnob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
      } else if (e.pointerId === this.lookId) {
        const k = e.pointerType === 'touch' ? 0.0075 : 0.0055;
        this.lookX += (e.clientX - this.lookLast[0]) * k;
        this.lookY += (e.clientY - this.lookLast[1]) * k;
        this.lookLast = [e.clientX, e.clientY];
      }
    });
    const end = (e) => {
      if (e.pointerId === this.stick.id) this.releaseStick();
      if (e.pointerId === this.lookId) this.lookId = null;
    };
    surface.addEventListener('pointerup', end);
    surface.addEventListener('pointercancel', end);
    surface.addEventListener('wheel', (e) => { this.zoom += Math.sign(e.deltaY) * 0.08; e.preventDefault(); }, { passive: false });

    // on-screen buttons
    const hold = (id, key) => {
      const b = el(id);
      const on = (e) => {
        this.setTouch(true); this.btn[key] = true; b.classList.add('on');
        try { b.setPointerCapture(e.pointerId); } catch (err) { /* synthetic pointer */ }
        e.preventDefault();
      };
      const off = () => { this.btn[key] = false; b.classList.remove('on'); };
      b.addEventListener('pointerdown', on);
      b.addEventListener('pointerup', off); b.addEventListener('pointercancel', off); b.addEventListener('lostpointercapture', off);
      b.addEventListener('contextmenu', (e) => e.preventDefault());
    };
    hold('#btnUp', 'up'); hold('#btnDown', 'down');
    el('#btnChirp').addEventListener('pointerdown', (e) => { this.chirp = true; e.preventDefault(); });
  }

  setTouch(on) {
    if (this.touch === on) return;
    this.touch = on;
    this.onTouchMode?.(on);
  }

  releaseStick() {
    this.stick.id = null; this.stick.x = this.stick.y = 0;
    this.elStick.classList.remove('on');
  }

  get looking() { return this.lookId !== null; }

  // Read the state for this frame and clear the per-frame deltas.
  frame(out) {
    const k = this.keys;
    const dz = (v) => (Math.abs(v) < 0.14 ? 0 : (v - Math.sign(v) * 0.14) / 0.86);
    let x = (k.has('KeyD') || k.has('ArrowRight') ? 1 : 0) - (k.has('KeyA') || k.has('ArrowLeft') ? 1 : 0);
    let y = (k.has('KeyW') || k.has('ArrowUp') ? 1 : 0) - (k.has('KeyS') || k.has('ArrowDown') ? 1 : 0);
    let v = (k.has('Space') || k.has('KeyR') ? 1 : 0)
      - (k.has('ShiftLeft') || k.has('ShiftRight') || k.has('KeyC') || k.has('KeyF') || k.has('ControlLeft') ? 1 : 0);
    if (this.stick.id !== null) { x += dz(this.stick.x); y += dz(this.stick.y); }
    v += (this.btn.up ? 1 : 0) - (this.btn.down ? 1 : 0);
    out.x = Math.max(-1, Math.min(1, x));
    out.y = Math.max(-1, Math.min(1, y));
    out.v = Math.max(-1, Math.min(1, v));
    out.lookX = this.lookX; out.lookY = this.lookY; out.zoom = this.zoom; out.looking = this.looking;
    out.chirp = this.chirp;
    this.lookX = this.lookY = this.zoom = 0; this.chirp = false;
    return out;
  }
}
