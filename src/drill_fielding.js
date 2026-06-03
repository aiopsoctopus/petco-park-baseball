import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { createPhysicsWorld } from './ball.js';

export function createFieldingDrill(scene, avatar, scoring) {
  const world = createPhysicsWorld();
  let score = 0;
  let ballInFlight = false;

  // Ball
  const ballGeo = new THREE.SphereGeometry(0.15, 16, 16);
  const ballMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
  const ballMesh = new THREE.Mesh(ballGeo, ballMat);
  scene.add(ballMesh);

  const ballShape = new CANNON.Sphere(0.15);
  const ballBody = new CANNON.Body({ mass: 0.145 });
  ballBody.addShape(ballShape);
  ballBody.position.set(0, 0.5, -18);
  world.addBody(ballBody);

  // Shadow
  const shadowGeo = new THREE.CircleGeometry(0.2, 16);
  const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3 });
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.rotation.x = -Math.PI / 2;
  scene.add(shadowMesh);

  // Score UI
  const scoreDiv = document.createElement('div');
  scoreDiv.style.cssText = 'position:fixed;top:20px;left:20px;color:white;font-family:sans-serif;font-size:1.5em;font-weight:bold;text-shadow:2px 2px 4px black;z-index:100;';
  scoreDiv.textContent = 'Catches: 0';
  document.body.appendChild(scoreDiv);

  // Launch button
  const launchBtn = document.createElement('button');
  launchBtn.textContent = 'Hit Fly Ball!';
  launchBtn.style.cssText = 'position:fixed;bottom:30px;left:50%;transform:translateX(-50%);padding:16px 40px;font-size:1.2em;font-weight:bold;background:#FEC325;color:#002D62;border:none;border-radius:12px;cursor:pointer;z-index:100;';
  document.body.appendChild(launchBtn);

  // Instructions
  const instrDiv = document.createElement('div');
  instrDiv.style.cssText = 'position:fixed;bottom:100px;left:50%;transform:translateX(-50%);color:white;font-family:sans-serif;font-size:1em;text-shadow:2px 2px 4px black;z-index:100;text-align:center;';
  instrDiv.textContent = 'Use Arrow Keys to move your player';
  document.body.appendChild(instrDiv);

  // Avatar movement
  const keys = {};
  window.addEventListener('keydown', e => { keys[e.code] = true; });
  window.addEventListener('keyup',   e => { keys[e.code] = false; });

  // D-pad for touch / mouse
  const PAD_DIRS = [
    { key: 'ArrowUp',    icon: '↑', col: 1, row: 0 },
    { key: 'ArrowLeft',  icon: '←', col: 0, row: 1 },
    { key: 'ArrowRight', icon: '→', col: 2, row: 1 },
    { key: 'ArrowDown',  icon: '↓', col: 1, row: 2 },
  ];
  const BTN = 52, GAP = 6;
  const dpad = document.createElement('div');
  dpad.style.cssText = `position:fixed;bottom:170px;right:20px;width:${(BTN+GAP)*3-GAP}px;height:${(BTN+GAP)*3-GAP}px;z-index:100;`;
  PAD_DIRS.forEach(({ key, icon, col, row }) => {
    const btn = document.createElement('button');
    btn.textContent = icon;
    btn.style.cssText = `position:absolute;left:${col*(BTN+GAP)}px;top:${row*(BTN+GAP)}px;
      width:${BTN}px;height:${BTN}px;background:rgba(0,45,98,0.75);color:#FEC325;
      border:2px solid rgba(254,195,37,0.55);border-radius:50%;font-size:1.3em;
      cursor:pointer;touch-action:none;user-select:none;`;
    btn.addEventListener('touchstart', e => { e.preventDefault(); keys[key] = true; },  { passive: false });
    btn.addEventListener('touchend',   e => { e.preventDefault(); keys[key] = false; }, { passive: false });
    btn.addEventListener('mousedown',  () => keys[key] = true);
    btn.addEventListener('mouseup',    () => keys[key] = false);
    btn.addEventListener('mouseleave', () => keys[key] = false);
    dpad.appendChild(btn);
  });
  document.body.appendChild(dpad);

  function launchFlyBall() {
    if (ballInFlight) return;
    const vx = (Math.random() - 0.5) * 12;
    const vz = Math.random() * 8 + 6;
    ballBody.position.set(0, 1, -18);
    ballBody.velocity.set(vx, 14, vz);
    ballInFlight = true;
    launchBtn.textContent = 'Ball in flight...';
  }

  launchBtn.addEventListener('click', launchFlyBall);

  function showFeedback(msg, color) {
    const div = document.createElement('div');
    div.textContent = msg;
    div.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);font-size:2.5em;font-weight:bold;color:' + color + ';text-shadow:2px 2px 6px black;z-index:200;pointer-events:none;font-family:sans-serif;';
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 1000);
  }

  function resetBall() {
    ballBody.position.set(0, 0.5, -18);
    ballBody.velocity.set(0, 0, 0);
    ballInFlight = false;
    launchBtn.textContent = 'Hit Fly Ball!';
  }

  function update() {
    world.step(1 / 60);

    if (avatar) {
      const speed = 0.08;
      if (keys['ArrowLeft'])  avatar.position.x -= speed;
      if (keys['ArrowRight']) avatar.position.x += speed;
      if (keys['ArrowUp'])    avatar.position.z -= speed;
      if (keys['ArrowDown'])  avatar.position.z += speed;
      avatar.position.x = Math.max(-25, Math.min(25, avatar.position.x));
      avatar.position.z = Math.max(-25, Math.min(25, avatar.position.z));
    }

    ballMesh.position.copy(ballBody.position);
    ballMesh.quaternion.copy(ballBody.quaternion);
    shadowMesh.position.set(ballBody.position.x, 0.02, ballBody.position.z);

    if (ballInFlight && avatar) {
      const dist = ballMesh.position.distanceTo(avatar.position);
      if (dist < 1.5) {
        score++;
        scoreDiv.textContent = 'Catches: ' + score;
        scoring.recordHit();
        showFeedback('CAUGHT IT!', '#FEC325');
        resetBall();
      }
    }

    if (ballBody.position.y < -1 || ballBody.position.z > 30) {
      if (ballInFlight) {
        scoring.recordMiss();
        showFeedback('Dropped!', '#ff4444');
      }
      resetBall();
    }
  }

  return { update };
}
