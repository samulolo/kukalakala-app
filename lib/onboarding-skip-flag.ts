// Chave partilhada entre app/onboarding/OnboardingClient.tsx (escreve,
// ao saltar o onboarding) e components/dashboard/OnboardingSkippedNotice.tsx
// (lê, uma única vez, para mostrar o toast de "completa o teu perfil").
// sessionStorage em vez de query string: sobrevive a um refresh da
// dashboard mas não persiste entre sessões/abas diferentes.
export const ONBOARDING_SKIPPED_KEY = "kukalakala:onboarding-skipped"
