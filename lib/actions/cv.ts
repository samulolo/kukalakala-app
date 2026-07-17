"use server"

// Partilhado entre o painel do candidato (upload/remoção/pré-visualização
// do próprio CV) e o painel da empresa (só pré-visualização/download do
// CV de quem se candidatou) — a RLS em storage.objects garante que cada
// um só consegue mesmo aceder ao que lhe é permitido.

import { revalidatePath } from "next/cache"
import {
    getCvSignedUrl as getCvSignedUrlData,
    removeCv as removeCvData,
    saveCvMetadata as saveCvMetadataData
} from "@/lib/supabase/cv"

export async function saveCvMetadata(filename: string, path: string) {
    const result = await saveCvMetadataData(filename, path)
    if (!result.error) {
        revalidatePath("/dashboard/perfil")
        revalidatePath("/dashboard")
    }
    return result
}

export async function removeCv(path: string) {
    const result = await removeCvData(path)
    if (!result.error) {
        revalidatePath("/dashboard/perfil")
        revalidatePath("/dashboard")
    }
    return result
}

export async function getCvSignedUrl(path: string) {
    return getCvSignedUrlData(path)
}
