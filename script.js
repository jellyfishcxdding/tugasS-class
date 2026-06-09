let S = JSON.parse(localStorage.getItem('todoPlantState')) || {
  coins: 120, streak: 3, wateringCharges: 0, plantXp: 0, plantStage: 0,
  equipped: { shoes: 0, shirt: 0, acc: -1, hat: -1 },
  owned: { shoes: [0], shirt: [0], acc: [], hat: [] },
  tasks: [
    { id: 1, text: 'Tugas Calculus', date: '2026-05-29', done: false, gcal: true, info: ['2 soal integral', '3 soal limit', '2 soal fungsi', '2 soal volume', '1 soal penerapan'] },
    { id: 2, text: 'Tugas Data Structure', date: '2026-06-11', done: false, gcal: false, info: ['Bikin logic AVL Tree', 'Buat visualisasi struct'] }
  ]
};

function saveState() { localStorage.setItem('todoPlantState', JSON.stringify(S)); }
function goTo(page) { window.location.href = page; }

function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

function triggerCamera(taskId) {
  const input = document.createElement('input');
  input.type = 'file'; input.accept = 'image/*'; input.capture = 'environment';
  input.onchange = (e) => {
    if (e.target.files.length) {
      const t = S.tasks.find(x => x.id === taskId);
      if (t && !t.done) {
        t.done = true; S.coins += 20;
        if (S.tasks.every(x => x.done === true)) S.wateringCharges += 1;
        saveState(); location.reload();
      }
    }
  };
  input.click();
}

function avatarSVG(shirtCol, shoesCol, hatOn, accOn) {
  const hat = hatOn ? `<rect x="25" y="10" width="60" height="10" rx="5" fill="#3a2a35"/><rect x="35" y="0" width="40" height="15" rx="5" fill="#3a2a35"/>` : '';
  const acc = accOn ? `<circle cx="38" cy="60" r="6" fill="none" stroke="#3a2a35" stroke-width="2"/><circle cx="72" cy="60" r="6" fill="none" stroke="#3a2a35" stroke-width="2"/><line x1="44" y1="60" x2="66" y2="60" stroke="#3a2a35" stroke-width="2"/>` : '';
  return `
    <ellipse cx="35" cy="150" rx="12" ry="5" fill="${shoesCol}"/>
    <ellipse cx="75" cy="150" rx="12" ry="5" fill="${shoesCol}"/>
    <rect x="20" y="80" width="70" height="50" rx="15" fill="${shirtCol}"/>
    <ellipse cx="55" cy="50" rx="30" ry="30" fill="#FDDBB4"/>
    <circle cx="45" cy="48" r="4" fill="#3a2a35"/>
    <circle cx="65" cy="48" r="4" fill="#3a2a35"/>
    <path d="M48 65 Q55 72 62 65" stroke="#c97a90" stroke-width="3" fill="none" stroke-linecap="round"/>
    ${hat}${acc}
  `;
}

function renderAvatar(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const colors = { shirt: ['#F4C0C0', '#A8D87A', '#85B7EB'], shoes: ['#8B5E3C', '#C84B6A', '#4A3520'] };
  const sc = S.equipped.shirt >= 0 ? colors.shirt[S.equipped.shirt] : '#F4C0C0';
  const ec = S.equipped.shoes >= 0 ? colors.shoes[S.equipped.shoes] : '#8B5E3C';
  el.innerHTML = avatarSVG(sc, ec, S.equipped.hat >= 0, S.equipped.acc >= 0);
}

function syncGlobalStats() {
  const cCoin = document.getElementById('global-coin');
  const cWater = document.getElementById('global-water-charge');
  const cStreak = document.getElementById('global-streak');
  if (cCoin) cCoin.textContent = S.coins;
  if (cWater) cWater.textContent = S.wateringCharges;
  if (cStreak) cStreak.textContent = S.streak;
}