// Simple calculator logic
const displayEl = document.getElementById('display');
const keys = document.querySelector('.keys');

let current = '';      // current expression string
let justEvaluated = false;

function updateDisplay(val){
  displayEl.textContent = val === '' ? '0' : val;
}

function append(value){
  if (justEvaluated && /[0-9.]/.test(value)) {
    // start new number after an evaluation when user types digit/decimal
    current = '';
    justEvaluated = false;
  }
  current += value;
  updateDisplay(current);
}

function backspace(){
  if (current.length > 0){
    current = current.slice(0, -1);
    updateDisplay(current);
  }
}

function clearAll(){
  current = '';
  justEvaluated = false;
  updateDisplay('0');
}

function applyPercent(){
  // apply percent to the last number in the expression
  // find last number and divide it by 100
  const match = current.match(/(\d+\.?\d*)$/);
  if (match){
    const num = match[1];
    const replaced = (parseFloat(num) / 100).toString();
    current = current.slice(0, match.index) + replaced;
    updateDisplay(current);
  }
}

function safeEval(expr){
  // Replace display-friendly operators with JS operators
  expr = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');

  // Allow only digits, operators, parentheses, decimal point, whitespace
  if (!/^[0-9+\-*/().\s%]+$/.test(expr)) {
    throw new Error('Invalid characters');
  }

  // Basic safety: do not allow sequences like "/*" or "**" (except builtin * for multiply)
  // Evaluate using Function to keep it simple
  // Note: This is a simple calculator; for production consider a full parser.
  return Function('"use strict"; return (' + expr + ')')();
}

function evaluate(){
  if (current.trim() === '') return;
  try {
    const result = safeEval(current);
    current = String(result);
    updateDisplay(current);
    justEvaluated = true;
  } catch (e){
    updateDisplay('Error');
    current = '';
    justEvaluated = true;
  }
}

keys.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;

  const value = btn.dataset.value;
  const action = btn.dataset.action;

  if (action === 'clear') {
    clearAll();
    return;
  }
  if (action === 'back') {
    backspace();
    return;
  }
  if (action === 'percent') {
    applyPercent();
    return;
  }
  if (action === 'equals') {
    evaluate();
    return;
  }

  // value buttons (digits, ., ops)
  if (value) {
    // Prevent multiple decimals in the same number
    if (value === '.') {
      // find the last number segment
      const lastNum = current.split(/[\+\-\×\÷\*\/\−\(\)]/).pop();
      if (lastNum && lastNum.includes('.')) return;
      if (lastNum === '' && (current === '' || /[\+\-\×\÷\*\/\−\(]$/.test(current))) {
        // if starting a decimal number like ".5", prepend '0'
        append('0');
      }
    }

    // Avoid two operators in a row (replace if last is operator)
    if (/^[\+\-×÷\*\/−]$/.test(value)) {
      if (current === '' && value !== '-') return; // don't allow leading +,*,/
      if (/[\+\-\×÷\*\/−]$/.test(current)) {
        // replace last operator
        current = current.slice(0, -1) + value;
        updateDisplay(current);
        return;
      }
    }
    append(value);
  }
});

// Keyboard support
document.addEventListener('keydown', (e) => {
  if (e.key >= '0' && e.key <= '9') {
    append(e.key);
    return;
  }
  if (e.key === '.') { append('.'); return; }
  if (e.key === 'Enter' || e.key === '=') { evaluate(); return; }
  if (e.key === 'Backspace') { backspace(); return; }
  if (e.key === 'Escape') { clearAll(); return; }

  // map keyboard operators
  const map = {'/':'÷','*':'×','-':'−','+':'+'};
  if (map[e.key]) {
    append(map[e.key]);
    return;
  }
});