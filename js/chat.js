// ===========================
//   CHAT ASSISTANT
// ===========================
function initChat() {
  chatCtx = { step: "idle", data: {} };
  document.getElementById("chatInput").addEventListener("keydown", e => {
    if (e.key === "Enter") sendChat();
  });
}

function sendChat() {
  const input = document.getElementById("chatInput").value.trim();
  if (!input) return;
  addChatMsg("user", input);
  document.getElementById("chatInput").value = "";
  processChat(input.toLowerCase());
}

function addChatMsg(type, text, isHtml = false) {
  const chat = document.getElementById("chatMsgs");
  const msg = document.createElement("div");
  msg.className = `chat-msg ${type}`;
  if (isHtml) msg.innerHTML = text; else msg.textContent = text;
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}

function processChat(msg) {
  // Simple NLP patterns
  const patterns = {
    balance: /\b(balance|money|funds|account)\b/i,
    transfer: /\b(transfer|send|move|pay)\b.*\b(to|from)\b/i,
    bill: /\b(bill|payment|pay|due)\b/i,
    loan: /\b(loan|credit|debt|borrow)\b/i,
    help: /\b(help|what|how|can|support)\b/i,
    history: /\b(history|transactions|activity|recent)\b/i,
    card: /\b(card|freeze|unfreeze|debit|credit)\b/i,
    deposit: /\b(deposit|add|withdraw|cash)\b/i,
    savings: /\b(savings|save|interest)\b/i,
    chat: /\b(chat|talk|assistant|nexa)\b/i
  };

  let response = "I'm not sure I understand. Try asking about your balance, transfers, bills, loans, or cards!";
  let action = null;

  if (patterns.balance.test(msg)) {
    response = `Your checking balance is ${fmt(STATE.balances.checking)}.${STATE.user.hasSavings ? ` Your savings balance is ${fmt(STATE.balances.savings)}.` : ""}`;
  } else if (patterns.transfer.test(msg)) {
    if (chatCtx.step === "idle") {
      chatCtx.step = "transfer_amount";
      response = "How much would you like to transfer?";
    }
  } else if (patterns.bill.test(msg)) {
    const bills = STATE.bills.map(b => `${b.name}: ${fmt(b.amount)} due ${b.due}`).join(", ");
    response = bills ? `Your bills: ${bills}` : "You have no outstanding bills!";
  } else if (patterns.loan.test(msg)) {
    const loans = STATE.loans.map(l => `${l.name}: ${fmt(l.balance)} remaining`).join(", ");
    response = loans ? `Your loans: ${loans}` : "You have no outstanding loans!";
  } else if (patterns.history.test(msg)) {
    const recent = STATE.transactions.slice(0, 3).map(t => `${t.desc}: ${t.type === "in" ? "+" : "-"}${fmt(t.amount)}`).join(", ");
    response = recent ? `Recent transactions: ${recent}` : "No recent transactions.";
  } else if (patterns.card.test(msg)) {
    const cards = STATE.cards.map(c => `${c.brand}: ${c.frozen ? "frozen" : "active"}`).join(", ");
    response = `Your cards: ${cards}`;
  } else if (patterns.deposit.test(msg) || patterns.withdraw.test(msg)) {
    response = "For deposits and withdrawals, please use the Withdraw/Deposit section in the app.";
  } else if (patterns.savings.test(msg)) {
    if (STATE.user.hasSavings) {
      response = `Your savings balance is ${fmt(STATE.balances.savings)}.`;
    } else {
      response = "You don't have a savings account yet.";
    }
  } else if (patterns.chat.test(msg) || patterns.help.test(msg)) {
    response = "I'm Nexa, your banking assistant! I can help with balances, transfers, bills, loans, cards, and more. What would you like to know?";
  }

  // Handle multi-step conversations
  if (chatCtx.step === "transfer_amount") {
    const amt = parseFloat(msg.replace(/[^0-9.]/g, ""));
    if (amt && amt > 0) {
      chatCtx.data.amount = amt;
      chatCtx.step = "transfer_to";
      response = "Who would you like to transfer to? (Enter a NexaBank username)";
    } else {
      response = "Please enter a valid amount.";
    }
  } else if (chatCtx.step === "transfer_to") {
    const user = msg.replace(/[^a-z0-9]/gi, "").toLowerCase();
    if (STATE.nexaUsers.includes(user)) {
      chatCtx.data.to = user;
      chatCtx.step = "transfer_confirm";
      response = `Transfer ${fmt(chatCtx.data.amount)} to ${user}? Reply "yes" to confirm.`;
    } else {
      response = "I don't recognize that username. Please check the spelling.";
    }
  } else if (chatCtx.step === "transfer_confirm" && msg.includes("yes")) {
    if (chatCtx.data.amount > STATE.balances.checking) {
      response = "Insufficient funds for this transfer.";
    } else {
      STATE.balances.checking -= chatCtx.data.amount;
      STATE.transactions.unshift({
        id: Date.now(), date: today(), desc: `Transfer to ${chatCtx.data.to}`, amount: chatCtx.data.amount, type: "out", icon: "??"
      });
      renderDashboard();
      refreshAllTxns();
      response = `? Transfer of ${fmt(chatCtx.data.amount)} to ${chatCtx.data.to} completed!`;
    }
    chatCtx = { step: "idle", data: {} };
  } else if (chatCtx.step === "transfer_confirm") {
    response = "Transfer cancelled.";
    chatCtx = { step: "idle", data: {} };
  }

  setTimeout(() => addChatMsg("bot", response), 500 + Math.random() * 500);
}

function toggleChat() {
  const chat = document.getElementById("chatContainer");
  chat.classList.toggle("open");
  if (chat.classList.contains("open")) {
    document.getElementById("chatInput").focus();
  }
}
