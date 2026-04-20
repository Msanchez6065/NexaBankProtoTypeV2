// ===========================
//   STATE (mutable, loaded on login)
// ===========================
let STATE = {};

// chat conversation context for multi-step flows
let chatCtx = null;

// ===========================
//   AUTH STATE
// ===========================
let loginAttempts = 0;
let lockoutTimer  = null;
let lockoutEnd    = null;
let twoFACode     = null;
let twoFAUser     = null;
let sessionInterval = null;
let lastActivity  = Date.now();
const MAX_ATTEMPTS  = 5;
const LOCKOUT_SECS  = 30;   // demo: 30 seconds (real would be 3600)
const SESSION_SECS  = 300;  // 5 minutes inactivity timeout
const WARN_SECS     = 60;   // warn 60s before timeout

// AutoSave username
window.addEventListener('load', () => {
  const saved = localStorage.getItem('nbSavedUser');
  if (saved) document.getElementById('loginUser').value = saved;
});
