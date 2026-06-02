export function createMainMenu(scene, avatar) {
  // Shift avatar right so it frames nicely in the right half of the viewport
  if (avatar) avatar.position.set(2.5, 0.6, 3);

  const s       = JSON.parse(localStorage.getItem('drillStats')    || '{}');
  const profile = JSON.parse(localStorage.getItem('avatarProfile') || '{}');

  const hits       = s.hits       || 0;
  const attempts   = s.attempts   || 0;
  const bestStreak = s.bestStreak || 0;
  const pct        = attempts > 0 ? Math.round(hits / attempts * 100) : 0;
  const diffLabel  = { rookie: 'Rookie', pro: 'Pro', allstar: 'All-Star' }[s.difficulty || 'rookie'];

  const playerName = profile.jerseyName || null;
  const jerseyNum  = profile.jerseyNum  || '';

  const greeting = playerName
    ? `Welcome back, <strong style="color:#FEC325;">${playerName}${jerseyNum ? ` #${jerseyNum}` : ''}</strong>`
    : `Let's play ball!`;

  function statChip(label, value) {
    return `
      <div style="background:rgba(254,195,37,0.1);border:1px solid rgba(254,195,37,0.25);
                  border-radius:8px;padding:10px 14px;text-align:center;flex:1;">
        <div style="font-size:1.5em;font-weight:bold;color:#FEC325;line-height:1;">${value}</div>
        <div style="font-size:0.68em;color:rgba(255,255,255,0.55);text-transform:uppercase;
                    letter-spacing:1px;margin-top:3px;">${label}</div>
      </div>`;
  }

  function drillCard(icon, title, desc, search) {
    return `
      <button data-href="${search}" style="
        background:rgba(255,255,255,0.05);border:1px solid rgba(254,195,37,0.2);
        border-radius:10px;padding:14px 18px;cursor:pointer;text-align:left;width:100%;
        color:white;font-family:sans-serif;display:flex;align-items:center;gap:14px;
        transition:background 0.15s,border-color 0.15s;"
        onmouseover="this.style.background='rgba(254,195,37,0.1)';this.style.borderColor='rgba(254,195,37,0.5)'"
        onmouseout="this.style.background='rgba(255,255,255,0.05)';this.style.borderColor='rgba(254,195,37,0.2)'">
        <span style="font-size:1.8em;flex-shrink:0;">${icon}</span>
        <div style="flex:1;">
          <div style="font-weight:bold;font-size:0.95em;">${title}</div>
          <div style="font-size:0.78em;color:rgba(255,255,255,0.55);margin-top:2px;">${desc}</div>
        </div>
        <span style="color:#FEC325;font-size:1.1em;flex-shrink:0;">›</span>
      </button>`;
  }

  const panel = document.createElement('div');
  panel.id = 'main-menu';
  panel.style.cssText = `
    position:fixed;top:0;left:0;width:50%;height:100%;z-index:300;
    background:linear-gradient(to right, #001635 82%, rgba(0,22,53,0) 100%);
    color:white;font-family:sans-serif;
    display:flex;flex-direction:column;justify-content:center;
    padding:0 44px 0 48px;box-sizing:border-box;
  `;

  panel.innerHTML = `
    <div style="font-size:0.7em;letter-spacing:3px;text-transform:uppercase;
                color:#FEC325;margin-bottom:8px;">⚾ Petco Park</div>

    <h1 style="font-size:2.8em;font-weight:900;line-height:1.05;margin:0 0 10px;
               text-shadow:0 2px 12px rgba(0,0,0,0.4);">Baseball<br>Drills</h1>

    <p style="font-size:0.95em;color:rgba(255,255,255,0.75);margin:0 0 26px;">
      ${greeting}
    </p>

    <div style="display:flex;gap:10px;margin-bottom:28px;">
      ${statChip('Hits', hits)}
      ${statChip('Avg', pct + '%')}
      ${statChip('Best Streak', bestStreak)}
    </div>

    <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:28px;">
      ${drillCard('⚾', 'Hitting Drill',  'Time your swing against pitches', '?drill=hitting')}
      ${drillCard('🏃', 'Base Running',   'Race throws from the outfield',   '?drill=bases')}
      ${drillCard('🧤', 'Fielding Drill', 'Chase down fly balls',            '?drill=fielding')}
    </div>

    <div style="font-size:0.78em;color:rgba(255,255,255,0.4);border-top:1px solid rgba(255,255,255,0.08);
                padding-top:16px;">
      Difficulty: <span style="color:#FEC325;">${diffLabel}</span>
      <span style="margin:0 8px;opacity:0.4;">·</span>
      ${attempts} plays · Customize your player in the panel →
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
