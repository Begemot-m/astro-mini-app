window.ASTRO_CONFIG = {
  // URL функции auth-telegram: обменивает Telegram initData на короткоживущий токен.
  authApiUrl: "",
  // URL функции interpret (живой AI-ответ через backend). Claude/Groq вызываются только на backend.
  interpretationApiUrl: "",
  // URL функции create-payment для реального checkout ЮKassa.
  paymentApiUrl: "",
  // "demo" — статичные заглушки; "live" — реальный backend.
  environment: "demo"
};
