/* Development-only validation; the published site does not run this file. */
const fs=require('node:fs');
const path=require('node:path');
require('../questions.js');
require('../religions.js');

const root=path.join(__dirname,'..');
const rows=fs.readFileSync(path.join(root,'religions.txt'),'utf8')
  .split(/\r?\n/).filter(line=>line&&!line.startsWith('#'))
  .map(line=>line.split('\t'));
const questionIds=new Set(globalThis.WORLDVIEW_QUESTIONS.map(q=>q.id));
const families=new Set(Object.keys(globalThis.WORLDVIEW_RELIGIONS.families));
const existingNames=new Set(globalThis.WORLDVIEW_RELIGIONS.traditions.map(entry=>entry.name.toLocaleLowerCase('ru')));
const directory=path.join(root,'catalog_batches');
const files=fs.existsSync(directory)?fs.readdirSync(directory).filter(name=>/^batch_\d{4}_\d{4}\.json$/.test(name)).sort():[];
const seen=new Set();
const keptNames=new Map();
const resolvedNames=new Set(existingNames);
const aliases=[];
let counts={keep:0,alias:0,review:0};
let errors=[];

for(const file of files){
  try {
    const match=file.match(/^batch_(\d{4})_(\d{4})\.json$/);
    const start=Number(match[1]),end=Number(match[2]);
    const batch=JSON.parse(fs.readFileSync(path.join(directory,file),'utf8'));
    if(batch.range?.[0]!==start||batch.range?.[1]!==end||!Array.isArray(batch.entries)||batch.entries.length!==end-start+1) throw Error('неверный диапазон или число записей');
    for(let offset=0;offset<batch.entries.length;offset++){
      const entry=batch.entries[offset],index=start+offset;
      if(index>rows.length||entry.sourceIndex!==index||entry.sourceName!==rows[index-1][0]) throw Error(`запись ${index} не соответствует religions.txt`);
      if(seen.has(index)) throw Error(`индекс ${index} обработан дважды`);
      seen.add(index);
      if(!['keep','alias','review'].includes(entry.decision)) throw Error(`неверное решение для ${index}`);
      counts[entry.decision]++;
      if(!entry.canonicalName||typeof entry.notes!=='string'||!Array.isArray(entry.sources)||!entry.sources.length||entry.sources.some(url=>!/^https:\/\//.test(url))) throw Error(`неполные источники/заметки для ${index}`);
      if(entry.decision==='alias') aliases.push(entry);
      else resolvedNames.add(entry.canonicalName.toLocaleLowerCase('ru'));
      if(entry.decision==='keep'&&!entry.description) throw Error(`нет описания для ${index}`);
      if(entry.decision==='keep'){
        const name=entry.canonicalName.toLocaleLowerCase('ru');
        if(existingNames.has(name)) throw Error(`запись ${index} уже есть в religions.js: ${entry.canonicalName}`);
        if(keptNames.has(name)) throw Error(`записи ${keptNames.get(name)} и ${index} имеют одинаковое название: ${entry.canonicalName}`);
        keptNames.set(name,index);
      }
      if(entry.family&&!families.has(entry.family)) throw Error(`неизвестное семейство ${entry.family} для ${index}`);
      if(entry.inheritFamilyProfile!==false) throw Error(`новая запись ${index} должна отключать наследование общего профиля`);
      const featureIds=new Set();
      for(const token of String(entry.profile||'').split(/\s+/).filter(Boolean)){
        const id=token.slice(1);
        if(!/^[+-][a-z_]+$/.test(token)||!questionIds.has(id)) throw Error(`неизвестный признак ${token} для ${index}`);
        if(featureIds.has(id)) throw Error(`повтор признака ${id} для ${index}`);
        featureIds.add(id);
      }
      if(!Array.isArray(entry.proposedQuestions)) throw Error(`нет proposedQuestions для ${index}`);
    }
  } catch(error) {errors.push(`${file}: ${error.message}`);}
}

for(const entry of aliases) if(!resolvedNames.has(entry.canonicalName.toLocaleLowerCase('ru')))
  errors.push(`запись ${entry.sourceIndex}: неизвестная цель alias ${entry.canonicalName}`);

const nextStart=rows.findIndex((_,index)=>!seen.has(index+1))+1;
const nextRange=nextStart?[nextStart,Math.min(rows.length,nextStart+19)]:null;
console.log(JSON.stringify({batches:files.length,processed:seen.size,total:rows.length,remaining:rows.length-seen.size,nextRange,decisions:counts,errors},null,2));
if(errors.length) process.exitCode=1;
