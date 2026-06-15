const DIRECT_SUPABASE_URL =
  "https://jtvwfccqvcxbbrtrntrd.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_fCoWkgsdNoCPoAy6t6T6tg_nxumekKa";

const isLocalDevelopment =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

window.SAKURA_SUPABASE = {
  url: isLocalDevelopment
    ? DIRECT_SUPABASE_URL
    : `${window.location.origin}/supabase`,

  anonKey: SUPABASE_PUBLISHABLE_KEY
};

window.SAKURA_DADATA = {
  token: "ed6c39816360984b962c7515549a04d99c08b738"
};