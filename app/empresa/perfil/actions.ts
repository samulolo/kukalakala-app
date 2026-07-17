"use server"

import { revalidatePath } from "next/cache"
import { upsertMyCompany, type CompanyInput } from "@/lib/supabase/company"

export async function saveCompany(input: CompanyInput) {
    const { error } = await upsertMyCompany(input)

    if (!error) {
        revalidatePath("/empresa/perfil")
        revalidatePath("/empresa")
    }

    return { error }
}
