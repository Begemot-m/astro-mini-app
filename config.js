window.ASTRO_CONFIG = {
  // URL функции auth-telegram: обменивает Telegram initData на короткоживущий токен.
  authApiUrl: "",
  // URL функции interpret (живой AI-ответ через backend). Claude/Groq вызываются только на backend.
  interpretationApiUrl: "",
  // URL функции save-chart: сохраняет данные рождения и карту в Supabase.
  saveChartApiUrl: "",
  // URL функции chart-calc: реальный расчёт Swiss Ephemeris (иначе — базовая карта).
  chartCalcApiUrl: "",
  // URL функции create-payment для реального checkout ЮKassa.
  paymentApiUrl: "",
  // URL функции cancel-subscription: отключение автопродления.
  cancelApiUrl: "",
  // "demo" — статичные заглушки; "live" — реальный backend.
  environment: "demo"
};
