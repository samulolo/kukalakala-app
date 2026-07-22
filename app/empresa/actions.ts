"use server"

import { revalidatePath } from "next/cache"
import { dismissOnboardingChecklist as dismissOnboardingChecklistData } from "@/lib/supabase/company"

export async function dismissOnboardingChecklist() {
    const result = await dismissOnboardingChecklistData()
    if (!result.error) {
        revalidatePath("/empresa")
    }
    return result
}
