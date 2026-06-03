const BADGE_DEFS = [
  { id: 'first_hit',  icon: '⚾', label: 'First Hit' },
  { id: 'streak_3',   icon: '🔥', label: 'Hot Streak' },
  { id: 'streak_5',   icon: '🌶️', label: 'On Fire' },
  { id: 'hits_10',    icon: '💪', label: '10 Hits' },
  { id: 'hits_25',    icon: '🌟', label: '25 Hits' },
  { id: 'best_10',    icon: '🏆', label: 'Streak of 10' },
];

export function createMainMenu(scene, avatarObj) {
  const avatar = avatarObj ? avatarObj.avatar : null;
  if (avatar) avatar.position.set(2.5, 0.6, 3);

  // Aggregate stats from per-drill keys
  const DRILL_KEYS = ['hitting', 'bases', 'fielding'];
  let totalHits = 0, totalAttempts = 0, totalBest = 0;
  DRILL_KEYS.forEach(k => {
    const s = JSON.parse(localStorage.getItem('drillStats_' + k) || '{}');
    totalHits     += s.hits       || 0;
    totalAttempts += s.attempts   || 0;
    totalBest      = Math.max(totalBest, s.bestStreak || 0);
  });
  const totalPct = totalAttempts > 0 ? Math.round(totalHits / totalAttempts * 100) : 0;

  const profile    = JSON.parse(localStorage.getItem('avatarProfile') || '{}');
  const playerName = profile.jerseyName || null;
  const jerseyNum  = profile.jerseyNum  || '';
  const unlocked   = JSON.parse(localStorage.getItem('badges') || '[]');

  // Read the shared difficulty label from any saved drill
  const anyStats  = JSON.parse(localStorage.getItem('drillStats_hitting') || '{}');
  const diffLabel = { rookie: 'Rookie', pro: 'Pro', allstar: 'All-Star' }[anyStats.difficulty || 'rookie'];

  const greeting = playerName
    ? `Welcome back, <strong style="color:#FEC325;">${playerName}${jerseyNum ? ` #${jerseyNum}` : ''}</strong>`
    : `Let's play ball!`;

  function drillStats(key) {
    const s = JSON.parse(localStorage.getItem('drillStats_' + key) || '{}');
    const h = s.hits || 0, a = s.attempts || 0;
    if (!a) return '<span style="color:rgba(255,255,255,0.3);font-size:0.75em;">Not played yet</span>';
    return `<span style="color:#FEC325;font-size:0.75em;">${h} hits · ${Math.round(h/a*100)}% avg</span>`;
  }

  function statChip(label, value) {
    return `
      <div style="background:rgba(254,195,37,0.1);border:1px solid rgba(254,195,37,0.25);
                  border-radius:8px;padding:10px 14px;text-align:center;flex:1;">
        <div style="font-size:1.5em;font-weight:bold;color:#FEC325;line-height:1;">${value}</div>
        <div style="font-size:0.68em;color:rgba(255,255,255,0.55);text-transform:uppercase;
                    letter-spacing:1px;margin-top:3px;">${label}</div>
      </div>`;
  }

  function drillCard(icon, title, desc, search, statsKey) {
    return `
      <button data-href="${search}" style="
        background:rgba(255,255,255,0.05);border:1px solid rgba(254,195,37,0.2);
        border-radius:10px;padding:14px 18px;cursor:pointer;text-align:left;width:100%;
        color:white;font-family:sans-serif;display:flex;align-items:center;gap:14px;"
        onmouseover="this.style.background='rgba(254,195,37,0.1)';this.style.borderColor='rgba(254,195,37,0.5)'"
        onmouseout="this.style.background='rgba(255,255,255,0.05)';this.style.borderColor='rgba(254,195,37,0.2)'">
        <span style="font-size:1.8em;flex-shrink:0;">${icon}</span>
        <div style="flex:1;">
          <div style="font-weight:bold;font-size:0.95em;">${title}</div>
          <div style="font-size:0.78em;color:rgba(255,255,255,0.5);margin-top:1px;">${desc}</div>
          <div style="margin-top:4px;">${drillStats(statsKey)}</div>
        </div>
        <span style="color:#FEC325;font-size:1.1em;flex-shrink:0;">›</span>
      </button>`;
  }

  const badgeRow = BADGE_DEFS.map(b =>
    `<span title="${b.label}" style="font-size:1.5em;opacity:${unlocked.includes(b.id) ? '1' : '0.18'};
      cursor:default;transition:transform 0.15s;"
      onmouseover="this.style.transform='scale(1.3)'"
      onmouseout="this.style.transform='scale(1)'">${b.icon}</span>`
  ).join('');

  const panel = document.createElement('div');
  panel.id = 'main-menu';
  panel.style.cssText = `
    position:fixed;top:0;left:0;width:50%;height:100%;z-index:300;
    background:linear-gradient(to right, #001635 82%, rgba(0,22,53,0) 100%);
    color:white;font-family:sans-serif;
    display:flex;flex-direction:column;justify-content:center;
    padding:0 44px 0 48px;box-sizing:border-box;overflow-y:auto;
  `;

  panel.innerHTML = `
    <img src="/textures/avatar.jpg" alt="Your player" style="
      width:110px;height:110px;object-fit:cover;object-position:top;
      border-radius:50%;border:3px solid #FEC325;
      box-shadow:0 4px 20px rgba(0,0,0,0.5);margin-bottom:14px;display:block;
    "/>

    <div style="font-size:0.7em;letter-spacing:3px;text-transform:uppercase;
                color:#FEC325;margin-bottom:8px;">⚾ Petco Park</div>

    <h1 style="font-size:2.8em;font-weight:900;line-height:1.05;margin:0 0 10px;
               text-shadow:0 2px 12px rgba(0,0,0,0.4);">Baseball<br>Drills</h1>

    <p style="font-size:0.95em;color:rgba(255,255,255,0.75);margin:0 0 22px;">${greeting}</p>

    <div style="display:flex;gap:10px;margin-bottom:24px;">
      ${statChip('Hits', totalHits)}
      ${statChip('Avg', totalPct + '%')}
      ${statChip('Best Streak', totalBest)}
    </div>

    <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:20px;">
      ${drillCard('⚾', 'Hitting Drill',  'Time your swing against pitches', '?drill=hitting',  'hitting')}
      ${drillCard('🏃', 'Base Running',   'Race throws from the outfield',   '?drill=bases',    'bases')}
      ${drillCard('🧤', 'Fielding Drill', 'Chase down fly balls',            '?drill=fielding', 'fielding')}
    </div>

    <div style="display:flex;gap:6px;margin-bottom:16px;">${badgeRow}</div>

    <div style="font-size:0.75em;color:rgba(255,255,255,0.35);border-top:1px solid rgba(255,255,255,0.07);padding-top:14px;">
      Difficulty: <span style="color:#FEC325;">${diffLabel}</span>
      <span style="margin:0 8px;opacity:0.4;">·</span>
      ${totalAttempts} total plays · Customize your player →
    </div>
  `;

  document.body.appendChild(panel);

  panel.querySelectorAll('[data-href]').forEach(btn => {
    btn.addEventListener('click', () => { window.location.search = btn.dataset.href; });
  });

  function update() {
    if (avatar) avatar.rotation.y += 0.008;
  }

  return { update };
}
