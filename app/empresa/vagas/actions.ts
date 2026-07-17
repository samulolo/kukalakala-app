"use server"

import { revalidatePath } from "next/cache"
import {
    createCompanyJob,
    updateCompanyJob,
    deleteCompanyJob,
    toggleCompanyJobActive,
    type CompanyJobInput
} from "@/lib/supabase/company-jobs"

export async function createJob(input: CompanyJobInput) {
    const result = await createCompanyJob(input)
    if (!result.error) {
        revalidatePath("/empresa/vagas")
        revalidatePath("/empresa")
    }
    return result
}

export async function updateJob(jobId: string, input: CompanyJobInput) {
    const result = await updateCompanyJob(jobId, input)
    if (!result.error) {
        revalidatePath("/empresa/vagas")
        revalidatePath("/empresa")
    }
    return result
}

export async function deleteJob(jobId: string) {
    const result = await deleteCompanyJob(jobId)
    if (!result.error) {
        revalidatePath("/empresa/vagas")
        revalidatePath("/empresa")
    }
    return result
}

export async function toggleJobActive(jobId: string, isActive: boolean) {
    const result = await toggleCompanyJobActive(jobId, isActive)
    if (!result.error) {
        revalidatePath("/empresa/vagas")
        revalidatePath("/empresa")
    }
    return result
}
