let S = JSON.parse(localStorage.getItem('todoPlantState')) || {
  coins: 150, streak: 3, wateringCharges: 0, plantXp: 0, plantStage: 0,
  equipped: { shoes: 0, shirt: 0, acc: -1, hat: -1 },
  owned: { shoes: [0], shirt: [0], acc: [], hat: [] },
  tasks: [
    { id: 1, text: 'Tugas Calculus', date: '2026-05-29', done: false, gcal: true, info: ['2 soal integral', '3 soal limit', '2 soal fungsi', '2 soal volume', '1 soal penerapan'] },
    { id: 2, text: 'Tugas Data Structure', date: '2026-06-11', done: false, gcal: false, info: ['Bikin logic AVL Tree', 'Buat visualisasi struct'] }
  ]
};

const defaultAvatarConfig = { hair: 'braid_bangs', hairColor: 'brown', outfit: 'white_top_redbow', bottom: 'pink_shorts', shoes: 'red_shoes', accessory: null };
let avatarConfig = { ...defaultAvatarConfig };
let avatarDraft = { ...defaultAvatarConfig };
const defaultAvatarOwned = { hair: ['braid_bangs'], outfit: ['white_top_redbow'], bottom: ['pink_shorts'], shoes: ['red_shoes'], accessory: [null] };
let avatarOwned = { ...defaultAvatarOwned };
let pendingAvatarPurchase = null;
const avatarChoices = {
  hair: [{ id: 'braid_bangs', label: 'Braid', icon: '👧', price: 0 }, { id: 'short_bangs', label: 'Short', icon: '👩', price: 30 }, { id: 'curly_bob', label: 'Curly', icon: '🧑', price: 45 }],
  outfit: [{ id: 'white_top_redbow', label: 'Ribbon top', icon: '🎀', price: 0 }, { id: 'yellow_top', label: 'Sunny top', icon: '🌼', price: 70 }, { id: 'blue_hoodie', label: 'Hoodie', icon: '🧥', price: 90 }],
  bottom: [{ id: 'pink_shorts', label: 'Pink shorts', icon: '🩳', price: 0 }, { id: 'blue_skirt', label: 'Blue skirt', icon: '👗', price: 50 }, { id: 'cream_pants', label: 'Pants', icon: '👖', price: 60 }],
  shoes: [{ id: 'red_shoes', label: 'Red shoes', icon: '👟', price: 0 }, { id: 'brown_boots', label: 'Boots', icon: '🥾', price: 40 }, { id: 'white_sneakers', label: 'Sneakers', icon: '👟', price: 25 }],
  accessory: [{ id: null, label: 'None', icon: '✦', price: 0 }, { id: 'glasses', label: 'Glasses', icon: '👓', price: 30 }, { id: 'flower', label: 'Flower', icon: '🌸', price: 35 }]
};

function loadAvatar() {
  try {
    const saved = JSON.parse(localStorage.getItem('userAvatarConfig'));
    if (saved && typeof saved === 'object') avatarConfig = { ...defaultAvatarConfig, ...saved };
  } catch (error) { avatarConfig = { ...defaultAvatarConfig }; }
  try {
    const savedOwned = JSON.parse(localStorage.getItem('userAvatarOwned'));
    if (savedOwned && typeof savedOwned === 'object') avatarOwned = { ...defaultAvatarOwned, ...savedOwned };
  } catch (error) { avatarOwned = { ...defaultAvatarOwned }; }
  avatarDraft = { ...avatarConfig };
}

function completeAvatarPurchase(category, choice) {
  S.coins -= choice.price;
  avatarOwned[category].push(choice.id);
  localStorage.setItem('userAvatarOwned', JSON.stringify(avatarOwned));
  saveState();
  syncGlobalStats();
  showToast(`${choice.label} berhasil dibeli!`);
}

function showAvatarPurchaseConfirm(category, choice) {
  pendingAvatarPurchase = { category, choice };
  document.getElementById('avatar-purchase-title').textContent = `Buy ${choice.label}?`;
  document.getElementById('avatar-purchase-message').textContent = 'This item will be added to your avatar collection.';
  document.getElementById('avatar-purchase-price').textContent = choice.price;
  const modal = document.getElementById('avatar-purchase-modal');
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
}

function cancelAvatarPurchase() {
  pendingAvatarPurchase = null;
  const modal = document.getElementById('avatar-purchase-modal');
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
}

function confirmAvatarPurchase() {
  if (!pendingAvatarPurchase) return;
  const { category, choice } = pendingAvatarPurchase;
  cancelAvatarPurchase();
  completeAvatarPurchase(category, choice);
  avatarDraft[category] = choice.id;
  renderAvatarOptions(category);
  renderAvatarPreview('avatar-customize');
}

function buyAvatarChoice(category, choice) {
  if (avatarOwned[category].includes(choice.id)) return true;
  if (S.coins < choice.price) {
    showToast(`Koin tidak cukup untuk membeli ${choice.label}.`);
    return false;
  }
  if (choice.price > 0) {
    showAvatarPurchaseConfirm(category, choice);
    return false;
  }
  completeAvatarPurchase(category, choice);
  return true;
}

function avatarVisual(config) {
  const outfitColors = { white_top_redbow: '#fffdf6', yellow_top: '#f5cf62', blue_hoodie: '#85b7eb' };
  const bottomColors = { pink_shorts: '#d88ab6', blue_skirt: '#78acd7', cream_pants: '#e8d5ab' };
  const shoeColors = { red_shoes: '#c84b6a', brown_boots: '#8b5e3c', white_sneakers: '#f5f5f5' };
  const shirt = outfitColors[config.outfit] || outfitColors.white_top_redbow;
  const bottom = bottomColors[config.bottom] || bottomColors.pink_shorts;
  const shoes = shoeColors[config.shoes] || shoeColors.red_shoes;
  const hairBack = config.hair === 'short_bangs' ? '<path d="M18 55Q17 10 55 8Q94 10 93 55L84 74H25Z" fill="#bd9878" stroke="#171717" stroke-width="1.5"/>' : config.hair === 'curly_bob' ? '<circle cx="21" cy="43" r="15" fill="#bd9878" stroke="#171717" stroke-width="1.5"/><circle cx="89" cy="43" r="15" fill="#bd9878" stroke="#171717" stroke-width="1.5"/><path d="M18 55Q17 10 55 8Q94 10 93 55L84 74H25Z" fill="#bd9878" stroke="#171717" stroke-width="1.5"/>' : '<path d="M18 55Q17 10 55 8Q94 10 93 55L84 76H25Z" fill="#bd9878" stroke="#171717" stroke-width="1.5"/><path d="M25 48Q9 63 17 82Q10 96 20 106Q10 119 23 125Q14 139 27 143Q34 130 38 114Q32 96 36 78Z" fill="#bd9878" stroke="#171717" stroke-width="1.5"/>';
  const hairFront = config.hair === 'short_bangs' ? '<path d="M19 45Q25 13 55 12Q84 13 92 45Q83 38 75 38L73 53L66 38L59 54L53 38L47 53L41 37L34 52L29 39Z" fill="#bd9878" stroke="#171717" stroke-width="1.5" stroke-linejoin="round"/>' : config.hair === 'curly_bob' ? '<path d="M19 45Q25 13 55 12Q84 13 92 45Q83 38 75 38L73 53L66 38L59 54L53 38L47 53L41 37L34 52L29 39Z" fill="#bd9878" stroke="#171717" stroke-width="1.5" stroke-linejoin="round"/>' : '<path d="M19 45Q25 13 55 12Q84 13 92 45Q83 38 75 38L73 53L66 38L59 54L53 38L47 53L41 37L34 52L29 39Z" fill="#bd9878" stroke="#171717" stroke-width="1.5" stroke-linejoin="round"/><path d="M22 48Q15 61 20 76" fill="none" stroke="#171717" stroke-width="1.5" stroke-linecap="round"/>';
  const accessory = config.accessory === 'glasses' ? '<circle cx="39" cy="58" r="7" fill="none" stroke="#3a2a35" stroke-width="2"/><circle cx="71" cy="58" r="7" fill="none" stroke="#3a2a35" stroke-width="2"/><path d="M46 58h18" stroke="#3a2a35" stroke-width="2"/>' : config.accessory === 'flower' ? '<circle cx="78" cy="23" r="5" fill="#ff8da1"/><circle cx="84" cy="23" r="5" fill="#ff8da1"/><circle cx="81" cy="18" r="5" fill="#ff8da1"/><circle cx="81" cy="24" r="3" fill="#f5c84b"/>' : '';
  return `${hairBack}<path d="M20 47Q20 20 55 19Q90 20 90 47L88 70Q86 87 55 88Q24 87 22 70Z" fill="#fff5df" stroke="#171717" stroke-width="1.5"/><path d="M45 87Q48 98 55 99Q62 98 65 87" fill="#fff5df" stroke="#171717" stroke-width="1.5"/><path d="M30 106Q35 98 42 96L68 96Q76 98 80 106L88 133Q84 140 76 137L72 119L75 145Q70 151 55 151Q40 151 35 145L38 119L34 137Q26 140 22 133Z" fill="${shirt}" stroke="#171717" stroke-width="1.5" stroke-linejoin="round"/><path d="M34 137Q27 137 25 131" fill="none" stroke="#171717" stroke-width="1.5" stroke-linecap="round"/><path d="M76 137Q83 137 85 131" fill="none" stroke="#171717" stroke-width="1.5" stroke-linecap="round"/><path d="M45 98L55 107L65 98" fill="none" stroke="#171717" stroke-width="1.2"/><path d="M51 101L55 108L59 101" fill="none" stroke="#e31b2f" stroke-width="2" stroke-linecap="round"/><path d="M38 145Q55 149 72 145L71 166Q64 172 55 167Q46 172 39 166Z" fill="${bottom}" stroke="#171717" stroke-width="1.5"/><path d="M42 168L48 168L47 179Q39 181 38 176Z" fill="#fff5df" stroke="#171717" stroke-width="1.5"/><path d="M62 168L68 168L72 176Q71 181 63 179Z" fill="#fff5df" stroke="#171717" stroke-width="1.5"/><ellipse cx="43" cy="178" rx="6" ry="3" fill="${shoes}" stroke="#171717" stroke-width="1.5"/><ellipse cx="68" cy="178" rx="6" ry="3" fill="${shoes}" stroke="#171717" stroke-width="1.5"/><ellipse cx="39" cy="58" rx="3.5" ry="5.5" fill="#171717"/><ellipse cx="71" cy="58" rx="3.5" ry="5.5" fill="#171717"/><ellipse cx="34" cy="70" rx="5" ry="2.5" fill="#e87591"/><ellipse cx="76" cy="70" rx="5" ry="2.5" fill="#e87591"/><path d="M45 69Q55 76 65 69Q65 82 55 83Q45 82 45 69Z" fill="#f38fa4" stroke="#171717" stroke-width="1.5" stroke-linejoin="round"/>${hairFront}${accessory}`;
}

function renderAvatarPreview(id) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = avatarVisual(avatarDraft);
}

function renderAvatarOptions(category) {
  const list = document.getElementById('avatar-options');
  if (!list) return;
  list.innerHTML = avatarChoices[category].map(choice => { const owned = avatarOwned[category].includes(choice.id); const priceLabel = owned ? 'Owned' : choice.price ? `🪙 ${choice.price}` : 'Free'; return `<button class="avatar-option ${avatarDraft[category] === choice.id ? 'selected' : ''}" data-avatar-category="${category}" data-avatar-id="${choice.id || ''}" type="button"><span class="avatar-option-visual">${choice.icon}</span><strong>${choice.label}</strong><small>${priceLabel}</small></button>`; }).join('');
  list.querySelectorAll('.avatar-option').forEach(option => option.addEventListener('click', () => {
    const choice = avatarChoices[category].find(item => String(item.id || '') === option.dataset.avatarId);
    if (!choice || !buyAvatarChoice(category, choice)) return;
    avatarDraft[category] = choice.id;
    renderAvatarOptions(category);
    renderAvatarPreview('avatar-customize');
  }));
}

function openCustomizeModal() {
  const modal = document.getElementById('avatar-modal');
  if (!modal) return;
  avatarDraft = { ...avatarConfig };
  syncGlobalStats();
  modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false');
  renderAvatarOptions('hair'); renderAvatarPreview('avatar-customize');
  document.querySelectorAll('.avatar-category-tab').forEach(tab => tab.classList.toggle('active', tab.dataset.category === 'hair'));
}

function closeCustomizeModal() {
  const modal = document.getElementById('avatar-modal');
  if (!modal) return;
  avatarDraft = { ...avatarConfig }; modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true');
}

function saveAvatar() {
  avatarConfig = { ...defaultAvatarConfig, ...avatarDraft };
  localStorage.setItem('userAvatarConfig', JSON.stringify(avatarConfig));
  document.querySelectorAll('[id^="avatar-"]').forEach(el => { if (el.id !== 'avatar-customize') el.innerHTML = avatarVisual(avatarConfig); });
  closeCustomizeModal();
}

loadAvatar();

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.avatar-category-tab').forEach(tab => tab.addEventListener('click', () => {
    document.querySelectorAll('.avatar-category-tab').forEach(item => item.classList.remove('active'));
    tab.classList.add('active');
    renderAvatarOptions(tab.dataset.category);
  }));
  const modal = document.getElementById('avatar-modal');
  if (modal) modal.addEventListener('click', event => { if (event.target === modal) closeCustomizeModal(); });
});

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
  if (avatarConfig && id.indexOf('avatar-') === 0) {
    el.innerHTML = avatarVisual(avatarConfig);
    return;
  }
  const colors = { shirt: ['#A8D87A', '#F4C0C0', '#85B7EB'], shoes: ['#8B5E3C', '#C84B6A', '#4A3520'] };
  const sc = S.equipped.shirt >= 0 ? colors.shirt[S.equipped.shirt] : '#A8D87A';
  const ec = S.equipped.shoes >= 0 ? colors.shoes[S.equipped.shoes] : '#8B5E3C';
  el.innerHTML = avatarSVG(sc, ec, S.equipped.hat >= 0, S.equipped.acc >= 0);
}

function syncGlobalStats() {
  // Sync paksa dari localStorage (biar update saat ganti kostum)
  S = JSON.parse(localStorage.getItem('todoPlantState')) || S;
  
  const cCoin = document.getElementById('global-coin');
  const modalCoin = document.getElementById('avatar-modal-coin');
  const cWater = document.getElementById('global-water-charge');
  const cStreak = document.getElementById('global-streak');
  if (cCoin) cCoin.textContent = S.coins;
  if (modalCoin) modalCoin.textContent = S.coins;
  if (cWater) cWater.textContent = S.wateringCharges;
  if (cStreak) cStreak.textContent = S.streak;
}