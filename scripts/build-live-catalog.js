/* Turn reviewed JSON batches into a checked-in browser script; no build is needed to serve the site. */
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const directory = path.join(root, 'catalog_batches');
const sourceRows = fs.readFileSync(path.join(root, 'religions.txt'), 'utf8')
  .split(/\r?\n/).filter(line => line && !line.startsWith('#'));
const files = fs.readdirSync(directory)
  .filter(name => /^batch_\d{4}_\d{4}\.json$/.test(name)).sort();
const entries = files.flatMap(name => JSON.parse(fs.readFileSync(path.join(directory, name), 'utf8')).entries)
  .sort((a, b) => a.sourceIndex - b.sourceIndex);

if (entries.length !== sourceRows.length || entries.some((entry, index) => entry.sourceIndex !== index + 1)) {
  throw Error('Каталог не покрывает все строки religions.txt без пропусков');
}

const newFamilies = {
  ancient_neareastern: {name: 'Древние ближневосточные традиции', profile: ''},
  ancient_american: {name: 'Древние традиции Америки', profile: ''},
  ancient_european: {name: 'Древние европейские традиции', profile: ''},
  ancient_anatolian: {name: 'Древние анатолийские традиции', profile: ''},
  ancient_caucasian: {name: 'Древние кавказские традиции', profile: ''},
  ancient_southasian: {name: 'Древние южноазиатские традиции', profile: ''},
  european_folk: {name: 'Европейские народные традиции', profile: ''},
};

// Reviewed question proposals with a positive answer confirmed for these specific records.
// Absence from a list means unknown, never an automatic "Нет".
const verifiedQuestionLinks = {
  divination_oracles: [1, 12, 13, 527, 530, 532, 587, 596],
  initiatory_brotherhood: [2, 3, 462, 717, 1005],
  spirit_possession: [22, 26, 31, 42, 43, 78, 79, 89, 98, 104, 144, 147, 148, 149, 352, 355, 367, 572, 882],
  entheogenic_ritual: [35, 260, 666, 667, 668, 669, 670, 671, 899, 905],
  spiritual_hand_transmission: [946, 958, 965, 968],
  ritual_masks: [2, 20, 30, 33, 34, 41, 47, 49, 52, 55, 73, 75, 76, 96, 113, 133, 134, 139, 196, 205, 209, 214, 220, 240, 246, 247, 248, 271, 287, 304, 311, 318, 329, 332, 370, 392, 505, 517, 556, 576, 607],
};

function familyFor(entry) {
  if (entry.family) return entry.family;
  const proposed = entry.notes.match(/\b(ancient_neareastern|ancient_american|ancient_european|ancient_anatolian|ancient_caucasian|ancient_southasian|european_folk)\b/);
  if (proposed) return proposed[1];
  const index = entry.sourceIndex;
  if (index >= 156 && index <= 175) return 'ancient_neareastern';
  if (index >= 209 && index <= 333) return 'ancient_american';
  if (index === 425) return 'ancient_caucasian';
  if (index >= 434 && index <= 490) return 'ancient_european';
  if (index >= 528 && index <= 537) return 'ancient_neareastern';
  if (index >= 615 && index <= 616) return 'ancient_european';
  if (index === 739) return 'philosophical';
  throw Error(`Не указано семейство для строки ${index}: ${entry.sourceName}`);
}

function completeProfile(entry) {
  const tokens=(entry.profile || '').split(/\s+/).filter(Boolean);
  const known=new Map(tokens.map(token=>[token.slice(1),token[0]]));
  for(const [id,indices] of Object.entries(verifiedQuestionLinks)){
    if(!indices.includes(entry.sourceIndex)) continue;
    if(known.has(id)){
      if(known.get(id)!=='+') throw Error(`Противоречивый признак ${id} у записи ${entry.sourceIndex}`);
      continue;
    }
    tokens.push(`+${id}`);
  }
  return tokens.join(' ');
}

const traditions = entries.filter(entry => entry.decision === 'keep').map(entry => ({
  id: `catalog-${String(entry.sourceIndex).padStart(4, '0')}`,
  name: entry.canonicalName,
  family: familyFor(entry),
  description: entry.description,
  profile: completeProfile(entry),
  inheritFamilyProfile: false,
  parent: entry.parent || null,
  sourceIndex: entry.sourceIndex,
  sources: entry.sources,
}));

const usedFamilies = new Set(traditions.map(entry => entry.family));
const activeNewFamilies = Object.fromEntries(Object.entries(newFamilies)
  .filter(([id]) => usedFamilies.has(id)));
const payload = {families: activeNewFamilies, traditions};
const output = `/* Generated from reviewed catalog_batches/*.json. Edit batches, then run node scripts/build-live-catalog.js. */\n` +
  `(() => {\n  const additions = ${JSON.stringify(payload)};\n` +
  `  const catalog = globalThis.WORLDVIEW_RELIGIONS;\n` +
  `  Object.assign(catalog.families, additions.families);\n` +
  `  catalog.traditions.push(...additions.traditions);\n` +
  `})();\n`;
fs.writeFileSync(path.join(root, 'catalog.js'), output);
console.log(`catalog.js: ${traditions.length} новых записей, ${Object.keys(activeNewFamilies).length} новых семейств`);
