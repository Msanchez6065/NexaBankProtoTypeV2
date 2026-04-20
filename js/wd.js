// ===========================
//   WITHDRAW/DEPOSIT
// ===========================
function updateWDDropdowns() {
  const sels = ["wdFrom", "wdTo"];
  sels.forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    const cur = sel.value;
    sel.innerHTML = `
      <option value="checking">Checking — ${fmt(STATE.balances.checking)}</option>
      ${STATE.user.hasSavings ? `<option value="savings">Savings — ${fmt(STATE.balances.savings)}</option>` : ""}
    `;
    if (cur && sel.querySelector(`option[value="${cur}"]`)) sel.value = cur;
  });
}

function doWithdraw() {
  const from = document.getElementById("wdFrom").value;
  const amt = parseFloat(document.getElementById("wdAmount").value);
  const note = document.getElementById("wdNote").value.trim();

  if (!amt || amt <= 0) { showToast("? Please enter a valid amount.", "error"); return; }
  if (amt > STATE.balances[from]) { showToast("? Insufficient funds.", "error"); return; }

  // Update balance
  STATE.balances[from] -= amt;

  // Add transaction
  const desc = note || `ATM Withdrawal`;
  STATE.transactions.unshift({
    id: Date.now(), date: today(), desc, amount: amt, type: "out", icon: "??"
  });

  // Update UI
  renderDashboard();
  refreshAllTxns();
  document.getElementById("wdAmount").value = "";
  document.getElementById("wdNote").value = "";
  showToast(`? Withdrew ${fmt(amt)} from ${from}`);
}

function doDeposit() {
  const to = document.getElementById("wdTo").value;
  const amt = parseFloat(document.getElementById("wdAmount").value);
  const note = document.getElementById("wdNote").value.trim();

  if (!amt || amt <= 0) { showToast("? Please enter a valid amount.", "error"); return; }

  // Update balance
  STATE.balances[to] += amt;

  // Add transaction
  const desc = note || `Deposit`;
  STATE.transactions.unshift({
    id: Date.now(), date: today(), desc, amount: amt, type: "in", icon: "??"
  });

  // Update UI
  renderDashboard();
  refreshAllTxns();
  document.getElementById("wdAmount").value = "";
  document.getElementById("wdNote").value = "";
  showToast(`? Deposited ${fmt(amt)} to ${to}`);
}

function toggleWDMode() {
  const mode = document.getElementById("wdMode").value;
  const fromRow = document.getElementById("wdFromRow");
  const toRow = document.getElementById("wdToRow");
  const btn = document.getElementById("wdBtn");

  if (mode === "withdraw") {
    fromRow.style.display = "block";
    toRow.style.display = "none";
    btn.textContent = "Withdraw";
    btn.onclick = doWithdraw;
  } else {
    fromRow.style.display = "none";
    toRow.style.display = "block";
    btn.textContent = "Deposit";
    btn.onclick = doDeposit;
  }
}

// ===========================
//   ATM SIMULATION
// ===========================
function simulateATM() {
  const amt = parseFloat(document.getElementById("atmAmount").value);
  if (!amt || amt <= 0 || amt % 20 !== 0) {
    showToast("? Please enter a multiple of $20.", "error");
    return;
  }
  if (amt > STATE.balances.checking) {
    showToast("? Insufficient funds.", "error");
    return;
  }

  // Simulate ATM dispensing
  STATE.balances.checking -= amt;
  STATE.transactions.unshift({
    id: Date.now(), date: today(), desc: `ATM Withdrawal - ${fmt(amt)}`, amount: amt, type: "out", icon: "??"
  });

  renderDashboard();
  refreshAllTxns();
  document.getElementById("atmAmount").value = "";
  closeModal("atmModal");
  showToast(`? Dispensed ${fmt(amt)} from ATM`);
}

function openATM() {
  document.getElementById("atmModal").classList.remove("hidden");
  document.getElementById("atmAmount").focus();
}

function closeATM() {
  document.getElementById("atmModal").classList.add("hidden");
}

// ===========================
//   CHECK DEPOSIT
// ===========================
function simulateCheckDeposit() {
  const amt = parseFloat(document.getElementById("checkAmount").value);
  if (!amt || amt <= 0) {
    showToast("? Please enter a valid amount.", "error");
    return;
  }

  // Simulate check deposit (takes 1-2 business days)
  setTimeout(() => {
    STATE.balances.checking += amt;
    STATE.transactions.unshift({
      id: Date.now(), date: today(), desc: `Check Deposit - ${fmt(amt)}`, amount: amt, type: "in", icon: "??"
    });
    renderDashboard();
    refreshAllTxns();
    showToast(`? Check deposit of ${fmt(amt)} has cleared`);
  }, 2000); // Simulate processing time

  document.getElementById("checkAmount").value = "";
  closeModal("checkModal");
  showToast("?? Check deposit submitted for processing...");
}

function openCheckDeposit() {
  document.getElementById("checkModal").classList.remove("hidden");
  document.getElementById("checkAmount").focus();
}

function closeCheckDeposit() {
  document.getElementById("checkModal").classList.add("hidden");
}
