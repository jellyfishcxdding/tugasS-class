// Database State Utama terhubung ke LocalStorage
let S = JSON.parse(localStorage.getItem('todoPlantState')) || {
  coins: 120,
  streak: 3,
  wateringCharges: 0, // Kesempatan menyiram tanaman (didapat jika semua tugas selesai)
  plantXp: 0,
  plantStage: 0,
  equipped: { shoes: 0, shirt: 0, acc: -1, hat: -1 },
  owned: { shoes: [0, 1], shirt: [0], acc: [], hat: [] },
  tasks: [
    { id: 1, text: 'Beli kertas A4', date: '2026-06-08', done: false, gcal: true },
    { id: 2, text: 'Beli spidol warna', date: '2026-06-08', done: false, gcal: false }
  ]
};

function saveState() {
  localStorage.setItem('todoPlantState', JSON.stringify(S));
}

function goTo(page) {
  window.location.href = page;
}

// Komponen Render Avatar Vektor (SVG)
function avatarSVG(shirtCol, shoesCol, hatOn, accOn) {
  const hat = hatOn ? `<rect x="25" y="10" width="60" height="10" rx="5" fill="#3a2a35"/><rect x="35" y="0" width="40" height="15" rx="5" fill="#3a2a35"/>` : '';
  const acc = accOn ? `<circle cx="38" cy="60" r="6" fill="none" stroke="#3a2a35" stroke-width="2"/><circle cx="72" cy="60" r="6" fill="none" stroke="#3a2a35" stroke-width="2"/><line x1="44" y1="60" x2="66" y2="60" stroke="#3a2a35" stroke-width="2"/>` : '';
  return `
    <ellipse cx="35" cy="150" rx="12" ry="5" fill="${shoesCol}"/>
    <ellipse cx="75" cy="150" rx="12" ry="5" fill="${shoesCol}"/>
    <rect x="20" y="80" width="70" height="50" rx="10" fill="${shirtCol}"/>
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

// Sinkronisasi Indikator Ekonomi & Status Koin Atas
function syncGlobalStats() {
  const cCoin = document.getElementById('global-coin');
  const cWater = document.getElementById('global-water-charge');
  if (cCoin) cCoin.textContent = S.coins;
  if (cWater) cWater.textContent = S.wateringCharges;
}

// Logic Tuntasin Tugas Hari Ini (Dapat Koin + Pengecekan Total Selesai)
function toggleTaskState(id) {
  const task = S.tasks.find(t => t.id === id);
  if (!task || task.done) return;
  
  task.done = true;
  S.coins += 15; // Reward koin per tugas tuntas
  
  // Cek apakah semua tugas di list hari ini udah tuntas semua
  const allDone = S.tasks.every(t => t.done === true);
  if (allDone) {
    S.wateringCharges += 1; // Reward bonus siram tanaman 1 kali
    showToast('🏆 List Tuntas! +1 Batas Siram Tanaman');
  } else {
    showToast('✅ Tugas Selesai! +15 Koin');
  }
  
  saveState();
  syncGlobalStats();
  if (typeof renderTasks === 'function') renderTasks();
}

function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}