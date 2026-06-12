# Астро — интерактивный прототип Telegram Mini App

Автономный frontend-прототип с адаптацией под Telegram WebApp SDK.

## Запуск

Откройте `index.html` напрямую или опубликуйте содержимое папки через GitHub Pages.

Для GitHub Pages достаточно создать репозиторий, положить содержимое этой папки в его корень и отправить в ветку `main`. Workflow `.github/workflows/pages.yml` автоматически опубликует приложение.

Для подключения как настоящего Telegram Mini App укажите полученный HTTPS URL в BotFather:

1. `/mybots`
2. Выберите бота
3. `Bot Settings` → `Menu Button`
4. Укажите URL GitHub Pages

## Реализовано

- четыре основных раздела приложения;
- подробные карточки сфер дня и натальной карты;
- раскрывающийся портрет;
- сценарий запроса Вселенной;
- пейволл и демонстрация Telegram Stars;
- Telegram WebApp SDK, haptic feedback и safe-area;
- адаптация под мобильный viewport.
- приветственный onboarding с безопасными формулировками и согласием;
- подробная натальная карта с домами, планетами и аспектами;
- прозрачное разделение расчёта Swiss Ephemeris и интерпретации Claude AI.

Архитектурные рекомендации по Claude AI, оплате и юридической рамке описаны в `ARCHITECTURE.md`.

## Подключение production backend

1. Создайте Supabase-проект и примените `supabase/migrations/001_initial.sql`.
2. Установите секреты из `.env.example` через Supabase Secrets.
3. Задеплойте функции `chart-calc`, `interpret`, `create-payment`, `yookassa-webhook`, `cancel-subscription`, `renew-subscriptions`.
4. Укажите URL функции `create-payment` в `config.js`.
5. Настройте webhook ЮKassa на URL функции `yookassa-webhook`.
6. Подключите Swiss Ephemeris микросервис через `CHART_CALC_URL`.
7. Настройте ежедневный cron для `renew-subscriptions` с секретом `CRON_SECRET`.

Пока `chart-calc` не подключён, интерфейс честно маркирует положения планет как демонстрационные.
