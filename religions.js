/* Families, traditions, and sources. Profiles refer to IDs in questions.js.
   + means characteristic, - means uncharacteristic, omitted means unknown/varies. */
(() => {
  const families = {
    christian:{name:'Христианство',profile:'+divine +personal +one_god +revelation +scripture +jesus +trinity +afterlife -many_gods -reincarnation -muhammad -nonreligious'},
    islam:{name:'Ислам',profile:'+divine +personal +one_god +revelation +scripture +muhammad +quran +sharia +afterlife -many_gods -trinity -nonreligious'},
    jewish:{name:'Иудаизм',profile:'+divine +personal +one_god +revelation +scripture +torah -trinity -muhammad -many_gods -nonreligious'},
    dharmic:{name:'Индийские традиции',profile:'+divine +reincarnation +karma +liberation +meditation -muhammad -trinity -nonreligious'},
    buddhist:{name:'Буддизм',profile:'+buddha +karma +reincarnation +liberation +no_self +meditation -one_god -revelation -nonreligious'},
    jain:{name:'Джайнизм',profile:'+karma +reincarnation +liberation +ahimsa -one_god -buddha -revelation -nonreligious'},
    sikh:{name:'Сикхизм',profile:'+divine +personal +one_god +reincarnation +karma +liberation +guru_granth +scripture -many_gods -nonreligious'},
    eastasian:{name:'Восточноазиатские традиции',profile:'+ancestors +ritual -muhammad -trinity -nonreligious'},
    indigenous:{name:'Традиционные и коренные верования',profile:'+nature_spirits +ancestors +ritual -nonreligious'},
    iranian:{name:'Иранские и ближневосточные традиции',profile:'+divine +personal +revelation +scripture +afterlife -nonreligious'},
    newreligion:{name:'Новые религиозные движения',profile:'+divine +new_revelation -nonreligious'},
    pagan:{name:'Неоязычество и эзотерика',profile:'+nature_spirits +ritual +many_gods +occult -one_god -nonreligious'},
    secular:{name:'Нерелигиозные мировоззрения',profile:'+nonreligious +scientific -revelation -scripture -ritual'},
    philosophical:{name:'Философские и духовные позиции',profile:'+nonreligious -scripture -ritual'}
  };

  // family|name|short description|specific profile. Profiles override family tendencies.
  const rows = `
christian|Православие|Восточная христианская традиция с литургией и таинствами.|+church +icons -pope -bible_alone
christian|Римский католицизм|Западная церковь с папским первенством и таинствами.|+church +pope +icons -bible_alone
christian|Восточный католицизм|Восточные обряды в общении с Римом.|+church +pope +icons -bible_alone
christian|Древневосточные православные церкви|Коптская, армянская, сирийская и родственные церкви.|+church +icons -pope -bible_alone
christian|Ассирийская церковь Востока|Древняя восточносирийская христианская традиция.|+church -pope -bible_alone
christian|Англиканство|Христианство с сочетанием реформаторского и литургического наследия.|+church +bible_alone -pope
christian|Лютеранство|Протестантская традиция Реформации.|+bible_alone +church -pope -icons
christian|Реформатское христианство|Протестантская традиция, связанная с Кальвином и его последователями.|+bible_alone -pope -icons
christian|Пресвитерианство|Реформатская церковная традиция с советами пресвитеров.|+bible_alone -pope -icons
christian|Методизм|Протестантское движение с акцентом на личную святость.|+bible_alone -pope
christian|Баптизм|Протестантская традиция крещения сознательных верующих.|+bible_alone +adult_baptism -church -pope
christian|Пятидесятничество|Харизматическое христианство с акцентом на дары Духа.|+bible_alone +adult_baptism +spirit_gifts -church
christian|Харизматическое христианство|Движения, выделяющие современные духовные дары.|+spirit_gifts
christian|Адвентизм седьмого дня|Христианская традиция с соблюдением субботы.|+sabbath +bible_alone -icons
christian|Анабаптизм|Радикальная Реформация и сознательное крещение.|+adult_baptism +bible_alone -church
christian|Меннонитство|Анабаптистская традиция с акцентом на миротворчество.|+adult_baptism +bible_alone -church
christian|Квакерство|Общество Друзей с акцентом на внутренний свет и простоту.|-church -icons -pope
christian|Моравская церковь|Протестантская община с сильной миссионерской традицией.|+bible_alone
christian|Армия спасения|Христианское движение служения и социальной помощи.|+bible_alone -church
christian|Церковь Иисуса Христа Святых последних дней|Реставрационистская традиция с дополнительными писаниями.|+restoration +scripture -trinity -bible_alone
christian|Свидетели Иеговы|Реставрационистское христианское движение.|+restoration +bible_alone -trinity -icons
christian|Унитарианское христианство|Христианский монотеизм без учения о Троице.|-trinity +one_god
christian|Христадельфиане|Нетроичная библейская реставрационистская традиция.|-trinity +restoration +bible_alone
christian|Христианская наука|Христианское движение духовного исцеления.|+restoration -church
islam|Суннитский ислам|Крупнейшее направление ислама, опирающееся на Коран и сунну.|-ali
islam|Шиитский ислам двунадесятников|Шиитская традиция двенадцати имамов.|+ali
islam|Исмаилизм|Шиитская традиция имамата с собственными линиями преемства.|+ali
islam|Зайдизм|Шиитская традиция, связанная с имаматом Зайда.|+ali
islam|Ибадизм|Самостоятельная исламская традиция, исторически отличная от суннизма и шиизма.|-ali
islam|Суфийские тарикаты|Мистические пути внутри разных направлений ислама.|+sufi
islam|Ахмадия|Исламское движение с особым пониманием роли Мирзы Гулама Ахмада.|+new_revelation
islam|Коранизм|Исламские подходы, уделяющие Корану исключительный нормативный приоритет.|+quran -sharia
jewish|Ортодоксальный иудаизм|Иудаизм с обязательностью галахи.|+halakha
jewish|Хасидский иудаизм|Ортодоксальная мистическая традиция и общинная жизнь.|+halakha
jewish|Консервативный иудаизм|Традиция, сохраняющая галаху при историческом развитии практики.|+halakha
jewish|Реформистский иудаизм|Еврейская традиция с акцентом на обновление практики.|-halakha
jewish|Реконструкционистский иудаизм|Иудаизм как развивающаяся религиозная цивилизация.|-halakha
jewish|Караимский иудаизм|Еврейская традиция, опирающаяся на письменную Тору.|+torah -halakha
jewish|Светский гуманистический иудаизм|Еврейская культура и этика без обязательной веры в Бога.|-divine +humanism +nonreligious -halakha
dharmic|Вайшнавизм|Индуистские традиции почитания Вишну и его аватар.|+vedas +bhakti +personal +one_god
dharmic|Кришнаизм|Вайшнавская преданность Кришне.|+vedas +bhakti +personal +one_god
dharmic|Шиваизм|Индуистские традиции почитания Шивы.|+vedas +bhakti +personal
dharmic|Шактизм|Индуистские традиции почитания богини Шакти.|+vedas +bhakti +personal
dharmic|Смартизм|Индуистская традиция нескольких форм божества и недвойственной философии.|+vedas +many_gods +pantheism
dharmic|Адвайта-веданта|Недвойственная философия единства атмана и Брахмана.|+vedas +pantheism -personal
dharmic|Двайта-веданта|Философия различия души и Бога в индуистской традиции.|+vedas +personal +one_god
dharmic|Вишишта-адвайта|Ведантическая традиция квалифицированного недуализма.|+vedas +bhakti +personal
dharmic|Йога как духовный путь|Индийские практики сосредоточения и освобождения.|+meditation +liberation
dharmic|Санкхья|Индийская философия различия сознания и природы.|+liberation -personal
buddhist|Тхеравада|Буддийская традиция с акцентом на ранние тексты и путь архата.|+scripture
buddhist|Дзен-буддизм|Буддийская традиция с особым акцентом на медитацию.|+meditation
buddhist|Чань-буддизм|Китайская буддийская традиция созерцания.|+meditation
buddhist|Буддизм Чистой земли|Буддийские школы почитания будды Амитабхи.|+bhakti +afterlife
buddhist|Нитирэн-буддизм|Японские буддийские школы, сосредоточенные на Лотосовой сутре.|+scripture
buddhist|Тибетский буддизм|Ваджраяна с ритуалами, наставничеством и медитацией.|+ritual +meditation
buddhist|Ваджраяна|Буддийские тантрические методы и ритуалы.|+ritual +meditation
buddhist|Светский буддизм|Буддийские практики без обязательной метафизической веры.|+scientific +nonreligious -reincarnation
jain|Дигамбара|Одна из двух крупных джайнских традиций.|+ahimsa
jain|Шветамбара|Одна из двух крупных джайнских традиций.|+ahimsa
jain|Стханакваси|Джайнское движение без храмового поклонения изображениям.|+ahimsa -icons
sikh|Сикхизм|Путь десяти гуру и Гуру Грантх Сахиб.|+guru_granth
sikh|Намдхари|Сикхское движение с особой линией живых гуру.|+guru_granth
sikh|Ниранкари|Движение сикхского происхождения, подчеркивающее бесформенного Бога.|+guru_granth
eastasian|Даосизм|Китайские традиции пути Дао, практик и ритуалов.|+dao +ritual
eastasian|Философский даосизм|Вдохновение классическими текстами о Дао без обязательных культов.|+dao -ritual
eastasian|Конфуцианство|Этическая и ритуальная традиция отношений и самосовершенствования.|+ancestors +ritual +humanism
eastasian|Синто|Японские традиции ками, святилищ и обрядов.|+kami +nature_spirits +ritual
eastasian|Китайская народная религия|Сочетание почитания предков, божеств и местных практик.|+ancestors +many_gods +ritual
eastasian|Игуаньдао|Китайское новое религиозное движение с синкретическими учениями.|+new_revelation +ritual
eastasian|Тэнрикё|Японское новое религиозное движение с учением о радостной жизни.|+new_revelation +personal
eastasian|Чхондогё|Корейская религиозная традиция с идеей божественного в человеке.|+pantheism +new_revelation
indigenous|Йоруба и Ифа|Западноафриканские традиции ориша и гадания Ифа.|+orisha +many_gods
indigenous|Сантерия / Лукуми|Афро-кубинская традиция почитания ориша.|+orisha +ritual
indigenous|Кандомбле|Афро-бразильские традиции ориша, водун и инкисе.|+orisha +ritual +spirit_possession
indigenous|Воду|Гаитянская традиция духов лва и ритуальной практики.|+nature_spirits +ritual +spirit_possession
indigenous|Аканская традиционная религия|Западноафриканские представления о высшем существе и духах.|+ancestors +nature_spirits
indigenous|Традиционные верования динка|Духовные традиции народа динка Восточной Африки.|+ancestors +nature_spirits
indigenous|Серерская религиозная традиция|Духовные традиции народа серер Западной Африки.|+ancestors +nature_spirits
indigenous|Тенгрианство|Центральноазиатские традиции Неба, духов и предков.|+nature_spirits +ancestors
indigenous|Сибирские шаманские традиции|Разнообразные местные практики общения с духами.|+nature_spirits +ancestors
indigenous|Саамская традиционная религия|Исторические духовные традиции саамских народов.|+nature_spirits +ancestors
indigenous|Андские традиции|Почитание Пачамамы, гор и взаимных обязательств.|+nature_spirits +ritual
indigenous|Мезоамериканские возрождения|Современные продолжения и реконструкции местных традиций.|+many_gods +ritual
indigenous|Австралийские традиции Первых народов|Разнообразные духовные традиции, связанные со страной и предками.|+ancestors +nature_spirits
iranian|Зороастризм|Иранская традиция Ахура Мазды и нравственного выбора.|+one_god +fire
iranian|Езидизм|Курдская религиозная традиция с особой космологией.|+one_god +ritual
iranian|Мандейство|Гностическая ближневосточная религия с обрядами омовения.|+one_god +ritual
iranian|Друзская традиция|Ближневосточная монотеистическая община с эзотерическим учением.|+one_god +revelation
iranian|Вера бахаи|Учение о единстве религий и последовательных откровениях.|+one_god +new_revelation
iranian|Бабизм|Иранское движение XIX века, связанное с учением Баба.|+one_god +new_revelation
newreligion|Растафари|Афро-карибское религиозное и культурное движение.|+one_god +scripture
newreligion|Спиритизм Кардека|Учение о духах, нравственном развитии и перевоплощении.|+reincarnation +afterlife
newreligion|Церковь объединения|Христианское по происхождению новое религиозное движение.|+jesus +one_god +new_revelation
newreligion|Саентология|Движение духовного развития с собственной практикой и учением.|+new_revelation -one_god
newreligion|Теософия|Эзотерическое учение о духовной эволюции и мудрости религий.|+reincarnation +karma +occult
newreligion|Антропософия|Духовная философия Рудольфа Штайнера.|+reincarnation +occult
newreligion|Нью-эйдж|Широкий круг индивидуальных духовных и эзотерических подходов.|+reincarnation +occult -scripture
newreligion|Унитарианский универсализм|Плюралистические общины со свободой личных убеждений.|+humanism -scripture -revelation
pagan|Викка|Современная языческая религия с ритуалами и природными циклами.|+many_gods +occult +ritual
pagan|Друидизм|Современные духовные пути, вдохновлённые кельтским наследием.|+nature_spirits +ritual
pagan|Асатру / хетенри|Современное германское язычество.|+many_gods +ancestors +ritual
pagan|Эллинизм|Современное почитание древнегреческих божеств.|+many_gods +ritual
pagan|Кеметизм|Современное почитание древнеегипетских божеств.|+many_gods +ritual
pagan|Родноверие|Современные славянские языческие движения.|+many_gods +ancestors +ritual
pagan|Эклектическое язычество|Личный путь, соединяющий разные языческие практики.|+many_gods +nature_spirits +ritual
pagan|Нетеистическое язычество|Природные и ритуальные практики без обязательной веры в богов.|-divine +nature_spirits +ritual
secular|Научный натурализм|Мир объясняется природными процессами и научным исследованием.|+scientific +naturalism -divine -afterlife
secular|Светский гуманизм|Этика и благополучие людей без религиозного основания.|+humanism +scientific -divine
secular|Атеизм|Отсутствие веры в богов; сам по себе не задаёт этику или философию.|-divine
secular|Агностицизм|Вопрос о божественном остаётся открытым или непознаваемым.|+agnostic
secular|Скептицизм|Убеждения соотносятся с проверяемыми свидетельствами.|+scientific +agnostic
secular|Экзистенциализм|Смысл и ответственность человека в центре размышления.|+humanism
secular|Стоицизм|Философская практика добродетели и принятия происходящего.|+humanism
secular|Этическая культура|Сообщества этического действия без обязательной религиозной догмы.|+humanism
secular|Светский иудаизм|Еврейская культурная идентичность без обязательной религиозной веры.|+humanism -divine
philosophical|Деизм|Вера в создателя без обязательного откровения и вмешательства.|+divine +one_god +deism -revelation
philosophical|Пантеизм|Божественное и мир понимаются как единое целое.|+divine +pantheism -personal
philosophical|Панентеизм|Мир пребывает в божественном, которое больше мира.|+divine +pantheism
philosophical|Анимистическая духовность|Представление об одушевлённой природе без одной обязательной традиции.|+nature_spirits +divine
philosophical|Духовность без религии|Личные духовные взгляды без принадлежности к организации.|+divine +meditation
philosophical|Плюралистическая духовность|Несколько традиций воспринимаются как источники истины.|+divine +meditation
philosophical|Апатеизм|Вопрос о существовании Бога не играет существенной роли в жизни.|+agnostic
philosophical|Игностицизм|Сначала требуется определить смысл слова «Бог».|+agnostic
`.trim().split('\n').map(line => {const [family,name,description,profile='']=line.split('|');return {id:name.toLowerCase().replace(/[^а-яa-z0-9]+/g,'-').replace(/^-|-$/g,''),family,name,description,profile};});

  globalThis.WORLDVIEW_RELIGIONS = {version:1,families,traditions:rows,sources:[
    {title:'Pew Research Center — Global Religious Change: Methodology',url:'https://www.pewresearch.org/religion/2025/06/09/global-religious-change-methodology/'},
    {title:'Pew Research Center — Religious Diversity Around the World',url:'https://www.pewresearch.org/religion/2026/02/12/religious-diversity-around-the-world/'},
    {title:'World Religion Database — category overview',url:'https://www.asrec.org/affiliation-world-religion-database/'}
  ]};
})();
