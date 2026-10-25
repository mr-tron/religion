/* Development-only coverage report for the checked-in browser catalogue. */
require('../questions.js');
require('../religions.js');
require('../catalog.js');
const {createEngine}=require('../engine.js');

const data={...globalThis.WORLDVIEW_RELIGIONS,questions:globalThis.WORLDVIEW_QUESTIONS};
const engine=createEngine(data);
const counts=new Map();
const signatures=new Map();
const weak=[];
for(const tradition of data.traditions){
  const inherited=tradition.inheritFamilyProfile===false?'':data.families[tradition.family].profile;
  const features=new Set(`${inherited} ${tradition.profile||''}`.trim().split(/\s+/).filter(Boolean).map(token=>token.slice(1)));
  const count=features.size;
  counts.set(count,(counts.get(count)||0)+1);
  if(count<3) weak.push({name:tradition.name,sourceIndex:tradition.sourceIndex||null,features:count});
}
for(const candidate of engine.candidates){
  const group=signatures.get(candidate.signature)||[];
  group.push(candidate.name);
  signatures.set(candidate.signature,group);
}
const duplicates=[...signatures.values()].filter(group=>group.length>1)
  .sort((a,b)=>b.length-a.length);
console.log(JSON.stringify({
  total:data.traditions.length,
  comparable:engine.candidates.length,
  belowThreshold:data.traditions.length-engine.candidates.length,
  featureCounts:Object.fromEntries([...counts].sort((a,b)=>a[0]-b[0])),
  belowThreeFeatures:weak.length,
  indistinguishableGroups:duplicates.length,
  largestGroup:duplicates[0]?.length||0,
  weakProfiles:weak,
},null,2));
