window.ASTRO_CONFIG = {
  // Add the deployed Supabase Edge Function URL to enable real YooKassa checkout.
  paymentApiUrl: "",
  // Claude API is called only by the backend. Never put ANTHROPIC_API_KEY here.
  interpretationApiUrl: "",
  // The authenticated app stores its short-lived backend JWT as astro_access_token.
  environment: "demo"
};
