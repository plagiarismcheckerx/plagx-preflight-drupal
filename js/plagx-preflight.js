// Draft Preflight panel: reads the content from the Drupal edit form and runs Plagx Preflight on it.
import { checkDraft } from './lib/index.js';

const BLOCKS = 'p, h1, h2, h3, h4, h5, h6, li, blockquote, pre, figcaption, td, th, dt, dd';
const LEVELS = { error: 'Error', warning: 'Warning', info: 'Suggestion' };

/**
 * The content's current HTML: every CKEditor 5 field on the edit form in page order,
 * or the plain text areas when no editor is attached (e.g. a plain-text format).
 */
function editorContent() {
  const form = document.querySelector('form.node-form') ?? document;
  const instances = window.Drupal?.CKEditor5Instances;
  const parts = [];
  for (const area of form.querySelectorAll('textarea')) {
    if (area.closest('.plagx-preflight')) continue;
    const editor = area.dataset.ckeditor5Id && instances?.get(area.dataset.ckeditor5Id);
    if (editor) parts.push(editor.getData());
    else if (area.name && area.name.endsWith('[value]') && !area.name.includes('[summary]')) parts.push(area.value);
  }
  return parts.join('\n');
}

/** Each non-empty line of `text` as its own paragraph, with runs of spaces collapsed. */
const lines = (text) => text.split('\n').map((l) => l.replace(/\s+/g, ' ').trim()).filter(Boolean);

/**
 * Content HTML as plain text: one paragraph per block, and per line inside a block
 * (line breaks, code and preformatted blocks), headings marked with "#" so
 * Preflight treats them as headings (including a References heading).
 */
export function htmlToText(html) {
  const doc = new DOMParser().parseFromString(`<!doctype html><html><body>${html}</body></html>`, 'text/html');
  for (const br of doc.body.querySelectorAll('br')) br.replaceWith('\n');
  if (!doc.body.querySelector('p, li')) {
    // Plain text or a single code block: no paragraph markup.
    for (const h of doc.body.querySelectorAll('h1, h2, h3, h4, h5, h6')) h.textContent = `\n# ${h.textContent.trim()}\n`;
    return lines(doc.body.textContent).join('\n\n');
  }
  const leaves = [...doc.body.querySelectorAll(BLOCKS)].filter((el) => !el.querySelector(BLOCKS));
  return leaves
    .flatMap((el) => {
      if (/^H[1-6]$/.test(el.tagName)) {
        const text = el.textContent.replace(/\s+/g, ' ').trim();
        return text ? [`# ${text}`] : [];
      }
      return lines(el.textContent);
    })
    .join('\n\n');
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function render(box, result) {
  const out = box.querySelector('.plagx-preflight__result');
  out.replaceChildren();
  const { stats } = result;
  const tiles = el('div', 'plagx-stats');
  for (const [value, label] of [
    [stats.words, 'Words'],
    [stats.readingTimeMinutes, 'Min read'],
    [stats.sentences, 'Sentences'],
    [stats.paragraphs, 'Paragraphs'],
  ]) {
    const tile = el('div', 'plagx-stat');
    tile.append(el('strong', '', String(value)), el('span', '', label));
    tiles.append(tile);
  }
  const pills = el('div', 'plagx-pills');
  pills.append(
    el('span', `plagx-pill${result.errors ? ' is-error' : ''}`, `${result.errors} errors`),
    el('span', `plagx-pill${result.warnings ? ' is-warning' : ''}`, `${result.warnings} warnings`),
    el('span', `plagx-pill${result.infos ? ' is-info' : ''}`, `${result.infos} suggestions`),
  );
  out.append(tiles, pills);
  if (!result.issues.length) {
    out.append(el('p', 'plagx-done', '✓ No issues found.'));
    return;
  }
  const list = el('ul', 'plagx-issues');
  for (const issue of result.issues) {
    const item = el('li', `plagx-issue is-${issue.level}`);
    item.append(
      el('span', 'plagx-issue__level', LEVELS[issue.level]),
      el('span', 'plagx-issue__message', issue.message.replace(/^Suggestion: /, '')),
    );
    if (issue.text) item.append(el('span', 'plagx-issue__text', issue.text.length > 80 ? `${issue.text.slice(0, 80)}…` : issue.text));
    list.append(item);
  }
  out.append(list);
}

function run(box) {
  const field = (name) => box.querySelector(`[data-field="${name}"]`).value;
  const number = (name) => Number.parseInt(field(name), 10) || undefined;
  const checks = box.dataset.checks ? box.dataset.checks.split(',') : [];
  try {
    render(box, checkDraft(htmlToText(editorContent()), {
      minWords: number('minWords'),
      maxWords: number('maxWords'),
      style: field('style'),
      checks,
    }));
  } catch (err) {
    box.querySelector('.plagx-preflight__result').replaceChildren(el('p', 'plagx-fail', err.message));
  }
}

for (const box of globalThis.document?.querySelectorAll('.plagx-preflight') ?? []) {
  box.querySelector('[data-action="check"]').addEventListener('click', () => run(box));
}
