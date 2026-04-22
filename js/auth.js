// ===========================
//   LOGIN
// ===========================
function doLogin() {
  if (lockoutEnd && Date.now() < lockoutEnd) return;

  const username = document.getElementById('loginUser').value.trim().toLowerCase();
  const password = document.getElementById('loginPass').value;
  const account = USERS_DB[username];

  if (account && account.password === password) {
    loginAttempts = 0;
    document.getElementById('loginError').textContent = '';
    document.getElementById('attemptsHint').textContent = '';
    localStorage.setItem('nbSavedUser', username);
    twoFAUser = username;
    show2FA(account);
    return;
  }

  loginAttempts += 1;
  const remaining = MAX_ATTEMPTS - loginAttempts;

  if (loginAttempts >= MAX_ATTEMPTS) {
    triggerLockout();
    return;
  }

  document.getElementById('loginError').textContent = 'Invalid username or password.';
  document.getElementById('attemptsHint').textContent =
    `${remaining} attempt${remaining === 1 ? '' : 's'} remaining before lockout.`;
}

document.getElementById('loginUser').addEventListener('keydown', event => {
  if (event.key === 'Enter') document.getElementById('loginPass').focus();
});

document.getElementById('loginPass').addEventListener('keydown', event => {
  if (event.key === 'Enter') doLogin();
});

function doLogout(reason = '') {
  clearInterval(sessionInterval);
  sessionInterval = null;
  chatCtx = null;
  twoFAUser = null;
  twoFACode = null;

  document.getElementById('app').classList.add('hidden');
  document.getElementById('twoFAScreen').classList.add('hidden');
  document.getElementById('sessionBanner').classList.remove('show');
  document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('loginPass').value = '';
  document.getElementById('loginError').textContent = reason;
  document.getElementById('attemptsHint').textContent = '';
}

// ===========================
//   2FA
// ===========================
function show2FA(account) {
  twoFACode = String(Math.floor(100000 + Math.random() * 900000));
  document.getElementById('tfaPhone').textContent = account.user.phone;
  document.getElementById('tfaCodeDisplay').textContent = twoFACode;
  document.getElementById('tfaError').textContent = '';
  document.querySelectorAll('.code-digit').forEach(input => {
    input.value = '';
    input.classList.remove('filled');
  });
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('twoFAScreen').classList.remove('hidden');
  setTimeout(() => document.querySelector('.code-digit').focus(), 100);
}

function onDigitInput(el, idx) {
  el.value = el.value.replace(/\D/g, '').slice(0, 1);
  el.classList.toggle('filled', el.value.length > 0);

  if (el.value && idx < 5) {
    document.querySelectorAll('.code-digit')[idx + 1].focus();
  }

  const allFilled = [...document.querySelectorAll('.code-digit')].every(input => input.value.length === 1);
  if (allFilled) verify2FA();
}

function onDigitKey(event, idx) {
  if (event.key === 'Backspace' && !event.target.value && idx > 0) {
    document.querySelectorAll('.code-digit')[idx - 1].focus();
  }
}

function verify2FA() {
  const entered = [...document.querySelectorAll('.code-digit')].map(input => input.value).join('');
  if (entered.length < 6) {
    document.getElementById('tfaError').textContent = 'Please enter all 6 digits.';
    return;
  }

  if (entered !== twoFACode) {
    document.getElementById('tfaError').textContent = 'Incorrect code. Please try again.';
    document.querySelectorAll('.code-digit').forEach(input => {
      input.value = '';
      input.classList.remove('filled');
    });
    document.querySelector('.code-digit').focus();
    return;
  }

  const account = USERS_DB[twoFAUser];
  STATE = JSON.parse(JSON.stringify({
    user: account.user,
    balances: account.balances,
    monthSpent: account.monthSpent,
    transactions: account.transactions,
    cards: account.cards,
    bills: account.bills,
    nexaUsers: account.nexaUsers,
    loans: account.loans,
  }));

  document.getElementById('twoFAScreen').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  lastActivity = Date.now();
  initApp();
}

function resend2FA() {
  if (!twoFAUser) return;
  twoFACode = String(Math.floor(100000 + Math.random() * 900000));
  document.getElementById('tfaCodeDisplay').textContent = twoFACode;
  document.getElementById('tfaError').textContent = 'A new code has been sent.';
  setTimeout(() => {
    if (document.getElementById('tfaError').textContent === 'A new code has been sent.') {
      document.getElementById('tfaError').textContent = '';
    }
  }, 3000);
}

function cancelTwoFA() {
  document.getElementById('twoFAScreen').classList.add('hidden');
  document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('tfaError').textContent = '';
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
  clearInterval(lockoutTimer);
  lockoutTimer = setInterval(() => {
    remaining -= 1;
    updateLockoutDisplay(remaining);

    if (remaining <= 0) {
      clearInterval(lockoutTimer);
      lockoutTimer = null;
      lockoutEnd = null;
      document.getElementById('lockoutScreen').classList.add('hidden');
      document.getElementById('loginScreen').classList.remove('hidden');
      document.getElementById('loginError').textContent = '';
      document.getElementById('attemptsHint').textContent = '';
    }
  }, 1000);
}

function updateLockoutDisplay(secs) {
  const safeSecs = Math.max(0, secs);
  const minutes = Math.floor(safeSecs / 60);
  const seconds = String(safeSecs % 60).padStart(2, '0');
  document.getElementById('lockoutTimer').textContent = `${minutes}:${seconds}`;
}

// ===========================
//   SESSION TIMEOUT
// ===========================
function startSessionTimer() {
  clearInterval(sessionInterval);
  lastActivity = Date.now();

  if (!document.body.dataset.nbActivityBound) {
    ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'].forEach(eventName => {
      document.addEventListener(eventName, resetActivity, { passive: true });
    });
    document.body.dataset.nbActivityBound = 'true';
  }

  sessionInterval = setInterval(() => {
    const idleSecs = (Date.now() - lastActivity) / 1000;
    const timeLeft = SESSION_SECS - idleSecs;
    const banner = document.getElementById('sessionBanner');
    const countdown = document.getElementById('sessionCountdown');

    if (timeLeft <= 0) {
      clearInterval(sessionInterval);
      sessionInterval = null;
      doLogout('You were logged out due to inactivity.');
      return;
    }

    if (timeLeft <= WARN_SECS) {
      banner.classList.add('show');
      countdown.textContent = Math.ceil(timeLeft);
    } else {
      banner.classList.remove('show');
    }
  }, 1000);
}

function resetActivity() {
  lastActivity = Date.now();
}

// ===========================
//   FORGOT PASSWORD
// ===========================
function openForgot() {
  document.getElementById('forgotModal').classList.remove('hidden');
  document.getElementById('forgotForm').classList.remove('hidden');
  document.getElementById('forgotSuccess').classList.add('hidden');
  document.getElementById('resetUser').value = document.getElementById('loginUser').value;
}

function closeForgot() {
  document.getElementById('forgotModal').classList.add('hidden');
}

function submitForgot() {
  document.getElementById('forgotForm').classList.add('hidden');
  document.getElementById('forgotSuccess').classList.remove('hidden');
}
