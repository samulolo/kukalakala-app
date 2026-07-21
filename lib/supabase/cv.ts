import { createClient, getVerifiedUser } from "@/supabase/server"

export const CV_BUCKET = "cvs"

// Grava, no perfil do candidato autenticado, o nome original e o
// caminho no Storage do CV que acabou de ser carregado a partir do
// browser (o upload em si já aconteceu antes de chamar isto).
//
// Upsert (não update): o candidato pode carregar o CV logo no passo
// 3 do onboarding, antes de a linha em "profiles" existir (só é
// criada quando o onboarding termina) — um update simples não
// falharia, mas também não faria nada, silenciosamente.
export async function saveCvMetadata(filename: string, path: string): Promise<{ error: string | null }> {
    const supabase = await createClient()
    const { data: { user } } = await getVerifiedUser()
    if (!user) return { error: "Não autenticado" }

    const { error } = await supabase
        .from("profiles")
        .upsert({ id: user.id, cv_filename: filename, cv_path: path })

    if (error) {
        console.error("Erro ao guardar metadados do CV: ", error)
        return { error: error.message }
    }
    return { error: null }
}

// Remove o ficheiro do Storage e limpa os metadados no perfil.
export async function removeCv(path: string): Promise<{ error: string | null }> {
    const supabase = await createClient()
    const { data: { user } } = await getVerifiedUser()
    if (!user) return { error: "Não autenticado" }

    const { error: storageError } = await supabase.storage.from(CV_BUCKET).remove([path])
    if (storageError) {
        console.error("Erro ao remover ficheiro do CV: ", storageError)
        return { error: storageError.message }
    }

    const { error } = await supabase
        .from("profiles")
        .update({ cv_filename: null, cv_path: null })
        .eq("id", user.id)

    if (error) {
        console.error("Erro ao limpar metadados do CV: ", error)
        return { error: error.message }
    }
    return { error: null }
}

// Link temporário (5 min) para ver/descarregar um CV — o bucket é
// privado, por isso não existe URL pública. Funciona tanto para o
// próprio candidato como para uma empresa a quem se candidatou (a
// policy de select em storage.objects garante isso).
export async function getCvSignedUrl(path: string): Promise<{ url: string | null; error: string | null }> {
    const supabase = await createClient()

    const { data, error } = await supabase.storage.from(CV_BUCKET).createSignedUrl(path, 60 * 5)

    if (error || !data) {
        // O Supabase Storage devolve sempre "Object not found" tanto para
        // um ficheiro que realmente já não existe como para um acesso
        // negado pela RLS — não há forma de distinguir os dois casos a
        // partir daqui. Traduzimos para uma mensagem que faz sentido em
        // qualquer um deles, e mantemos o erro em bruto só nos logs do
        // servidor (mais fácil de depurar do que a string genérica).
        console.error("Erro ao gerar link do CV (path: ", path, "): ", error)
        const isNotFound = error?.message?.toLowerCase().includes("not found")
        return {
            url: null,
            error: isNotFound
                ? "Não foi possível encontrar este CV. Pode ter sido removido — pede ao candidato para o carregar de novo."
                : (error?.message ?? "Não foi possível gerar o link")
        }
    }

    return { url: data.signedUrl, error: null }
}
