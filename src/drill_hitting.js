import { createPhysicsWorld, createBall, pitch } from './ball.js';

export function createHittingDrill(scene, scoring, avatarObj) {
  const world = createPhysicsWorld();
  const ball = createBall(scene, world);
  let swingWindow = false;
  let score = 0;
  let pitchInFlight = false;
  

  // Score display
  const scoreDiv = document.createElement('div');
  scoreDiv.style.cssText = `
    position:fixed;top:20px;left:20px;color:white;font-family:sans-serif;
    font-size:1.5em;font-weight:bold;text-shadow:2px 2px 4px black;z-index:100;
  `;
  scoreDiv.textContent = 'Hits: 0';
  document.body.appendChild(scoreDiv);

  // Pitch button
  const pitchBtn = document.createElement('button');
  pitchBtn.textContent = '⚾ Pitch!';
  pitchBtn.style.cssText = `
    position:fixed;bottom:30px;left:50%;transform:translateX(-50%);
    padding:16px 40px;font-size:1.2em;font-weight:bold;background:#FEC325;
    color:#002D62;border:none;border-radius:12px;cursor:pointer;z-index:100;
  `;
  document.body.appendChild(pitchBtn);

  pitchBtn.addEventListener('click', () => {
    if (!pitchInFlight) {
      const label = pitch(ball.body, scoring.getDifficulty().ballSpeed);
      pitchInFlight = true;
      swingWindow = true;
      pitchBtn.textContent = `🏏 Swing! — ${label}`;
    }
  });

  function trySwing() {
    if (!swingWindow) return;
    if (avatarObj) avatarObj.playAnimation('swing');
    const z = ball.body.position.z;
    const x = ball.body.position.x;
    const inZone = z > 1 && z < 8 && Math.abs(x) < 2.5;
    if (inZone) {
      score++;
      scoreDiv.textContent = `Hits: ${score}`;
      scoring.recordHit();
      showFeedback('HIT! 💥', '#FEC325');
    } else {
      scoring.recordMiss();
      showFeedback('Miss!', '#FF4444');
    }
    swingWindow = false;
    pitchInFlight = false;
    pitchBtn.textContent = '⚾ Pitch!';
    ball.body.position.set(0, 1.5, -18);
    ball.body.velocity.set(0, 0, 0);
    ball.shadow.position.set(ball.body.position.x, 0.02, ball.body.position.z);
  }

  window.addEventListener('keydown', e => {
    if (e.code === 'Space') { e.preventDefault(); trySwing(); }
  });
  window.addEventListener('touchstart', e => {
    e.preventDefault(); trySwing();
  }, { passive: false });

  function showFeedback(msg, color) {
    const div = document.createElement('div');
    div.textContent = msg;
    div.style.cssText = `
      position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
      font-size:2.5em;font-weight:bold;color:${color};
      text-shadow:2px 2px 6px black;z-index:200;pointer-events:none;
      font-family:sans-serif;
    `;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 1000);
  }

  function update() {
    world.step(1 / 60);
    if (avatarObj) avatarObj.updateAnimation();
    ball.mesh.position.copy(ball.body.position);
    ball.mesh.quaternion.copy(ball.body.quaternion);
    ball.shadow.position.set(ball.body.position.x, 0.02, ball.body.position.z);

    // Reset if ball goes past home plate without a swing
    if (ball.body.position.z > 10) {
      if (pitchInFlight) {
        scoring.recordMiss();
        showFeedback('Strike!', '#FF4444');
      }
      pitchInFlight = false;
      swingWindow = false;
      pitchBtn.textContent = '⚾ Pitch!';
      ball.body.position.set(0, 1.5, -18);
      ball.body.velocity.set(0, 0, 0);
    }
  }

  return { update };
}