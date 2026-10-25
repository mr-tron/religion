/* Regenerate the human review queue from the checked batch files. */
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const directory = path.join(root, 'catalog_batches');
const files = fs.readdirSync(directory)
  .filter(name => /^batch_\d{4}_\d{4}\.json$/.test(name)).sort();
const entries = files.flatMap(name => JSON.parse(fs.readFileSync(path.join(directory, name), 'utf8')).entries)
  .sort((a, b) => a.sourceIndex - b.sourceIndex);
const total = fs.readFileSync(path.join(root, 'religions.txt'), 'utf8')
  .split(/\r?\n/).filter(line => line && !line.startsWith('#')).length;
const counts = {keep: 0, alias: 0, review: 0};
for (const entry of entries) counts[entry.decision]++;

const escaped = value => String(value ?? '').replaceAll('|', '\\|').replaceAll('\n', ' ');
const link = entry => `[источник](${entry.sources[0]})`;
const lines = [
  '# Ревью каталога',
  '',
  'Создано командой `node scripts/build-catalog-report.js`. Основные данные и все источники находятся в `batch_*.json`.',
  '',
  `Обработано: **${entries.length}/${total}**. Отдельных кандидатов: **${counts.keep}**; синонимов: **${counts.alias}**; на ревью: **${counts.review}**.`,
  '',
  '## Синонимы',
  '',
  '| № | Исходное название | Каноническое название | Основание |',
  '| ---: | --- | --- | --- |',
  ...entries.filter(entry => entry.decision === 'alias').map(entry =>
    `| ${entry.sourceIndex} | ${escaped(entry.sourceName)} | ${escaped(entry.canonicalName)} | ${escaped(entry.notes)} ${link(entry)} |`),
  '',
  '## Требует редакторского решения',
  '',
  '| № | Исходное название | Предлагаемое название | Причина |',
  '| ---: | --- | --- | --- |',
  ...entries.filter(entry => entry.decision === 'review').map(entry =>
    `| ${entry.sourceIndex} | ${escaped(entry.sourceName)} | ${escaped(entry.canonicalName)} | ${escaped(entry.notes)} ${link(entry)} |`),
  '',
  '## Предложенные вопросы',
  '',
];
const proposals = new Map();
for (const entry of entries) for (const question of entry.proposedQuestions || []) {
  if (!question || typeof question !== 'object' || !question.id) continue;
  if (!proposals.has(question.id)) proposals.set(question.id, {texts: new Set(), indices: []});
  proposals.get(question.id).texts.add(question.text || '');
  proposals.get(question.id).indices.push(entry.sourceIndex);
}
for (const [id, proposal] of [...proposals].sort(([a], [b]) => a.localeCompare(b))) {
  lines.push(`- **${id}** — ${[...proposal.texts].filter(Boolean).join(' / ')} (строки: ${proposal.indices.join(', ')}).`);
}
lines.push('');
fs.writeFileSync(path.join(directory, 'REVIEW.md'), lines.join('\n'));
console.log(`catalog_batches/REVIEW.md: ${entries.length}/${total} записей, ${proposals.size} предложенных вопросов`);
