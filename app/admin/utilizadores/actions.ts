"use server"

import {
    getAdminCandidateDetail,
    getAdminCompanyDetail,
    type AdminCandidateDetail,
    type AdminCompanyDetail
} from "@/lib/supabase/admin"

export async function fetchAdminCandidateDetail(id: string): Promise<AdminCandidateDetail | null> {
    return getAdminCandidateDetail(id)
}

export async function fetchAdminCompanyDetail(id: string): Promise<AdminCompanyDetail | null> {
    return getAdminCompanyDetail(id)
}
