import type { Job } from "@/lib/supabase/jobs"

// Mapeamento aproximado do texto livre de "tipo de vaga" (ex: "Full-time",
// "Meio período") para o enum employmentType do schema.org JobPosting.
// Quando não reconhecido, o campo é omitido em vez de arriscar um valor
// inválido nos dados estruturados.
function mapEmploymentType(type: string): string | undefined {
    const normalized = type.trim().toLowerCase()
    if (/full.?time|integral|tempo inteiro/.test(normalized)) return "FULL_TIME"
    if (/part.?time|meio per[ií]odo/.test(normalized)) return "PART_TIME"
    if (/contrato|contract/.test(normalized)) return "CONTRACTOR"
    if (/est[aá]gio|intern/.test(normalized)) return "INTERN"
    if (/freelance|freelancer/.test(normalized)) return "OTHER"
    if (/temp[oó]r[aá]rio|temporary/.test(normalized)) return "TEMPORARY"
    return undefined
}

// "location" é um texto livre tipo "Luanda, Angola" ou "Lisboa, Portugal"
// preenchido pela empresa — separamos por vírgula como melhor esforço
// para popular addressLocality/addressCountry.
function splitLocation(location: string): { locality: string; country?: string } {
    const parts = location.split(",").map((part) => part.trim()).filter(Boolean)
    if (parts.length === 0) return { locality: location }
    if (parts.length === 1) return { locality: parts[0] }
    return { locality: parts.slice(0, -1).join(", "), country: parts[parts.length - 1] }
}

// Dados estruturados schema.org/JobPosting — habilita rich results no
// Google Jobs para a página pública de detalhes da vaga.
// https://developers.google.com/search/docs/appearance/structured-data/job-posting
export function buildJobPostingJsonLd(job: Job, url: string) {
    const { locality, country } = splitLocation(job.location)
    const employmentType = mapEmploymentType(job.type)
    // schema.org/JobPosting.skills espera texto livre — junta as
    // competências obrigatórias/importantes (as desejáveis ficam de
    // fora, por serem "nice to have" e não o essencial da vaga).
    const skillsText = job.skills
        .filter((skill) => skill.level === "obrigatorio" || skill.level === "importante")
        .map((skill) => skill.name)
        .join(", ")

    return {
        "@context": "https://schema.org",
        "@type": "JobPosting",
        title: job.title,
        description: job.description,
        identifier: {
            "@type": "PropertyValue",
            name: "Kukalakala",
            value: job.id
        },
        datePosted: job.createdAt,
        employmentType,
        hiringOrganization: {
            "@type": "Organization",
            name: job.company
        },
        jobLocation: {
            "@type": "Place",
            address: {
                "@type": "PostalAddress",
                addressLocality: locality,
                ...(country ? { addressCountry: country } : {})
            }
        },
        ...(skillsText ? { skills: skillsText } : {}),
        directApply: true,
        url
    }
}
