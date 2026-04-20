// ===========================
//   UTILITY FUNCTIONS
// ===========================
function fmt(n) { return "$" + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
function timeStr() {
  const d = new Date();
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}
function today() {
  return new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ===========================
//   MODAL HELPERS
// ===========================
function openModal(id) {
  document.getElementById(id).classList.remove("hidden");
}

function closeModal(id) {
  document.getElementById(id).classList.add("hidden");
}

// ===========================
//   FORM VALIDATION
// ===========================
function validateAmount(input) {
  const val = parseFloat(input.value);
  if (isNaN(val) || val <= 0) {
    input.classList.add("error");
    return false;
  }
  input.classList.remove("error");
  return true;
}

// ===========================
//   LOCAL STORAGE HELPERS
// ===========================
function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn("Failed to save to localStorage:", e);
  }
}

function loadFromStorage(key, defaultValue = null) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    console.warn("Failed to load from localStorage:", e);
    return defaultValue;
  }
}

// ===========================
//   ANIMATION HELPERS
// ===========================
function fadeIn(el, duration = 300) {
  el.style.opacity = "0";
  el.style.display = "block";
  const start = Date.now();
  const timer = setInterval(() => {
    const elapsed = Date.now() - start;
    const progress = elapsed / duration;
    if (progress >= 1) {
      el.style.opacity = "1";
      clearInterval(timer);
    } else {
      el.style.opacity = progress;
    }
  }, 16);
}

function fadeOut(el, duration = 300) {
  const start = Date.now();
  const timer = setInterval(() => {
    const elapsed = Date.now() - start;
    const progress = elapsed / duration;
    if (progress >= 1) {
      el.style.display = "none";
      clearInterval(timer);
    } else {
      el.style.opacity = 1 - progress;
    }
  }, 16);
}

// ===========================
//   EVENT DELEGATION
// ===========================
function onClick(selector, handler) {
  document.addEventListener("click", e => {
    if (e.target.matches(selector) || e.target.closest(selector)) {
      handler(e);
    }
  });
}

// ===========================
//   DOM HELPERS
// ===========================
function $(selector) {
  return document.querySelector(selector);
}

function $$(selector) {
  return Array.from(document.querySelectorAll(selector));
}

// ===========================
//   MATH HELPERS
// ===========================
function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

function roundTo(val, decimals = 2) {
  return Math.round(val * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

// ===========================
//   STRING HELPERS
// ===========================
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function truncate(str, maxLen = 50) {
  return str.length > maxLen ? str.slice(0, maxLen) + "..." : str;
}

// ===========================
//   ARRAY HELPERS
// ===========================
function unique(arr) {
  return [...new Set(arr)];
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
