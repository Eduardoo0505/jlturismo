/**
 * URL base do BFF. Em produção, defina VITE_API_URL no build (ex.: painel do host).
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:3000";
