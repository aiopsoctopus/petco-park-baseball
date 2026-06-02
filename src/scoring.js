export function createScoring() {
  let hits = 0;
  let attempts = 0;
  let streak = 0;
  let bestStreak = 0;
  let difficulty = 'rookie';

  const DIFFICULTIES = {
    rookie:  { swingWindow: 3.0, ballSpeed: 22, label: 'Rookie' },
    pro:     { swingWindow: 2.0, ballSpeed: 26, label: 'Pro' },
    allstar: { swingWindow: 1.2, ballSpeed: 30, label: 'All-Star' },
  };

  // Stats panel
  const panel = document.createElement('div');
  panel.style.cssText = 'position:fixed;bottom:20px;right:20px;background:rgba(0,0,0,0.8);color:white;font-family:sans-serif;padding:16px;border-radius:10px;z-index:100;min-width:160px;';
  document.body.appendChild(panel);

  // Difficulty selector
  const diffDiv = document.createElement('div');
  diffDiv.style.cssText = 'position:fixed;top:70px;left:50%;transform:translateX(-50%);display:flex;gap:8px;z-index:200;';
  Object.entries(DIFFICULTIES).forEach(([key, val]) => {
    const btn = document.createElement('button');
    btn.textContent = val.label;
    btn.style.cssText = 'padding:6px 14px;font-size:0.85em;font-weight:bold;border:2px solid #FEC325;border-radius:6px;cursor:pointer;background:' + (key === difficulty ? '#FEC325' : '#002D62') + ';color:' + (key === difficulty ? '#002D62' : '#FEC325') + ';';
    btn.addEventListener('click', () => {
      difficulty = key;
      document.querySelectorAll('#diff-btn').forEach(b => {
        b.style.background = '#002D62';
        b.style.color = '#FEC325';
      });
      btn.style.background = '#FEC325';
      btn.style.color = '#002D62';
      updatePanel();
    });
    btn.id = 'diff-btn';
    diffDiv.appendChild(btn);
  });
  document.body.appendChild(diffDiv);

  function updatePanel() {
    const pct = attempts > 0 ? Math.round((hits / attempts) * 100) : 0;
    panel.innerHTML = `
      <div style="font-size:0.75em;color:#FEC325;font-weight:bold;margin-bottom:8px;">STATS</div>
      <div>Hits: <strong>${hits}</strong></div>
      <div>Attempts: <strong>${attempts}</strong></div>
      <div>Average: <strong>${pct}%</strong></div>
      <div>Streak: <strong>${streak}</strong></div>
      <div>Best: <strong>${bestStreak}</strong></div>
      <div style="margin-top:8px;font-size:0.8em;color:#FEC325;">Difficulty: ${DIFFICULTIES[difficulty].label}</div>
    `;
  }

  updatePanel();

  return {
    getDifficulty: () => DIFFICULTIES[difficulty],
    recordHit: () => {
      hits++; attempts++; streak++;
      if (streak > bestStreak) bestStreak = streak;
      updatePanel();
    },
    recordMiss: () => {
      attempts++; streak = 0;
      updatePanel();
    },
    save: () => localStorage.setItem('drillStats', JSON.stringify({ hits, attempts, streak: 0, bestStreak, difficulty })),
    load: () => {
      const s = localStorage.getItem('drillStats');
      if (s) { const d = JSON.parse(s); hits = d.hits; attempts = d.attempts; bestStreak = d.bestStreak; difficulty = d.difficulty || 'rookie'; updatePanel(); }
    }
  };
}
