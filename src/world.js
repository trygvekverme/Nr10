// Puts the whole apartment together and lights it.
import * as THREE from 'three';
import { Builder } from './builder.js';
import { createMaterials, createEnvironment } from './materials.js';
import { buildHouse, LVL } from './house.js';
import { buildMainRooms } from './rooms_main.js';
import { buildOtherRooms } from './rooms_other.js';
import { buildOutside } from './outside.js';

export function buildWorld(scene, renderer, quality) {
  const M = createMaterials(renderer);
  scene.environment = createEnvironment(renderer);
  scene.environmentIntensity = 0.55;
  scene.background = new THREE.Color(0xc9d6de);

  const b = new Builder();
  buildHouse(b, M);
  buildMainRooms(b, M);
  buildOtherRooms(b, M);
  buildOutside(b, M, scene);
  b.build(scene);

  // soft overall light
  scene.add(new THREE.HemisphereLight(0xfbfaf6, 0xe6d8c2, 0.6));

  // A nearly vertical "sky light" that only exists to give the furniture soft
  // grounding shadows (ceilings and walls do not cast).
  const sun = new THREE.DirectionalLight(0xfff6ea, 2.1);
  sun.position.set(-0.6, 14, 4.0);
  sun.target.position.set(0.9, 0, 6.2);
  sun.castShadow = quality.shadows;
  const sc = sun.shadow.camera;
  sc.left = -6.2; sc.right = 6.2; sc.top = 9.5; sc.bottom = -9.5; sc.near = 4; sc.far = 20;
  sun.shadow.mapSize.set(quality.shadowSize, quality.shadowSize);
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 0.025;
  sun.shadow.radius = 4;
  sun.shadow.autoUpdate = false;
  sun.shadow.needsUpdate = true;
  scene.add(sun, sun.target);

  // warm lamps
  const lamp = (x, y, z, intensity, color = 0xffc98a, dist = 6) => {
    const l = new THREE.PointLight(color, intensity, dist, 2);
    l.position.set(x, y, z);
    scene.add(l);
    return l;
  };
  lamp(-2.5, 1.2, 4.9, 2.2);                 // kitchen worktop lights
  lamp(-1.82, 1.3, 1.75, 2.6);               // dining pendant
  lamp(2.14, 1.42, 0.35, 1.8);               // shelf lamp above the sofa
  if (quality.lamps > 3) {
    lamp(0.67, 2.2, 8.6, 3.2, 0xfff0d8, 7);  // corridor
    lamp(0.2, 2.15, 12.5, 2.6, 0xffe2b8);    // hall
    lamp(1.3, LVL.LF + 1.75, 6.6, 2.6);      // loft pendant
  }

  return { M, colliders: b.colliders, sun };
}
