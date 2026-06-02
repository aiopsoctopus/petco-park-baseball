import { createPhysicsWorld, createBall, pitch } from './ball.js';

export function createHittingDrill(scene) {
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
      pitch(ball.body);
      pitchInFlight = true;
      swingWindow = true;
      pitchBtn.textContent = '🏏 Swing! (Space)';
    }
  });

  // Swing on spacebar
  window.addEventListener('keydown', e => {
    if (e.code === 'Space' && swingWindow) {
      e.preventDefault();
      const z = ball.body.position.z;
      if (z > 2 && z < 7) {
        score++;
        scoreDiv.textContent = `Hits: ${score}`;
        showFeedback('CRACK! 💥', '#FEC325');
      } else {
        showFeedback('Swing and a miss!', '#ff4444');
      }
      swingWindow = false;
      pitchInFlight = false;
      pitchBtn.textContent = '⚾ Pitch!';
      ball.body.position.set(0, 1.5, -18);
      ball.body.velocity.set(0, 0, 0);
    }
  });

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
    ball.mesh.position.copy(ball.body.position);
    ball.mesh.quaternion.copy(ball.body.quaternion);

    // Reset if ball goes past home plate
    if (ball.body.position.z > 10) {
      pitchInFlight = false;
      swingWindow = false;
      pitchBtn.textContent = '⚾ Pitch!';
      ball.body.position.set(0, 1.5, -18);
      ball.body.velocity.set(0, 0, 0);
    }
  }

  return { update };
}