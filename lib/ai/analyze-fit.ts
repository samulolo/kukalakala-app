import OpenAI from "openai"

// Módulo real de análise de IA — substitui o antigo lib/ai-fit-mock.ts.
// Uma única chamada ao modelo cobre as duas perspetivas usadas na app
// (o painel "Análise IA" da empresa e o painel "Feedback de IA" do
// candidato): ambos mostram o mesmo score/enquadramento, só a
// apresentação difere (a empresa vê "pontos de atenção", o candidato
// vê os mesmos pontos como "pontos fracos" + sugestões de melhoria).

export type AiFitLevel = "Alto" | "Médio" | "Baixo"

export interface AiFitAnalysis {
    score: number
    fitLevel: AiFitLevel
    summary: string
    strengths: string[]
    weaknesses: string[]
    improvements: string[]
}

export interface AnalyzeFitInput {
    jobTitle: string
    jobCompany: string
    jobCategory: string
    jobDescription: string
    jobRequirements: string[]
    candidateName: string
    candidateHeadline: string
    candidateLevel: string
    candidateSkills: string[]
    candidateBio: string
    // Texto já extraído do CV (PDF/DOCX) — null se não há CV carregado
    // ou não foi possível ler o ficheiro (ver lib/ai/extract-cv-text.ts).
    cvText: string | null
}

let client: OpenAI | null = null

function getClient(): OpenAI {
    if (!client) {
        const apiKey = process.env.OPENAI_API_KEY
        if (!apiKey) {
            throw new Error("OPENAI_API_KEY não está configurada")
        }
        client = new OpenAI({ apiKey })
    }
    return client
}

// Limite generoso mas seguro para não disparar o custo/latência da
// chamada com CVs muito longos — a maioria cabe muito abaixo disto.
const MAX_CV_CHARS = 8000

const responseSchema = {
    name: "ai_fit_analysis",
    strict: true,
    schema: {
        type: "object",
        properties: {
            score: { type: "integer", minimum: 0, maximum: 100 },
            fitLevel: { type: "string", enum: ["Alto", "Médio", "Baixo"] },
            summary: { type: "string" },
            strengths: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 5 },
            weaknesses: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 5 },
            improvements: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 4 }
        },
        required: ["score", "fitLevel", "summary", "strengths", "weaknesses", "improvements"],
        additionalProperties: false
    }
} as const

function buildPrompt(input: AnalyzeFitInput): string {
    const cvSection = input.cvText
        ? `Currículo do candidato (texto extraído do ficheiro):\n"""\n${input.cvText.slice(0, MAX_CV_CHARS)}\n"""`
        : "O candidato não tem um CV carregado, ou não foi possível ler o conteúdo do ficheiro — usa apenas os dados de perfil abaixo."

    return `Analisa o quão bem este candidato se enquadra nesta vaga de emprego. Responde sempre em português, de forma direta, específica e honesta — evita generalidades vagas que sirvam para qualquer candidatura.

VAGA
Título: ${input.jobTitle}
Empresa: ${input.jobCompany}
Categoria: ${input.jobCategory}
Descrição: ${input.jobDescription}
Requisitos: ${input.jobRequirements.join("; ") || "Não especificados"}

PERFIL DO CANDIDATO
Nome: ${input.candidateName}
Cargo/objetivo pretendido: ${input.candidateHeadline || "Não indicado"}
Nível de experiência: ${input.candidateLevel || "Não indicado"}
Competências indicadas no perfil: ${input.candidateSkills.join(", ") || "Nenhuma"}
Biografia: ${input.candidateBio || "Não preenchida"}

${cvSection}

Devolve:
- score: 0 a 100, o quão bem o candidato se enquadra nesta vaga específica
- fitLevel: "Alto" (score >= 75), "Médio" (score 50-74) ou "Baixo" (score < 50) — tem de corresponder ao score
- summary: 1-2 frases a resumir o enquadramento
- strengths: 2 a 5 pontos fortes concretos, específicos ao par candidato/vaga (não genéricos)
- weaknesses: 2 a 5 pontos fracos ou lacunas concretas face aos requisitos desta vaga
- improvements: 2 a 4 sugestões concretas e acionáveis para o candidato melhorar a candidatura ou o perfil`
}

export async function analyzeApplicationFit(input: AnalyzeFitInput): Promise<AiFitAnalysis> {
    const openai = getClient()
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini"

    const completion = await openai.chat.completions.create({
        model,
        temperature: 0.4,
        response_format: {
            type: "json_schema",
            json_schema: responseSchema
        },
        messages: [
            {
                role: "system",
                content: "És um recrutador técnico experiente que avalia, com honestidade e especificidade, o enquadramento entre candidatos e vagas de emprego."
            },
            { role: "user", content: buildPrompt(input) }
        ]
    })

    const raw = completion.choices[0]?.message?.content
    if (!raw) {
        throw new Error("Resposta vazia do modelo de IA")
    }

    const parsed = JSON.parse(raw) as AiFitAnalysis

    // Defesa extra: garante que fitLevel bate certo com o score mesmo que
    // o modelo se desvie ligeiramente das instruções.
    const fitLevel: AiFitLevel = parsed.score >= 75 ? "Alto" : parsed.score >= 50 ? "Médio" : "Baixo"

    return { ...parsed, fitLevel }
}
