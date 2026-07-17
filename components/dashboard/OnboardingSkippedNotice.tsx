"use client"

import { useEffect } from "react"
import { useToast } from "./ToastContext"
import { ONBOARDING_SKIPPED_KEY } from "@/lib/onboarding-skip-flag"

// Renderizado (invisível) dentro do layout da dashboard. Se o candidato
// saltou o onboarding há pouco (sinal deixado em sessionStorage por
// app/onboarding/OnboardingClient.tsx), mostra um toast a lembrar de
// completar o perfil e consome o sinal, para não repetir em refreshes.
export default function OnboardingSkippedNotice() {
    const { showToast } = useToast()

    useEffect(() => {
        if (sessionStorage.getItem(ONBOARDING_SKIPPED_KEY) !== "1") return
        sessionStorage.removeItem(ONBOARDING_SKIPPED_KEY)
        showToast("Perfil por completar. Acaba quando quiseres para aumentar as tuas hipóteses.", "success")
    }, [showToast])

    return null
}
