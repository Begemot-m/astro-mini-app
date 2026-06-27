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
  about: ["info", "Об астро.", "Магия в современной упаковке", "астро. — развлекательно-рефлексивный продукт. Интерпретации помогают посмотреть на привычные ситуации с нового ракурса, но не заменяют профессиональные медицинские, юридические или финансовые рекомендации.", [["Версия", "Прототип 0.3"], ["Расчёт карты", "Swiss Ephemeris"], ["Интерпретация", "AI-разбор через backend"]]],
  "edit-profile": ["user-round", "Профиль", "Данные Telegram", "В реальном Mini App имя и аватар загружаются из Telegram. Здесь показан демонстрационный пользователь.", [["Имя", "Мария К."], ["Username", "@maria_k"], ["Город", "Москва"]]],
  terms: ["file-text", "Условия использования", "Безопасная рамка", "астро. предоставляет персонализированные развлекательно-рефлексивные материалы. Интерпретации носят вероятностный характер, могут не совпадать с вашим опытом и не должны быть единственным основанием для важных решений.", [["Не является", "диагнозом, лечением или консультацией"], ["Не гарантирует", "события, доход, отношения или результат"], ["Полный документ", "site → legal/terms.html"]]],
  privacy: ["shield-check", "Конфиденциальность", "Минимум необходимых данных", "Для расчёта карты нужны дата, время и место рождения. Они относятся к персональным данным и должны храниться с согласия пользователя, удаляться по запросу и не передаваться AI в идентифицирующем виде.", [["AI получает", "обезличенный JSON карты"], ["Не отправляем", "Telegram ID, username и точный адрес"], ["Контроль", "экспорт и удаление данных пользователем"]]],
  "ai-policy": ["bot", "Как используется AI", "AI только интерпретирует", "Нейросеть получает уже рассчитанную структуру карты и пишет понятный текст по строгой методологии. Она не рассчитывает положения планет, не ставит диагнозы и не выдаёт финансовых, медицинских или юридических рекомендаций.", [["Расчёт", "Swiss Ephemeris"], ["Тестовый провайдер", "GigaChat API через защищённый backend"], ["Production-переключение", "Claude или другой AI без изменений frontend"]]]
  ,mercury: ["message-circle", "Меркурий в Близнецах", "Мышление и речь", "Символически это положение связано с быстрым мышлением, любопытством и способностью переключаться между разными точками зрения. Проверяйте описание по своему опыту.", [["Положение", "Близнецы · 15°42′"], ["Может помогать", "объяснять сложное простыми словами"], ["Зона внимания", "информационная перегрузка"]]]
  ,venus: ["heart", "Венера в Близнецах", "Вкус и отношения", "В отношениях вам может быть особенно важен живой обмен мыслями, лёгкость и ощущение, что рядом можно оставаться любопытной.", [["Положение", "Близнецы · 29°11′"], ["Ценность", "интерес и диалог"], ["Проверить по опыту", "насколько вам важна свобода общения"]]]
  ,offer: ["file-check-2", "Условия подписки", "ЮKassa · внешний checkout", "Подписка оформляется на самостоятельном веб-сервисе. Перед оплатой пользователь видит цену, периодичность, условия автопродления, возврата и отключения. Доступ открывается только после подтверждённого webhook ЮKassa.", [["Цена", "299 ₽ каждые 30 дней"], ["Отмена", "самостоятельно в профиле"], ["Оплата", "защищённая страница ЮKassa"]]]
  ,"subscription-management": ["credit-card", "Управление подпиской", "Контроль списаний", "В production здесь отображаются актуальный статус, дата следующего списания, история чеков и кнопка отключения автопродления. Отключение не удаляет уже оплаченный доступ.", [["Статус демо", "подписка не оформлена"], ["Автопродление", "выключается одним действием"], ["Возврат", "по правилам публичной оферты"]]]
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
  const item = details[key]; if (!item) return;
  const [icon, title, label, copy, rows] = item;
  $("#sheet-content").innerHTML = `<div class="detail-hero"><i data-lucide="${icon}"></i></div><p class="eyebrow">${label}</p><h2>${title}</h2><p>${copy}</p><div class="detail-list">${rows.map(row => `<div><span>${row[0]}</span><strong>${row[1]}</strong></div>`).join("")}</div><button class="primary" data-sheet-done>Понятно</button>`;
  openSheet(detailSheet);
  $("[data-sheet-done]").onclick = () => closeSheet(detailSheet);
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
    localStorage.setItem("astro_chart_json", JSON.stringify(chartJson));
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
  const messages = { notifications: "Новых прогнозов пока нет", streak: "7 дней подряд — мягкий ритм уже сложился", daypart: "Периоды дня рассчитаны по вашим транзитам", share: "Карточка готова к отправке в Telegram", "save-answer": "Ответ сохранён в избранное" };
  showToast(messages[button.dataset.action] || "Готово"); haptic();
}));
$$("[data-link]").forEach(button => button.addEventListener("click", () => {
  const url = new URL(button.dataset.link, window.location.href).href;
  tg?.openLink ? tg.openLink(url) : window.open(url, "_blank", "noopener");
}));

const entitlement = { isPlus: false, questionsLeft: 3, questionsLimit: 3 };

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
  } catch (_) {
    showToast("Не удалось авторизоваться — показаны демо-данные");
  }
  applyEntitlement();
}

if (tg) {
  tg.ready(); tg.expand(); tg.setHeaderColor("#ffffff"); tg.setBackgroundColor("#ffffff");
  const user = tg.initDataUnsafe?.user;
  if (user?.first_name) $$(".profile-card strong").forEach(el => el.textContent = user.first_name);
  authenticate();
}
icons();
renderNatalChart();
setupOnboarding();
setupBirthFlow();
