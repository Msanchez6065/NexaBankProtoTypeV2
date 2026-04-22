// ===========================
//   WITHDRAW / DEPOSIT
// ===========================
function updateWDDropdowns() {
  const options = [
    { value: 'checking', label: `Checking Account - ${fmt(STATE.balances.checking || 0)}` },
  ];

  if (STATE.user.hasSavings && STATE.balances.savings !== undefined) {
    options.push({ value: 'savings', label: `Savings Account - ${fmt(STATE.balances.savings)}` });
  }

  fillWDSelect(document.getElementById('wdFromAcct'), options);
  fillWDSelect(document.getElementById('wdToAcct'), options);
}

function fillWDSelect(select, options) {
  if (!select) return;
  const current = select.value;
  select.innerHTML = options.map(option => `<option value="${option.value}">${option.label}</option>`).join('');
  if (options.some(option => option.value === current)) {
    select.value = current;
  }
}

function switchWDTab(mode) {
  const isWithdraw = mode === 'withdraw';
  document.getElementById('wdTabWithdraw').classList.toggle('active', isWithdraw);
  document.getElementById('wdTabDeposit').classList.toggle('active', !isWithdraw);
  document.getElementById('wdWithdrawPanel').classList.toggle('hidden', !isWithdraw);
  document.getElementById('wdDepositPanel').classList.toggle('hidden', isWithdraw);
}

function quickWithdraw(amount) {
  document.getElementById('wdAmount').value = amount;
}

function doWithdraw() {
  const from = document.getElementById('wdFromAcct').value;
  const amount = parseFloat(document.getElementById('wdAmount').value);

  if (!amount || amount <= 0) {
    showToast('Please enter a valid amount.', 'error');
    return;
  }

  if (amount > (STATE.balances[from] || 0)) {
    showToast('Insufficient funds.', 'error');
    return;
  }

  STATE.balances[from] = roundTo(STATE.balances[from] - amount);
  STATE.transactions.unshift({
    id: Date.now(),
    desc: 'Cash withdrawal',
    type: 'out',
    amount,
    date: today(),
    icon: '↓',
    acct: from,
  });

  document.getElementById('wdAmount').value = '';
  renderDashboard();
  refreshAllTxns();
  updateBalanceSelects();
  updateWDDropdowns();
  showToast(`Withdrew ${fmt(amount)} from ${from}.`);
}

function doDeposit() {
  const to = document.getElementById('wdToAcct').value;
  const amount = parseFloat(document.getElementById('wdDepAmount').value);
  const method = document.getElementById('wdDepMethod').value;

  if (!amount || amount <= 0) {
    showToast('Please enter a valid amount.', 'error');
    return;
  }

  STATE.balances[to] = roundTo((STATE.balances[to] || 0) + amount);
  STATE.transactions.unshift({
    id: Date.now(),
    desc: `${capitalize(method)} deposit`,
    type: 'in',
    amount,
    date: today(),
    icon: '↑',
    acct: to,
  });

  document.getElementById('wdDepAmount').value = '';
  renderDashboard();
  refreshAllTxns();
  updateBalanceSelects();
  updateWDDropdowns();
  showToast(`Deposited ${fmt(amount)} to ${to}.`);
}
