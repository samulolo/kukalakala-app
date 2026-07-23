"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { MapPin, Briefcase, Eye, Sparkles, GripVertical } from "lucide-react"
import type { CompanyApplicant } from "@/lib/supabase/company-applications"
import type { ApplicationStatus } from "@/lib/supabase/applications"
import type { AiFitAnalysis } from "@/lib/ai/analyze-fit"
import type { SavedCandidate } from "@/lib/supabase/saved-candidates"
import { changeApplicationStatus } from "./actions"
import { getCompanyApplicationAiFit } from "@/lib/actions/ai-fit"
import CandidateDetailsDrawer from "./CandidateDetailsDrawer"
import AiFitDrawer from "./AiFitDrawer"

interface ColumnConfig {
    status: ApplicationStatus
    label: string
    headerClass: string
    dotClass: string
}

const columns: ColumnConfig[] = [
    { status: "Em análise", label: "Em análise", headerClass: "text-blue-700 bg-blue-50", dotClass: "bg-blue-700" },
    { status: "Entrevista", label: "Entrevista", headerClass: "text-amber-700 bg-amber-50", dotClass: "bg-amber-500" },
    { status: "Aprovado", label: "Aprovado", headerClass: "text-emerald-700 bg-emerald-50", dotClass: "bg-emerald-600" },
    { status: "Rejeitado", label: "Rejeitado", headerClass: "text-slate-600 bg-slate-100", dotClass: "bg-slate-400" }
]

const statusOptions: ApplicationStatus[] = columns.map((c) => c.status)

interface CandidaturasClientProps {
    applications: CompanyApplicant[]
    jobOptions: { id: string; title: string }[]
    // Candidatura a abrir automaticamente ao chegar de um link de
    // notificação (?conversa=ID) — já vem incluída em "applications",
    // que carrega sempre o conjunto completo da empresa.
    openApplicantId?: string | null
    saved: SavedCandidate[]
}

export default function CandidaturasClient({
    applications: initialApplications,
    jobOptions,
    openApplicantId = null,
    saved
}: CandidaturasClientProps) {
    const router = useRouter()
    const pathname = usePathname()

    // Só guardamos os desvios (id -> novo estado) em vez de duplicar a
    // lista inteira num useState — evita precisar de um efeito para
    // voltar a sincronizar com "initialApplications" sempre que o
    // servidor revalida (proibido pela regra react-hooks/set-state-in-effect).
    // O estado "verdadeiro" é sempre derivado por cima da prop mais
    // recente, com estes desvios aplicados por cima para a atualização
    // otimista do drag-and-drop parecer instantânea.
    const [statusOverrides, setStatusOverrides] = useState<Map<string, ApplicationStatus>>(new Map())
    const [jobId, setJobId] = useState("")
    const [savingId, setSavingId] = useState<string | null>(null)
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [aiSelectedId, setAiSelectedId] = useState<string | null>(null)
    const [aiLoading, setAiLoading] = useState(false)
    const [aiError, setAiError] = useState<string | null>(null)
    const [aiResult, setAiResult] = useState<AiFitAnalysis | null>(null)
    const [draggingId, setDraggingId] = useState<string | null>(null)
    const [dragOverStatus, setDragOverStatus] = useState<ApplicationStatus | null>(null)

    const applications = useMemo(
        () =>
            initialApplications.map((application) => {
                const overrideStatus = statusOverrides.get(application.id)
                return overrideStatus ? { ...application, status: overrideStatus } : application
            }),
        [initialApplications, statusOverrides]
    )

    // Mesma lógica de "abrir candidatura vinda de notificação" que já
    // existia antes do Kanban: ajusta o estado durante a renderização
    // (em vez de um efeito) para reagir assim que chega um "?conversa="
    // novo, e repõe o guard a null quando o parâmetro desaparece da URL —
    // sem isto, uma notificação seguinte para a MESMA candidatura nunca
    // voltaria a abrir o painel.
    const [appliedOpenId, setAppliedOpenId] = useState<string | null>(null)
    if (openApplicantId && openApplicantId !== appliedOpenId) {
        setAppliedOpenId(openApplicantId)
        setSelectedId(openApplicantId)
    } else if (!openApplicantId && appliedOpenId !== null) {
        setAppliedOpenId(null)
    }

    useEffect(() => {
        if (appliedOpenId) {
            router.replace(pathname, { scroll: false })
        }
    }, [appliedOpenId, pathname, router])

    const filteredApplications = useMemo(
        () => (jobId ? applications.filter((a) => a.jobId === jobId) : applications),
        [applications, jobId]
    )

    const applicationsByStatus = useMemo(() => {
        const grouped = new Map<ApplicationStatus, CompanyApplicant[]>()
        for (const column of columns) grouped.set(column.status, [])
        for (const application of filteredApplications) {
            grouped.get(application.status)?.push(application)
        }
        return grouped
    }, [filteredApplications])

    const selectedApplicant = applications.find((a) => a.id === selectedId) ?? null
    const aiSelectedApplicant = applications.find((a) => a.id === aiSelectedId) ?? null

    const savedNoteById = useMemo(() => new Map(saved.map((s) => [s.candidateId, s.note])), [saved])
    const selectedSavedNote = selectedApplicant ? savedNoteById.get(selectedApplicant.candidateId) ?? null : null

    const handleApplicationStatusChange = async (applicationId: string, newStatus: ApplicationStatus) => {
        const current = applications.find((a) => a.id === applicationId)
        if (!current || current.status === newStatus) return

        // Otimista: move o cartão já na interface antes da resposta do
        // servidor, para o drag-and-drop parecer instantâneo — reverte
        // para o estado anterior se a atualização falhar.
        const previousStatus = current.status
        setStatusOverrides((prev) => new Map(prev).set(applicationId, newStatus))
        setSavingId(applicationId)

        const result = await changeApplicationStatus(applicationId, newStatus)

        if (result?.error) {
            setStatusOverrides((prev) => new Map(prev).set(applicationId, previousStatus))
        }
        setSavingId(null)
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, status: ApplicationStatus) => {
        e.preventDefault()
        const applicationId = e.dataTransfer.getData("text/plain")
        setDragOverStatus(null)
        setDraggingId(null)
        if (!applicationId) return
        handleApplicationStatusChange(applicationId, status)
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
                <select value={jobId} onChange={(e) => setJobId(e.target.value)} className={selectClass}>
                    <option value="">Todas as vagas</option>
                    {jobOptions.map((job) => (
                        <option key={job.id} value={job.id}>{job.title}</option>
                    ))}
                </select>

                <span className="text-xs text-slate-400 font-light ml-auto">
                    {filteredApplications.length} {filteredApplications.length === 1 ? "candidatura" : "candidaturas"}
                </span>
            </div>

            {filteredApplications.length > 0 ? (
                <div className="flex gap-4 overflow-x-auto pb-2">
                    {columns.map((column) => {
                        const columnApplications = applicationsByStatus.get(column.status) ?? []
                        const isDragOver = dragOverStatus === column.status

                        return (
                            <div
                                key={column.status}
                                onDragOver={(e) => {
                                    e.preventDefault()
                                    if (dragOverStatus !== column.status) setDragOverStatus(column.status)
                                }}
                                onDragLeave={() => setDragOverStatus((prev) => (prev === column.status ? null : prev))}
                                onDrop={(e) => handleDrop(e, column.status)}
                                className={`flex-shrink-0 w-72 rounded-2xl border bg-slate-50/60 flex flex-col transition-colors ${
                                    isDragOver ? "border-blue-300 bg-blue-50/60" : "border-slate-200"
                                }`}
                            >
                                <div className={`flex items-center justify-between px-3.5 py-3 rounded-t-2xl ${column.headerClass}`}>
                                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold">
                                        <span className={`w-1.5 h-1.5 rounded-full ${column.dotClass}`} />
                                        {column.label}
                                    </span>
                                    <span className="text-xs font-medium opacity-70">{columnApplications.length}</span>
                                </div>

                                <div className="flex-1 p-2.5 space-y-2.5 overflow-y-auto max-h-[65vh] min-h-[6rem]">
                                    {columnApplications.length > 0 ? (
                                        columnApplications.map((application) => (
                                            <div
                                                key={application.id}
                                                draggable
                                                onDragStart={(e) => {
                                                    e.dataTransfer.effectAllowed = "move"
                                                    e.dataTransfer.setData("text/plain", application.id)
                                                    setDraggingId(application.id)
                                                }}
                                                onDragEnd={() => {
                                                    setDraggingId(null)
                                                    setDragOverStatus(null)
                                                }}
                                                className={`p-3 rounded-xl border border-slate-200 bg-white shadow-sm cursor-grab active:cursor-grabbing transition-opacity ${
                                                    draggingId === application.id ? "opacity-40" : "opacity-100"
                                                } ${savingId === application.id ? "pointer-events-none opacity-60" : ""}`}
                                            >
                                                <div className="flex items-start gap-2.5 mb-2">
                                                    <span className="flex-shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-700 text-white text-xs font-semibold">
                                                        {application.candidateName.charAt(0)}
                                                    </span>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-medium text-slate-900 truncate">{application.candidateName}</p>
                                                        <p className="text-xs text-slate-500 font-light truncate">
                                                            {application.candidateHeadline || "Sem cargo indicado"}
                                                        </p>
                                                    </div>
                                                    <GripVertical className="w-3.5 h-3.5 text-slate-300 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                                                </div>

                                                <p className="text-xs text-slate-400 font-light mb-1 inline-flex items-center gap-1 truncate">
                                                    <Briefcase className="w-3 h-3 flex-shrink-0" strokeWidth={1.5} />
                                                    <span className="truncate">{application.jobTitle}</span>
                                                </p>
                                                {application.candidateLocation && (
                                                    <p className="text-xs text-slate-400 font-light mb-2 inline-flex items-center gap-1 truncate">
                                                        <MapPin className="w-3 h-3 flex-shrink-0" strokeWidth={1.5} />
                                                        <span className="truncate">{application.candidateLocation}</span>
                                                    </p>
                                                )}

                                                <div className="flex items-center gap-1 mb-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedId(application.id)}
                                                        title="Ver detalhes"
                                                        className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-blue-700 hover:bg-blue-50 transition-colors"
                                                    >
                                                        <Eye className="w-4 h-4" strokeWidth={1.75} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenAiFit(application.id)}
                                                        title="Análise IA"
                                                        className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                                                    >
                                                        <Sparkles className="w-4 h-4" strokeWidth={1.75} />
                                                    </button>
                                                    <span className="text-[11px] text-slate-400 font-light ml-auto">{application.appliedAt}</span>
                                                </div>

                                                {/* Alternativa ao arrastar, para teclado/touch. */}
                                                <select
                                                    value={application.status}
                                                    onChange={(e) =>
                                                        handleApplicationStatusChange(application.id, e.target.value as ApplicationStatus)
                                                    }
                                                    disabled={savingId === application.id}
                                                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-colors disabled:opacity-50"
                                                >
                                                    {statusOptions.map((option) => (
                                                        <option key={option} value={option}>{option}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-slate-400 font-light text-center py-8">
                                            Nenhuma candidatura aqui
                                        </p>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="p-2 sm:p-4 rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="text-center py-16">
                        <p className="text-slate-600 font-light text-sm">
                            {jobId ? "Nenhuma candidatura encontrada com este filtro" : "Nenhuma candidatura encontrada"}
                        </p>
                    </div>
                </div>
            )}

            <CandidateDetailsDrawer
                applicant={selectedApplicant}
                onClose={() => setSelectedId(null)}
                onStatusChange={handleApplicationStatusChange}
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
