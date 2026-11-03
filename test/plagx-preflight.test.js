import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DOMParser } from 'linkedom';

globalThis.DOMParser = DOMParser;
const { htmlToText } = await import('../js/plagx-preflight.js');
const { checkDraft } = await import('../js/lib/index.js');

const POST = `<!-- wp:heading --><h2 class="wp-block-heading">Introduction</h2><!-- /wp:heading -->
<!-- wp:paragraph --><p>Academic writing is is a skill (Smith, 2020). A good draft cites <strong>every</strong> source (Brown, 2018).</p><!-- /wp:paragraph -->
<!-- wp:heading --><h2 class="wp-block-heading">References</h2><!-- /wp:heading -->
<!-- wp:list --><ul><li>Smith, J. (2020). Writing for university. Academic Press.</li><li>Lee, K. (2019). Planning essays. Study Skills Journal, 4(2), 10-18.</li></ul><!-- /wp:list -->`;

test('CKEditor HTML becomes paragraphs, headings and reference lines', () => {
  assert.equal(htmlToText(POST), [
    '# Introduction',
    'Academic writing is is a skill (Smith, 2020). A good draft cites every source (Brown, 2018).',
    '# References',
    'Smith, J. (2020). Writing for university. Academic Press.',
    'Lee, K. (2019). Planning essays. Study Skills Journal, 4(2), 10-18.',
  ].join('\n\n'));
});

test('Preflight finds the issues in a converted post', () => {
  const codes = checkDraft(htmlToText(POST)).issues.map((i) => i.code);
  assert.ok(codes.includes('repeated-word'));
  assert.ok(codes.includes('citation-no-reference')); // Brown, 2018
  assert.ok(codes.includes('reference-not-cited')); // Lee, 2019
});

test('plain text without block tags is kept as is', () => {
  assert.equal(htmlToText('Plain text draft.'), 'Plain text draft.');
});

test('plain text keeps blank-line paragraphs next to headings', () => {
  const html = '<h2>Introduction</h2>\nFirst paragraph with <em>emphasis</em>.\n\nSecond paragraph.\n<h2>References</h2>\nSmith, J. (2020). Title.';
  assert.equal(htmlToText(html), '# Introduction\n\nFirst paragraph with emphasis.\n\nSecond paragraph.\n\n# References\n\nSmith, J. (2020). Title.');
});

test('a pasted code block is read line by line', () => {
  const html = '<!-- wp:code --><pre class="wp-block-code"><code>Introduction\nAcademic writing is is a skill (Smith, 2020). A good draft cites every source (Brown, 2018).\nReferences\nSmith, J. (2020). Writing for university. Academic Press.\nLee, K. (2019). Planning essays. Study Skills Journal, 4(2), 10-18.</code></pre><!-- /wp:code -->';
  const result = checkDraft(htmlToText(html));
  const codes = result.issues.map((i) => i.code);
  assert.ok(codes.includes('repeated-word'));
  assert.ok(codes.includes('citation-no-reference'));
  assert.ok(codes.includes('reference-not-cited'));
});

test('line breaks inside a paragraph start new lines', () => {
  assert.equal(htmlToText('<p>References<br>Smith, J. (2020). Title.<br/>Lee, K. (2019). Other.</p>'),
    'References\n\nSmith, J. (2020). Title.\n\nLee, K. (2019). Other.');
});

test('nested blocks are read once', () => {
  assert.equal(htmlToText('<blockquote><p>Quoted.</p></blockquote>'), 'Quoted.');
});
