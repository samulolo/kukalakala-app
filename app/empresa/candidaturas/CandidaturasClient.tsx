"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { MapPin, Briefcase, Eye, Sparkles } from "lucide-react"
import type { CompanyApplicant } from "@/lib/supabase/company-applications"
import type { ApplicationStatus } from "@/lib/supabase/applications"
import type { AiFitAnalysis } from "@/lib/ai/analyze-fit"
import type { SavedCandidate } from "@/lib/supabase/saved-candidates"
import { changeApplicationStatus } from "./actions"
import { getCompanyApplicationAiFit } from "@/lib/actions/ai-fit"
import CandidateDetailsDrawer from "./CandidateDetailsDrawer"
import AiFitDrawer from "./AiFitDrawer"

const statusOptions: ApplicationStatus[] = ["Em análise", "Entrevista", "Aprovado", "Rejeitado"]

interface CandidaturasClientProps {
    applications: CompanyApplicant[]
    // Candidatura a abrir automaticamente (vinda de um link de
    // notificação, ex. ?conversa=ID) — carregada à parte porque pode não
    // estar entre as candidaturas visíveis com os filtros atuais.
    openApplicant?: CompanyApplicant | null
    saved: SavedCandidate[]
}

export default function CandidaturasClient({ applications, openApplicant, saved }: CandidaturasClientProps) {
    const router = useRouter()
    const pathname = usePathname()
    const [jobFilter, setJobFilter] = useState("all")
    const [statusFilter, setStatusFilter] = useState<"all" | ApplicationStatus>("all")
    const [savingId, setSavingId] = useState<string | null>(null)
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [aiSelectedId, setAiSelectedId] = useState<string | null>(null)
    const [aiLoading, setAiLoading] = useState(false)
    const [aiError, setAiError] = useState<string | null>(null)
    const [aiResult, setAiResult] = useState<AiFitAnalysis | null>(null)

    // Ajusta o estado durante a renderização (em vez de um efeito) para
    // abrir a candidatura vinda da notificação assim que chega uma nova.
    //
    // Também repõe o guard a null assim que o parâmetro "?conversa="
    // desaparece da URL (depois de o limparmos no efeito abaixo). Sem
    // isto, uma notificação seguinte para a MESMA candidatura — o caso
    // normal numa conversa com várias mensagens — nunca voltaria a
    // abrir o painel, porque o id já teria ficado marcado como
    // "aplicado" e nunca mais haveria alteração para reagir.
    const [appliedOpenId, setAppliedOpenId] = useState<string | null>(null)
    if (openApplicant && openApplicant.id !== appliedOpenId) {
        setAppliedOpenId(openApplicant.id)
        setSelectedId(openApplicant.id)
    } else if (!openApplicant && appliedOpenId !== null) {
        setAppliedOpenId(null)
    }

    // Limpa o parâmetro "?conversa=" da URL depois de aplicado, para que
    // fique disponível para consumir de novo numa próxima notificação.
    useEffect(() => {
        if (appliedOpenId) {
            router.replace(pathname, { scroll: false })
        }
    }, [appliedOpenId, pathname, router])

    const jobs = useMemo(() => {
        const map = new Map<string, string>()
        applications.forEach((a) => map.set(a.jobId, a.jobTitle))
        return Array.from(map, ([id, title]) => ({ id, title }))
    }, [applications])

    const filtered = applications.filter((a) => {
        if (jobFilter !== "all" && a.jobId !== jobFilter) return false
        if (statusFilter !== "all" && a.status !== statusFilter) return false
        return true
    })

    const selectedApplicant =
        applications.find((a) => a.id === selectedId) ?? (openApplicant?.id === selectedId ? openApplicant : null)
    const aiSelectedApplicant = applications.find((a) => a.id === aiSelectedId) ?? null

    const savedNoteById = useMemo(() => new Map(saved.map((s) => [s.candidateId, s.note])), [saved])
    const selectedSavedNote = selectedApplicant ? savedNoteById.get(selectedApplicant.candidateId) ?? null : null

    const handleStatusChange = async (applicationId: string, status: ApplicationStatus) => {
        setSavingId(applicationId)
        await changeApplicationStatus(applicationId, status)
        setSavingId(null)
    }

    const handleOpenAiFit = async (applicationId: string) => {
        setAiSelectedId(applicationId)
        setAiLoading(true)
        setAiError(null)
        setAiResult(null)

        try {
            const { result, error } = await getCompanyApplicationAiFit(applicationId)
            if (error) {
                setAiError(error)
            } else {
                setAiResult(result)
            }
        } catch {
            setAiError("Não foi possível gerar a análise, tenta novamente.")
        } finally {
            setAiLoading(false)
        }
    }

    const selectClass =
        "px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-colors"

    return (
        <>
            <div className="flex flex-wrap items-center gap-3 mb-4">
                <select value={jobFilter} onChange={(e) => setJobFilter(e.target.value)} className={selectClass}>
                    <option value="all">Todas as vagas</option>
                    {jobs.map((job) => (
                        <option key={job.id} value={job.id}>{job.title}</option>
                    ))}
                </select>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as "all" | ApplicationStatus)}
                    className={selectClass}
                >
                    <option value="all">Todos os estados</option>
                    {statusOptions.map((status) => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>

                <span className="text-xs text-slate-400 font-light ml-auto">
                    {filtered.length} {filtered.length === 1 ? "candidatura" : "candidaturas"}
                </span>
            </div>

            <div className="p-2 sm:p-4 rounded-2xl border border-slate-200 bg-white shadow-sm">
                {filtered.length > 0 ? (
                    <ul className="divide-y divide-slate-100 px-2">
                        {filtered.map((application) => (
                            <li
                                key={application.id}
                                className="py-4 px-1 flex flex-col sm:flex-row sm:items-center gap-3"
                            >
                                <span className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-lg bg-blue-700 text-white text-sm font-semibold">
                                    {application.candidateName.charAt(0)}
                                </span>

                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-slate-900 truncate">{application.candidateName}</p>
                                    <p className="text-xs text-slate-500 font-light truncate">
                                        {application.candidateHeadline || "Sem cargo indicado"}
                                        {application.candidateLocation && (
                                            <span className="inline-flex items-center gap-1 ml-2">
                                                <MapPin className="w-3 h-3 inline" strokeWidth={1.5} />
                                                {application.candidateLocation}
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-xs text-slate-400 font-light mt-0.5 inline-flex items-center gap-1">
                                        <Briefcase className="w-3 h-3" strokeWidth={1.5} />
                                        {application.jobTitle} · {application.appliedAt}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setSelectedId(application.id)}
                                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-blue-700 hover:bg-blue-50 transition-colors flex-shrink-0"
                                >
                                    <Eye className="w-4 h-4" strokeWidth={1.75} />
                                    Ver detalhes
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleOpenAiFit(application.id)}
                                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors flex-shrink-0"
                                >
                                    <Sparkles className="w-4 h-4" strokeWidth={1.75} />
                                    Análise IA
                                </button>

                                <select
                                    value={application.status}
                                    onChange={(e) => handleStatusChange(application.id, e.target.value as ApplicationStatus)}
                                    disabled={savingId === application.id}
                                    className={`${selectClass} flex-shrink-0 disabled:opacity-50`}
                                >
                                    {statusOptions.map((status) => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-16">
                        <p className="text-slate-600 font-light text-sm">
                            Nenhuma candidatura encontrada
                        </p>
                    </div>
                )}
            </div>

            <CandidateDetailsDrawer
                applicant={selectedApplicant}
                onClose={() => setSelectedId(null)}
                onStatusChange={handleStatusChange}
                saving={savingId === selectedId}
                savedNote={selectedSavedNote}
            />

            <AiFitDrawer
                applicant={aiSelectedApplicant}
                onClose={() => setAiSelectedId(null)}
                result={aiResult}
                loading={aiLoading}
                error={aiError}
            />
        </>
    )
}
