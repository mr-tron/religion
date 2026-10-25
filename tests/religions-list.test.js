const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

test('research list has unique names and traceable sources',()=>{
  const source=fs.readFileSync(path.join(__dirname,'..','religions.txt'),'utf8');
  const rows=source.split('\n').filter(line=>line&&!line.startsWith('#'));
  const names=new Set();
  for(const row of rows){
    const columns=row.split('\t');
    assert.equal(columns.length,3,row);
    const [name,category,url]=columns;
    assert.ok(name&&category&&url.startsWith('https://'),row);
    const key=name.normalize('NFKD').toLocaleLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
    assert.ok(!names.has(key),`Повтор: ${name}`);
    names.add(key);
  }
  assert.ok(rows.length>1500);
  for(const name of ['Baarmati religion','Suunism','Association of Shinto Shrines','Rainbow Family','Pandeism','Panendeism']) assert.ok(source.includes(`${name}\t`),name);
  for(const alias of ['Barmati Panth','Suwunism']) assert.ok(!source.includes(`${alias}\t`),alias);
});
