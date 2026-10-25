const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
require('../questions.js');
require('../religions.js');
require('../catalog.js');
const {createEngine,validateKnowledge}=require('../engine.js');
const data={...globalThis.WORLDVIEW_RELIGIONS,questions:globalThis.WORLDVIEW_QUESTIONS};

test('catalog loads and every question points to known features',()=>{
  assert.equal(validateKnowledge(data),true);
  assert.equal(data.traditions.length,1546);
  assert.ok(data.questions.length>=40);
});

test('question selection adapts and never repeats answered questions',()=>{
  const engine=createEngine(data);
  const initial=engine.nextQuestion([]);
  assert.ok(initial);
  const answers=[{id:initial.question.id,value:'yes'}];
  const next=engine.nextQuestion(answers);
  assert.ok(next);
  assert.notEqual(next.question.id,initial.question.id);
  assert.ok(next.gain>0);
});

test('unrelated scripture traditions are not asked down a nonreligious path',()=>{
  const engine=createEngine(data);
  const answers=[];
  const markers=new Set(['jesus','muhammad','quran','torah','vedas','buddha','guru_granth']);
  for(let i=0;i<12;i++){
    const next=engine.nextQuestion(answers);
    assert.ok(next);
    assert.ok(!markers.has(next.question.id),next.question.id);
    answers.push({id:next.question.id,value:next.question.id==='nonreligious'?'yes':'no'});
  }
});

test('questions move into a plausible tradition after broad answers',()=>{
  const engine=createEngine(data);
  const answers=[
    {id:'ritual',value:'yes'}, {id:'divine',value:'yes'},
    {id:'many_gods',value:'no'}, {id:'scripture',value:'yes'}
  ];
  const next=engine.nextQuestion(answers);
  assert.ok(next.question.routeFamilies?.includes('christian'));
});

test('other answers do not alter ranking, known answers do',()=>{
  const engine=createEngine(data);
  const initial=engine.rank([]);
  const other=engine.rank([{id:'divine',value:'other'}]);
  assert.deepEqual(other.map(x=>x.posterior),initial.map(x=>x.posterior));
  const known=engine.rank([{id:'divine',value:'yes'}]);
  assert.notDeepEqual(known.map(x=>x.posterior),initial.map(x=>x.posterior));
});

test('specific answer patterns lift their traditions',()=>{
  const engine=createEngine(data);
  const cases=[
    ['Православие',{jesus:'yes',trinity:'yes',church:'yes',icons:'yes',pope:'no'}],
    ['Сикхизм',{guru_granth:'yes',reincarnation:'yes',one_god:'yes',buddha:'no'}],
    ['Научный натурализм',{scientific:'yes',naturalism:'yes',divine:'no',nonreligious:'yes'}]
  ];
  for(const [name,pattern] of cases){
    const answers=Object.entries(pattern).map(([id,value])=>({id,value}));
    assert.ok(engine.rank(answers).slice(0,12).some(x=>x.name===name),name);
  }
});

test('pantheist path asks about Spinoza and ranks Spinozism above sparse matches',()=>{
  const engine=createEngine(data);
  const answers=[
    {id:'ritual',value:'no'}, {id:'divine',value:'yes'},
    {id:'personal',value:'no'}, {id:'pantheism',value:'yes'}
  ];
  assert.equal(engine.nextQuestion(answers).question.id,'spinoza_necessity');
  answers.push({id:'spinoza_necessity',value:'yes'},
    {id:'naturalism',value:'yes'}, {id:'revelation',value:'no'},
    {id:'scripture',value:'no'});
  const ranked=engine.rank(answers);
  assert.equal(ranked[0].name,'Спинозизм');
  assert.ok(ranked.findIndex(x=>x.name==='Традиционная духовность буби')>20);
});

test('invalid catalogue features are rejected',()=>{
  const copy=structuredClone(data);
  copy.traditions[0].profile+=' +missing_feature';
  assert.throws(()=>validateKnowledge(copy),/Неизвестный признак/);
});

test('a tradition can opt out of broad family assumptions',()=>{
  const copy=structuredClone(data);
  copy.traditions[0].inheritFamilyProfile=false;
  const engine=createEngine(copy);
  const first=engine.candidates.find(t=>t.id===copy.traditions[0].id);
  assert.equal(first.features.divine,undefined);
  assert.equal(first.features.church,.88);
});

test('reviewed catalog entries join the quiz without ranking empty profiles',()=>{
  const engine=createEngine(data);
  assert.ok(engine.candidates.length>800);
  assert.ok(engine.candidates.length<data.traditions.length);
  assert.ok(engine.candidates.some(t=>t.id==='catalog-0001'));
  const unprofiled=data.traditions.find(t=>t.id.startsWith('catalog-')&&t.profile==='');
  assert.ok(unprofiled);
  assert.ok(!engine.candidates.some(t=>t.id===unprofiled.id));
  assert.ok(engine.candidates.every(t=>Object.keys(t.features).length>=3));
});

test('published page loads the reviewed catalog before the app',()=>{
  const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
  const catalog=html.indexOf('src="catalog.js"');
  const app=html.indexOf('src="app.js"');
  assert.ok(catalog>0&&app>catalog);
});
