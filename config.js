window.ASTRO_CONFIG = {
  // URL функции auth-telegram: обменивает Telegram initData на короткоживущий токен.
  authApiUrl: "https://abdlkghlchczwenobvkx.supabase.co/functions/v1/auth-telegram",
  // URL функции interpret (живой AI-ответ через backend). Claude/Groq вызываются только на backend.
  interpretationApiUrl: "https://abdlkghlchczwenobvkx.supabase.co/functions/v1/interpret",
  // URL функции save-chart: сохраняет данные рождения и карту в Supabase.
  saveChartApiUrl: "https://abdlkghlchczwenobvkx.supabase.co/functions/v1/save-chart",
  // URL функции daily-content: ежедневный контент главной (прогноз, сферы, неделя/месяц).
  dailyContentApiUrl: "https://abdlkghlchczwenobvkx.supabase.co/functions/v1/daily-content",
  // URL функции portrait: глубокий портрет по карте (кэшируется).
  portraitApiUrl: "https://abdlkghlchczwenobvkx.supabase.co/functions/v1/portrait",
  // URL функции chart-calc: реальный расчёт Swiss Ephemeris (иначе — базовая карта).
  chartCalcApiUrl: "",
  // URL функции create-payment для реального checkout ЮKassa.
  paymentApiUrl: "",
  // URL функции cancel-subscription: отключение автопродления.
  cancelApiUrl: "",
  // Username бота БЕЗ @ (например "my_astro_bot") — для корректных ссылок при шеринге.
  botUsername: "",
  // "demo" — статичные заглушки; "live" — реальный backend.
  environment: "live"
};
