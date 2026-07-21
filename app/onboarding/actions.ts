"use server"

import { upsertMyProfile, type ProfileInput } from "@/lib/supabase/profile"

// Devolve { error } em vez de redirecionar aqui — o redirect fica a
// cargo do cliente (que chamou esta ação diretamente, sem ser via
// <form action>), para evitar depender de como o Next.js propaga o
// sinal de redirect() de dentro de uma Server Action chamada assim.
export async function completeOnboarding(input: ProfileInput) {
    const { error } = await upsertMyProfile(input)
    return { error }
}

// Chamada quando o candidato clica em "Preencher mais tarde". Grava uma
// linha mínima em "profiles" (só com o nome que já temos, o resto fica
// por preencher) para o onboarding nunca mais reaparecer nos próximos
// logins — a existência da linha é o que marca "já é candidato" (ver
// app/onboarding/layout.tsx). O checklist de perfil incompleto no
// dashboard fica a lembrar o resto.
export async function skipOnboarding(fullName: string) {
    const { error } = await upsertMyProfile({
        fullName,
        headline: "",
        location: "",
        phone: "",
        bio: "",
        level: "",
        skills: [],
        searchable: false
    })
    return { error }
}
