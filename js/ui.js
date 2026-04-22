// ===========================
//   INIT
// ===========================
function initApp() {
  document.getElementById('sidebarAvatar').textContent = STATE.user.initials;
  document.getElementById('sidebarName').textContent = STATE.user.name;
  document.getElementById('headerName').textContent = STATE.user.name.split(' ')[0];

  const savingsCard = document.getElementById('savingsCard');
  savingsCard.style.display = STATE.user.hasSavings ? '' : 'none';

  showPage('dashboard', document.querySelector('.nav-item[data-page="dashboard"]'));
  renderDashboard();
  renderBillsGrid();
  renderCardsPage();
  renderLoansPage();
  refreshAllTxns();
  updateBalanceSelects();
  updateWDDropdowns();
  initChat();
  startSessionTimer();
}

// ===========================
//   PAGES
// ===========================
function showPage(id, el) {
  document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
  document.getElementById(`page-${id}`).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  if (el) el.classList.add('active');

  if (id === 'history') refreshAllTxns();
  if (id === 'cards') renderCardsPage();
  if (id === 'loans') renderLoansPage();
}

// ===========================
//   RENDER HELPERS
// ===========================
function renderDashboard() {
  document.getElementById('balChecking').textContent = fmt(STATE.balances.checking || 0);

  if (STATE.user.hasSavings) {
    document.getElementById('balSavings').textContent = fmt(STATE.balances.savings || 0);
  }

  const total = (STATE.balances.checking || 0) + (STATE.balances.savings || 0);
  document.getElementById('statTotal').textContent = fmt(total);
  document.getElementById('statSpent').textContent = fmt(STATE.monthSpent || 0);
  document.getElementById('statBills').textContent = String(STATE.bills.length);
  renderTxnList('recentTxns', STATE.transactions.slice(0, 5));
}

function renderTxnList(elId, list) {
  const container = document.getElementById(elId);
  if (!container) return;

  if (!list.length) {
    container.innerHTML = '<div class="txn-item"><div class="txn-desc"><div class="txn-name">No transactions yet.</div></div></div>';
    return;
  }

  container.innerHTML = list.map(txn => {
    const amountClass = txn.type === 'in' ? 'in' : 'out';
    const icon = txn.icon || (txn.type === 'in' ? '↓' : txn.type === 'bill' ? '◦' : '↑');
    const signedAmount = txn.type === 'in' ? `+${fmt(txn.amount)}` : `-${fmt(txn.amount)}`;

    return `
      <div class="txn-item">
        <div class="txn-icon ${txn.type}">${icon}</div>
        <div class="txn-desc">
          <div class="txn-name">${txn.desc}</div>
          <div class="txn-date">${txn.date}</div>
        </div>
        <div class="txn-amount ${amountClass}">${signedAmount}</div>
      </div>
    `;
  }).join('');
}

function refreshAllTxns() {
  renderTxnList('allTxns', STATE.transactions);
}

function renderBillsGrid() {
  const grid = document.getElementById('billsGrid');
  if (!grid) return;

  if (!STATE.bills.length) {
    grid.innerHTML = '<div class="bill-card"><div class="bill-name">No pending bills</div><div class="bill-due">You are all caught up.</div></div>';
    return;
  }

  grid.innerHTML = STATE.bills.map(bill => `
    <div class="bill-card" id="bill-${bill.id}" onclick="selectBill('${bill.id}')">
      <div class="bill-icon">${bill.icon || '◦'}</div>
      <div class="bill-name">${bill.name}</div>
      <div class="bill-due">Due ${bill.due}</div>
      <div class="bill-amount">${fmt(bill.amount)}</div>
    </div>
  `).join('');
}

function selectBill(id) {
  document.querySelectorAll('.bill-card').forEach(card => card.classList.remove('selected'));
  const selected = document.getElementById(`bill-${id}`);
  if (selected) selected.classList.add('selected');

  const bill = STATE.bills.find(item => item.id === id);
  if (!bill) return;

  document.getElementById('billName').value = bill.name;
  document.getElementById('billAmount').value = bill.amount;
}

function renderCardsPage() {
  const grid = document.getElementById('cardsGrid');
  if (!grid) return;

  grid.innerHTML = STATE.cards.map(card => `
    <div>
      <div class="bank-card ${card.brand.toLowerCase().includes('master') ? 'mc' : 'visa'} ${card.frozen ? 'frozen' : ''}">
        <div>
          <div class="bank-card-chip">◼</div>
          <div class="bank-card-num">${card.num}</div>
        </div>
        <div class="bank-card-footer">
          <div>
            <div class="bank-card-holder">${card.holder}</div>
            <div class="small muted">Exp ${card.exp}</div>
          </div>
          <div class="bank-card-brand">${card.brand}</div>
        </div>
      </div>
      <div class="card-status-badge ${card.frozen ? 'frozen' : 'active'}">
        ${card.frozen ? 'Frozen' : 'Active'}
      </div>
      <br>
      <button
        class="btn-freeze ${card.frozen ? 'do-unfreeze' : 'do-freeze'}"
        onclick="toggleCard('${card.id}')">
        ${card.frozen ? 'Unfreeze Card' : 'Freeze Card'}
      </button>
    </div>
  `).join('');
}

function toggleCard(id) {
  const card = STATE.cards.find(item => item.id === id);
  if (!card) return;

  card.frozen = !card.frozen;
  renderCardsPage();
  showToast(`${card.brand} card ${card.frozen ? 'frozen' : 'unfrozen'}.`, card.frozen ? 'error' : 'success');
}

function renderLoansPage() {
  const grid = document.getElementById('loansGrid');
  const select = document.getElementById('loanSelect');
  if (!grid || !select) return;

  if (!STATE.loans.length) {
    grid.innerHTML = '<div class="loan-card"><div class="loan-name">No active loans</div><div class="loan-apr">This account has no open credit balances.</div></div>';
    select.innerHTML = '';
    return;
  }

  grid.innerHTML = STATE.loans.map(loan => {
    const isCredit = loan.type === 'credit';
    const progressPct = isCredit
      ? Math.min(100, (loan.balance / loan.limit) * 100)
      : Math.min(100, ((loan.original - loan.balance) / loan.original) * 100);
    const progressLabel = isCredit
      ? `${Math.round(progressPct)}% utilization`
      : `${Math.round(progressPct)}% paid off`;
    const thirdLabel = isCredit ? 'Credit Limit' : 'Original Balance';
    const thirdValue = isCredit ? fmt(loan.limit) : fmt(loan.original);

    return `
      <div class="loan-card">
        <div class="loan-header">
          <div class="loan-icon-wrap ${loan.colorClass || loan.type}">${loan.icon || '$'}</div>
          <div class="loan-meta">
            <div class="loan-name">${loan.name}</div>
            <div class="loan-apr">${loan.apr.toFixed(2)}% APR</div>
          </div>
          <div class="due-badge">Due ${loan.dueDate}</div>
        </div>
        <div class="loan-balance-row">
          <div>
            <div class="loan-bal-label">Current Balance</div>
            <div class="loan-bal-value">${fmt(loan.balance)}</div>
          </div>
        </div>
        <div class="loan-detail-row">
          <div class="loan-detail">
            <div class="loan-detail-label">Min. Payment</div>
            <div class="loan-detail-val">${fmt(loan.minPayment)}</div>
          </div>
          <div class="loan-detail">
            <div class="loan-detail-label">APR</div>
            <div class="loan-detail-val">${loan.apr.toFixed(2)}%</div>
          </div>
          <div class="loan-detail">
            <div class="loan-detail-label">${thirdLabel}</div>
            <div class="loan-detail-val">${thirdValue}</div>
          </div>
        </div>
        <div class="loan-progress-wrap">
          <div class="loan-progress-label">
            <span>${progressLabel}</span>
            <span>${fmt(loan.balance)}</span>
          </div>
          <div class="loan-progress-bar">
            <div class="loan-progress-fill ${loan.type}" style="width:${progressPct}%"></div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  const current = select.value;
  select.innerHTML = STATE.loans.map(loan => `
    <option value="${loan.id}">${loan.name} - ${fmt(loan.balance)}</option>
  `).join('');

  if (STATE.loans.some(loan => loan.id === current)) {
    select.value = current;
  }
}

// ===========================
//   TOAST
// ===========================
function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = type;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}
