import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export function createPhysicsWorld() {
  const world = new CANNON.World();
  world.gravity.set(0, -9.82, 0);
  return world;
}

export function createBall(scene, world) {
  // Visual
  const geo = new THREE.SphereGeometry(0.15, 16, 16);
  const mat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);


// Shadow blob beneath ball
const shadowGeo = new THREE.CircleGeometry(0.2, 16);
const shadowMat = new THREE.MeshBasicMaterial({ 
  color: 0x000000, 
  transparent: true, 
  opacity: 0.3 
});
const shadow = new THREE.Mesh(shadowGeo, shadowMat);
shadow.rotation.x = -Math.PI / 2;
scene.add(shadow);

  // Physics
  const shape = new CANNON.Sphere(0.15);
  const body = new CANNON.Body({ mass: 0.145 });
  body.addShape(shape);
  body.position.set(0, 1.5, -18); // pitcher's mound distance
  world.addBody(body);

return { mesh, body, shadow };
}

const PITCHES = {
  fastball:  { vx: 0,    vy: 0,    vz: 28, label: 'FASTBALL 🔥' },
  curveball: { vx: 1.5,  vy: -1.2, vz: 24, label: 'CURVEBALL 🌀' },
  changeup:  { vx: 0,    vy: 0,    vz: 19, label: 'CHANGEUP 🎯' },
};

export function pitch(ballBody, speed = 26) {
  const scale = speed / 26;
  const types = Object.values(PITCHES);
  const p = types[Math.floor(Math.random() * types.length)];
  ballBody.position.set(0, 1.5, -18);
  ballBody.velocity.set(p.vx * scale, p.vy * scale, p.vz * scale);
  ballBody.angularVelocity.set(0, 0, 0);
  return p.label;
}