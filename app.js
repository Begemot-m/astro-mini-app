const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
const tg = window.Telegram?.WebApp;
const screens = $$(".screen");
const navButtons = $$(".bottom-nav button");
const paywall = $("#paywall");
const detailSheet = $("#detail-sheet");
const paywallTitle = $("#paywall-title");
const toast = $("#toast");

const details = {
  energy: ["moon", "Спокойная сила", "Энергия дня", "Луна в Деве усиливает практичность и помогает навести порядок не только вокруг, но и внутри. Сегодня полезно завершать, уточнять и бережно возвращать себе контроль.", [["Лучшее время", "с 11:20 до 15:40"], ["Главный транзит", "Луна тригон Меркурий"], ["Избегать", "Перфекционизма и лишней критики"]]],
  forecast: ["sparkles", "Ваш прогноз", "Личный ритм дня", "Утро подходит для спокойной подготовки, а после полудня разговоры пойдут легче. Вечером не требуйте от себя продуктивности: вашей нервной системе понадобится тишина.", [["Работа", "Закрыть одну важную задачу"], ["Отношения", "Говорить прямо, но мягко"], ["Ресурс", "Прогулка без телефона"]]],
  love: ["heart", "Любовь и близость", "Честность", "Венера поддерживает разговор без защитных масок. Сегодня близость рождается из простых признаний: скажите, чего вам хочется, не превращая желание в требование.", [["Хорошо", "Назвать свои чувства"], ["Осторожнее", "Не додумывать за другого"], ["Вечером", "Создать время только для двоих"]]],
  money: ["wallet", "Деньги и дело", "Фокус", "Сатурн помогает отличить сильную идею от отвлекающей. Не расширяйте список задач: выберите одну, которая создаёт измеримый результат.", [["Рабочий фокус", "Упаковка и презентация"], ["Решения", "Проверять цифрами"], ["Не сегодня", "Импульсивные покупки"]]],
  resource: ["leaf", "Тело и ресурс", "Тишина", "Ваш ресурс восстанавливается не через новые впечатления, а через снижение интенсивности. Оставьте вечером немного незаполненного времени.", [["Поддержит", "Ровный ритм и вода"], ["Зона внимания", "Информационная перегрузка"], ["Вечером", "Меньше экранов после 21:00"]]],
  chart: ["circle-dot-dashed", "Натальная карта", "Рисунок момента рождения", "Карта показывает положения планет, домов и аспектов на момент вашего рождения. Нажимая на элементы, вы будете получать подробные интерпретации.", [["Система домов", "Плацидус"], ["Доминирующая стихия", "Воздух"], ["Доминирующая планета", "Меркурий"]]],
  sun: ["sun", "Солнце в Близнецах", "Ядро личности", "Ваше Солнце проявляется через любопытство, связь идей и свободу задавать вопросы. Вам важно постоянно обновлять картину мира.", [["Градус", "21° 08′"], ["Дом", "9 дом"], ["Аспект", "Тригон с Сатурном"]]],
  moon: ["moon", "Луна в Скорпионе", "Эмоциональная природа", "Вы чувствуете глубже, чем показываете. Интуитивно считываете подтекст и нуждаетесь в отношениях, где можно быть полностью честной.", [["Градус", "04° 32′"], ["Дом", "1 дом"], ["Ресурс", "Эмоциональная честность"]]],
  asc: ["circle-dot", "Асцендент в Весах", "Как вас видят", "Первое впечатление о вас связано с тактом, эстетикой и умением создавать комфортный контакт. Вы естественно ищете баланс.", [["Градус", "15° 10′"], ["Управитель", "Венера"], ["Стиль", "Мягкая уверенность"]]],
  "history-work": ["compass", "Баланс работы и отдыха", "Ответ от 8 июня", "Ваш Марс просит действовать ритмично, а не рывками. Восстановление сейчас является частью результата, а не наградой после него.", [["Ориентир", "Планировать паузы заранее"], ["Транзит", "Марс секстиль Луна"]]],
  "history-project": ["rocket", "Новый проект", "Ответ от 2 июня", "Период подходит для исследования и первого прототипа. Не обещайте себе большой запуск: сделайте маленькую версию, которую можно проверить.", [["Ориентир", "Тест до конца недели"], ["Транзит", "Меркурий тригон Юпитер"]]],
  birth: ["calendar-days", "Данные рождения", "Основа расчёта", "Эти данные используются для точного положения планет и домов. В реальном приложении изменение данных запустит новый расчёт карты.", [["Дата", "11 июня 1996"], ["Время", "08:40"], ["Место", "Москва, Россия"], ["Часовой пояс", "UTC+4 на дату рождения"]]],
  referral: ["users", "Пригласить друзей", "Дарите астро+", "За каждого друга, который оформит подписку, вы получите 7 дополнительных дней астро+. Ещё два приглашения откроют месяц бесплатно.", [["Приглашено", "1 из 3"], ["Ваша награда", "7 дней астро+"], ["Ссылка", "t.me/astro_demo_bot?start=ref_maria"]]],
  about: ["info", "Об астро.", "Магия в современной упаковке", "астро. — развлекательно-рефлексивный продукт. Интерпретации помогают посмотреть на привычные ситуации с нового ракурса, но не заменяют профессиональные медицинские, юридические или финансовые рекомендации.", [["Расчёт карты", "Swiss Ephemeris"], ["Интерпретация", "AI через backend"]]],
  legal: ["shield-check", "Условия и конфиденциальность", "Правила и данные", "Сервис носит развлекательно-рефлексивный характер: материалы вероятностны, не являются диагнозом и не гарантируют событий. Для карты нужны дата, время и место рождения — они хранятся с вашего согласия, удаляются по запросу и не передаются AI в идентифицирующем виде.", [["Не является", "диагнозом или консультацией"], ["AI получает", "обезличенную структуру карты"], ["Контроль", "экспорт и удаление данных"], ["Полные документы", "site → legal/"]]],
  "edit-profile": ["user-round", "Профиль", "Ваше имя", "Имя подтягивается из Telegram. Здесь можно задать или изменить его — оно будет использоваться в приложении.", []],
  terms: ["file-text", "Условия использования", "Безопасная рамка", "астро. предоставляет персонализированные развлекательно-рефлексивные материалы. Интерпретации носят вероятностный характер, могут не совпадать с вашим опытом и не должны быть единственным основанием для важных решений.", [["Не является", "диагнозом, лечением или консультацией"], ["Не гарантирует", "события, доход, отношения или результат"], ["Полный документ", "site → legal/terms.html"]]],
  privacy: ["shield-check", "Конфиденциальность", "Минимум необходимых данных", "Для расчёта карты нужны дата, время и место рождения. Они относятся к персональным данным и должны храниться с согласия пользователя, удаляться по запросу и не передаваться AI в идентифицирующем виде.", [["AI получает", "обезличенный JSON карты"], ["Не отправляем", "Telegram ID, username и точный адрес"], ["Контроль", "экспорт и удаление данных пользователем"]]],
  "ai-policy": ["bot", "Как используется AI", "AI только интерпретирует", "Нейросеть получает уже рассчитанную структуру карты и пишет понятный текст по строгой методологии. Она не рассчитывает положения планет, не ставит диагнозы и не выдаёт финансовых, медицинских или юридических рекомендаций.", [["Расчёт", "Swiss Ephemeris"], ["Тестовый провайдер", "GigaChat API через защищённый backend"], ["Production-переключение", "Claude или другой AI без изменений frontend"]]]
  ,mercury: ["message-circle", "Меркурий в Близнецах", "Мышление и речь", "Символически это положение связано с быстрым мышлением, любопытством и способностью переключаться между разными точками зрения. Проверяйте описание по своему опыту.", [["Положение", "Близнецы · 15°42′"], ["Может помогать", "объяснять сложное простыми словами"], ["Зона внимания", "информационная перегрузка"]]]
  ,venus: ["heart", "Венера в Близнецах", "Вкус и отношения", "В отношениях вам может быть особенно важен живой обмен мыслями, лёгкость и ощущение, что рядом можно оставаться любопытной.", [["Положение", "Близнецы · 29°11′"], ["Ценность", "интерес и диалог"], ["Проверить по опыту", "насколько вам важна свобода общения"]]]
  ,offer: ["file-check-2", "Условия подписки", "ЮKassa · внешний checkout", "Подписка оформляется на самостоятельном веб-сервисе. Перед оплатой пользователь видит цену, периодичность, условия автопродления, возврата и отключения. Доступ открывается только после подтверждённого webhook ЮKassa.", [["Цена", "299 ₽ каждые 30 дней"], ["Отмена", "самостоятельно в профиле"], ["Оплата", "защищённая страница ЮKassa"]]]
  ,"subscription-management": ["credit-card", "Управление подпиской", "Контроль списаний", "Здесь — статус подписки и автопродление. Отключение автопродления не удаляет уже оплаченный доступ: он сохраняется до конца оплаченного периода.", [["Тариф", "Астро+ · 299 ₽ / 30 дней"], ["Оплата", "защищённая страница ЮKassa"], ["Возврат", "по правилам публичной оферты"]]]
};

function icons() {
  if (!window.lucide) return;
  try {
    $$("[data-lucide]").forEach((node) => {
      const name = node.getAttribute("data-lucide");
      const iconKey = name?.split("-").map(part => part.charAt(0).toUpperCase() + part.slice(1)).join("");
      if (iconKey && window.lucide.icons && !window.lucide.icons[iconKey]) node.setAttribute("data-lucide", "circle-dot");
    });
    window.lucide.createIcons({ attrs: { "stroke-width": 1.8 } });
  } catch (_) {
    $$("[data-lucide]").forEach((node) => node.classList.add("icon-fallback"));
  }
}
function haptic(type = "light") { try { tg?.HapticFeedback?.impactOccurred(type); } catch (_) {} }
function showToast(text) { toast.textContent = text; toast.classList.add("show"); setTimeout(() => toast.classList.remove("show"), 2800); }
function closeSheet(sheet) { sheet.classList.remove("open"); document.body.style.overflow = ""; }
function openSheet(sheet) { sheet.classList.add("open"); document.body.style.overflow = "hidden"; haptic(); icons(); }

function goTo(id) {
  screens.forEach((screen) => screen.classList.toggle("active", screen.id === id));
  navButtons.forEach((button) => button.classList.toggle("active", button.dataset.go === id));
  window.scrollTo({ top: 0, behavior: "smooth" }); haptic("soft");
}

function showDetail(key) {
  if (key === "friend-chart") { openFriendChart(); return; }
  if (key === "birth") { openBirthEdit(); return; }
  const item = details[key]; if (!item) return;
  const [icon, title, label, copy, rows] = item;

  // Доп. блоки строятся в одном innerHTML — без DOM-инъекций (исключает задвоение кнопок).
  let extra = "";
  if (key === "edit-profile") {
    extra = `<label class="field"><span>Ваше имя</span><input id="edit-name-input" type="text" maxlength="60" value="${escapeHtml(localStorage.getItem("astro_name") || "")}"></label><button class="primary" id="save-name-btn">Сохранить имя</button>`;
  } else if (key === "subscription-management") {
    extra = entitlement.isPlus
      ? `<button class="secondary" id="cancel-sub-btn">Отключить автопродление</button>`
      : `<button class="primary" id="sub-paywall-btn">Оформить Астро+</button>`;
  }

  $("#sheet-content").innerHTML = `<div class="detail-hero"><i data-lucide="${icon}"></i></div><p class="eyebrow">${label}</p><h2>${title}</h2><p>${copy}</p><div class="detail-list">${rows.map(row => `<div><span>${row[0]}</span><strong>${row[1]}</strong></div>`).join("")}</div>${extra}<button class="primary" data-sheet-done>Понятно</button>`;
  openSheet(detailSheet);

  if (key === "edit-profile") $("#save-name-btn").onclick = () => saveName($("#edit-name-input").value);
  if (key === "subscription-management") {
    const cancel = $("#cancel-sub-btn"); if (cancel) cancel.onclick = () => cancelSubscription(cancel);
    const subP = $("#sub-paywall-btn"); if (subP) subP.onclick = () => { closeSheet(detailSheet); paywallTitle.textContent = "Откройте: Астро+"; openSheet(paywall); };
  }
  $("[data-sheet-done]").onclick = () => closeSheet(detailSheet);
}

async function cancelSubscription(btn) {
  const endpoint = window.ASTRO_CONFIG?.cancelApiUrl;
  const token = localStorage.getItem("astro_access_token");
  if (!endpoint || !token) { showToast("Доступно после подключения backend"); return; }
  btn.disabled = true; btn.textContent = "Отключаем…";
  try {
    const r = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` } });
    if (!r.ok) throw new Error("cancel");
    showToast("Автопродление отключено. Доступ сохранится до конца оплаченного периода.");
    btn.textContent = "Автопродление отключено";
  } catch (_) {
    showToast("Не удалось отключить — попробуйте позже");
    btn.disabled = false; btn.textContent = "Отключить автопродление";
  }
}

function polar(cx, cy, radius, angle) {
  const radians = (angle - 90) * Math.PI / 180;
  return { x: cx + radius * Math.cos(radians), y: cy + radius * Math.sin(radians) };
}

function renderNatalChart(timeUnknown = false) {
  const svg = $("#natal-chart"); if (!svg) return;
  svg.innerHTML = "";
  const NS = "http://www.w3.org/2000/svg";
  const add = (tag, attrs = {}, text = "") => {
    const node = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
    if (text) node.textContent = text;
    svg.appendChild(node); return node;
  };
  const line = (a, b, cls) => add("line", { x1: a.x, y1: a.y, x2: b.x, y2: b.y, class: cls });
  const zodiac = ["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"];
  const houses = [272, 303, 331, 2, 35, 65, 92, 122, 151, 182, 213, 244];
  const planets = [
    { symbol:"☉", angle:71, degree:"21°", accent:true },
    { symbol:"☽", angle:214, degree:"04°" },
    { symbol:"☿", angle:65, degree:"15°", accent:true },
    { symbol:"♀", angle:49, degree:"29°" },
    { symbol:"♂", angle:123, degree:"03°" },
    { symbol:"♃", angle:286, degree:"16°" },
    { symbol:"♄", angle:348, degree:"06°" },
    { symbol:"♅", angle:310, degree:"04°" },
    { symbol:"♆", angle:302, degree:"27°" },
    { symbol:"♇", angle:251, degree:"00°" }
  ];
  add("circle", { cx:180, cy:180, r:166, class:"chart-ring" });
  add("circle", { cx:180, cy:180, r:139, class:"chart-ring soft" });
  add("circle", { cx:180, cy:180, r:105, class:"chart-ring" });
  add("circle", { cx:180, cy:180, r:73, class:"chart-ring soft" });
  for (let i = 0; i < 12; i++) {
    line(polar(180,180,139,i*30), polar(180,180,166,i*30), "zodiac-line");
    const label = polar(180,180,153,i*30+15); add("text",{x:label.x,y:label.y,class:"zodiac-label"},zodiac[i]);
  }
  if (!timeUnknown) {
    houses.forEach((angle, index) => {
      line(polar(180,180,73,angle), polar(180,180,139,angle), index === 0 || index === 6 ? "axis-line" : "house-line");
      const label = polar(180,180,91,angle + 12); add("text",{x:label.x,y:label.y,class:"house-number"},String(index+1));
    });
    [["ASC",272],["DSC",92],["MC",2],["IC",182]].forEach(([label, angle]) => {
      const p = polar(180,180,145,angle); add("text",{x:p.x,y:p.y,class:"axis-label"},label);
    });
  }
  planets.forEach(planet => {
    const p = polar(180,180,119,planet.angle);
    add("circle",{cx:p.x,cy:p.y,r:9,class:`planet-node${planet.accent?" accent":""}`});
    add("text",{x:p.x,y:p.y+.5,class:"planet-symbol"},planet.symbol);
    const d = polar(180,180,133,planet.angle); add("text",{x:d.x,y:d.y,class:"planet-degree"},planet.degree);
  });
  add("circle",{cx:180,cy:180,r:38,class:"chart-center"});
  add("text",{x:180,y:177,class:"chart-center-title"},"Москва");
  add("text",{x:180,y:188,class:"chart-center-sub"},timeUnknown ? "карта без домов" : "структурная схема");
}

const PLANET_GLYPH = { sun:"☉", moon:"☽", mercury:"☿", venus:"♀", mars:"♂", jupiter:"♃", saturn:"♄", uranus:"♅", neptune:"♆", pluto:"♇", north_node:"☊" };

// Рисует круг карты из реальных данных расчёта (угол = долгота). Fallback на демо.
function renderRealChart(chart) {
  const svg = $("#natal-chart"); if (!svg) return;
  const planets = Array.isArray(chart?.planets) ? chart.planets : null;
  if (!planets) { renderNatalChart(!!chart?.birth?.time_unknown); return; }
  svg.innerHTML = "";
  const NS = "http://www.w3.org/2000/svg";
  const add = (tag, attrs = {}, text = "") => {
    const node = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
    if (text) node.textContent = text;
    svg.appendChild(node); return node;
  };
  const pol = (r, a) => { const rad = (a - 90) * Math.PI / 180; return { x: 180 + r * Math.cos(rad), y: 180 + r * Math.sin(rad) }; };
  const line = (A, B, cls) => add("line", { x1: A.x, y1: A.y, x2: B.x, y2: B.y, class: cls });
  const zodiac = ["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"];
  add("circle", { cx:180, cy:180, r:166, class:"chart-ring" });
  add("circle", { cx:180, cy:180, r:139, class:"chart-ring soft" });
  add("circle", { cx:180, cy:180, r:105, class:"chart-ring" });
  add("circle", { cx:180, cy:180, r:73, class:"chart-ring soft" });
  for (let i = 0; i < 12; i++) {
    line(pol(139, i*30), pol(166, i*30), "zodiac-line");
    const l = pol(153, i*30 + 15); add("text", { x:l.x, y:l.y, class:"zodiac-label" }, zodiac[i]);
  }
  const cusps = Array.isArray(chart.house_cusps) && chart.house_cusps.length === 12 ? chart.house_cusps : null;
  if (cusps) {
    cusps.forEach((cuspLon, idx) => {
      const axis = idx === 0 || idx === 3 || idx === 6 || idx === 9;
      line(pol(73, cuspLon), pol(139, cuspLon), axis ? "axis-line" : "house-line");
    });
    [["ASC", cusps[0]], ["IC", cusps[3]], ["DSC", cusps[6]], ["MC", cusps[9]]].forEach(([label, lon]) => {
      const p = pol(145, lon); add("text", { x:p.x, y:p.y, class:"axis-label" }, label);
    });
  }
  planets.forEach(pl => {
    const p = pol(119, pl.lon);
    add("circle", { cx:p.x, cy:p.y, r:9, class:`planet-node${pl.key === "sun" ? " accent" : ""}` });
    add("text", { x:p.x, y:p.y + .5, class:"planet-symbol" }, PLANET_GLYPH[pl.key] || "•");
    const d = pol(133, pl.lon); add("text", { x:d.x, y:d.y, class:"planet-degree" }, `${Math.round(pl.degree)}°`);
  });
  add("circle", { cx:180, cy:180, r:38, class:"chart-center" });
  add("text", { x:180, y:177, class:"chart-center-title" }, String(chart.birth?.place || "").split(",")[0].slice(0, 14));
  add("text", { x:180, y:188, class:"chart-center-sub" }, cusps ? "Плацидус" : "карта без домов");
}

function setupOnboarding() {
  const onboarding = $("#onboarding"); if (!onboarding) return;
  let slide = 0;
  const slides = $$(".onboarding-slide", onboarding);
  const dots = $$(".onboarding-dots i", onboarding);
  const next = $("#onboarding-next");
  const update = () => {
    slides.forEach((item, index) => item.classList.toggle("active", index === slide));
    dots.forEach((item, index) => item.classList.toggle("active", index === slide));
    next.innerHTML = slide === slides.length - 1 ? `Начать знакомство <i data-lucide="arrow-right"></i>` : `Продолжить <i data-lucide="arrow-right"></i>`;
    icons();
  };
  next.addEventListener("click", () => {
    if (slide < slides.length - 1) { slide += 1; update(); haptic("soft"); return; }
    if (!$("#consent-check").checked) { showToast("Подтвердите согласие, чтобы продолжить"); return; }
    onboarding.classList.add("hidden"); setTimeout(() => { onboarding.remove(); $("#birth-setup").classList.add("open"); icons(); }, 380); haptic("medium");
  });
}

// Знак Солнца по дате — детерминирован, без эфемерид. Для мгновенного тизера.
function sunSignFromDate(value) {
  const d = new Date(`${value}T12:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  const m = d.getMonth() + 1, day = d.getDate();
  const signs = [
    ["Козерог", 1, 19], ["Водолей", 2, 18], ["Рыбы", 3, 20], ["Овен", 4, 19],
    ["Телец", 5, 20], ["Близнецы", 6, 20], ["Рак", 7, 22], ["Лев", 8, 22],
    ["Дева", 9, 22], ["Весы", 10, 22], ["Скорпион", 11, 21], ["Стрелец", 12, 21]
  ];
  const [name, , lastDay] = signs[m - 1];
  if (day <= lastDay) return name;
  return signs[m % 12][0];
}

function setupBirthFlow() {
  let step = 0;
  const steps = $$(".birth-step");
  const next = $("#birth-next");
  const unknown = $("#time-unknown");
  unknown.addEventListener("change", () => $("#time-field").classList.toggle("disabled", unknown.checked));
  const update = () => {
    steps.forEach((item, index) => item.classList.toggle("active", index === step));
    $(".birth-progress i").style.width = `${((step + 1) / steps.length) * 100}%`;
    next.innerHTML = step === steps.length - 1 ? `Построить карту <i data-lucide="sparkles"></i>` : `Продолжить <i data-lucide="arrow-right"></i>`;
    icons();
  };
  next.addEventListener("click", () => {
    if (step === 0 && !$("#birth-date").value) return showToast("Укажите дату рождения");
    if (step === 2 && !$("#birth-place").value.trim()) return showToast("Укажите город рождения");
    if (step === 0) { const sign = sunSignFromDate($("#birth-date").value); if (sign) showToast(`Уже вижу: ваше Солнце в ${sign} ✨`); }
    if (step < steps.length - 1) { step += 1; update(); return; }
    const place = $("#birth-place").value.trim();
    const date = new Date(`${$("#birth-date").value}T12:00:00`);
    const formatted = Number.isNaN(date.getTime()) ? $("#birth-date").value : date.toLocaleDateString("ru-RU",{day:"numeric",month:"long",year:"numeric"});
    $("#chart-meta").innerHTML = unknown.checked ? `${place} · ${formatted}<br>Время неизвестно · карта без домов` : `${place} · ${formatted} · ${$("#birth-time").value}<br>Система домов: Плацидус`;
    $$(".positions-list em").forEach(em => { if (unknown.checked) em.textContent = "дом не рассчитан"; });
    $(".big-three button:last-child").style.display = unknown.checked ? "none" : "";
    renderNatalChart(unknown.checked);
    // Сохраняем карту для запросов к AI (иначе interpret получает пустой chart → обезличенный ответ).
    const chartJson = {
      birth: {
        date: $("#birth-date").value,
        time: unknown.checked ? null : $("#birth-time").value,
        time_unknown: unknown.checked,
        place,
      },
      sun_sign: sunSignFromDate($("#birth-date").value),
      houses_system: unknown.checked ? null : "Placidus",
      note: "Базовые данные рождения. Полный расчёт Swiss Ephemeris подключается на backend (chart-calc).",
    };
    const nameVal = $("#birth-name") && $("#birth-name").value.trim();
    if (nameVal) { localStorage.setItem("astro_name", nameVal); applyName(nameVal); }
    localStorage.setItem("astro_chart_json", JSON.stringify(chartJson));
    saveChartToBackend(chartJson);
    computeChart(chartJson.birth); // апгрейд до реальной карты, если chart-calc подключён
    $("#birth-setup").classList.remove("open");
    showToast("Данные сохранены. В production здесь запустится расчёт Swiss Ephemeris.");
  });
}

$$("[data-go]").forEach(button => button.addEventListener("click", () => goTo(button.dataset.go)));
$$("[data-detail]").forEach(button => button.addEventListener("click", () => showDetail(button.dataset.detail)));
$$("[data-paywall]").forEach(button => button.addEventListener("click", () => {
  if (entitlement.isPlus) { showToast("Уже открыто в Астро+"); return; }
  paywallTitle.textContent = `Откройте: ${button.dataset.paywall}`; openSheet(paywall);
}));
$$(".sheet-close").forEach(button => button.addEventListener("click", () => closeSheet(button.closest(".sheet-backdrop"))));
$$(".sheet-backdrop").forEach(backdrop => backdrop.addEventListener("click", e => { if (e.target === backdrop) closeSheet(backdrop); }));

$$(".accordion-head:not(.locked)").forEach(button => button.addEventListener("click", () => {
  const body = button.nextElementSibling; const open = body.classList.toggle("open");
  button.classList.toggle("open", open); $("span", button).textContent = open ? "−" : "+"; haptic("soft");
}));

const question = $("#question");
question.addEventListener("input", () => $("#char-count").textContent = `${question.value.length} / 220`);
$$("[data-prompt]").forEach(button => button.addEventListener("click", () => { question.value = button.dataset.prompt; question.dispatchEvent(new Event("input")); question.focus(); }));
const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
function renderAnswer(data) {
  if (data.title) $("#answer-title").textContent = data.title;
  const body = $("#answer-body");
  const blocks = [];
  if (data.summary) blocks.push(`<p>${escapeHtml(data.summary)}</p>`);
  (data.sections || []).forEach(sec => {
    if (sec.heading) blocks.push(`<p><b>${escapeHtml(sec.heading)}</b></p>`);
    if (sec.body) blocks.push(`<p>${escapeHtml(sec.body)}</p>`);
  });
  body.innerHTML = blocks.join("") || body.innerHTML;
  if (data.disclaimer) $(".answer-disclaimer").textContent = data.disclaimer;
}
$("#ask-button").addEventListener("click", () => {
  if (!question.value.trim()) { question.focus(); showToast("Сначала напишите вопрос"); return; }
  const userQuestion = question.value.trim();
  const endpoint = window.ASTRO_CONFIG?.interpretationApiUrl;
  const token = localStorage.getItem("astro_access_token");
  const reveal = () => {
    $("#answer-card").classList.add("show"); question.value = ""; question.dispatchEvent(new Event("input")); haptic("medium");
    setTimeout(() => $("#answer-card").scrollIntoView({ behavior: "smooth", block: "center" }), 180);
  };
  if (!endpoint || !token) { reveal(); showToast("Показан демо-ответ. Подключите AI backend для генерации."); return; }
  $("#ask-button").textContent = "AI готовит ответ…";
  fetch(endpoint, { method:"POST", headers:{"Content-Type":"application/json","Authorization":`Bearer ${token}`}, body:JSON.stringify({ task:"universe_answer", chart:JSON.parse(localStorage.getItem("astro_chart_json") || "{}"), question:userQuestion }) })
    .then(async response => {
      const payload = await response.json().catch(() => ({}));
      if (response.status === 402) { const e = new Error("quota"); e.payload = payload; throw e; }
      if (!response.ok) throw new Error("ai");
      return payload;
    })
    .then(data => {
      renderAnswer(data); $("#answer-source").textContent = "AI · ответ сегодня"; reveal(); showToast("Ответ AI сохранён в истории");
      entitlement.questionsLeft = Math.max(0, entitlement.questionsLeft - 1); applyEntitlement();
      answerHistory.unshift({ question: userQuestion, title: data.title, summary: data.summary, created_at: new Date().toISOString() });
      renderHistory();
    })
    .catch(err => {
      if (err.message === "quota") {
        entitlement.questionsLeft = 0; applyEntitlement();
        showToast(err.payload?.message || "Лимит запросов исчерпан");
        if (!entitlement.isPlus) { paywallTitle.textContent = "Откройте: больше ответов Вселенной"; openSheet(paywall); }
        return;
      }
      reveal(); showToast("AI временно недоступен — показан демо-ответ");
    })
    .finally(() => { $("#ask-button").innerHTML = `Спросить Вселенную <i data-lucide="arrow-up-right"></i>`; icons(); });
});

$(".toggle-row").addEventListener("click", () => { $(".toggle").classList.toggle("on"); showToast($(".toggle").classList.contains("on") ? "Утренний прогноз включён" : "Утренний прогноз выключен"); });
$(".subscribe").addEventListener("click", async () => {
  if (!$("#payment-consent").checked) return showToast("Подтвердите условия подписки");
  const receiptEmail = $("#payment-email").value.trim();
  if (!receiptEmail.includes("@")) return showToast("Укажите email для электронного чека");
  const fallback = new URL("checkout.html", window.location.href).href;
  try {
    if (!window.ASTRO_CONFIG?.paymentApiUrl) throw new Error("demo");
    const token = localStorage.getItem("astro_access_token");
    if (!token) throw new Error("auth");
    const response = await fetch(window.ASTRO_CONFIG.paymentApiUrl, { method:"POST", headers:{"Content-Type":"application/json","Authorization":`Bearer ${token}`}, body:JSON.stringify({plan:"astro_plus_monthly",return_url:window.location.href,receipt_email:receiptEmail}) });
    if (!response.ok) throw new Error("payment");
    const { confirmation_url } = await response.json();
    tg?.openLink ? tg.openLink(confirmation_url) : window.open(confirmation_url, "_blank", "noopener");
  } catch (_) {
    tg?.openLink ? tg.openLink(fallback) : window.open(fallback, "_blank", "noopener");
  }
});
$$("[data-action]").forEach(button => button.addEventListener("click", () => {
  if (button.dataset.action === "share") { shareMyChart(); haptic(); return; }
  const messages = { streak: "Ваш ритм складывается день за днём", daypart: "Периоды дня рассчитаны по вашей карте", "save-answer": "Ответ сохранён в избранное" };
  showToast(messages[button.dataset.action] || "Готово"); haptic();
}));

const refreshBtn = $("#refresh-btn");
if (refreshBtn) refreshBtn.addEventListener("click", async () => {
  refreshBtn.classList.add("spinning");
  await loadDailyContent();
  refreshBtn.classList.remove("spinning");
  haptic(); showToast("Обновлено");
});
$$("[data-link]").forEach(button => button.addEventListener("click", () => {
  const url = new URL(button.dataset.link, window.location.href).href;
  tg?.openLink ? tg.openLink(url) : window.open(url, "_blank", "noopener");
}));

const entitlement = { isPlus: false, questionsLeft: 3, questionsLimit: 3 };
let answerHistory = [];

function formatHistDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
}

function renderHistory() {
  const list = $("#history-list");
  if (!list || !answerHistory.length) return; // нет истории — оставляем демо-карточки
  list.innerHTML = answerHistory.map((it, i) =>
    `<button class="history-card" data-hist="${i}"><span>${formatHistDate(it.created_at)}</span><strong>${escapeHtml(it.question || it.title || "Ответ Вселенной")}</strong><small>${escapeHtml((it.summary || "").slice(0, 90))}…</small><i data-lucide="chevron-right"></i></button>`
  ).join("");
  const count = $("#history-count");
  if (count) count.textContent = `${answerHistory.length} всего`;
  list.querySelectorAll("[data-hist]").forEach(btn => btn.addEventListener("click", () => {
    const it = answerHistory[Number(btn.dataset.hist)];
    renderAnswer({ title: it.title, summary: it.summary, sections: [] });
    $("#answer-card").classList.add("show");
    $("#answer-source").textContent = `Из истории · ${formatHistDate(it.created_at)}`;
    setTimeout(() => $("#answer-card").scrollIntoView({ behavior: "smooth", block: "center" }), 120);
    icons(); haptic("soft");
  }));
  icons();
}

function applyEntitlement() {
  document.body.classList.toggle("is-plus", entitlement.isPlus);
  const counter = $("#questions-left");
  if (counter) {
    counter.textContent = entitlement.isPlus
      ? `Осталось ${entitlement.questionsLeft} из ${entitlement.questionsLimit}`
      : `Бесплатно: ${entitlement.questionsLeft} из ${entitlement.questionsLimit}`;
    counter.classList.toggle("counter-empty", entitlement.questionsLeft <= 0);
  }
}

// --- Имя пользователя ---
function applyName(name) {
  name = (name || "").trim();
  const greeting = $("#profile-greeting");
  if (greeting) greeting.innerHTML = name ? `${escapeHtml(name)},<br>это ваше небо` : "Это ваше<br>небо";
  if (!name) return;
  $$(".profile-card strong").forEach(el => el.textContent = name);
  const initials = name.split(/\s+/).map(w => w[0] || "").slice(0, 2).join("").toUpperCase();
  $$(".avatar").forEach(el => { if (!el.querySelector("img")) el.textContent = initials; });
}

async function saveName(name) {
  name = (name || "").trim();
  if (!name) { showToast("Введите имя"); return; }
  localStorage.setItem("astro_name", name);
  applyName(name);
  const endpoint = window.ASTRO_CONFIG?.saveChartApiUrl;
  const token = localStorage.getItem("astro_access_token");
  if (endpoint && token) {
    try {
      await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ name }),
      });
    } catch (_) {}
  }
  showToast("Имя сохранено");
  closeSheet(detailSheet);
}

// --- Ежедневный контент главной (прогноз, сферы, энергия, части дня, неделя) ---
function renderDaily(d) {
  if (!d) return;
  if (d.energy) {
    const card = $(".energy-card");
    if (card) {
      const eb = $(".eyebrow", card); if (eb && d.energy.percent) eb.textContent = `Энергия дня · ${d.energy.percent}%`;
      const h = $("h2", card); if (h && d.energy.title) h.textContent = d.energy.title;
      const ps = $$("p", card); const bodyP = ps[ps.length - 1]; if (bodyP && d.energy.body) bodyP.textContent = d.energy.body;
    }
  }
  if (Array.isArray(d.dayparts)) {
    const btns = $$(".day-meter button");
    d.dayparts.forEach((dp, i) => {
      const b = btns[i]; if (!b) return;
      const s = $("strong", b); if (s && dp.title) s.textContent = dp.title;
      const bar = $("i", b); if (bar && dp.level) bar.style.setProperty("--level", `${dp.level}%`);
    });
  }
  if (d.forecast) {
    const fc = $(".forecast-card");
    if (fc) {
      const p = $("p", fc); if (p && d.forecast.body) p.textContent = d.forecast.body;
      const adv = fc.querySelector(".advice div");
      if (adv && d.forecast.advice) adv.innerHTML = `<span>Совет дня</span>${escapeHtml(d.forecast.advice)}`;
    }
  }
  (d.spheres || []).forEach(s => {
    const card = document.querySelector(`.sphere-card[data-detail="${s.key}"]`);
    if (!card) return;
    const strong = $("strong", card); if (strong && s.title) strong.textContent = s.title;
    const p = $("p", card); if (p && s.text) p.textContent = s.text;
    const em = $("em", card); if (em && s.percent) em.textContent = `${s.percent}%`;
  });
  if (d.is_plus && d.week) {
    const wc = $(".week-card");
    if (wc) { const h = $("h3", wc); if (h && d.week.title) h.textContent = d.week.title; const p = wc.querySelector("div > p"); if (p && d.week.body) p.textContent = d.week.body; }
  }
}

async function loadDailyContent() {
  const endpoint = window.ASTRO_CONFIG?.dailyContentApiUrl;
  const token = localStorage.getItem("astro_access_token");
  if (!endpoint || !token) return;
  try {
    const chart = JSON.parse(localStorage.getItem("astro_chart_json") || "null");
    const r = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ chart }),
    });
    if (!r.ok) return;
    renderDaily(await r.json());
    markDailyLoaded();
  } catch (_) {}
}

const SIGN_BLURB = {
  "Овен": "решительность, прямота и желание действовать первым",
  "Телец": "основательность, любовь к комфорту и устойчивость",
  "Близнецы": "любопытство, лёгкость в общении и быстрый ум",
  "Рак": "чуткость, привязанность к близким и хорошая интуиция",
  "Лев": "тепло, щедрость и потребность быть замеченным",
  "Дева": "внимание к деталям, практичность и желание улучшать",
  "Весы": "стремление к балансу, эстетика и дипломатичность",
  "Скорпион": "глубина чувств, проницательность и сила воли",
  "Стрелец": "тяга к свободе, оптимизм и поиск смысла",
  "Козерог": "целеустремлённость, ответственность и выдержка",
  "Водолей": "оригинальность, независимость и взгляд в будущее",
  "Рыбы": "мечтательность, эмпатия и тонкое восприятие",
};
const SIGN_STRENGTH = {
  "Овен": "смелость начинать и вести за собой", "Телец": "терпение и умение доводить до результата",
  "Близнецы": "находить общий язык и быстро учиться", "Рак": "заботиться и создавать тёплую атмосферу",
  "Лев": "вдохновлять и быть в центре событий", "Дева": "наводить порядок и видеть детали",
  "Весы": "сглаживать конфликты и держать вкус", "Скорпион": "идти до конца и читать людей",
  "Стрелец": "видеть большую картину и заражать оптимизмом", "Козерог": "строить вдолгую и держать слово",
  "Водолей": "мыслить нестандартно и объединять людей", "Рыбы": "сопереживать и творчески чувствовать",
};
const SIGN_GROWTH = {
  "Овен": "учиться терпению и слушать других", "Телец": "не бояться перемен", "Близнецы": "доводить начатое до конца",
  "Рак": "не закрываться в обидах", "Лев": "делиться вниманием", "Дева": "быть мягче к себе",
  "Весы": "принимать решения без долгих сомнений", "Скорпион": "отпускать контроль", "Стрелец": "доводить идеи до дела",
  "Козерог": "позволять себе отдых", "Водолей": "быть ближе эмоционально", "Рыбы": "опираться на факты",
};

function setTodayDate() {
  const el = $("#today-date"); if (!el) return;
  const s = new Date().toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" });
  el.textContent = s.charAt(0).toUpperCase() + s.slice(1);
}

function pluralDays(n) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return "день";
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return "дня";
  return "дней";
}
// Реальный счётчик дней подряд + интенсивность пламени.
function computeStreak() {
  const btn = $(".streak"); if (!btn) return;
  const todayStr = new Date().toISOString().slice(0, 10);
  const last = localStorage.getItem("astro_streak_date");
  let streak = parseInt(localStorage.getItem("astro_streak") || "0", 10) || 0;
  if (last !== todayStr) {
    const y = new Date(); y.setDate(y.getDate() - 1);
    streak = (last === y.toISOString().slice(0, 10)) ? streak + 1 : 1;
    localStorage.setItem("astro_streak", String(streak));
    localStorage.setItem("astro_streak_date", todayStr);
  }
  if (streak < 1) streak = 1;
  btn.innerHTML = `<i data-lucide="flame"></i> ${streak} ${pluralDays(streak)} подряд`;
  btn.dataset.flame = String(streak >= 30 ? 4 : streak >= 14 ? 3 : streak >= 7 ? 2 : streak >= 3 ? 1 : 0);
  icons();
}

// Раскрывает все разделы портрета и добавляет платный CTA там, где его нет.
function enhancePortrait() {
  $$("#chart .accordion-head").forEach(head => {
    const body = head.nextElementSibling;
    if (!body || !body.classList.contains("accordion-body")) return;
    body.classList.add("open"); head.classList.add("open");
    const span = $("span", head); if (span) span.textContent = "−";
    if (!body.querySelector(".inline-paywall") && !body.querySelector(".locked-teaser")) {
      const cta = document.createElement("button");
      cta.className = "inline-paywall";
      cta.textContent = "Подробнее в Астро+";
      cta.addEventListener("click", (e) => {
        e.stopPropagation();
        if (entitlement.isPlus) { showToast("Уже открыто в Астро+"); return; }
        paywallTitle.textContent = "Откройте: подробный разбор"; openSheet(paywall);
      });
      body.appendChild(cta);
    }
  });
}

// Редактирование данных рождения (лимит раз в неделю — на backend).
function openBirthEdit() {
  const c = JSON.parse(localStorage.getItem("astro_chart_json") || "null") || {};
  const b = c.birth || {};
  $("#sheet-content").innerHTML = `<div class="detail-hero"><i data-lucide="calendar-days"></i></div>
    <p class="eyebrow">Данные рождения</p><h2>Изменить</h2>
    <p>Менять данные можно <b>раз в неделю</b> — после изменения карта и прогнозы пересчитаются.</p>
    <label class="field"><span>Дата рождения</span><input id="be-date" type="date" value="${b.date || ""}"></label>
    <label class="field"><span>Время рождения</span><input id="be-time" type="time" value="${b.time || ""}"></label>
    <label class="unknown-time"><input id="be-unknown" type="checkbox" ${b.time_unknown ? "checked" : ""}><span><b>Время неизвестно</b>Построим карту без домов</span></label>
    <label class="field"><span>Город рождения</span><input id="be-place" type="text" maxlength="60" value="${escapeHtml(b.place || "")}"></label>
    <button class="primary" id="be-save">Сохранить и пересчитать</button>`;
  openSheet(detailSheet);
  $("#be-save").onclick = saveBirthEdit;
}
async function saveBirthEdit() {
  const date = $("#be-date").value;
  if (!date) { showToast("Укажите дату рождения"); return; }
  const unknown = $("#be-unknown").checked;
  const birth = { date, time: unknown ? null : $("#be-time").value, time_unknown: unknown, place: $("#be-place").value.trim() };
  const chartJson = { birth, sun_sign: sunSignFromDate(date), houses_system: unknown ? null : "Placidus", note: "обновлено пользователем" };
  const btn = $("#be-save"); btn.disabled = true; btn.textContent = "Сохраняем…";
  const endpoint = window.ASTRO_CONFIG?.saveChartApiUrl;
  const token = localStorage.getItem("astro_access_token");
  if (endpoint && token) {
    try {
      const r = await fetch(endpoint, {
        method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ birth, chart: chartJson }),
      });
      if (r.status === 429) {
        const p = await r.json().catch(() => ({}));
        showToast(p.message || "Данные рождения можно менять раз в неделю");
        btn.disabled = false; btn.textContent = "Сохранить и пересчитать"; return;
      }
    } catch (_) {}
  }
  localStorage.setItem("astro_chart_json", JSON.stringify(chartJson));
  localStorage.removeItem("astro_daily_date");
  applySavedChart();
  computeChart(birth);
  loadDailyContent();
  closeSheet(detailSheet);
  showToast("Данные обновлены — карта пересчитывается");
}

function updateRefreshDot() {
  const btn = $("#refresh-btn"); if (!btn) return;
  const today = new Date().toISOString().slice(0, 10);
  btn.classList.toggle("stale", localStorage.getItem("astro_daily_date") !== today);
}
function markDailyLoaded() {
  localStorage.setItem("astro_daily_date", new Date().toISOString().slice(0, 10));
  updateRefreshDot();
}

function appLink() {
  const u = window.ASTRO_CONFIG?.botUsername;
  return u ? `https://t.me/${u}` : "https://begemot-m.github.io/astro-mini-app/";
}
function shareToTelegram(text, link) {
  const url = `https://t.me/share/url?url=${encodeURIComponent(link || appLink())}&text=${encodeURIComponent(text)}`;
  if (tg?.openTelegramLink) tg.openTelegramLink(url); else window.open(url, "_blank", "noopener");
}
function shareMyChart() {
  const c = JSON.parse(localStorage.getItem("astro_chart_json") || "null");
  const name = localStorage.getItem("astro_name") || "Моя";
  const sign = c?.sun_sign ? ` · Солнце в ${c.sun_sign}` : "";
  shareToTelegram(`✨ ${name} натальная карта${sign}. Узнай свою личность через астрологию в астро.`);
}

function openFriendChart() {
  $("#sheet-content").innerHTML = `<div class="detail-hero"><i data-lucide="user-plus"></i></div>
    <p class="eyebrow">Карта для друга</p><h2>Краткий разбор</h2>
    <p>Введите данные друга — получите короткое описание, которым можно поделиться.</p>
    <label class="field"><span>Имя друга</span><input id="fr-name" type="text" maxlength="40" placeholder="Имя"></label>
    <label class="field"><span>Дата рождения</span><input id="fr-date" type="date"></label>
    <label class="field"><span>Город рождения</span><input id="fr-place" type="text" maxlength="60" placeholder="Город (необязательно)"></label>
    <button class="primary" id="fr-go">Составить</button>
    <div id="fr-result"></div>`;
  openSheet(detailSheet);
  $("#fr-go").onclick = buildFriendChart;
}
function buildFriendChart() {
  const name = ($("#fr-name").value || "").trim() || "Друг";
  const date = $("#fr-date").value;
  if (!date) { showToast("Укажите дату рождения друга"); return; }
  const sign = sunSignFromDate(date) || "";
  const blurb = SIGN_BLURB[sign] || "особый внутренний рисунок личности";
  const strength = SIGN_STRENGTH[sign] || "свои сильные стороны";
  const growth = SIGN_GROWTH[sign] || "точки роста";

  // Текст для экрана (по разделам) и текст для пересылки (с приглашением).
  const sections = [
    ["Характер", `Солнце в ${sign} — ядро личности. Может проявляться ${blurb}.`],
    ["Сильная сторона", `${strength.charAt(0).toUpperCase() + strength.slice(1)}.`],
    ["Зона роста", `${growth.charAt(0).toUpperCase() + growth.slice(1)}.`],
  ];
  $("#fr-result").innerHTML = `<article class="recognition-card" style="margin-top:16px">
      <p class="eyebrow">${escapeHtml(name)} · Солнце в ${escapeHtml(sign)}</p>
      ${sections.map(s => `<p style="color:#ddd;font-size:11px;line-height:1.6;margin:8px 0"><b style="color:#a852ff;display:block;font-size:9px;text-transform:uppercase;letter-spacing:.5px">${escapeHtml(s[0])}</b>${escapeHtml(s[1])}</p>`).join("")}
      <p class="reflection-question" style="margin-bottom:0"><b>Полная карта — Луна, отношения и предназначение — раскрывается в астро.</b></p>
    </article>
    <button class="primary" id="fr-share">Поделиться в Telegram</button>`;
  const shareText = `✨ ${name} — краткий астропортрет\n\nСолнце в ${sign}: ${blurb}.\nСильная сторона: ${strength}.\nЗона роста: ${growth}.\n\nЭто только ядро личности. Полная карта — в приложении астро:`;
  $("#fr-share").onclick = () => shareToTelegram(shareText);
  icons();
}

async function authenticate() {
  const endpoint = window.ASTRO_CONFIG?.authApiUrl;
  const initData = tg?.initData;
  if (!endpoint || !initData) { applyEntitlement(); return; } // demo-режим
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ init_data: initData }),
    });
    if (!response.ok) throw new Error("auth");
    const data = await response.json();
    if (data.access_token) localStorage.setItem("astro_access_token", data.access_token);
    entitlement.isPlus = data.is_plus === true;
    if (Number.isInteger(data.questions_left)) entitlement.questionsLeft = data.questions_left;
    if (Number.isInteger(data.questions_limit)) entitlement.questionsLimit = data.questions_limit;
    // Кросс-девайс: если на бэке есть карта, а локально нет — восстанавливаем.
    if (data.chart && !localStorage.getItem("astro_chart_json")) {
      localStorage.setItem("astro_chart_json", JSON.stringify(data.chart));
      applySavedChart();
    }
    if (Array.isArray(data.history)) { answerHistory = data.history; renderHistory(); }
    if (data.display_name && !localStorage.getItem("astro_name")) localStorage.setItem("astro_name", data.display_name);
    applyName(localStorage.getItem("astro_name") || data.display_name);
    loadDailyContent();
  } catch (_) {
    showToast("Не удалось авторизоваться — показаны демо-данные");
  }
  applyEntitlement();
}

async function saveChartToBackend(chartJson) {
  const endpoint = window.ASTRO_CONFIG?.saveChartApiUrl;
  const token = localStorage.getItem("astro_access_token");
  if (!endpoint || !token || !chartJson?.birth) return;
  try {
    const r = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ birth: chartJson.birth, chart: chartJson, name: localStorage.getItem("astro_name") || undefined }),
    });
    if (r.status === 429) {
      const p = await r.json().catch(() => ({}));
      showToast(p.message || "Данные рождения можно менять раз в неделю");
    }
  } catch (_) {}
}

// Реальный расчёт Swiss Ephemeris через Edge Function chart-calc.
// Тихий fallback: если сервис не подключён или ошибка — остаётся базовая карта.
async function computeChart(birth) {
  const endpoint = window.ASTRO_CONFIG?.chartCalcApiUrl;
  const token = localStorage.getItem("astro_access_token");
  if (!endpoint || !token || !birth?.date) return;
  try {
    const r = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify(birth),
    });
    if (!r.ok) return;
    const realChart = await r.json();
    if (!realChart || !Array.isArray(realChart.planets)) return;
    localStorage.setItem("astro_chart_json", JSON.stringify(realChart));
    saveChartToBackend(realChart); // в realChart есть поле birth
    renderRealChart(realChart);    // перерисовать круг под реальный расчёт
    showToast("Карта рассчитана по Swiss Ephemeris ✨");
  } catch (_) {}
}

// Восстанавливает интерфейс по сохранённой карте: убирает онбординг, заполняет мету.
function applySavedChart() {
  const raw = localStorage.getItem("astro_chart_json");
  if (!raw) return false;
  let c; try { c = JSON.parse(raw); } catch { return false; }
  if (!c || !c.birth) return false;
  const onboarding = $("#onboarding"); if (onboarding) onboarding.remove();
  const d = new Date(`${c.birth.date}T12:00:00`);
  const formatted = Number.isNaN(d.getTime()) ? (c.birth.date || "") : d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
  const meta = $("#chart-meta");
  if (meta && c.birth.place) meta.innerHTML = c.birth.time_unknown
    ? `${c.birth.place} · ${formatted}<br>Время неизвестно · карта без домов`
    : `${c.birth.place} · ${formatted}${c.birth.time ? " · " + c.birth.time : ""}<br>Система домов: Плацидус`;
  const city = (c.birth.place || "").split(",")[0];
  const sub = $("#profile-sub"); if (sub) sub.textContent = city;
  const bs = $("#birth-summary"); if (bs) bs.textContent = `${formatted}${city ? " · " + city : ""}`;
  // Если карта реальная (есть планеты) — рисуем её; иначе демо-схема.
  if (Array.isArray(c.planets)) renderRealChart(c); else renderNatalChart(!!c.birth.time_unknown);
  return true;
}

if (tg) {
  tg.ready(); tg.expand(); tg.setHeaderColor("#ffffff"); tg.setBackgroundColor("#ffffff");
  const user = tg.initDataUnsafe?.user;
  if (user?.first_name && !localStorage.getItem("astro_name")) applyName(user.first_name);
  authenticate();
}
icons();
renderNatalChart();
const hasSavedChart = applySavedChart();
applyName(localStorage.getItem("astro_name"));
setTodayDate();
updateRefreshDot();
computeStreak();
enhancePortrait();
// Микровибрация на каждый тап по кнопке (restore haptics).
document.addEventListener("click", (e) => { if (e.target.closest("button")) haptic("light"); });
if (!hasSavedChart) setupOnboarding(); // онбординг только для новых пользователей
setupBirthFlow();
