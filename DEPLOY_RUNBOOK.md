# Runbook деплоя новой версии

Выполняется с ТВОЕЙ машины (нужен интернет и твои аккаунты).
Версия уже закоммичена локально (`git log` покажет коммит «feat: безопасность, живой AI…»).

---

## Часть 1. Опубликовать фронт (GitHub Pages)

Папка уже git-репозиторий с готовым коммитом. Подключаем твой существующий репозиторий
и аккуратно сливаем, сохраняя его историю (наша версия побеждает в конфликтах):

```powershell
cd "C:\Users\Матвей\Desktop\astro-mini-app-vscode-package"
git remote add origin https://github.com/Begemot-m/astro-mini-app.git
git fetch origin
git merge --allow-unrelated-histories -X ours origin/main -m "merge: новая версия прототипа"
git push origin main
```

> Если на пуше попросит логин — используй GitHub username + Personal Access Token
> (Settings → Developer settings → Tokens). Пароль от аккаунта GitHub больше не принимает.

После пуша workflow `pages.yml` сам пересоберёт сайт. Через 1–2 минуты обновится
`https://begemot-m.github.io/astro-mini-app/`.

> ⚠️ Пока backend (Часть 2) не подключён и `config.js` пуст — приложение работает
> в demo-режиме (без живого AI). Это безопасно: ничего не сломается, просто заглушки.

---

## Часть 2. Поднять backend (Supabase + Groq)

Полная пошаговая инструкция — в `GROQ_TEST_GUIDE.md`. Кратко:

1. Создать проект Supabase, применить миграции `001 → 005` в SQL Editor.
2. Установить Supabase CLI, `supabase login`, `supabase link --project-ref <ref>`.
3. Задать секреты (Edge Functions → Secrets) по `.env.example`:
   `AI_PROVIDER=groq`, `GROQ_API_KEY`, `TELEGRAM_BOT_TOKEN`, `SUPABASE_JWT_SECRET`,
   `APP_ORIGIN`, лимиты, и (для оплаты позже) ключи ЮKassa.
4. Задеплоить функции:
   ```
   supabase functions deploy auth-telegram
   supabase functions deploy interpret
   supabase functions deploy create-payment
   supabase functions deploy yookassa-webhook
   supabase functions deploy cancel-subscription
   supabase functions deploy renew-subscriptions
   ```

---

## Часть 3. Связать фронт с backend

В `config.js` вписать URL задеплоенных функций и переключить режим:

```js
window.ASTRO_CONFIG = {
  authApiUrl: "https://<ref>.functions.supabase.co/auth-telegram",
  interpretationApiUrl: "https://<ref>.functions.supabase.co/interpret",
  paymentApiUrl: "https://<ref>.functions.supabase.co/create-payment",
  environment: "live"
};
```

Затем закоммитить и запушить только этот файл:

```powershell
git add config.js
git commit -m "config: подключить production backend"
git push origin main
```

---

## Часть 4. Telegram и проверка

1. @BotFather → бот → Bot Settings → Menu Button → URL твоего GitHub Pages.
2. Открыть бота, нажать Menu Button — приложение должно авторизоваться молча.
3. Раздел вопросов → задать вопрос → должен прийти живой ответ Groq.
4. После 3 бесплатных вопросов — откроется пейвол. Это правильно.

## Порядок безопасности

- Сначала всё на staging-проекте Supabase, потом production (как в `LAUNCH_GUIDE.md`).
- Реальные платежи ЮKassa включать в последнюю очередь, после теста webhook.
- `.env` с ключами в git не попадёт — он в `.gitignore`.
