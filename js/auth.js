// ===========================
//   LOGIN
// ===========================
function doLogin() {
  // Check lockout
  if (lockoutEnd && Date.now() < lockoutEnd) return;

  const u    = document.getElementById('loginUser').value.trim().toLowerCase();
  const p    = document.getElementById('loginPass').value;
  const data = USERS_DB[u];

  if (data && data.password === p) {
    loginAttempts = 0;
    document.getElementById('attemptsHint').textContent = '';
    document.getElementById('loginError').textContent   = '';
    // AutoSave username
    localStorage.setItem('nbSavedUser', u);
    // Stash user key for 2FA
    twoFAUser = u;
    show2FA(data);
  } else {
    loginAttempts++;
    const remaining = MAX_ATTEMPTS - loginAttempts;
    if (loginAttempts >= MAX_ATTEMPTS) {
      triggerLockout();
    } else {
      document.getElementById('loginError').textContent = 'Invalid username or password.';
      document.getElementById('attemptsHint').textContent =
        ??  attempt remaining before account lock;
    }
  }
}
document.getElementById('loginUser').addEventListener('keydown', e => { if(e.key==='Enter') document.getElementById('loginPass').focus(); });
document.getElementById('loginPass').addEventListener('keydown', e => { if(e.key==='Enter') doLogin(); });

function doLogout(reason) {
  clearInterval(sessionInterval); sessionInterval = null;
  document.getElementById('app').classList.add('hidden');
  document.getElementById('sessionBanner').classList.remove('show');
  document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('loginPass').value = '';
  document.getElementById('loginError').textContent = reason || '';
  document.getElementById('attemptsHint').textContent = '';
}

// ===========================
//   2FA
// ===========================
function show2FA(data) {
  twoFACode = String(Math.floor(100000 + Math.random() * 900000));
  document.getElementById('tfaPhone').textContent       = data.user.phone;
  document.getElementById('tfaCodeDisplay').textContent = twoFACode;
  document.getElementById('tfaError').textContent       = '';
  document.querySelectorAll('.code-digit').forEach(i => { i.value = ''; i.classList.remove('filled'); });
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('twoFAScreen').classList.remove('hidden');
  setTimeout(() => document.querySelector('.code-digit').focus(), 100);
}

function onDigitInput(el, idx) {
  el.value = el.value.replace(/\D/g, '');
  el.classList.toggle('filled', el.value.length > 0);
  if (el.value && idx < 5) document.querySelectorAll('.code-digit')[idx + 1].focus();
  if (idx === 5 && el.value) verify2FA();
}

function onDigitKey(e, idx) {
  if (e.key === 'Backspace' && !e.target.value && idx > 0)
    document.querySelectorAll('.code-digit')[idx - 1].focus();
}

function verify2FA() {
  const entered = [...document.querySelectorAll('.code-digit')].map(i => i.value).join('');
  if (entered.length < 6) { document.getElementById('tfaError').textContent = 'Please enter all 6 digits.'; return; }
  if (entered === twoFACode) {
    // Success — load user into state and enter app
    const data = USERS_DB[twoFAUser];
    Object.assign(STATE, JSON.parse(JSON.stringify({
      user: data.user, balances: data.balances, monthSpent: data.monthSpent,
      transactions: data.transactions, cards: data.cards, bills: data.bills,
      nexaUsers: data.nexaUsers, loans: data.loans,
    })));
    document.getElementById('twoFAScreen').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    lastActivity = Date.now();
    initApp();
  } else {
    document.getElementById('tfaError').textContent = '? Incorrect code. Please try again.';
    document.querySelectorAll('.code-digit').forEach(i => { i.value = ''; i.classList.remove('filled'); });
    document.querySelector('.code-digit').focus();
  }
}

function resend2FA() {
  const data = USERS_DB[twoFAUser];
  twoFACode = String(Math.floor(100000 + Math.random() * 900000));
  document.getElementById('tfaCodeDisplay').textContent = twoFACode;
  document.getElementById('tfaError').textContent = '? New code sent!';
  setTimeout(() => { document.getElementById('tfaError').textContent = ''; }, 3000);
}

function cancelTwoFA() {
  document.getElementById('twoFAScreen').classList.add('hidden');
  document.getElementById('loginScreen').classList.remove('hidden');
}

// ===========================
//   LOCKOUT
// ===========================
function triggerLockout() {
  loginAttempts = 0;
  lockoutEnd = Date.now() + LOCKOUT_SECS * 1000;
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('lockoutScreen').classList.remove('hidden');
  let remaining = LOCKOUT_SECS;
  updateLockoutDisplay(remaining);
  lockoutTimer = setInterval(() => {
    remaining--;
    updateLockoutDisplay(remaining);
    if (remaining <= 0) {
      clearInterval(lockoutTimer);
      lockoutEnd = null;
      document.getElementById('lockoutScreen').classList.add('hidden');
      document.getElementById('loginScreen').classList.remove('hidden');
      document.getElementById('loginError').textContent = '';
      document.getElementById('attemptsHint').textContent = '';
    }
  }, 1000);
}

function updateLockoutDisplay(secs) {
  const m = Math.floor(secs / 60), s = secs % 60;
  document.getElementById('lockoutTimer').textContent = ${m}:;
}

// ===========================
//   SESSION TIMEOUT
// ===========================
function startSessionTimer() {
  clearInterval(sessionInterval);
  lastActivity = Date.now();
  ['mousemove','keydown','click','scroll','touchstart'].forEach(e =>
    document.addEventListener(e, resetActivity, { passive: true }));

  sessionInterval = setInterval(() => {
    const idle = (Date.now() - lastActivity) / 1000;
    const timeLeft = SESSION_SECS - idle;
    const banner = document.getElementById('sessionBanner');
    const countdown = document.getElementById('sessionCountdown');

    if (timeLeft <= 0) {
      clearInterval(sessionInterval);
      doLogout('?? You were logged out due to inactivity.');
    } else if (timeLeft <= WARN_SECS) {
      banner.classList.add('show');
      countdown.textContent = Math.ceil(timeLeft);
    } else {
      banner.classList.remove('show');
    }
  }, 1000);
}

function resetActivity() { lastActivity = Date.now(); }

// ===========================
//   FORGOT PASSWORD
// ===========================
function openForgot() {
  document.getElementById('forgotModal').classList.remove('hidden');
  document.getElementById('forgotForm').classList.remove('hidden');
  document.getElementById('forgotSuccess').classList.add('hidden');
  document.getElementById('resetUser').value = document.getElementById('loginUser').value;
}

function closeForgot() { document.getElementById('forgotModal').classList.add('hidden'); }

function submitForgot() {
  const u = document.getElementById('resetUser').value.trim().toLowerCase();
  // Always show success (simulate email send regardless of whether user exists)
  document.getElementById('forgotForm').classList.add('hidden');
  document.getElementById('forgotSuccess').classList.remove('hidden');
}
