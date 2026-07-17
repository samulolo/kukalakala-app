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
