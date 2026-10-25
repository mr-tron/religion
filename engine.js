/* Pure inference module. No DOM, network, or storage dependencies. */
(() => {
  const tokenize = profile => profile.trim() ? profile.trim().split(/\s+/) : [];

  function parseProfile(profile, knownIds) {
    const values = {};
    for (const token of tokenize(profile || '')) {
      const sign = token[0], id = token.slice(1);
      if (!['+','-','?'].includes(sign) || !knownIds.has(id)) throw Error(`Неизвестный признак: ${token}`);
      if (id in values) throw Error(`Повтор признака: ${id}`);
      values[id] = sign === '+' ? .88 : sign === '-' ? .12 : .5;
    }
    return values;
  }

  function validateKnowledge(data) {
    if (!data || !Array.isArray(data.questions) || !Array.isArray(data.traditions) || !data.families) throw Error('Неверная структура каталога');
    const ids = new Set();
    for (const q of data.questions) {
      if (!q.id || !q.text || ids.has(q.id)) throw Error(`Неверный или повторный вопрос: ${q.id}`);
      if (q.routeFamilies && (!Array.isArray(q.routeFamilies) || q.routeFamilies.some(family => !data.families[family]))) throw Error(`Неизвестное направление для вопроса: ${q.id}`);
      if (q.routeFamilies && (!Array.isArray(q.routeSignals) || !q.routeSignals.length)) throw Error(`Нет ранних признаков для вопроса: ${q.id}`);
      ids.add(q.id);
    }
    for (const q of data.questions) for (const target of Object.values(q.followUps || {}))
      if (!ids.has(target)) throw Error(`Неизвестный следующий вопрос: ${q.id} → ${target}`);
    const traditionIds = new Set();
    for (const [key, family] of Object.entries(data.families)) {
      if (!key || !family.name) throw Error(`Неверная семья: ${key}`);
      parseProfile(family.profile, ids);
    }
    for (const t of data.traditions) {
      if (!t.id || !t.name || !t.description || !data.families[t.family] || traditionIds.has(t.id)) throw Error(`Неверная или повторная запись: ${t.name}`);
      if (t.inheritFamilyProfile != null && typeof t.inheritFamilyProfile !== 'boolean') throw Error(`Неверное наследование признаков: ${t.name}`);
      traditionIds.add(t.id);
      parseProfile(t.profile, ids);
    }
    return true;
  }

  function createEngine(data) {
    validateKnowledge(data);
    const ids = new Set(data.questions.map(q => q.id));
    const prepared = data.traditions.map(t => {
      const inherited=t.inheritFamilyProfile===false?{}:parseProfile(data.families[t.family].profile,ids);
      return {...t,features:{...inherited,...parseProfile(t.profile,ids)}};
    });
    // A one- or two-feature profile cannot support a specific recommendation.
    // Keep it in the catalog until research provides enough independent signals.
    const comparable = prepared.filter(t => Object.keys(t.features).length >= 3);
    if (!comparable.length) throw Error('В каталоге нет учений с проверенными признаками');
    const candidates = comparable.map(t => {
      return {...t,familyName:data.families[t.family].name,
        signature:JSON.stringify(Object.entries(t.features).sort(([a],[b])=>a.localeCompare(b))),
        prior:1 / comparable.length};
    });
    const information = probabilities => -probabilities.reduce((sum,p) => sum + (p > 0 ? p * Math.log2(p) : 0),0);
    const likelihood = (candidate,id,answer) => {
      const p = candidate.features[id] ?? .5;
      return answer === 'yes' ? p : 1-p;
    };

    function rank(answers) {
      const scored = candidates.map(candidate => {
        let log = Math.log(candidate.prior);
        for (const answer of answers) if (answer.value === 'yes' || answer.value === 'no') log += Math.log(likelihood(candidate,answer.id,answer.value));
        return {candidate,log};
      });
      const peak = Math.max(...scored.map(x => x.log));
      const exp = scored.map(x => Math.exp(x.log-peak));
      const total = exp.reduce((a,b) => a+b,0);
      return scored.map((x,i) => ({...x.candidate,posterior:exp[i]/total})).sort((a,b) => b.posterior-a.posterior);
    }

    function nextQuestion(answers) {
      const used = new Set(answers.map(a => a.id));
      const ranked = rank(answers);
      const determined = answers.filter(a => a.value === 'yes' || a.value === 'no').length;
      const lastAnswer = answers.at(-1);
      const previousQuestion = data.questions.find(q => q.id === lastAnswer?.id);
      let followUpId = previousQuestion?.followUps?.[lastAnswer?.value];
      if (lastAnswer?.id === 'personal' && !answers.some(a => a.id === 'divine' && a.value === 'yes')) followUpId = null;
      const leadingFamilies = {};
      for (const candidate of ranked.slice(0,20)) leadingFamilies[candidate.family] = (leadingFamilies[candidate.family] || 0) + 1;
      const entropyBefore = information(ranked.map(x => x.posterior));
      let best = null;
      for (const question of data.questions) {
        if (used.has(question.id)) continue;
        const routeShare = question.routeFamilies
          ? Math.max(...question.routeFamilies.map(family => (leadingFamilies[family] || 0) / 20))
          : 0;
        const onRoute = routeShare >= .2 || question.routeFamilies?.includes(ranked[0].family);
        if (question.id !== followUpId && question.routeFamilies && (determined < 4 || !onRoute ||
          !answers.some(answer => answer.value === 'yes' && question.routeSignals.includes(answer.id)))) continue;
        const yesMass = ranked.reduce((s,c) => s + c.posterior * (c.features[question.id] ?? .5),0);
        const noMass = 1-yesMass;
        if (yesMass < .001 || noMass < .001) continue;
        const yesPosterior = ranked.map(c => c.posterior*(c.features[question.id] ?? .5)/yesMass);
        const noPosterior = ranked.map(c => c.posterior*(1-(c.features[question.id] ?? .5))/noMass);
        const gain = entropyBefore - yesMass*information(yesPosterior) - noMass*information(noPosterior);
        const score = gain * (1 + 1.5 * routeShare) + (question.id === followUpId ? 1 : 0);
        if (!best || score > best.score) best = {question,gain,score};
      }
      return best && best.gain > .001 ? best : null;
    }

    function evidence(candidate,answers) {
      const supported=[],contradicted=[];
      let total=0,fit=0;
      for (const a of answers) {
        if (a.value !== 'yes' && a.value !== 'no') continue;
        const p=candidate.features[a.id];
        if (p == null || p === .5) continue;
        const expected=p>.5?'yes':'no';
        const q=data.questions.find(q => q.id===a.id);
        total++;
        if (a.value===expected) {fit++;supported.push(q.text);} else contradicted.push(q.text);
      }
      return {fit,total,supported,contradicted};
    }

    function clarity(answers) {
      const start = information(rank([]).map(x=>x.posterior));
      const current = information(rank(answers).map(x=>x.posterior));
      return Math.max(0,Math.min(.96,1-current/start));
    }
    return {rank,nextQuestion,evidence,clarity,candidates};
  }

  globalThis.WorldviewEngine = {createEngine,validateKnowledge};
  if (typeof module !== 'undefined') module.exports = globalThis.WorldviewEngine;
})();
