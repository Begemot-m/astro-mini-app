# chart-service — расчёт натальной карты (Swiss Ephemeris)

Отдельный Python-микросервис. Считает положения планет, дома (Плацидус) и аспекты
по данным рождения и возвращает обезличенную JSON-структуру карты.

Интерпретацию НЕ делает — это задача функции `interpret` (AI). Так требует
`ARCHITECTURE.md`: расчёт и интерпретация разделены.

## Контракт

`POST /` с заголовком `Authorization: Bearer <CHART_CALC_TOKEN>`:

```json
{ "date": "1996-06-11", "time": "08:40", "time_unknown": false, "place": "Москва, Россия" }
```

Ответ — `planets[]`, `aspects[]`, `ascendant`, `house_cusps`, `dominant_element`.
`GET /health` → `{ "ok": true }`.

Этот сервис вызывает Edge Function `chart-calc` (она прокидывает запрос и токен).

## Локальный запуск

```bash
cd chart-service
pip install -r requirements.txt
export CHART_CALC_TOKEN=dev-secret
uvicorn main:app --reload --port 8000
curl -X POST localhost:8000/ -H "Authorization: Bearer dev-secret" \
  -H "Content-Type: application/json" \
  -d '{"date":"1996-06-11","time":"08:40","place":"Москва"}'
```

## Деплой (Railway / Fly.io)

### Railway
1. New Project → Deploy from Repo (или загрузить папку `chart-service`).
2. Railway сам обнаружит `Dockerfile`.
3. Variables: `CHART_CALC_TOKEN=<секрет>`, `GEOCODER_UA=astro-mini-app/1.0`.
4. После деплоя получите публичный URL.

### Fly.io
1. `fly launch` в папке `chart-service` (использует `Dockerfile`).
2. `fly secrets set CHART_CALC_TOKEN=<секрет>`.
3. `fly deploy`.

## Связка с backend

В секретах Supabase задать:
```
CHART_CALC_URL=https://<ваш-сервис>/         # URL этого сервиса (с / на конце)
CHART_CALC_TOKEN=<тот же секрет>
```

Затем задеплоить/обновить Edge Function `chart-calc`. После этого фронт
(`config.js` → `chartCalcApiUrl`) получит реальную карту вместо демо.

## Точность и оговорки

- Эфемерида Moshier (без внешних файлов), точность ~0.1' — достаточно для интерпретаций.
- Геокодирование — Nominatim (OpenStreetMap), лимит ~1 запрос/сек. Для продакшена
  стоит кэшировать координаты городов или взять платный геокодер.
- Исторический часовой пояс берётся из IANA tz по координатам (zoneinfo) —
  корректно обрабатывает исторические сдвиги и переводы часов для большинства мест.
- Проверьте минимум 10 карт по независимому референсу перед снятием маркировки «demo»
  (см. `LAUNCH_GUIDE.md`, Шаг 3).
