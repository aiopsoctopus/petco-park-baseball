export function createUI(headMat, bodyMat) {
  const panel = document.createElement('div');
  panel.style.cssText = `
    position: fixed; top: 20px; right: 20px; background: rgba(0,0,0,0.8);
    color: white; padding: 20px; border-radius: 12px; width: 220px;
    font-family: sans-serif; z-index: 100;
  `;

  panel.innerHTML = `
    <h3 style="margin:0 0 16px;color:#FEC325;">⚾ Your Player</h3>

    <label style="display:block;margin-bottom:8px;font-size:0.85em;">Skin Tone</label>
    <div id="skin-swatches" style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px;">
      ${['#FDDBB4','#F1C27D','#E0AC69','#C68642','#8D5524','#4A2912'].map(c =>
        `<div data-color="${c}" style="width:28px;height:28px;border-radius:50%;background:${c};cursor:pointer;border:2px solid transparent;"></div>`
      ).join('')}
    </div>

    <label style="display:block;margin-bottom:8px;font-size:0.85em;">Hair Color</label>
    <div id="hair-swatches" style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px;">
      ${['#1a1a1a','#4a2e1a','#b07030','#d4a843','#e8e8e8','#8B0000','#1a3a8f','#2d8b45'].map(c =>
        `<div data-color="${c}" style="width:28px;height:28px;border-radius:50%;background:${c};cursor:pointer;border:2px solid transparent;"></div>`
      ).join('')}
    </div>

    <label style="display:block;margin-bottom:8px;font-size:0.85em;">Jersey Number</label>
    <input id="jersey-num" type="number" min="0" max="99" value="1"
      style="width:100%;padding:6px;border-radius:6px;border:none;font-size:1.1em;text-align:center;margin-bottom:16px;">

    <label style="display:block;margin-bottom:8px;font-size:0.85em;">Name on Jersey</label>
    <input id="jersey-name" type="text" maxlength="12" placeholder="Your name"
      style="width:100%;padding:6px;border-radius:6px;border:none;font-size:1em;margin-bottom:16px;">

    <button id="save-avatar" style="width:100%;padding:10px;background:#FEC325;color:#002D62;
      font-weight:bold;border:none;border-radius:8px;cursor:pointer;font-size:1em;">
      Save Player
    </button>
  `;

  document.body.appendChild(panel);

  // Skin tone clicks
  document.getElementById('skin-swatches').addEventListener('click', e => {
    if (e.target.dataset.color) {
      headMat.color.set(e.target.dataset.color);
      document.querySelectorAll('#skin-swatches div').forEach(d => d.style.border = '2px solid transparent');
      e.target.style.border = '2px solid white';
    }
  });

  // Save to LocalStorage
  document.getElementById('save-avatar').addEventListener('click', () => {
    const data = {
      skinColor: '#' + headMat.color.getHexString(),
      jerseyNum: document.getElementById('jersey-num').value,
      jerseyName: document.getElementById('jersey-name').value,
    };
    localStorage.setItem('avatarProfile', JSON.stringify(data));
    document.getElementById('save-avatar').textContent = '✓ Saved!';
    setTimeout(() => document.getElementById('save-avatar').textContent = 'Save Player', 2000);
  });

  // Load saved profile
  const saved = localStorage.getItem('avatarProfile');
  if (saved) {
    const data = JSON.parse(saved);
    headMat.color.set(data.skinColor);
    document.getElementById('jersey-num').value = data.jerseyNum;
    document.getElementById('jersey-name').value = data.jerseyName;
  }
setTimeout(() => {
  const saved = localStorage.getItem('avatarProfile');
  if (saved) {
    const data = JSON.parse(saved);
    headMat.color.set(data.skinColor);
    document.getElementById('jersey-num').value = data.jerseyNum;
    document.getElementById('jersey-name').value = data.jerseyName;
  }
}, 100);
}