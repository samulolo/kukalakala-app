"use server"

import { createClient } from "@/supabase/server"
import { getMyProfile } from "@/lib/supabase/profile"
import { getJobsByIds } from "@/lib/supabase/jobs"
import { getMyApplicationById } from "@/lib/supabase/applications"
import { getCompanyApplicantById } from "@/lib/supabase/company-applications"
import { analyzeApplicationFit, type AiFitAnalysis } from "@/lib/ai/analyze-fit"
import { extractCvText } from "@/lib/ai/extract-cv-text"

interface AiFitOutcome {
    result: AiFitAnalysis | null
    error: string | null
}

// Grava o resultado na própria candidatura (colunas ai_*), para nunca
// mais precisar de chamar o modelo outra vez para o mesmo par
// candidato/vaga. Passa por uma função Postgres security definer
// (save_application_ai_fit, ver supabase/migrations/20260719200000_ai_fit_analysis.sql)
// em vez de um update direto: é a única forma de o candidato poder
// gravar isto na sua própria candidatura sem lhe abrir uma policy de
// UPDATE completa (que também lhe daria acesso de escrita a "status").
async function persistAiFit(applicationId: string, analysis: AiFitAnalysis): Promise<void> {
    const supabase = await createClient()
    const { error } = await supabase.rpc("save_application_ai_fit", {
        p_application_id: applicationId,
        p_score: analysis.score,
        p_fit_level: analysis.fitLevel,
        p_summary: analysis.summary,
        p_strengths: analysis.strengths,
        p_weaknesses: analysis.weaknesses,
        p_improvements: analysis.improvements
    })

    if (error) {
        // Falhar a gravar o cache não deve impedir mostrar o resultado
        // já calculado — só significa que a próxima abertura do painel
        // vai chamar a IA outra vez.
        console.error("Erro ao guardar análise de IA: ", error)
    }
}

// Lado da empresa: análise de IA de uma candidatura às suas vagas.
export async function getCompanyApplicationAiFit(applicationId: string): Promise<AiFitOutcome> {
    const applicant = await getCompanyApplicantById(applicationId)
    if (!applicant) {
        return { result: null, error: "Não foi possível encontrar esta candidatura." }
    }

    if (applicant.cachedAiFit) {
        return { result: applicant.cachedAiFit, error: null }
    }

    const jobs = await getJobsByIds([applicant.jobId])
    const job = jobs[0]
    if (!job) {
        return { result: null, error: "Não foi possível encontrar os detalhes desta vaga." }
    }

    const cvText = applicant.candidateCvPath
        ? (await extractCvText(applicant.candidateCvPath)).text
        : null

    try {
        const analysis = await analyzeApplicationFit({
            jobTitle: job.title,
            jobCompany: job.company,
            jobCategory: job.category,
            jobDescription: job.description,
            jobRequirements: job.requirements,
            jobSkills: job.skills,
            candidateName: applicant.candidateName,
            candidateHeadline: applicant.candidateHeadline,
            candidateLevel: applicant.candidateLevel,
            candidateSkills: applicant.candidateSkills,
            candidateBio: applicant.candidateBio,
            cvText
        })

        await persistAiFit(applicationId, analysis)
        return { result: analysis, error: null }
    } catch (err) {
        console.error("Erro na análise de IA (empresa): ", err)
        return { result: null, error: "Não foi possível gerar a análise agora. Tenta novamente." }
    }
}

// Lado do candidato: feedback de IA sobre a própria candidatura.
// Mesma análise, mesma cache — só a apresentação muda (ver
// CandidateJobFitDrawer.tsx vs AiFitDrawer.tsx).
export async function getMyApplicationAiFit(applicationId: string): Promise<AiFitOutcome> {
    const application = await getMyApplicationById(applicationId)
    if (!application) {
        return { result: null, error: "Não foi possível encontrar esta candidatura." }
    }

    if (application.cachedAiFit) {
        return { result: application.cachedAiFit, error: null }
    }

    const [profile, jobs] = await Promise.all([
        getMyProfile(),
        getJobsByIds([application.jobId])
    ])

    const job = jobs[0]
    if (!job) {
        return { result: null, error: "Não foi possível encontrar os detalhes desta vaga." }
    }

    const cvText = profile?.cvPath
        ? (await extractCvText(profile.cvPath)).text
        : null

    try {
        const analysis = await analyzeApplicationFit({
            jobTitle: job.title,
            jobCompany: job.company,
            jobCategory: job.category,
            jobDescription: job.description,
            jobRequirements: job.requirements,
            jobSkills: job.skills,
            candidateName: profile?.fullName || "Candidato(a)",
            candidateHeadline: profile?.headline || "",
            candidateLevel: profile?.level || "",
            candidateSkills: profile?.skills ?? [],
            candidateBio: profile?.bio || "",
            cvText
        })

        await persistAiFit(applicationId, analysis)
        return { result: analysis, error: null }
    } catch (err) {
        console.error("Erro na análise de IA (candidato): ", err)
        return { result: null, error: "Não foi possível gerar o feedback agora. Tenta novamente." }
    }
}
