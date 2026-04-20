// ===========================
//   USERS DATABASE
// ===========================
const USERS_DB = {
  marco: {
    password: '1234',
    user: { name: 'Marco', initials: 'M', hasSavings: true, phone: '•••-•••-1847', email: 'm***o@email.com' },
    balances: { checking: 4250.00, savings: 12800.00 },
    monthSpent: 1240.00,
    transactions: [
      { id:1, desc:'Amazon Purchase',    type:'out',  amount:89.99,  date:'Mar 29, 2026', icon:'??', acct:'checking' },
      { id:2, desc:'Salary Deposit',     type:'in',   amount:3200.00,date:'Mar 28, 2026', icon:'??', acct:'checking' },
      { id:3, desc:'Netflix',            type:'bill', amount:15.99,  date:'Mar 27, 2026', icon:'??', acct:'checking' },
      { id:4, desc:'Electric Bill',      type:'bill', amount:112.40, date:'Mar 25, 2026', icon:'?', acct:'checking' },
      { id:5, desc:'Transfer ? Savings', type:'out',  amount:500.00, date:'Mar 22, 2026', icon:'??', acct:'checking' },
      { id:6, desc:'Freelance Payment',  type:'in',   amount:450.00, date:'Mar 20, 2026', icon:'??', acct:'checking' },
    ],
    cards: [
      { id:'visa', brand:'Visa',       num:'•••• •••• •••• 4521', holder:'Marco', exp:'05/29', frozen:false },
      { id:'mc',   brand:'Mastercard', num:'•••• •••• •••• 8834', holder:'Marco', exp:'11/27', frozen:false },
    ],
    bills: [
      { id:'electric', name:'Electric Bill',  icon:'?', amount:112.40, due:'Apr 3'  },
      { id:'internet', name:'Internet',        icon:'??', amount:59.99,  due:'Apr 5'  },
      { id:'netflix',  name:'Netflix',         icon:'??', amount:15.99,  due:'Apr 7'  },
      { id:'water',    name:'Water Bill',      icon:'??', amount:44.50,  due:'Apr 10' },
      { id:'gym',      name:'Gym Membership',  icon:'???', amount:29.00,  due:'Apr 12' },
    ],
    nexaUsers: {
      sarah: { name:'Sarah Johnson',  acct:'••4892' },
      alex:  { name:'Alex Thompson',  acct:'••7731' },
      maria: { name:'Maria Garcia',   acct:'••2245' },
      james: { name:'James Wilson',   acct:'••6618' },
      linda: { name:'Linda Chen',     acct:'••9903' },
      jacob: { name:'Jacob Schmidt',  acct:'••3317' },
    },
    loans: [
      { id:'cc',       name:'Credit Card',   icon:'??', balance:2340.00,  limit:5000.00,   minPayment:45.00,  apr:22.99, dueDate:'Apr 10', type:'credit',      colorClass:'credit'      },
      { id:'auto',     name:'Auto Loan',     icon:'??', balance:14850.00, original:22000.00,minPayment:312.00, apr:6.90,  dueDate:'Apr 5',  type:'installment', colorClass:'installment' },
      { id:'personal', name:'Personal Loan', icon:'??', balance:4200.00,  original:8000.00, minPayment:178.00, apr:11.50, dueDate:'Apr 15', type:'installment', colorClass:'installment' },
    ],
  },
  jacob: {
    password: '5678',
    user: { name: 'Jacob Schmidt', initials: 'JS', hasSavings: false, phone: '•••-•••-3317', email: 'j***b@email.com' },
    balances: { checking: 3180.00 },
    monthSpent: 620.00,
    transactions: [
      { id:1, desc:'Gas Station',      type:'out',  amount:45.00,  date:'Mar 29, 2026', icon:'?', acct:'checking' },
      { id:2, desc:'Auto Insurance',   type:'bill', amount:127.50, date:'Mar 28, 2026', icon:'??', acct:'checking' },
      { id:3, desc:'Paycheck',         type:'in',   amount:2850.00,date:'Mar 27, 2026', icon:'??', acct:'checking' },
      { id:4, desc:'Grocery Store',    type:'out',  amount:89.30,  date:'Mar 25, 2026', icon:'??', acct:'checking' },
      { id:5, desc:'Coffee Shop',      type:'out',  amount:12.50,  date:'Mar 24, 2026', icon:'?', acct:'checking' },
      { id:6, desc:'Credit Card Pmt',  type:'bill', amount:29.00,  date:'Mar 20, 2026', icon:'??', acct:'checking' },
    ],
    cards: [
      { id:'visa-j', brand:'Visa', num:'•••• •••• •••• 7743', holder:'Jacob Schmidt', exp:'09/28', frozen:false },
    ],
    bills: [],
    nexaUsers: {
      marco: { name:'Marco',          acct:'••4521' },
      sarah: { name:'Sarah Johnson',  acct:'••4892' },
      alex:  { name:'Alex Thompson',  acct:'••7731' },
      maria: { name:'Maria Garcia',   acct:'••2245' },
      james: { name:'James Wilson',   acct:'••6618' },
      linda: { name:'Linda Chen',     acct:'••9903' },
    },
    loans: [
      { id:'cc',   name:'Credit Card', icon:'??', balance:1450.00, limit:3000.00,   minPayment:29.00,  apr:24.99, dueDate:'Apr 8', type:'credit',      colorClass:'loan' },
      { id:'auto', name:'Auto Loan',   icon:'??', balance:18500.00,original:25000.00,minPayment:298.00, apr:5.90,  dueDate:'Apr 3', type:'installment', colorClass:'loan' },
    ],
  },
};
