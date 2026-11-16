import * as ChronlangEngine from './index';

const editor = document.getElementById('editor') as HTMLTextAreaElement;
const output = document.getElementById('output') as HTMLPreElement;
const runBtn = document.getElementById('run-btn') as HTMLButtonElement;
const copyBtn = document.getElementById('copy-btn') as HTMLButtonElement;
const fnSelect = document.getElementById('fn-select') as HTMLSelectElement;
const statusEl = document.getElementById('status') as HTMLSpanElement;
const charCount = document.getElementById('char-count') as HTMLSpanElement;

// 1. Discover all exported functions from src/index.ts automatically
const exportedFunctions = Object.entries(ChronlangEngine).filter(
  ([, value]) => typeof value === 'function'
);

if (exportedFunctions.length > 0) {
  statusEl.textContent = `Connected (${exportedFunctions.length} engine functions found)`;
  exportedFunctions.forEach(([name]) => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = `${name}()`;
    fnSelect.appendChild(option);
  });
} else {
  statusEl.textContent = 'Connected (Check src/index.ts exports)';
}

// 2. Execute the selected engine function against the editor text
function runEngine() {
  const code = editor.value;
  const selectedFnName = fnSelect.value;
  output.classList.remove('error');

  if (!selectedFnName) {
    output.classList.add('error');
    output.textContent = 'No exported functions found in src/index.ts.';
    return;
  }

  try {
    const fn = (ChronlangEngine as Record<string, any>)[selectedFnName];
    const result = fn(code);

    // Format output cleanly whether it returns a string, array, or AST/state object
    if (typeof result === 'string') {
      output.textContent = result;
    } else {
      output.textContent = JSON.stringify(result, null, 2);
    }
  } catch (err: any) {
    output.classList.add('error');
    output.textContent = err?.stack || err?.message || String(err);
  }
}

// Event Listeners
runBtn.addEventListener('click', runEngine);

editor.addEventListener('input', () => {
  charCount.textContent = `${editor.value.length} chars`;
});

editor.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    runEngine();
  }
});

copyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(output.textContent || '');
  copyBtn.textContent = 'Copied!';
  setTimeout(() => (copyBtn.textContent = 'Copy'), 1500);
});
