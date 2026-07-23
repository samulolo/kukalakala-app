// Nome do cookie que guarda a decisão de consentimento de cookies do
// visitante ("accepted" | "rejected") — partilhado entre o layout raiz
// (lê-o no servidor, para o banner nunca "piscar" a quem já decidiu) e
// o próprio banner (escreve-o no browser quando a pessoa escolhe).
export const COOKIE_CONSENT_NAME = "kk_cookie_consent"
export const COOKIE_CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 365
