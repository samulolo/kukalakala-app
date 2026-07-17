"use server"

import { revalidatePath } from "next/cache"
import { upsertMyProfile, type ProfileInput } from "@/lib/supabase/profile"

export async function saveProfile(input: ProfileInput) {
    const { error } = await upsertMyProfile(input)

    if (!error) {
        revalidatePath("/dashboard/perfil")
        revalidatePath("/dashboard")
    }

    return { error }
}
