// ===========================
//   CHAT ASSISTANT
// ===========================
function initChat() {
  const chatMessages = document.getElementById('chatMessages');
  chatMessages.innerHTML = '';
  chatCtx = { step: 'idle', data: {} };
  addChatMsg('bot', `Hi ${STATE.user.name.split(' ')[0]}, I'm Nexi. Ask about balances, transfers, bills, loans, or cards.`);
}

function sendChat() {
  const input = document.getElementById('chatInput');
  const message = input.value.trim();
  if (!message) return;

  addChatMsg('user', message);
  input.value = '';
  processChat(message);
}

function addChatMsg(type, text) {
  const chat = document.getElementById('chatMessages');
  const msg = document.createElement('div');
  msg.className = `msg ${type}`;

  const avatar = document.createElement('div');
  avatar.className = 'msg-mini-avatar';
  avatar.textContent = type === 'bot' ? 'N' : STATE.user.initials.slice(0, 1);

  const bubbleWrap = document.createElement('div');
  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.textContent = text;
  const time = document.createElement('div');
  time.className = 'msg-time';
  time.textContent = timeStr();

  bubbleWrap.appendChild(bubble);
  bubbleWrap.appendChild(time);
  msg.appendChild(avatar);
  msg.appendChild(bubbleWrap);
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}

function processChat(rawMessage) {
  const message = rawMessage.toLowerCase();
  let response = 'I can help with balances, transfers, bills, loans, cards, and recent activity.';

  if (chatCtx.step === 'transfer_amount') {
    const amount = parseFloat(message.replace(/[^0-9.]/g, ''));
    if (!amount || amount <= 0) {
      replyLater('Please enter a valid dollar amount.');
      return;
    }
    chatCtx = { step: 'transfer_to', data: { amount } };
    replyLater('Who would you like to transfer to? Enter a NexaBank username.');
    return;
  }

  if (chatCtx.step === 'transfer_to') {
    const username = message.replace(/[^a-z0-9]/g, '');
    const recipient = STATE.nexaUsers[username];
    if (!recipient) {
      replyLater('I do not recognize that recipient. Try one of the usernames from the transfer dropdown.');
      return;
    }
    chatCtx.data.to = username;
    chatCtx.step = 'transfer_confirm';
    replyLater(`Reply yes to send ${fmt(chatCtx.data.amount)} to ${recipient.name}.`);
    return;
  }

  if (chatCtx.step === 'transfer_confirm') {
    if (!message.includes('yes')) {
      chatCtx = { step: 'idle', data: {} };
      replyLater('Transfer canceled.');
      return;
    }

    const amount = chatCtx.data.amount;
    const recipient = STATE.nexaUsers[chatCtx.data.to];
    if (amount > (STATE.balances.checking || 0)) {
      chatCtx = { step: 'idle', data: {} };
      replyLater('Insufficient funds in checking for that transfer.');
      return;
    }

    STATE.balances.checking = roundTo(STATE.balances.checking - amount);
    STATE.transactions.unshift({
      id: Date.now(),
      desc: `Transfer to ${recipient.name}`,
      type: 'out',
      amount,
      date: today(),
      icon: '→',
      acct: 'checking',
    });
    renderDashboard();
    refreshAllTxns();
    updateBalanceSelects();
    updateWDDropdowns();
    chatCtx = { step: 'idle', data: {} };
    replyLater(`Transfer complete. ${fmt(amount)} sent to ${recipient.name}.`);
    return;
  }

  if (/\b(balance|checking|savings|money|funds)\b/.test(message)) {
    response = `Checking: ${fmt(STATE.balances.checking || 0)}.${STATE.user.hasSavings ? ` Savings: ${fmt(STATE.balances.savings || 0)}.` : ''}`;
  } else if (/\b(transfer|send money|move money)\b/.test(message)) {
    chatCtx = { step: 'transfer_amount', data: {} };
    response = 'How much would you like to transfer?';
  } else if (/\b(bill|bills|payment|due)\b/.test(message)) {
    response = STATE.bills.length
      ? `Pending bills: ${STATE.bills.map(bill => `${bill.name} ${fmt(bill.amount)} due ${bill.due}`).join(', ')}`
      : 'You have no pending bills.';
  } else if (/\b(loan|credit|debt)\b/.test(message)) {
    response = STATE.loans.length
      ? `Loans: ${STATE.loans.map(loan => `${loan.name} ${fmt(loan.balance)} remaining`).join(', ')}`
      : 'You have no outstanding loans.';
  } else if (/\b(card|cards|freeze)\b/.test(message)) {
    response = `Cards: ${STATE.cards.map(card => `${card.brand} is ${card.frozen ? 'frozen' : 'active'}`).join(', ')}.`;
  } else if (/\b(history|transactions|activity|recent)\b/.test(message)) {
    response = STATE.transactions.length
      ? `Recent activity: ${STATE.transactions.slice(0, 3).map(txn => `${txn.desc} ${txn.type === 'in' ? '+' : '-'}${fmt(txn.amount)}`).join(', ')}`
      : 'No recent transactions.';
  }

  replyLater(response);
}

function replyLater(text) {
  setTimeout(() => addChatMsg('bot', text), 350);
}

function toggleChat() {
  const panel = document.getElementById('chatPanel');
  const overlay = document.getElementById('chatOverlay');
  panel.classList.toggle('open');
  overlay.classList.toggle('open');
  if (panel.classList.contains('open')) {
    document.getElementById('chatInput').focus();
  }
}
