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
  money: ["wallet-cards", "Деньги и дело", "Фокус", "Сатурн помогает отличить сильную идею от отвлекающей. Не расширяйте список задач: выберите одну, которая создаёт измеримый результат.", [["Рабочий фокус", "Упаковка и презентация"], ["Решения", "Проверять цифрами"], ["Не сегодня", "Импульсивные покупки"]]],
  resource: ["leaf", "Тело и ресурс", "Тишина", "Ваш ресурс восстанавливается не через новые впечатления, а через снижение интенсивности. Оставьте вечером немного незаполненного времени.", [["Поддержит", "Ровный ритм и вода"], ["Зона внимания", "Информационная перегрузка"], ["Вечером", "Меньше экранов после 21:00"]]],
  chart: ["circle-dot-dashed", "Натальная карта", "Рисунок момента рождения", "Карта показывает положения планет, домов и аспектов на момент вашего рождения. Нажимая на элементы, вы будете получать подробные интерпретации.", [["Система домов", "Плацидус"], ["Доминирующая стихия", "Воздух"], ["Доминирующая планета", "Меркурий"]]],
  sun: ["sun", "Солнце в Близнецах", "Ядро личности", "Ваше Солнце проявляется через любопытство, связь идей и свободу задавать вопросы. Вам важно постоянно обновлять картину мира.", [["Градус", "21° 08′"], ["Дом", "9 дом"], ["Аспект", "Тригон с Сатурном"]]],
  moon: ["moon", "Луна в Скорпионе", "Эмоциональная природа", "Вы чувствуете глубже, чем показываете. Интуитивно считываете подтекст и нуждаетесь в отношениях, где можно быть полностью честной.", [["Градус", "04° 32′"], ["Дом", "1 дом"], ["Ресурс", "Эмоциональная честность"]]],
  asc: ["circle-dot", "Асцендент в Весах", "Как вас видят", "Первое впечатление о вас связано с тактом, эстетикой и умением создавать комфортный контакт. Вы естественно ищете баланс.", [["Градус", "15° 10′"], ["Управитель", "Венера"], ["Стиль", "Мягкая уверенность"]]],
  "history-work": ["compass", "Баланс работы и отдыха", "Ответ от 8 июня", "Ваш Марс просит действовать ритмично, а не рывками. Восстановление сейчас является частью результата, а не наградой после него.", [["Ориентир", "Планировать паузы заранее"], ["Транзит", "Марс секстиль Луна"]]],
  "history-project": ["rocket", "Новый проект", "Ответ от 2 июня", "Период подходит для исследования и первого прототипа. Не обещайте себе большой запуск: сделайте маленькую версию, которую можно проверить.", [["Ориентир", "Тест до конца недели"], ["Транзит", "Меркурий тригон Юпитер"]]],
  birth: ["calendar-days", "Данные рождения", "Основа расчёта", "Эти данные используются для точного положения планет и домов. В реальном приложении изменение данных запустит новый расчёт карты.", [["Дата", "11 июня 1996"], ["Время", "08:40"], ["Место", "Москва, Россия"], ["Часовой пояс", "UTC+4 на дату рождения"]]],
  referral: ["users", "Пригласить друзей", "Дарите Астро+", "За каждого друга, который оформит подписку, вы получите 7 дополнительных дней Астро+. Ещё два приглашения откроют месяц бесплатно.", [["Приглашено", "1 из 3"], ["Ваша награда", "7 дней Астро+"], ["Ссылка", "t.me/astro_demo_bot?start=ref_maria"]]],
  about: ["info", "Об Астро", "Магия в современной упаковке", "Астро — развлекательно-рефлексивный продукт. Интерпретации помогают посмотреть на привычные ситуации с нового ракурса, но не заменяют профессиональные медицинские, юридические или финансовые рекомендации.", [["Версия", "Прототип 0.2"], ["Расчёт карты", "Swiss Ephemeris"], ["Интерпретация", "Персональный AI-разбор"]]],
  "edit-profile": ["user-round", "Профиль", "Данные Telegram", "В реальном Mini App имя и аватар загружаются из Telegram. Здесь показан демонстрационный пользователь.", [["Имя", "Мария К."], ["Username", "@maria_k"], ["Город", "Москва"]]],
  terms: ["file-text", "Условия использования", "Безопасная рамка", "Астро предоставляет персонализированные развлекательно-рефлексивные материалы. Интерпретации носят вероятностный характер, могут не совпадать с вашим опытом и не должны быть единственным основанием для важных решений.", [["Не является", "диагнозом, лечением или консультацией"], ["Не гарантирует", "события, доход, отношения или результат"], ["Возраст", "сервис предназначен для пользователей 18+"]]],
  privacy: ["shield-check", "Конфиденциальность", "Минимум необходимых данных", "Для расчёта карты нужны дата, время и место рождения. Они относятся к персональным данным и должны храниться с согласия пользователя, удаляться по запросу и не передаваться Claude AI в идентифицирующем виде.", [["Claude получает", "обезличенный JSON карты"], ["Не отправляем", "Telegram ID, username и точный адрес"], ["Контроль", "экспорт и удаление данных пользователем"]]],
  "ai-policy": ["bot", "Как используется Claude AI", "AI только интерпретирует", "Claude получает уже рассчитанную структуру карты и пишет понятный текст по строгой методологии. Он не рассчитывает положения планет, не ставит диагнозы и не выдаёт финансовых, медицинских или юридических рекомендаций.", [["Расчёт", "Swiss Ephemeris"], ["Интерпретация", "Claude API через защищённый backend"], ["Защита", "фильтры тем и мягкий вероятностный язык"]]]
};

function icons() { if (window.lucide) window.lucide.createIcons({ attrs: { "stroke-width": 1.8 } }); }
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

function renderNatalChart() {
  const svg = $("#natal-chart"); if (!svg) return;
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
  houses.forEach((angle, index) => {
    line(polar(180,180,73,angle), polar(180,180,139,angle), index === 0 || index === 6 ? "axis-line" : "house-line");
    const label = polar(180,180,91,angle + 12); add("text",{x:label.x,y:label.y,class:"house-number"},String(index+1));
  });
  [["ASC",272],["DSC",92],["MC",2],["IC",182]].forEach(([label, angle]) => {
    const p = polar(180,180,145,angle); add("text",{x:p.x,y:p.y,class:"axis-label"},label);
  });
  [[0,6,"aspect-trine"],[0,4,"aspect-square"],[1,5,"aspect-trine"],[2,7,"aspect-sextile"],[3,8,"aspect-square"],[4,9,"aspect-trine"],[5,7,"aspect-sextile"],[1,8,"aspect-square"]].forEach(([a,b,cls]) => line(polar(180,180,68,planets[a].angle),polar(180,180,68,planets[b].angle),cls));
  planets.forEach(planet => {
    const p = polar(180,180,119,planet.angle);
    add("circle",{cx:p.x,cy:p.y,r:9,class:`planet-node${planet.accent?" accent":""}`});
    add("text",{x:p.x,y:p.y+.5,class:"planet-symbol"},planet.symbol);
    const d = polar(180,180,133,planet.angle); add("text",{x:d.x,y:d.y,class:"planet-degree"},planet.degree);
  });
  add("circle",{cx:180,cy:180,r:38,class:"chart-center"});
  add("text",{x:180,y:177,class:"chart-center-title"},"Москва");
  add("text",{x:180,y:188,class:"chart-center-sub"},"11.06.1996 · 08:40");
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
    onboarding.classList.add("hidden"); setTimeout(() => onboarding.remove(), 380); haptic("medium");
  });
}

$$("[data-go]").forEach(button => button.addEventListener("click", () => goTo(button.dataset.go)));
$$("[data-detail]").forEach(button => button.addEventListener("click", () => showDetail(button.dataset.detail)));
$$("[data-paywall]").forEach(button => button.addEventListener("click", () => { paywallTitle.textContent = `Откройте: ${button.dataset.paywall}`; openSheet(paywall); }));
$$(".sheet-close").forEach(button => button.addEventListener("click", () => closeSheet(button.closest(".sheet-backdrop"))));
$$(".sheet-backdrop").forEach(backdrop => backdrop.addEventListener("click", e => { if (e.target === backdrop) closeSheet(backdrop); }));

$$(".accordion-head:not(.locked)").forEach(button => button.addEventListener("click", () => {
  const body = button.nextElementSibling; const open = body.classList.toggle("open");
  button.classList.toggle("open", open); $("span", button).textContent = open ? "−" : "+"; haptic("soft");
}));

const question = $("#question");
question.addEventListener("input", () => $("#char-count").textContent = `${question.value.length} / 220`);
$$("[data-prompt]").forEach(button => button.addEventListener("click", () => { question.value = button.dataset.prompt; question.dispatchEvent(new Event("input")); question.focus(); }));
$("#ask-button").addEventListener("click", () => {
  if (!question.value.trim()) { question.focus(); showToast("Сначала напишите вопрос"); return; }
  $("#answer-card").classList.add("show"); question.value = ""; question.dispatchEvent(new Event("input")); haptic("medium"); showToast("Ответ готов и сохранён в истории"); setTimeout(() => $("#answer-card").scrollIntoView({ behavior: "smooth", block: "center" }), 180);
});

$(".toggle-row").addEventListener("click", () => { $(".toggle").classList.toggle("on"); showToast($(".toggle").classList.contains("on") ? "Утренний прогноз включён" : "Утренний прогноз выключен"); });
$(".subscribe").addEventListener("click", () => { closeSheet(paywall); haptic("medium"); showToast("Бесплатный режим продолжает работать"); });
$$("[data-action]").forEach(button => button.addEventListener("click", () => {
  const messages = { notifications: "Новых прогнозов пока нет", streak: "7 дней подряд — мягкий ритм уже сложился", daypart: "Периоды дня рассчитаны по вашим транзитам", share: "Карточка готова к отправке в Telegram", "save-answer": "Ответ сохранён в избранное" };
  showToast(messages[button.dataset.action] || "Готово"); haptic();
}));

if (tg) {
  tg.ready(); tg.expand(); tg.setHeaderColor("#ffffff"); tg.setBackgroundColor("#ffffff");
  const user = tg.initDataUnsafe?.user;
  if (user?.first_name) $$(".profile-card strong").forEach(el => el.textContent = user.first_name);
}
icons();
renderNatalChart();
setupOnboarding();
