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
