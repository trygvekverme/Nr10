import * as THREE from 'three';
import { buildWorld } from './world.js';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const t0 = performance.now();
const world = buildWorld(scene, renderer, { shadows: true, shadowSize: 4096, lamps: 6 });
console.log('build ms', performance.now() - t0, 'colliders', world.colliders.length);
const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.03, 400);
window.__view = (px, py, pz, tx, ty, tz) => { camera.position.set(px, py, pz); camera.lookAt(tx, ty, tz); renderer.render(scene, camera); };
window.__view(0.7, 1.5, 11, 0.7, 1.2, 0);
window.__info = () => JSON.stringify(renderer.info.render) + ' ' + JSON.stringify(renderer.info.memory);
window.__ready = true;
