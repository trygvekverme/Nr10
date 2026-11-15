import * as THREE from 'three';
import { buildWorld } from './world.js';
import { CollisionWorld } from './physics.js';
import { Bird } from './bird.js';
import { ChaseCamera } from './camera.js';
import { Input } from './controls.js';
import { GameAudio } from './audio.js';
import { createFish } from './fish.js';

const DEV = new URLSearchParams(location.search).has('dev');
const coarse = matchMedia('(pointer: coarse)').matches;
const $ = (s) => document.querySelector(s);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, coarse ? 1.5 : 2));
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
$('#surface').appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, 0.02, 400);

const world = buildWorld(scene, renderer, { shadows: true, shadowSize: coarse ? 2048 : 4096, lamps: 6 });
const collision = new CollisionWorld(world.colliders);
const audio = new GameAudio();
const bird = new Bird(scene, collision, audio);
bird.placeAt(0.19, 0.9, 2.05, Math.PI / 2);          // on the back of the sofa, facing the living room
const chase = new ChaseCamera(camera, collision);
chase.snap(bird);
chase.yawOff = 0.5; chase.pitch = 0.22;
const updateFish = createFish(scene);
const input = new Input(document.body);

function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.fov = w >= h ? 62 : 78;                      // wider on a phone held upright
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize);
addEventListener('orientationchange', () => setTimeout(resize, 200));
resize();

// ------------------------------------------------------------------- UI
let started = false;
let hintShown = { land: false };
const overlay = $('#start');
input.onTouchMode = (on) => document.body.classList.toggle('touch', on);
if (coarse) document.body.classList.add('touch');

function start() {
  if (started) return;
  started = true;
  input.enabled = true;
  audio.start();
  overlay.classList.add('hidden');
  document.body.classList.add('playing');
  chase.idle = 2;
  showHint(coarse ? 'Hold ▲ for å lette' : 'Hold mellomrom for å lette', 5);
}
$('#play').addEventListener('click', start);
$('#play').disabled = false;
$('#play').textContent = 'Start';

const musicBtn = $('#btnMusic');
function toggleMusic() {
  audio.setMusic(!audio.musicOn);
  musicBtn.classList.toggle('off', !audio.musicOn);
}
musicBtn.addEventListener('click', toggleMusic);
$('#btnHelp').addEventListener('click', () => { $('#help').classList.toggle('show'); });
$('#help').addEventListener('click', () => $('#help').classList.remove('show'));
addEventListener('keydown', (e) => {
  if (e.code === 'KeyM') toggleMusic();
  if (e.code === 'KeyH') $('#help').classList.toggle('show');
  if (!started && (e.code === 'Enter' || e.code === 'Space')) start();
});
document.addEventListener('visibilitychange', () => { if (document.hidden) audio.suspend(); else if (started) audio.resume(); });

let hintTimer = 0;
function showHint(text, seconds) {
  const h = $('#hint');
  h.textContent = text; h.classList.add('show');
  hintTimer = seconds;
}

// ----------------------------------------------------------------- loop
const inp = { x: 0, y: 0, v: 0, lookX: 0, lookY: 0, zoom: 0, looking: false, chirp: false };
const idleInp = { x: 0, y: 0, v: 0, lookX: 0, lookY: 0, zoom: 0, looking: false, chirp: false };
let last = performance.now();
let time = 0;
let wasFlying = false;
let frozen = false;

function step(dt, i) {
  time += dt;
  bird.update(dt, i);
  chase.update(dt, bird, i);
  updateFish(time);
  if (started) {
    if (bird.flying && !wasFlying && !hintShown.land) {
      hintShown.land = true;
      showHint(coarse ? 'Hold ▼ over et møbel for å lande' : 'Hold Shift over et møbel for å lande', 6);
    }
    wasFlying = bird.flying;
    if (hintTimer > 0) { hintTimer -= dt; if (hintTimer <= 0) $('#hint').classList.remove('show'); }
  }
}

// If the device cannot keep up, quietly lower the render resolution.
let pixelRatio = renderer.getPixelRatio();
let slow = 0, measured = 0;
function adapt(rawDt) {
  measured += rawDt;
  if (measured < 1.5) return;                       // ignore start-up hitches
  slow = rawDt > 0.027 ? slow + rawDt : Math.max(0, slow - rawDt * 2);
  if (slow > 1.2 && pixelRatio > 0.7) {
    pixelRatio = Math.max(0.7, pixelRatio * 0.82);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(innerWidth, innerHeight);
    slow = 0; measured = 0.5;
  }
}

function frame(now) {
  requestAnimationFrame(frame);
  if (frozen) return;
  const raw = (now - last) / 1000;
  const dt = Math.min(0.05, raw);
  last = now;
  if (!DEV && !document.hidden && raw < 0.5) adapt(raw);
  if (started) input.frame(inp);
  else { idleInp.lookX = -dt * 0.06; }                 // slow drift around the bird on the title screen
  step(dt, started ? inp : idleInp);
  renderer.render(scene, camera);
}
requestAnimationFrame(frame);

// hooks used by the automated tests (index.html?dev)
if (DEV) {
  window.__game = { bird, chase, camera, scene, renderer, collision, audio, start, input };
  window.__view = (px, py, pz, tx, ty, tz) => {
    frozen = true; camera.position.set(px, py, pz); camera.lookAt(tx, ty, tz); renderer.render(scene, camera);
  };
  window.__step = (n, i = {}) => {
    frozen = true;
    const ii = { ...idleInp, lookX: 0, ...i };
    for (let k = 0; k < n; k++) { step(1 / 60, ii); ii.chirp = false; ii.lookX = 0; ii.lookY = 0; }
    renderer.render(scene, camera);
    return { mode: bird.mode, pos: bird.pos.toArray().map((v) => +v.toFixed(3)), yaw: +bird.yaw.toFixed(3), speed: +bird.speed.toFixed(2) };
  };
  window.__info = () => JSON.stringify(renderer.info.render) + ' colliders ' + world.colliders.length;
}
window.__ready = true;
