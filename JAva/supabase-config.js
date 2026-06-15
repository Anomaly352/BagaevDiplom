const DIRECT_SUPABASE_URL =
  "https://jtvwfccqvcxbbrtrntrd.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_fCoWkgsdNoCPoAy6t6T6tg_nxumekKa";

const isLocalDevelopment =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

const isVercelProduction =
  window.location.hostname.endsWith(".vercel.app") ||
  window.location.hostname === "bagaev-diplom.vercel.app";

window.SAKURA_SUPABASE = {
  url: isVercelProduction
    ? `${window.location.origin}/supabase`
    : DIRECT_SUPABASE_URL,

  anonKey: SUPABASE_PUBLISHABLE_KEY,
  timeoutMs: 12000
};

window.SAKURA_DADATA = {
  endpoint: "/api/dadata"
};
