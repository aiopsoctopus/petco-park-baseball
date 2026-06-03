import * as THREE from 'three';

export function createBaseRunningDrill(scene, avatar, scoring) {
  // Matches base positions in main.js
  const BASES = [
    new THREE.Vector3(0, 0.6, 5),   // home
    new THREE.Vector3(5, 0.6, 0),   // 1st
    new THREE.Vector3(0, 0.6, -5),  // 2nd
    new THREE.Vector3(-5, 0.6, 0),  // 3rd
  ];
  const BASE_NAMES = ['Home', '1st', '2nd', '3rd'];

  // Throw comes from the relevant outfield region per target base
  const THROW_ORIGINS = [
    new THREE.Vector3(-8, 3, -15),  // to home: left-center relay
    new THREE.Vector3(20, 3, 10),   // to 1st: right field
    new THREE.Vector3(0, 3, -20),   // to 2nd: center field
    new THREE.Vector3(-20, 3, 10),  // to 3rd: left field
  ];

  const SCENARIOS = [
    { label: 'Single',               path: [0, 1] },
    { label: 'Double',               path: [0, 1, 2] },
    { label: 'Triple',               path: [0, 1, 2, 3] },
    { label: 'Inside-the-Park HR',   path: [0, 1, 2, 3, 0] },
  ];

  const RUNNER_SPEED   = 4.5;   // units/sec
  const SLIDE_BONUS    = 0.35;  // seconds shaved off runner time
  const CLOSE_THRESHOLD = 0.4;  // triggers slow-mo when |runnerTime - throwTime| < this
  const THROW_TIMES    = { 'Rookie': 3.2, 'Pro': 2.2, 'All-Star': 1.5 };

  let state       = 'idle'; // idle | running | slowmo | result
  let scenarioIdx = 0;
  let pathIndex   = 0;
  let runnerT     = 0;
  let throwT      = 0;
  let throwTime   = 2.5;
  let runnerLegTime = 0;
  let slideUsed   = false;
  let slideApplied = false;
  let slowFactor  = 1.0;
  let slowmoTimer = 0;
  let lastResult  = 'safe';
  let lastTime    = null;

  // ── Throw ball ──────────────────────────────────────
  const throwBall = new THREE.Mesh(
    new THREE.SphereGeometry(0.15, 12, 12),
    new THREE.MeshLambertMaterial({ color: 0xFFFFFF })
  );
  throwBall.visible = false;
  scene.add(throwBall);

  const throwShadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.15, 12),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3 })
  );
  throwShadow.rotation.x = -Math.PI / 2;
  throwShadow.visible = false;
  scene.add(throwShadow);

  // ── Target base ring ────────────────────────────────
  const targetRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.6, 0.08, 8, 32),
    new THREE.MeshLambertMaterial({ color: 0xFEC325 })
  );
  targetRing.rotation.x = -Math.PI / 2;
  targetRing.visible = false;
  scene.add(targetRing);

  // ── Fielder marker ──────────────────────────────────
  const fielder = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.25, 1.4, 8),
    new THREE.MeshLambertMaterial({ color: 0xFF4444 })
  );
  fielder.visible = false;
  scene.add(fielder);

  // ── UI ──────────────────────────────────────────────
  const statusDiv = document.createElement('div');
  statusDiv.style.cssText = 'position:fixed;top:20px;left:20px;color:white;font-family:sans-serif;font-size:1.4em;font-weight:bold;text-shadow:2px 2px 4px black;z-index:100;';
  statusDiv.textContent = 'Base Running';
  document.body.appendChild(statusDiv);

  const scenarioBar = document.createElement('div');
  scenarioBar.style.cssText = 'position:fixed;bottom:100px;left:50%;transform:translateX(-50%);display:flex;gap:8px;z-index:100;';
  SCENARIOS.forEach((s, i) => {
    const btn = document.createElement('button');
    btn.textContent = s.label;
    btn.className = 'scenario-btn';
    btn.style.cssText = `padding:8px 16px;font-size:0.85em;font-weight:bold;border:2px solid #FEC325;border-radius:6px;cursor:pointer;background:${i === 0 ? '#FEC325' : '#002D62'};color:${i === 0 ? '#002D62' : '#FEC325'};`;
    btn.addEventListener('click', () => {
      if (state !== 'idle') return;
      scenarioIdx = i;
      document.querySelectorAll('.scenario-btn').forEach(b => {
        b.style.background = '#002D62'; b.style.color = '#FEC325';
      });
      btn.style.background = '#FEC325'; btn.style.color = '#002D62';
    });
    scenarioBar.appendChild(btn);
  });
  document.body.appendChild(scenarioBar);

  const goBtn = document.createElement('button');
  goBtn.textContent = '⚾ Hit it! Run!';
  goBtn.style.cssText = 'position:fixed;bottom:30px;left:50%;transform:translateX(-50%);padding:16px 40px;font-size:1.2em;font-weight:bold;background:#FEC325;color:#002D62;border:none;border-radius:12px;cursor:pointer;z-index:100;';
  document.body.appendChild(goBtn);

  const instrDiv = document.createElement('div');
  instrDiv.style.cssText = 'position:fixed;bottom:165px;left:50%;transform:translateX(-50%);color:rgba(255,255,255,0.8);font-family:sans-serif;font-size:0.9em;text-shadow:1px 1px 3px black;z-index:100;text-align:center;';
  instrDiv.textContent = 'Press Space when close to a base to slide!';
  document.body.appendChild(instrDiv);

  function handleTap() {
    if (state === 'idle') startRun();
    else if (state === 'running' && !slideUsed && runnerT > 0.65) triggerSlide();
  }

  goBtn.addEventListener('click', startRun);
  window.addEventListener('keydown', e => {
    if (e.code === 'Space') { e.preventDefault(); handleTap(); }
  });
  window.addEventListener('touchstart', e => {
    e.preventDefault(); handleTap();
  }, { passive: false });

  // ── Control flow ─────────────────────────────────────

  function startRun() {
    if (state !== 'idle') return;
    pathIndex = 0;
    if (avatar) {
      avatar.position.copy(BASES[SCENARIOS[scenarioIdx].path[0]]);
      avatar.scale.set(1, 1, 1);
    }
    startLeg();
  }

  function startLeg() {
    const path = SCENARIOS[scenarioIdx].path;
    const fromIdx = path[pathIndex];
    const toIdx   = path[pathIndex + 1];

    if (toIdx === undefined) {
      finishRun();
      return;
    }

    const dist = BASES[fromIdx].distanceTo(BASES[toIdx]);
    runnerLegTime = dist / RUNNER_SPEED;
    runnerT    = 0;
    throwT     = 0;
    slideUsed  = false;
    slideApplied = false;
    slowFactor = 1.0;

    const diff = scoring.getDifficulty();
    throwTime = (THROW_TIMES[diff.label] || 2.2) + (Math.random() * 0.4 - 0.2);

    throwBall.userData.start = THROW_ORIGINS[toIdx].clone();
    throwBall.userData.end   = BASES[toIdx].clone().add(new THREE.Vector3(0, 0.3, 0));
    throwBall.position.copy(throwBall.userData.start);
    throwBall.visible  = true;
    throwShadow.visible = true;

    targetRing.position.set(BASES[toIdx].x, 0.05, BASES[toIdx].z);
    targetRing.visible = true;
    fielder.position.set(BASES[toIdx].x + 0.9, 0.7, BASES[toIdx].z + 0.9);
    fielder.visible = true;

    state = 'running';
    goBtn.textContent = '🏃 Running...';
    statusDiv.textContent = `Running to ${BASE_NAMES[toIdx]}...`;
  }

  function triggerSlide() {
    slideUsed    = true;
    slideApplied = true;
    if (avatar) avatar.scale.set(1.3, 0.35, 1);
    showFeedback('Slide! 🏃', '#FEC325');
  }

  function resolveArrival() {
    const effectiveTime = runnerLegTime - (slideApplied ? SLIDE_BONUS : 0);
    const isSafe  = effectiveTime < throwTime;
    const isClose = Math.abs(effectiveTime - throwTime) < CLOSE_THRESHOLD;
    lastResult = isSafe ? 'safe' : 'out';

    if (isClose) {
      state = 'slowmo';
      slowFactor  = 0.12;
      slowmoTimer = 1.8;
      showFeedback('Close play! 😱', '#FF8800');
    } else {
      showResult(isSafe);
    }
  }

  function showResult(isSafe) {
    throwBall.visible   = false;
    throwShadow.visible = false;
    targetRing.visible  = false;
    fielder.visible     = false;
    if (avatar) avatar.scale.set(1, 1, 1);

    if (isSafe) {
      pathIndex++;
      const nextTo = SCENARIOS[scenarioIdx].path[pathIndex + 1];
      if (nextTo === undefined) {
        finishRun();
      } else {
        showFeedback('SAFE! ✅', '#FEC325');
        statusDiv.textContent = 'Safe! Keep running...';
        state = 'result';
        setTimeout(() => { if (state === 'result') startLeg(); }, 1000);
      }
    } else {
      scoring.recordMiss();
      showFeedback('OUT! ❌', '#FF4444');
      statusDiv.textContent = 'Out!';
      goBtn.textContent = '⚾ Hit it! Run!';
      state = 'result';
      setTimeout(() => { state = 'idle'; }, 2000);
    }
  }

  function finishRun() {
    scoring.recordHit();
    showFeedback('YOU SCORED! 🏆', '#FEC325');
    statusDiv.textContent = SCENARIOS[scenarioIdx].label + ' — scored!';
    goBtn.textContent = '⚾ Hit it! Run!';
    throwBall.visible   = false;
    throwShadow.visible = false;
    targetRing.visible  = false;
    fielder.visible     = false;
    if (avatar) avatar.scale.set(1, 1, 1);
    state = 'result';
    setTimeout(() => { state = 'idle'; }, 2000);
  }

  function showFeedback(msg, color) {
    const div = document.createElement('div');
    div.textContent = msg;
    div.style.cssText = `position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);font-size:2.5em;font-weight:bold;color:${color};text-shadow:2px 2px 6px black;z-index:200;pointer-events:none;font-family:sans-serif;`;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 1200);
  }

  // ── Per-frame update ─────────────────────────────────

  function update() {
    const now = performance.now();
    const dt = lastTime ? Math.min((now - lastTime) / 1000, 0.05) : 1 / 60;
    lastTime = now;

    if (state !== 'running' && state !== 'slowmo') return;

    const scaled = dt * slowFactor;
    const path   = SCENARIOS[scenarioIdx].path;
    const fromIdx = path[pathIndex];
    const toIdx   = path[pathIndex + 1];
    if (toIdx === undefined) return;

    const from = BASES[fromIdx];
    const to   = BASES[toIdx];

    // Advance runner (slide shortens effective leg time)
    const legTime = runnerLegTime - (slideApplied ? SLIDE_BONUS : 0);
    runnerT = Math.min(1, runnerT + scaled / legTime);

    if (avatar) {
      avatar.position.lerpVectors(from, to, runnerT);
      const dir = to.clone().sub(from);
      if (dir.length() > 0.01) avatar.rotation.y = Math.atan2(dir.x, dir.z);
    }

    // Advance throw ball along arc
    throwT = Math.min(1, throwT + scaled / throwTime);
    if (throwBall.visible) {
      const s = throwBall.userData.start;
      const e = throwBall.userData.end;
      throwBall.position.x = s.x + (e.x - s.x) * throwT;
      throwBall.position.z = s.z + (e.z - s.z) * throwT;
      throwBall.position.y = s.y + (e.y - s.y) * throwT + Math.sin(throwT * Math.PI) * 4;
      throwShadow.position.set(throwBall.position.x, 0.02, throwBall.position.z);
    }

    // Pulse target ring to draw attention
    const pulse = 1 + Math.sin(performance.now() / 200) * 0.1;
    targetRing.scale.set(pulse, 1, pulse);

    // Slow-mo: count down in real time (not scaled)
    if (state === 'slowmo') {
      slowmoTimer -= dt;
      if (slowmoTimer <= 0) {
        slowFactor = 1.0;
        showResult(lastResult === 'safe');
      }
    }

    if (runnerT >= 1 && state === 'running') resolveArrival();
  }

  return { update };
}
