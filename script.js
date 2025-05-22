const APR = 50; // persen per tahun
const maxSupply = 500_000_000;
let data = {
  balance: 1000000,  // mulai dengan 1 juta token gratis
  staked: 0,
  reward: 0,
  lastClaim: Date.now(),
  totalSupply: 1000000, // token yang sudah beredar awal
};

// Cek apakah data ada di localStorage
if(localStorage.getItem('stakingData')) {
  data = JSON.parse(localStorage.getItem('stakingData'));
  updateReward();
} else {
  saveData();
}

function saveData() {
  localStorage.setItem('stakingData', JSON.stringify(data));
  updateUI();
}

function updateUI() {
  document.getElementById('balance').innerText = data.balance.toFixed(4);
  document.getElementById('staked').innerText = data.staked.toFixed(4);
  document.getElementById('reward').innerText = data.reward.toFixed(4);
}

function nowSeconds() {
  return Date.now();
}

function updateReward() {
  let now = nowSeconds();
  let secondsPassed = (now - data.lastClaim) / 1000;
  if(data.staked > 0 && secondsPassed > 0) {
    let yearlyReward = data.staked * (APR / 100);
    let perSecondReward = yearlyReward / (365 * 24 * 60 * 60);
    let rewardEarned = perSecondReward * secondsPassed;

    // Pastikan totalSupply tidak lebih dari maxSupply
    if(data.totalSupply + rewardEarned > maxSupply) {
      rewardEarned = Math.max(0, maxSupply - data.totalSupply);
    }

    data.reward += rewardEarned;
    data.totalSupply += rewardEarned;
  }
  data.lastClaim = now;
  saveData();
}

function stake() {
  updateReward();
  let amt = parseFloat(document.getElementById('stakeAmount').value);
  if(isNaN(amt) || amt <= 0) {
    alert('Masukkan jumlah stake yang valid!');
    return;
  }
  if(amt > data.balance) {
    alert('Saldo tidak cukup!');
    return;
  }
  data.balance -= amt;
  data.staked += amt;
  log('Stake ' + amt.toFixed(4) + ' token');
  saveData();
}

function claimReward() {
  updateReward();
  if(data.reward <= 0) {
    alert('Tidak ada reward yang bisa diklaim');
    return;
  }
  data.balance += data.reward;
  log('Claim reward ' + data.reward.toFixed(4) + ' token');
  data.reward = 0;
  saveData();
}

function transferToken() {
  let amt = parseFloat(document.getElementById('transferAmount').value);
  let user = document.getElementById('transferUser').value.trim();
  if(isNaN(amt) || amt <= 0) {
    alert('Masukkan jumlah transfer yang valid!');
    return;
  }
  if(amt > data.balance) {
    alert('Saldo tidak cukup!');
    return;
  }
  if(user === '') {
    alert('Masukkan user ID tujuan!');
    return;
  }
  // Simulasi transfer (hanya log)
  data.balance -= amt;
  log(`Transfer ${amt.toFixed(4)} token ke user "${user}" (simulasi)`);
  saveData();
}

function log(msg) {
  let logDiv = document.getElementById('log');
  let time = new Date().toLocaleTimeString();
  logDiv.innerHTML += `[${time}] ${msg}<br>`;
  logDiv.scrollTop = logDiv.scrollHeight;
}

// Update reward setiap detik di background supaya UI update realtime
setInterval(() => {
  updateReward();
  updateUI();
}, 1000);

updateUI();
