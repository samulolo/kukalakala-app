"use client"

import { useMemo, useState } from "react"
import { Search, MapPin, Briefcase, Eye, Sparkles, X, Users, BookmarkCheck } from "lucide-react"
import type { CompanyApplicant } from "@/lib/supabase/company-applications"
import type { ApplicationStatus } from "@/lib/supabase/applications"
import type { AiFitAnalysis } from "@/lib/ai/analyze-fit"
import type { PoolCandidate } from "@/lib/supabase/candidate-pool"
import type { SavedCandidate } from "@/lib/supabase/saved-candidates"
import { groupApplicationsByCandidate, mergeCandidatePool, searchCandidates, type CandidateGroup } from "@/lib/candidate-search"
import { changeApplicationStatus } from "../candidaturas/actions"
import { getCompanyApplicationAiFit } from "@/lib/actions/ai-fit"
import CandidateDetailsDrawer from "../candidaturas/CandidateDetailsDrawer"
import AiFitDrawer from "../candidaturas/AiFitDrawer"
import CandidatePreviewDrawer from "./CandidatePreviewDrawer"

interface CandidatosSearchClientProps {
    applications: CompanyApplicant[]
    pool: PoolCandidate[]
    saved: SavedCandidate[]
}

export default function CandidatosSearchClient({ applications, pool, saved }: CandidatosSearchClientProps) {
    const [query, setQuery] = useState("")
    const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null)
    const [previewCandidateId, setPreviewCandidateId] = useState<string | null>(null)
    const [savingId, setSavingId] = useState<string | null>(null)
    const [aiSelectedId, setAiSelectedId] = useState<string | null>(null)
    const [aiLoading, setAiLoading] = useState(false)
    const [aiError, setAiError] = useState<string | null>(null)
    const [aiResult, setAiResult] = useState<AiFitAnalysis | null>(null)

    const candidates = useMemo(
        () => mergeCandidatePool(groupApplicationsByCandidate(applications), pool),
        [applications, pool]
    )
    const results = useMemo(() => searchCandidates(candidates, query), [candidates, query])
    const savedNoteById = useMemo(() => new Map(saved.map((s) => [s.candidateId, s.note])), [saved])

    const selectedApplicant = applications.find((a) => a.id === selectedApplicationId) ?? null
    const aiSelectedApplicant = applications.find((a) => a.id === aiSelectedId) ?? null
    const previewCandidate = candidates.find((c) => c.candidateId === previewCandidateId) ?? null
    const selectedSavedNote = selectedApplicant ? savedNoteById.get(selectedApplicant.candidateId) ?? null : null
    const previewSavedNote = previewCandidate ? savedNoteById.get(previewCandidate.candidateId) ?? null : null

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

    return (
        <>
            <div className="relative max-w-lg mb-5">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={1.5} />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ex: arquiteto, React, sénior..."
                    className="w-full pl-10 pr-9 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-colors"
                />
                {query && (
                    <button
                        type="button"
                        onClick={() => setQuery("")}
                        aria-label="Limpar pesquisa"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="w-4 h-4" strokeWidth={1.75} />
                    </button>
                )}
            </div>

            <p className="text-xs text-slate-400 font-light mb-4">
                {results.length} {results.length === 1 ? "candidato encontrado" : "candidatos encontrados"} — inclui
                quem já se candidatou às tuas vagas e o banco de talentos pesquisável
            </p>

            <div className="p-2 sm:p-4 rounded-2xl border border-slate-200 bg-white shadow-sm">
                {results.length > 0 ? (
                    <ul className="divide-y divide-slate-100 px-2">
                        {results.map((candidate) => (
                            <CandidateRow
                                key={candidate.candidateId}
                                candidate={candidate}
                                savingId={savingId}
                                isSaved={savedNoteById.has(candidate.candidateId)}
                                onOpenDetails={setSelectedApplicationId}
                                onOpenPreview={setPreviewCandidateId}
                                onOpenAiFit={handleOpenAiFit}
                                onStatusChange={handleStatusChange}
                            />
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-16">
                        <p className="text-slate-600 font-light text-sm">
                            {query ? "Nenhum candidato corresponde à pesquisa" : "Ainda não há candidatos para mostrar"}
                        </p>
                    </div>
                )}
            </div>

            <CandidateDetailsDrawer
                applicant={selectedApplicant}
                onClose={() => setSelectedApplicationId(null)}
                onStatusChange={handleStatusChange}
                saving={savingId === selectedApplicationId}
                savedNote={selectedSavedNote}
            />

            <AiFitDrawer
                applicant={aiSelectedApplicant}
                onClose={() => setAiSelectedId(null)}
                result={aiResult}
                loading={aiLoading}
                error={aiError}
            />

            <CandidatePreviewDrawer
                candidate={previewCandidate}
                onClose={() => setPreviewCandidateId(null)}
                savedNote={previewSavedNote}
            />
        </>
    )
}

const statusOptions: ApplicationStatus[] = ["Em análise", "Entrevista", "Aprovado", "Rejeitado"]

const selectClass =
    "px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-colors"

function CandidateRow({
    candidate,
    savingId,
    isSaved,
    onOpenDetails,
    onOpenPreview,
    onOpenAiFit,
    onStatusChange
}: {
    candidate: CandidateGroup
    savingId: string | null
    isSaved: boolean
    onOpenDetails: (applicationId: string) => void
    onOpenPreview: (candidateId: string) => void
    onOpenAiFit: (applicationId: string) => void
    onStatusChange: (applicationId: string, status: ApplicationStatus) => void
}) {
    const primary = candidate.applications[0] ?? null

    return (
        <li className="py-4 px-1 flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-lg bg-blue-700 text-white text-sm font-semibold">
                {candidate.name.charAt(0)}
            </span>

            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-slate-900 truncate">{candidate.name}</p>
                    {isSaved && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium flex-shrink-0">
                            <BookmarkCheck className="w-3 h-3" strokeWidth={1.75} />
                            No pool
                        </span>
                    )}
                    {candidate.bestAiScore !== null && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium flex-shrink-0">
                            <Sparkles className="w-3 h-3" strokeWidth={1.75} />
                            {candidate.bestAiScore}% compatibilidade
                        </span>
                    )}
                    {!primary && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs font-medium flex-shrink-0">
                            <Users className="w-3 h-3" strokeWidth={1.75} />
                            Banco de talentos
                        </span>
                    )}
                </div>
                <p className="text-xs text-slate-500 font-light truncate">
                    {candidate.headline || "Sem cargo indicado"}
                    {candidate.location && (
                        <span className="inline-flex items-center gap-1 ml-2">
                            <MapPin className="w-3 h-3 inline" strokeWidth={1.5} />
                            {candidate.location}
                        </span>
                    )}
                </p>
                {primary && (
                    <p className="text-xs text-slate-400 font-light mt-0.5 inline-flex flex-wrap items-center gap-1">
                        <Briefcase className="w-3 h-3" strokeWidth={1.5} />
                        {candidate.applications.map((a) => a.jobTitle).join(", ")}
                    </p>
                )}
            </div>

            {primary ? (
                <>
                    <button
                        type="button"
                        onClick={() => onOpenDetails(primary.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-blue-700 hover:bg-blue-50 transition-colors flex-shrink-0"
                    >
                        <Eye className="w-4 h-4" strokeWidth={1.75} />
                        Ver detalhes
                    </button>

                    <button
                        type="button"
                        onClick={() => onOpenAiFit(primary.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors flex-shrink-0"
                    >
                        <Sparkles className="w-4 h-4" strokeWidth={1.75} />
                        Análise IA
                    </button>

                    <select
                        value={primary.status}
                        onChange={(e) => onStatusChange(primary.id, e.target.value as ApplicationStatus)}
                        disabled={savingId === primary.id}
                        className={`${selectClass} flex-shrink-0 disabled:opacity-50`}
                    >
                        {statusOptions.map((status) => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </>
            ) : (
                <button
                    type="button"
                    onClick={() => onOpenPreview(candidate.candidateId)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-blue-700 hover:bg-blue-50 transition-colors flex-shrink-0"
                >
                    <Eye className="w-4 h-4" strokeWidth={1.75} />
                    Ver perfil
                </button>
            )}
        </li>
    )
}
