// ===========================
//   TRANSFERS
// ===========================
function doTransfer() {
  const from = document.getElementById("transferFrom").value;
  const to   = document.getElementById("transferTo").value;
  const amt  = parseFloat(document.getElementById("transferAmount").value);
  const note = document.getElementById("transferNote").value.trim();

  if (!amt || amt <= 0) { showToast("? Please enter a valid amount.", "error"); return; }
  if (from === to) { showToast("? Cannot transfer to the same account.", "error"); return; }

  const fromBal = STATE.balances[from];
  if (amt > fromBal) { showToast("? Insufficient funds.", "error"); return; }

  // Update balances
  STATE.balances[from] -= amt;
  STATE.balances[to]   += amt;

  // Add transactions
  const desc = note || `Transfer from ${from} to ${to}`;
  const txn = { id: Date.now(), date: today(), desc, amount: amt, type: "out", icon: "??" };
  STATE.transactions.unshift(txn);
  if (from === "checking") {
    STATE.transactions.unshift({ ...txn, desc: `Transfer to ${to}`, type: "out" });
  }
  if (to === "checking") {
    STATE.transactions.unshift({ ...txn, desc: `Transfer from ${from}`, type: "in" });
  }

  // Update UI
  renderDashboard();
  refreshAllTxns();
  document.getElementById("transferAmount").value = "";
  document.getElementById("transferNote").value = "";
  showToast(`? Transferred ${fmt(amt)} from ${from} to ${to}`);
}

// ===========================
//   BILL PAYMENTS
// ===========================
function payBill() {
  const id = document.querySelector(".bill-card.selected");
  if (!id) { showToast("? Please select a bill to pay.", "error"); return; }
  const billId = id.id.replace("bill-", "");
  const b = STATE.bills.find(x => x.id === billId);
  if (!b) return;

  const amt = parseFloat(document.getElementById("billAmount").value);
  if (!amt || amt <= 0) { showToast("? Please enter a valid amount.", "error"); return; }
  if (amt > STATE.balances.checking) { showToast("? Insufficient funds.", "error"); return; }

  // Update balance
  STATE.balances.checking -= amt;

  // Add transaction
  STATE.transactions.unshift({
    id: Date.now(), date: today(), desc: `Paid ${b.name}`, amount: amt, type: "out", icon: "??"
  });

  // Update bill (simulate payment)
  b.amount -= amt;
  if (b.amount <= 0) {
    STATE.bills = STATE.bills.filter(x => x.id !== billId);
  }

  // Update UI
  renderDashboard();
  renderBillsGrid();
  refreshAllTxns();
  document.getElementById("billAmount").value = "";
  document.querySelectorAll(".bill-card").forEach(c => c.classList.remove("selected"));
  showToast(`? Paid ${fmt(amt)} to ${b.name}`);
}

// ===========================
//   LOAN PAYMENTS
// ===========================
function payLoan() {
  const loanId = document.getElementById("loanSelect").value;
  if (!loanId) { showToast("? Please select a loan to pay.", "error"); return; }
  const l = STATE.loans.find(x => x.id === loanId);
  if (!l) return;

  const amt = parseFloat(document.getElementById("loanAmount").value);
  if (!amt || amt <= 0) { showToast("? Please enter a valid amount.", "error"); return; }
  if (amt > STATE.balances.checking) { showToast("? Insufficient funds.", "error"); return; }

  // Update balance
  STATE.balances.checking -= amt;

  // Update loan balance
  l.balance -= amt;
  if (l.balance <= 0) {
    STATE.loans = STATE.loans.filter(x => x.id !== loanId);
  }

  // Add transaction
  STATE.transactions.unshift({
    id: Date.now(), date: today(), desc: `Loan payment - ${l.name}`, amount: amt, type: "out", icon: "??"
  });

  // Update UI
  renderDashboard();
  renderLoansPage();
  refreshAllTxns();
  document.getElementById("loanAmount").value = "";
  showToast(`? Paid ${fmt(amt)} towards ${l.name}`);
}

// ===========================
//   BALANCE SELECTS
// ===========================
function updateBalanceSelects() {
  const sels = ["transferFrom", "transferTo"];
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
