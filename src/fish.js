// A few small fish swimming lazy loops in the aquarium.
import * as THREE from 'three';

const B = { x0: 1.25, x1: 1.57, y0: 0.9, y1: 1.24, z0: 4.47, z1: 5.33 };

export function createFish(scene) {
  const body = new THREE.SphereGeometry(1, 10, 8);
  const tail = new THREE.BufferGeometry();
  tail.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, -1, 0.8, 0, -1, -0.8, 0], 3));
  tail.computeVertexNormals();
  const fish = [];
  const kinds = [
    { n: 9, len: 0.016, tall: 0.42, color: 0xd95a3a, tailColor: 0x2a2a2a },   // little rasboras
    { n: 2, len: 0.03, tall: 1.25, color: 0xcfcab8, tailColor: 0x3a3a34 },    // angelfish
  ];
  for (const k of kinds) {
    for (let i = 0; i < k.n; i++) {
      const g = new THREE.Group();
      const mat = new THREE.MeshStandardMaterial({ color: k.color, roughness: 0.35, metalness: 0.3 });
      const b = new THREE.Mesh(body, mat);
      b.scale.set(k.len, k.len * k.tall, k.len * 0.28);
      const t = new THREE.Mesh(tail, new THREE.MeshStandardMaterial({ color: k.tailColor, roughness: 0.5, side: THREE.DoubleSide }));
      t.position.x = -k.len * 0.85; t.scale.setScalar(k.len * 0.8);
      g.add(b, t);
      scene.add(g);
      fish.push({
        g, tail: t,
        cx: THREE.MathUtils.lerp(B.x0, B.x1, 0.3 + Math.random() * 0.4),
        cy: THREE.MathUtils.lerp(B.y0, B.y1, 0.2 + Math.random() * 0.7),
        cz: THREE.MathUtils.lerp(B.z0, B.z1, 0.25 + Math.random() * 0.5),
        ax: 0.05 + Math.random() * 0.07, az: 0.12 + Math.random() * 0.2, ay: 0.02 + Math.random() * 0.05,
        w: (0.25 + Math.random() * 0.35) * (Math.random() < 0.5 ? 1 : -1), ph: Math.random() * 6.28,
      });
    }
  }
  const prev = new THREE.Vector3();
  return function update(time) {
    for (const f of fish) {
      const a = time * f.w + f.ph;
      const x = THREE.MathUtils.clamp(f.cx + Math.sin(a * 2) * f.ax, B.x0, B.x1);
      const z = THREE.MathUtils.clamp(f.cz + Math.sin(a) * f.az, B.z0, B.z1);
      const y = THREE.MathUtils.clamp(f.cy + Math.sin(a * 1.7 + 1) * f.ay, B.y0, B.y1);
      prev.copy(f.g.position);
      f.g.position.set(x, y, z);
      const dx = x - prev.x, dz = z - prev.z;
      if (dx * dx + dz * dz > 1e-10) f.g.rotation.y = Math.atan2(-dz, dx);
      f.tail.rotation.y = Math.sin(time * 9 + f.ph) * 0.5;
    }
  };
}
