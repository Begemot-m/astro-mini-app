# Тестовый запуск в Telegram с живым AI (Groq)

Цель: увидеть прототип в Telegram, где «Спросить Вселенную» отвечает реальной нейросетью.
Платежи на этом этапе НЕ включаем.

Порядок: Groq → Supabase → секреты → деплой функций → BotFather. Не пропускайте шаги.

---

## Шаг 1. Ключ Groq (бесплатно)

1. Зайдите на https://console.groq.com (регистрация по Google/email, карта не нужна).
   Если страница не открывается из РФ — включите VPN только для регистрации; сам бэкенд работает в облаке и в РФ-доступе не нуждается.
2. API Keys → Create API Key. Скопируйте ключ (показывается один раз).
3. Модель по умолчанию — `llama-3.3-70b-versatile`. Менять не нужно.

## Шаг 2. Supabase-проект

1. Создайте проект на https://supabase.com (бесплатный тариф годится для теста).
2. SQL Editor → выполните по очереди миграции из `supabase/migrations/`:
   `001 → 002 → 003 → 004 → 005 → 006`. Каждую отдельно, сверху вниз.
3. Settings → API скопируйте: `Project URL`, `anon public`, `service_role`, и `JWT Secret`.

## Шаг 3. Бот в Telegram

1. В Telegram откройте @BotFather → `/newbot`, задайте имя. Получите **токен бота**.
   (Меню-кнопку настроите в шаге 6, когда будет URL.)

## Шаг 4. Секреты Supabase

Project → Edge Functions → Secrets (или `supabase secrets set`). Заполните:

```
AI_PROVIDER=groq
GROQ_API_KEY=<ключ из шага 1>
GROQ_MODEL=llama-3.3-70b-versatile
FREE_QUESTIONS_PER_MONTH=3
PLUS_QUESTIONS_PER_MONTH=10
TELEGRAM_BOT_TOKEN=<токен из шага 3>
SUPABASE_JWT_SECRET=<JWT Secret из шага 2>
SUPABASE_URL=<Project URL>
SUPABASE_ANON_KEY=<anon public>
SUPABASE_SERVICE_ROLE_KEY=<service_role>
APP_ORIGIN=https://<ваш-логин>.github.io/astro-mini-app/
```

> SUPABASE_URL/ANON/SERVICE_ROLE могут подставляться платформой автоматически —
> если их нельзя задать вручную, пропустите эти три строки.

## Шаг 5. Деплой функций

Установите Supabase CLI (https://supabase.com/docs/guides/cli), затем:

```
supabase login
supabase link --project-ref <ref вашего проекта>
supabase functions deploy auth-telegram
supabase functions deploy interpret
```

(`create-payment`, `yookassa-webhook`, `cancel-subscription`, `renew-subscriptions`,
`chart-calc` для теста с AI деплоить НЕ обязательно — они про оплату/расчёт.)

После деплоя URL функций имеют вид
`https://<ref>.supabase.co/functions/v1/auth-telegram` и `.../interpret`.

## Шаг 6. Привязка фронта и публикация

1. В `config.js` впишите:
   ```js
   authApiUrl: "https://<ref>.supabase.co/functions/v1/auth-telegram",
   interpretationApiUrl: "https://<ref>.supabase.co/functions/v1/interpret",
   saveChartApiUrl: "https://<ref>.supabase.co/functions/v1/save-chart",
   environment: "live"
   ```
2. Запушьте проект в GitHub (ветка `main`) — GitHub Pages опубликует его автоматически
   (workflow уже есть в `.github/workflows/pages.yml`).
3. В @BotFather: `/mybots` → ваш бот → Bot Settings → Menu Button →
   укажите URL `https://<ваш-логин>.github.io/astro-mini-app/`.

## Шаг 7. Проверка

1. Откройте бота в Telegram, нажмите Menu Button — приложение запустится.
2. При старте фронт молча обменяет initData на токен (функция auth-telegram).
3. Перейдите в раздел вопросов, напишите вопрос → «Спросить Вселенную».
4. Должен прийти **реальный ответ Groq** (не демо). После 3 вопросов в месяц
   бесплатный лимит исчерпается и откроется пейвол — это корректное поведение.

---

## Если что-то не работает

- **Всегда демо-ответ / 401** — не задан `SUPABASE_JWT_SECRET`, либо `authApiUrl` пустой,
  либо токен бота в секрете не совпадает с ботом, через который открыли приложение.
- **«AI временно недоступен»** — проверьте `GROQ_API_KEY` и лимиты Groq в консоли.
- **Логи**: Supabase → Edge Functions → выбрать функцию → Logs. Там видно реальную причину.
- Тестируйте сначала на отдельном Supabase-проекте, как требует `LAUNCH_GUIDE.md`.

## Замечание про качество текста

Groq (Llama) на русском слабее, чем Claude/GigaChat — для теста механики это нормально.
Когда захотите лучше русский: смените `AI_PROVIDER` на `anthropic` (для прода) —
код переключится без изменений фронта. GigaChat-ветку нужно дописать (OAuth-токен).
```
