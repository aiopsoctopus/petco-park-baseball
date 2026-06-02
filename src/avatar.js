import * as THREE from 'three';

// Avatar: base character mesh
export function createAvatar(scene) {
  const avatar = new THREE.Group();

  // Body (torso)
  const bodyGeo = new THREE.CylinderGeometry(0.5, 0.4, 1.2, 8);
  const bodyMat = new THREE.MeshLambertMaterial({ color: 0x002D62 }); // Padres navy
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.6;
  avatar.add(body);

  // Head
  const headGeo = new THREE.SphereGeometry(0.4, 16, 16);
  const headMat = new THREE.MeshLambertMaterial({ color: 0xF1C27D }); // default skin
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = 1.65;
  avatar.add(head);

  // Helmet
  const helmetGeo = new THREE.SphereGeometry(0.43, 16, 16, 0, Math.PI * 2, 0, Math.PI / 1.8);
  const helmetMat = new THREE.MeshLambertMaterial({ color: 0x002D62 });
  const helmet = new THREE.Mesh(helmetGeo, helmetMat);
  helmet.position.y = 1.65;
  avatar.add(helmet);

  // Legs
  const legGeo = new THREE.CylinderGeometry(0.18, 0.15, 0.9, 8);
  const legMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });

  const leftLeg = new THREE.Mesh(legGeo, legMat);
  leftLeg.position.set(-0.22, -0.15, 0);
  avatar.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeo, legMat);
  rightLeg.position.set(0.22, -0.15, 0);
  avatar.add(rightLeg);

  // Arms
  const armGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.9, 8);

  const leftArm = new THREE.Mesh(armGeo, bodyMat);
  leftArm.position.set(-0.65, 0.6, 0);
  leftArm.rotation.z = Math.PI / 6;
  avatar.add(leftArm);

  const rightArm = new THREE.Mesh(armGeo, bodyMat);
  rightArm.position.set(0.65, 0.6, 0);
  rightArm.rotation.z = -Math.PI / 6;
  avatar.add(rightArm);

  // Place on field
  avatar.position.set(0, 0.6, 3);
  scene.add(avatar);

  return { avatar, headMat, bodyMat };
}