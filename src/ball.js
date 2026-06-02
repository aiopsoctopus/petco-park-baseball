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

  // Physics
  const shape = new CANNON.Sphere(0.15);
  const body = new CANNON.Body({ mass: 0.145 });
  body.addShape(shape);
  body.position.set(0, 1.5, -18); // pitcher's mound distance
  world.addBody(body);

  return { mesh, body };
}

export function pitch(ballBody) {
  ballBody.position.set(0, 1.5, -18);
  ballBody.velocity.set(0, 0, 28); // fastball toward home plate
  ballBody.angularVelocity.set(0, 0, 0);
}