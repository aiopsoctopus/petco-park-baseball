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

  // Arms — wrapped in pivot groups so they rotate naturally from the shoulder
  const armGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.9, 8);

  const leftArmPivot = new THREE.Group();
  leftArmPivot.position.set(-0.65, 0.85, 0);
  const leftArm = new THREE.Mesh(armGeo, bodyMat);
  leftArm.position.y = -0.45;
  leftArmPivot.add(leftArm);
  leftArmPivot.rotation.z = Math.PI / 6;
  avatar.add(leftArmPivot);

  const rightArmPivot = new THREE.Group();
  rightArmPivot.position.set(0.65, 0.85, 0);
  const rightArm = new THREE.Mesh(armGeo, bodyMat);
  rightArm.position.y = -0.45;
  rightArmPivot.add(rightArm);
  rightArmPivot.rotation.z = -Math.PI / 6;
  avatar.add(rightArmPivot);

  // Place on field
  avatar.position.set(0, 0.6, 3);
  scene.add(avatar);

  // ── ANIMATION STATE ──
  let anim = null; // { type, progress, duration }

  // Idle resting rotations
  const REST_LEFT_Z  =  Math.PI / 6;
  const REST_RIGHT_Z = -Math.PI / 6;
  const REST_BODY_X  = 0;
  const REST_BODY_Z  = 0;

  /**
   * Trigger a named animation on the avatar.
   * type: 'swing' | 'catch' | 'slide'
   */
  function playAnimation(type) {
    anim = { type, progress: 0, duration: type === 'swing' ? 0.35 : type === 'catch' ? 0.4 : 0.5 };
  }

  /**
   * Call this every frame from the drill's update() loop.
   * dt: seconds since last frame (pass 1/60 if not tracking delta)
   */
  function updateAnimation(dt = 1 / 60) {
    if (!anim) return;
    anim.progress = Math.min(anim.progress + dt / anim.duration, 1);
    const t = anim.progress;
    // Ease in-out
    const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    if (anim.type === 'swing') {
      // Arms swing forward across body — classic batting motion
      leftArmPivot.rotation.z  = REST_LEFT_Z  + ease * (-Math.PI * 0.9);
      rightArmPivot.rotation.z = REST_RIGHT_Z + ease * (-Math.PI * 0.9);
      leftArmPivot.rotation.x  = ease * (-Math.PI / 4);
      rightArmPivot.rotation.x = ease * (-Math.PI / 4);
      body.rotation.y = ease * (Math.PI / 3); // torso twist
    } else if (anim.type === 'catch') {
      // Both arms raise up above head
      leftArmPivot.rotation.z  = REST_LEFT_Z  + ease * (-Math.PI * 0.7);
      rightArmPivot.rotation.z = REST_RIGHT_Z + ease * ( Math.PI * 0.7);
      leftArmPivot.rotation.x  = ease * (-Math.PI / 2);
      rightArmPivot.rotation.x = ease * (-Math.PI / 2);
    } else if (anim.type === 'slide') {
      // Body tilts forward, legs angle back
      body.rotation.x  = ease * (Math.PI / 3);
      leftLeg.rotation.x  = ease * (Math.PI / 4);
      rightLeg.rotation.x = ease * (Math.PI / 4);
    }

    // Return to rest after animation completes
    if (anim.progress >= 1) {
      leftArmPivot.rotation.set(0, 0, REST_LEFT_Z);
      rightArmPivot.rotation.set(0, 0, REST_RIGHT_Z);
      body.rotation.set(REST_BODY_X, 0, REST_BODY_Z);
      leftLeg.rotation.set(0, 0, 0);
      rightLeg.rotation.set(0, 0, 0);
      anim = null;
    }
  }

  return { avatar, headMat, bodyMat, playAnimation, updateAnimation };
}