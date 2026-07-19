import { createClient } from "@/supabase/server"

const MAX_TEXT_CHARS = 20000

function getExtension(path: string): string {
    const parts = path.split(".")
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ""
}

interface ExtractResult {
    text: string | null
    error: string | null
}

// Lê o ficheiro do CV diretamente do Storage privado (bucket "cvs") e
// extrai o texto para dar à análise de IA. PDF e DOCX são suportados;
// para .doc (formato binário legado, sem biblioteca fiável em Node
// para extração de texto sem depender de binários externos) devolvemos
// null em vez de bloquear a funcionalidade toda — a análise cai então
// para os dados estruturados do perfil (competências, nível, bio).
export async function extractCvText(path: string): Promise<ExtractResult> {
    const extension = getExtension(path)

    if (extension !== "pdf" && extension !== "docx") {
        return {
            text: null,
            error: extension === "doc"
                ? "Formato .doc não é suportado para leitura automática do conteúdo"
                : "Formato de ficheiro desconhecido"
        }
    }

    try {
        const supabase = await createClient()
        const { data, error } = await supabase.storage.from("cvs").download(path)
        if (error || !data) {
            console.error("Erro ao descarregar CV para análise de IA: ", error)
            return { text: null, error: error?.message ?? "Não foi possível descarregar o CV" }
        }

        const buffer = Buffer.from(await data.arrayBuffer())

        if (extension === "pdf") {
            const { PDFParse } = await import("pdf-parse")
            const parser = new PDFParse({ data: buffer })
            try {
                const result = await parser.getText()
                return { text: result.text.slice(0, MAX_TEXT_CHARS), error: null }
            } finally {
                await parser.destroy()
            }
        }

        const mammoth = await import("mammoth")
        const result = await mammoth.extractRawText({ buffer })
        return { text: result.value.slice(0, MAX_TEXT_CHARS), error: null }
    } catch (err) {
        console.error("Erro ao extrair texto do CV: ", err)
        return { text: null, error: "Não foi possível ler o conteúdo do CV" }
    }
}
