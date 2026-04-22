// ===========================
//   TRANSFERS
// ===========================
function toggleTfType() {
  const type = document.getElementById('tfType').value;
  document.getElementById('tfToOwnWrap').classList.toggle('hidden', type !== 'own');
  document.getElementById('tfToUserWrap').classList.toggle('hidden', type !== 'user');
}

function doTransfer() {
  const type = document.getElementById('tfType').value;
  const from = document.getElementById('tfFrom').value;
  const amount = parseFloat(document.getElementById('tfAmount').value);
  const note = document.getElementById('tfNote').value.trim();

  if (!amount || amount <= 0) {
    showToast('Please enter a valid amount.', 'error');
    return;
  }

  if (amount > (STATE.balances[from] || 0)) {
    showToast('Insufficient funds.', 'error');
    return;
  }

  if (type === 'own') {
    const to = document.getElementById('tfTo').value;
    if (to === from) {
      showToast('Choose a different destination account.', 'error');
      return;
    }

    STATE.balances[from] = roundTo(STATE.balances[from] - amount);
    STATE.balances[to] = roundTo((STATE.balances[to] || 0) + amount);
    STATE.transactions.unshift({
      id: Date.now(),
      desc: note || `Transfer to ${capitalize(to)}`,
      type: 'out',
      amount,
      date: today(),
      icon: '⇄',
      acct: from,
    });
    STATE.transactions.unshift({
      id: Date.now() + 1,
      desc: note || `Transfer from ${capitalize(from)}`,
      type: 'in',
      amount,
      date: today(),
      icon: '⇄',
      acct: to,
    });
    showToast(`Transferred ${fmt(amount)} to ${to}.`);
  } else {
    const recipientKey = document.getElementById('tfToUser').value;
    const recipient = STATE.nexaUsers[recipientKey];

    STATE.balances[from] = roundTo(STATE.balances[from] - amount);
    STATE.transactions.unshift({
      id: Date.now(),
      desc: note || `Transfer to ${recipient.name}`,
      type: 'out',
      amount,
      date: today(),
      icon: '→',
      acct: from,
    });
    showToast(`Sent ${fmt(amount)} to ${recipient.name}.`);
  }

  document.getElementById('tfAmount').value = '';
  document.getElementById('tfNote').value = '';
  renderDashboard();
  refreshAllTxns();
  updateBalanceSelects();
  updateWDDropdowns();
}

// ===========================
//   BILL PAYMENTS
// ===========================
function doPayBill() {
  const name = document.getElementById('billName').value.trim();
  const amount = parseFloat(document.getElementById('billAmount').value);
  const from = document.getElementById('billFrom').value;

  if (!name) {
    showToast('Enter a bill or payee name.', 'error');
    return;
  }

  if (!amount || amount <= 0) {
    showToast('Please enter a valid amount.', 'error');
    return;
  }

  if (amount > (STATE.balances[from] || 0)) {
    showToast('Insufficient funds.', 'error');
    return;
  }

  STATE.balances[from] = roundTo(STATE.balances[from] - amount);
  STATE.monthSpent = roundTo((STATE.monthSpent || 0) + amount);
  STATE.transactions.unshift({
    id: Date.now(),
    desc: `Bill payment - ${name}`,
    type: 'bill',
    amount,
    date: today(),
    icon: '◦',
    acct: from,
  });

  const existingBill = STATE.bills.find(bill => bill.name.toLowerCase() === name.toLowerCase());
  if (existingBill) {
    STATE.bills = STATE.bills.filter(bill => bill.id !== existingBill.id);
  }

  document.getElementById('billName').value = '';
  document.getElementById('billAmount').value = '';
  renderDashboard();
  renderBillsGrid();
  refreshAllTxns();
  updateBalanceSelects();
  updateWDDropdowns();
  showToast(`Paid ${fmt(amount)} to ${name}.`);
}

// ===========================
//   LOAN PAYMENTS
// ===========================
function getSelectedLoan() {
  const loanId = document.getElementById('loanSelect').value;
  return STATE.loans.find(loan => loan.id === loanId);
}

function payLoanAmount(amount) {
  const loan = getSelectedLoan();
  const from = document.getElementById('loanPayFrom').value;

  if (!loan) {
    showToast('Select a loan first.', 'error');
    return;
  }

  if (!amount || amount <= 0) {
    showToast('Please enter a valid amount.', 'error');
    return;
  }

  if (amount > (STATE.balances[from] || 0)) {
    showToast('Insufficient funds.', 'error');
    return;
  }

  const payment = Math.min(amount, loan.balance);
  STATE.balances[from] = roundTo(STATE.balances[from] - payment);
  loan.balance = roundTo(Math.max(0, loan.balance - payment));
  STATE.transactions.unshift({
    id: Date.now(),
    desc: `Loan payment - ${loan.name}`,
    type: 'out',
    amount: payment,
    date: today(),
    icon: '◧',
    acct: from,
  });

  if (loan.balance === 0) {
    STATE.loans = STATE.loans.filter(item => item.id !== loan.id);
  }

  document.getElementById('loanPayAmt').value = '';
  renderDashboard();
  renderLoansPage();
  refreshAllTxns();
  updateBalanceSelects();
  updateWDDropdowns();
  showToast(`Paid ${fmt(payment)} toward ${loan.name}.`);
}

function doPayLoan() {
  payLoanAmount(parseFloat(document.getElementById('loanPayAmt').value));
}

function doPayLoanMin() {
  const loan = getSelectedLoan();
  if (!loan) {
    showToast('Select a loan first.', 'error');
    return;
  }
  payLoanAmount(loan.minPayment);
}

function doPayLoanFull() {
  const loan = getSelectedLoan();
  if (!loan) {
    showToast('Select a loan first.', 'error');
    return;
  }
  payLoanAmount(loan.balance);
}

// ===========================
//   BALANCE SELECTS
// ===========================
function updateBalanceSelects() {
  const tfFrom = document.getElementById('tfFrom');
  const tfTo = document.getElementById('tfTo');
  const billFrom = document.getElementById('billFrom');
  const loanPayFrom = document.getElementById('loanPayFrom');

  const options = [
    { value: 'checking', label: `Checking - ${fmt(STATE.balances.checking || 0)}` },
  ];

  if (STATE.user.hasSavings && STATE.balances.savings !== undefined) {
    options.push({ value: 'savings', label: `Savings - ${fmt(STATE.balances.savings)}` });
  }

  fillSelect(tfFrom, options);
  fillSelect(billFrom, options);
  fillSelect(loanPayFrom, options);

  if (tfTo) {
    const current = tfTo.value;
    tfTo.innerHTML = options.map(option => `<option value="${option.value}">${option.label}</option>`).join('');
    if (options.some(option => option.value === current)) tfTo.value = current;
  }
}

function fillSelect(select, options) {
  if (!select) return;
  const current = select.value;
  select.innerHTML = options.map(option => `<option value="${option.value}">${option.label}</option>`).join('');
  if (options.some(option => option.value === current)) {
    select.value = current;
  }
}
