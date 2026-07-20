"use server"

import { revalidatePath } from "next/cache"
import { submitCompanyVerification } from "@/lib/supabase/company"
import {
    getVerificationDocumentUrl as getVerificationDocumentUrlData,
    reviewCompanyVerification as reviewCompanyVerificationData
} from "@/lib/supabase/admin"

export async function submitVerification(documentPath: string) {
    const result = await submitCompanyVerification(documentPath)
    if (!result.error) {
        revalidatePath("/empresa/perfil")
    }
    return result
}

export async function getVerificationDocumentUrl(path: string) {
    return getVerificationDocumentUrlData(path)
}

export async function reviewVerification(companyId: string, approve: boolean, rejectionReason = "") {
    const result = await reviewCompanyVerificationData(companyId, approve, rejectionReason)
    if (!result.error) {
        revalidatePath("/admin")
    }
    return result
}
