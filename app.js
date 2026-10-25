(() => {
  'use strict';
  const data = {...globalThis.WORLDVIEW_RELIGIONS,questions:globalThis.WORLDVIEW_QUESTIONS};
  const $ = id => document.getElementById(id);
  const intro=$('intro'), quiz=$('quiz'), results=$('results');
  const answers=[];
  let nextCheckpoint=10;
  let engine, currentQuestion;

  function countWord(count,one,few,many) {
    const n=count%100,unit=count%10;
    return n>=11&&n<=14?many:unit===1?one:unit>=2&&unit<=4?few:many;
  }

  function node(tag,cls,text) {
    const element=document.createElement(tag);
    if (cls) element.className=cls;
    if (text != null) element.textContent=text;
    return element;
  }

  function show(view) {
    for (const section of [intro,quiz,results]) section.classList.toggle('hidden',section!==view);
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function renderQuestion(questionId) {
    const choice=questionId ? {question:data.questions.find(q=>q.id===questionId)} : engine.nextQuestion(answers);
    if (!choice?.question) {renderResults();return;}
    currentQuestion=choice.question;
    $('question-number').textContent=`Вопрос ${answers.length+1}`;
    $('question-category').textContent=currentQuestion.category;
    $('question-text').textContent=currentQuestion.text;
    $('question-hint').textContent=currentQuestion.hint || 'Выбирайте ответ, который ближе к вашим взглядам сейчас.';
    $('progress-fill').style.width=`${Math.max(4,engine.clarity(answers)*100)}%`;
    $('search-note').textContent=answers.length<3?'Сначала найдём широкие ориентиры, затем уточним детали.':'Следующий вопрос выбран по вашим предыдущим ответам.';
    $('remaining-note').textContent=`${answers.length} ${countWord(answers.length,'ответ','ответа','ответов')} · длина опроса зависит от ваших взглядов`;
    $('back-button').disabled=answers.length===0;
    const container=$('answers');container.replaceChildren();
    for (const [value,label] of [['yes','Да'],['no','Нет'],['other','Иное']]) {
      const button=node('button','answer-button',label);
      button.type='button';
      button.addEventListener('click',()=> {
        record(value);
      });
      container.append(button);
    }
    show(quiz);
  }

  function record(value) {
    answers.push({id:currentQuestion.id,value});
    if (answers.length >= nextCheckpoint) {
      nextCheckpoint += 5;
      renderResults();
    } else renderQuestion();
  }

  function renderResults() {
    const ranked=engine.rank(answers);
    const neutral=answers.filter(a=>!['yes','no'].includes(a.value)).length;
    const evidenceCount=answers.length-neutral;
    const list=$('result-list');list.replaceChildren();
    const picked=[],seenSignatures=new Set();
    const bestPosterior=ranked[0]?.posterior || 0;
    for (const candidate of evidenceCount?ranked:[]) {
      if (seenSignatures.has(candidate.signature)) continue;
      const evidence=engine.evidence(candidate,answers);
      if (evidenceCount>=5 && (evidence.fit<3 || candidate.posterior<bestPosterior*.12)) continue;
      seenSignatures.add(candidate.signature);
      picked.push({candidate,evidence});
      if (picked.length===5) break;
    }
    picked.forEach(({candidate,evidence},index)=>{
      const same=engine.candidates.filter(x=>x.id!==candidate.id&&x.signature===candidate.signature);
      const group=same.length>0;
      const names=[candidate,...same].map(x=>x.name);
      const visibleNames=names.slice(0,6).join(', ');
      const remaining=names.length>6?` и ещё ${names.length-6}`:'';
      const card=node('article','result-card');
      card.append(node('div','result-rank',String(index+1).padStart(2,'0')));
      const main=node('div');
      main.append(node('div','result-family',group?'Неразличимая группа':candidate.familyName),
        node('h3','result-name',group?`${same.length+1} близких традиций`:candidate.name),
        node('p','result-description',group
          ?`Одинаковые проверенные признаки: ${visibleNames}${remaining}.`
          :candidate.description));
      if (!group && candidate.sources?.length) {
        const source=node('a','result-source','Источник ↗');
        source.href=candidate.sources[0];source.target='_blank';source.rel='noopener noreferrer';
        main.append(source);
      }
      card.append(main);
      const match=node('div','match',evidence.total?`${evidence.fit}/${evidence.total}`:'—');
      match.append(node('small',null,evidence.total?'признаков совпало':'нет данных о признаке'));
      card.append(match);
      list.append(card);
    });
    if (!evidenceCount) list.append(node('div','empty-state','Пока нечего сравнивать. Ответьте «Да» или «Нет» хотя бы на один вопрос, чтобы увидеть направления.'));
    else if (!picked.length) list.append(node('div','empty-state','Пока недостаточно проверенных совпадений для осмысленного результата. Продолжите опрос.'));
    $('result-summary').textContent=!evidenceCount
      ?'Ответ «Иное» не влияет на оценку. Продолжайте опрос, если хотите увидеть близкие варианты.'
      :evidenceCount<4
      ?`Пока есть только ${evidenceCount} ${countWord(evidenceCount,'определённый ответ','определённых ответа','определённых ответов')}. Это предварительные направления — несколько дополнительных вопросов могут сильно изменить порядок.`
      :`На основе ${evidenceCount} определённых ответов${neutral?` и ${neutral} пропущенных вопросов`:''} это предварительные ближайшие варианты из ${engine.candidates.length} записей с проверенными признаками. Можно уточнить результат дальше. Счёт справа показывает совпадение известных признаков, а не вероятность вашей принадлежности.`;
    $('continue-button').classList.toggle('hidden',!engine.nextQuestion(answers));
    $('edit-answer-button').classList.toggle('hidden',answers.length===0);
    show(results);
  }

  function undoLastAnswer() {
    const previous=answers.pop();
    if (previous) renderQuestion(previous.id);
  }

  function addDialogText(parent,tag,text,cls) {parent.append(node(tag,cls,text));}
  function openAbout() {
    const body=$('dialog-content');body.replaceChildren();
    addDialogText(body,'h3','Как это работает');
    addDialogText(body,'p','Отвечайте на вопросы о своих взглядах. По ходу опроса вопросы будут меняться, а после нескольких ответов появится список близких вам направлений. Можно продолжить и уточнить результат.');
    addDialogText(body,'p','Если не знаете, что ответить, или вопрос вам не подходит, выберите «Иное». Ошиблись — вернитесь к предыдущему вопросу.');
    addDialogText(body,'p','Результат — подсказка для знакомства с учениями, а не ярлык. Счёт рядом с названием показывает, сколько известных ответов совпало. Ваши ответы никуда не отправляются и исчезнут после обновления страницы.');
    $('info-dialog').showModal();
  }
  function openCatalog() {
    const body=$('dialog-content');body.replaceChildren();
    addDialogText(body,'h3',`Каталог: ${data.traditions.length} направлений`);
    addDialogText(body,'p',`В опросе сопоставляются ${engine.candidates.length} направлений с проверенными признаками. Остальные представлены в каталоге, но пока не имеют достаточно данных для сравнения. Некоторые записи обозначают широкие семейства, другие — конкретные школы; границы и самоописания могут различаться.`);
    for (const [key,family] of Object.entries(data.families)) {
      const matches=data.traditions.filter(t=>t.family===key);
      if (!matches.length) continue;
      const item=node('div','catalog-family');
      item.append(node('strong',null,`${family.name} · ${matches.length}`),node('p',null,matches.map(t=>t.name).join(' · ')));
      body.append(item);
    }
    addDialogText(body,'h3','Источники для структуры каталога');
    addDialogText(body,'p','Общие категории сверены с материалами ниже. Признаки отдельных направлений — упрощённая редакционная модель, которую нужно уточнять вместе с представителями традиций и профильными источниками.');
    const list=node('ul');
    for (const source of data.sources) {
      const li=node('li'),link=node('a',null,source.title);
      link.href=source.url;link.target='_blank';link.rel='noopener noreferrer';li.append(link);list.append(li);
    }
    body.append(list);
    $('info-dialog').showModal();
  }

  try {
    engine=globalThis.WorldviewEngine.createEngine(data);
    $('stats').append(
      (()=>{const el=node('div','stat');el.append(node('strong',null,String(data.traditions.length)),node('span',null,'традиций и взглядов в каталоге'));return el;})(),
      (()=>{const el=node('div','stat');el.append(node('strong',null,String(engine.candidates.length)),node('span',null,'направлений участвуют в подборе'));return el;})(),
      (()=>{const el=node('div','stat');el.append(node('strong',null,String(data.questions.length)),node('span',null,'вопросов в базе'));return el;})()
    );
  } catch(error) {
    $('start-button').disabled=true;
    $('stats').textContent=`Ошибка каталога: ${error.message}`;
    console.error(error);
    return;
  }

  $('start-button').addEventListener('click',()=>renderQuestion());
  $('results-button').addEventListener('click',renderResults);
  $('back-button').addEventListener('click',undoLastAnswer);
  $('edit-answer-button').addEventListener('click',undoLastAnswer);
  $('continue-button').addEventListener('click',()=>renderQuestion());
  $('restart-button').addEventListener('click',()=>{answers.length=0;nextCheckpoint=10;renderQuestion();});
  $('about-button').addEventListener('click',openAbout);
  $('catalog-button').addEventListener('click',openCatalog);
  $('close-dialog').addEventListener('click',()=>$('info-dialog').close());
})();
