import * as THREE from 'three';
import * as T from './textures.js';

// Shared colours (sRGB hex) sampled by eye from the walkthrough video.
export const C = {
  wall: 0xf1ede4, olive: 0x8e8c74, teal: 0x32677b, sand: 0xdcc898, ceil: 0xf6f4ee, trim: 0xfbfaf6,
  oakCab: 0xc58e52, oakLight: 0xdcb984, oakTable: 0xcfa878, oakBench: 0xd3b287,
  black: 0x1b1b1d, charcoal: 0x2b2c30, steel: 0xb9bcbe, sofa: 0xb9b3a8, cognac: 0xb07238,
  terracotta: 0xc98a62, basket: 0xc8a876, potWhite: 0xeeeae2, darkWood: 0x4a3222,
};

export function createMaterials(renderer) {
  T.setMaxAnisotropy(renderer.capabilities.getMaxAnisotropy());
  const std = (o) => new THREE.MeshStandardMaterial({ vertexColors: true, ...o });
  const M = {
    matte: std({ roughness: 0.92 }),
    satin: std({ roughness: 0.5 }),
    gloss: std({ roughness: 0.1 }),
    metal: std({ roughness: 0.38, metalness: 1 }),
    chrome: std({ roughness: 0.1, metalness: 1 }),
    mirror: std({ roughness: 0.02, metalness: 1 }),
    plaster: std({ map: T.plaster(), roughness: 0.96 }),
    parquet: std({ map: T.parquet(), roughness: 0.36 }),
    wood: std({ map: T.wood(), roughness: 0.58 }),
    fabric: std({ map: T.fabric(), roughness: 1 }),
    leather: std({ map: T.leather(), roughness: 0.5 }),
    weave: std({ map: T.weave(), roughness: 0.9 }),
    tiles: std({ map: T.tiles(), roughness: 0.42 }),
    counter: std({ map: T.counter(), roughness: 0.38 }),
    slate: std({ map: T.slate(), roughness: 0.22 }),
    deck: std({ map: T.deck(), roughness: 0.9 }),
    panel: std({ map: T.panel(), roughness: 0.8, emissive: 0x4a4844 }),
    ceiling: std({ map: T.plaster(), roughness: 0.96, emissive: 0x57544e }),
    grass: std({ map: T.grass(), roughness: 1 }),
    cladding: std({ map: T.cladding(), roughness: 0.9 }),
    roofRed: std({ map: T.roofTiles([176, 72, 50]), roughness: 0.85 }),
    roofGrey: std({ map: T.roofTiles([92, 92, 96]), roughness: 0.85 }),
    glass: new THREE.MeshStandardMaterial({
      color: 0xd6e6ea, transparent: true, opacity: 0.14, roughness: 0.02, metalness: 0.0,
      vertexColors: true, depthWrite: false,
    }),
    water: new THREE.MeshStandardMaterial({
      color: 0x9fc7a8, transparent: true, opacity: 0.22, roughness: 0.05, vertexColors: true, depthWrite: false,
    }),
    leaf: std({ roughness: 0.65, side: THREE.DoubleSide }),
    glow: new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }),
    sky: new THREE.MeshBasicMaterial({ map: T.sky(), side: THREE.BackSide, fog: false, vertexColors: true }),
    T,
  };
  const cache = new Map();
  // One-off textured materials (pictures, rugs ...), cached by name.
  M.pic = (name, make, opts = {}) => {
    if (!cache.has(name)) {
      cache.set(name, new THREE.MeshStandardMaterial({
        map: make(), vertexColors: true, roughness: opts.roughness ?? 0.7,
        transparent: !!opts.alpha, alphaTest: opts.alpha ? 0.4 : 0,
        emissive: opts.emissive ? new THREE.Color(0xffffff) : new THREE.Color(0),
        emissiveMap: null,
      }));
      if (opts.emissive) { const m = cache.get(name); m.emissiveMap = m.map; m.emissiveIntensity = opts.emissive; }
    }
    return cache.get(name);
  };
  return M;
}

// A tiny hand-made "room" that is prefiltered into an environment map so that
// glossy surfaces (floor, glass, mirror wardrobe, TV) get believable reflections.
export function createEnvironment(renderer) {
  const scene = new THREE.Scene();
  const mk = (w, h, d, color, x, y, z, back = false) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d),
      new THREE.MeshBasicMaterial({ color, side: back ? THREE.BackSide : THREE.FrontSide }));
    m.position.set(x, y, z); scene.add(m); return m;
  };
  const room = mk(10, 5, 14, 0xffffff, 0, 1.1, 0, true);
  // paint the faces of the room: walls, floor, ceiling
  room.material = [
    new THREE.MeshBasicMaterial({ color: new THREE.Color(0.62, 0.6, 0.52), side: THREE.BackSide }),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(0.8, 0.77, 0.7), side: THREE.BackSide }),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, 0.98, 0.94), side: THREE.BackSide }),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(0.5, 0.3, 0.14), side: THREE.BackSide }),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(0.55, 0.55, 0.5), side: THREE.BackSide }),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(0.85, 0.82, 0.76), side: THREE.BackSide }),
  ];
  const bright = new THREE.Color(7, 7.6, 8.2);
  mk(2.4, 1.5, 0.1, bright, -2.2, 0.2, -6.9);   // dining window
  mk(2.2, 2.2, 0.1, bright, 2.8, -0.1, -6.9);    // terrace doors
  mk(1.2, 1.2, 0.1, bright, 0.5, 0.2, 6.9);     // hall window
  mk(1.0, 0.1, 1.6, new THREE.Color(5, 5.4, 6), 2.5, 3.55, -1); // skylight
  const warm = new THREE.Color(6, 3.6, 1.6);
  mk(0.3, 0.3, 0.3, warm, 1.5, 0.2, -6.5);
  mk(0.3, 0.3, 0.3, warm, -4.6, 0.0, 1);
  mk(0.5, 0.1, 0.5, warm, 0.6, 3.5, 3.5);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(scene, 0.03).texture;
  pmrem.dispose();
  return env;
}
