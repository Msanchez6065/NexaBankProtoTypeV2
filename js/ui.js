// ===========================
//   INIT
// ===========================
function initApp() {
  // Update sidebar / header identity
  document.getElementById('sidebarAvatar').textContent = STATE.user.initials;
  document.getElementById('sidebarName').textContent   = STATE.user.name;
  document.getElementById('headerName').textContent    = STATE.user.name.split(' ')[0];
  // Show/hide savings account card
  const savCard = document.getElementById('savingsCard');
  if (savCard) savCard.style.display = STATE.user.hasSavings ? '' : 'none';
  // Reset to dashboard tab
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-dashboard').classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelector('.nav-item[data-page="dashboard"]').classList.add('active');
  renderDashboard();
  renderBillsGrid();
  renderCardsPage();
  renderLoansPage();
  refreshAllTxns();
  initChat();
  updateBalanceSelects();
  updateWDDropdowns();
  startSessionTimer();
}

// ===========================
//   PAGES
// ===========================
function showPage(id, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  if (el) el.classList.add('active');
  if (id === 'history') refreshAllTxns();
  if (id === 'loans') renderLoansPage();
}

// ===========================
//   RENDER HELPERS
// ===========================
function fmt(n) { return '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
function timeStr() {
  const d = new Date();
  return d.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' });
}
function today() {
  return new Date().toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
}

function renderDashboard() {
  document.getElementById('balChecking').textContent = fmt(STATE.balances.checking);
  if (STATE.user.hasSavings && STATE.balances.savings !== undefined) {
    document.getElementById('balSavings').textContent = fmt(STATE.balances.savings);
  }
  const total = (STATE.balances.checking || 0) + (STATE.balances.savings || 0);
  document.getElementById('statTotal').textContent = fmt(total);
  document.getElementById('statSpent').textContent = fmt(STATE.monthSpent);
  renderTxnList('recentTxns', STATE.transactions.slice(0, 5));
}

function renderTxnList(elId, list) {
  const el = document.getElementById(elId);
  if (!list.length) { el.innerHTML = '<div class="muted small" style="padding:16px">No transactions yet.</div>'; return; }
  el.innerHTML = list.map(t => 
    <div class="txn-item">
      <div class="txn-icon "></div>
      <div class="txn-desc">
        <div class="txn-name"></div>
        <div class="txn-date"></div>
      </div>
      <div class="txn-amount "></div>
    </div>).join('');
}

function refreshAllTxns() { renderTxnList('allTxns', STATE.transactions); }

function renderBillsGrid() {
  document.getElementById('billsGrid').innerHTML = STATE.bills.map(b => 
    <div class="bill-card" id="bill-" onclick="selectBill('')">
      <div class="bill-icon"></div>
      <div class="bill-name"></div>
      <div class="bill-due">Due </div>
      <div class="bill-amount"></div>
    </div>).join('');
}

function selectBill(id) {
  document.querySelectorAll('.bill-card').forEach(c => c.classList.remove('selected'));
  document.getElementById('bill-' + id).classList.add('selected');
  const b = STATE.bills.find(x => x.id === id);
  document.getElementById('billName').value = b.name;
  document.getElementById('billAmount').value = b.amount;
}

function renderCardsPage() {
  document.getElementById('cardsGrid').innerHTML = STATE.cards.map(c => 
    <div>
      <div class="bank-card  ">
        <div>
          <div class="bank-card-chip">??</div>
          <div class="bank-card-num"></div>
        </div>
        <div class="bank-card-footer">
          <div>
            <div class="bank-card-holder"></div>
            <div class="small muted">Exp </div>
          </div>
          <div class="bank-card-brand"></div>
        </div>
      </div>
      <div class="card-status-badge ">
        
      </div><br>
      <button class="btn-freeze "
        onclick="toggleCard('')">
        
      </button>
    </div>).join('');
}

function toggleCard(id) {
  const c = STATE.cards.find(x => x.id === id);
  c.frozen = !c.frozen;
  renderCardsPage();
  showToast(c.frozen ? ??  card frozen : ??  card unfrozen, c.frozen ? 'error' : 'success');
}

function renderLoansPage() {
  const grid = document.getElementById('loansGrid');
  if (!grid) return;
  grid.innerHTML = STATE.loans.map(l => {
    let pct, pctLabel, fillClass;
    if (l.type === 'credit') {
      pct = ((l.balance / l.limit) * 100).toFixed(0);
      pctLabel = ${pct}% utilization ( of );
      fillClass = 'credit';
    } else {
      const paid = l.original - l.balance;
      pct = ((paid / l.original) * 100).toFixed(0);
      pctLabel = ${pct}% paid off ( of );
      fillClass = 'installment';
    }
    return 
    <div class="loan-card">
      <div class="loan-header">
        <div class="loan-icon-wrap "></div>
        <div class="loan-meta">
          <div class="loan-name"></div>
          <div class="loan-apr">% APR · </div>
        </div>
        <div class="due-badge">?? Due </div>
      </div>
      <div class="loan-balance-row">
        <div>
          <div class="loan-bal-label"></div>
          <div class="loan-bal-value"></div>
        </div>
      </div>
      <div class="loan-detail-row">
        <div class="loan-detail">
          <div class="loan-detail-label">Min. Payment</div>
          <div class="loan-detail-val"></div>
        </div>
        <div class="loan-detail">
          <div class="loan-detail-label">APR</div>
          <div class="loan-detail-val">%</div>
        </div>
        <div class="loan-detail">
          <div class="loan-detail-label"></div>
          <div class="loan-detail-val"></div>
        </div>
      </div>
      <div class="loan-progress-wrap">
        <div class="loan-progress-label">
          <span></span>
        </div>
        <div class="loan-progress-bar">
          <div class="loan-progress-fill " style="width:%"></div>
        </div>
      </div>
    </div>;
  }).join('');

  // sync loan select dropdown
  const sel = document.getElementById('loanSelect');
  if (sel) {
    const cur = sel.value;
    sel.innerHTML = STATE.loans.map(l => <option value=""> — </option>).join('');
    if (STATE.loans.find(l => l.id === cur)) sel.value = cur;
  }
}

// ===========================
//   TOAST
// ===========================
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = show ;
  setTimeout(() => t.classList.remove('show'), 3000);
}
