const BADGES = [
  { id: 'first_hit',  icon: '⚾', label: 'First Hit!',      check: s => s.hits >= 1 },
  { id: 'streak_3',   icon: '🔥', label: 'Hot Streak!',     check: s => s.streak >= 3 },
  { id: 'streak_5',   icon: '🌶️', label: 'On Fire!',        check: s => s.streak >= 5 },
  { id: 'hits_10',    icon: '💪', label: '10 Hits',          check: s => s.hits >= 10 },
  { id: 'hits_25',    icon: '🌟', label: '25 Hits',          check: s => s.hits >= 25 },
  { id: 'best_10',    icon: '🏆', label: 'Streak of 10!',   check: s => s.bestStreak >= 10 },
];

export function createScoring(drillName = 'overall') {
  const STORAGE_KEY = 'drillStats_' + drillName;

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
      diffDiv.querySelectorAll('button').forEach(b => { b.style.background = '#002D62'; b.style.color = '#FEC325'; });
      btn.style.background = '#FEC325';
      btn.style.color = '#002D62';
      updatePanel();
    });
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

  function checkBadges() {
    const unlocked = JSON.parse(localStorage.getItem('badges') || '[]');
    let changed = false;
    BADGES.forEach(badge => {
      if (!unlocked.includes(badge.id) && badge.check({ hits, attempts, streak, bestStreak })) {
        unlocked.push(badge.id);
        changed = true;
        showBadgeUnlock(badge);
      }
    });
    if (changed) localStorage.setItem('badges', JSON.stringify(unlocked));
  }

  function showBadgeUnlock(badge) {
    const div = document.createElement('div');
    div.style.cssText = `
      position:fixed;bottom:120px;left:50%;
      transform:translateX(-50%) translateY(16px);
      background:#002D62;border:2px solid #FEC325;color:white;
      font-family:sans-serif;padding:12px 24px;border-radius:12px;z-index:500;
      text-align:center;opacity:0;transition:opacity 0.3s,transform 0.3s;
      box-shadow:0 4px 20px rgba(0,0,0,0.5);pointer-events:none;
    `;
    div.innerHTML = `
      <div style="font-size:1.8em;line-height:1;">${badge.icon}</div>
      <div style="font-size:0.68em;color:#FEC325;text-transform:uppercase;letter-spacing:1px;margin:4px 0 2px;">Badge Unlocked!</div>
      <div style="font-size:0.9em;font-weight:bold;">${badge.label}</div>
    `;
    document.body.appendChild(div);
    setTimeout(() => { div.style.opacity = '1'; div.style.transform = 'translateX(-50%) translateY(0)'; }, 50);
    setTimeout(() => { div.style.opacity = '0'; setTimeout(() => div.remove(), 300); }, 2800);
  }

  return {
    getDifficulty: () => DIFFICULTIES[difficulty],
    recordHit: () => {
      hits++; attempts++; streak++;
      if (streak > bestStreak) bestStreak = streak;
      updatePanel();
      checkBadges();
    },
    recordMiss: () => {
      attempts++; streak = 0;
      updatePanel();
      checkBadges();
    },
    save: () => localStorage.setItem(STORAGE_KEY, JSON.stringify({ hits, attempts, bestStreak, difficulty })),
    load: () => {
      const s = localStorage.getItem(STORAGE_KEY);
      if (s) {
        const d = JSON.parse(s);
        hits = d.hits || 0; attempts = d.attempts || 0;
        bestStreak = d.bestStreak || 0; difficulty = d.difficulty || 'rookie';
        updatePanel();
      }
    },
  };
}
