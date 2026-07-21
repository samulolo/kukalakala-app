"use client"

import { useMemo, useState } from "react"
import { Search, MapPin, Briefcase, Eye, X, Users, BookmarkCheck, Trophy, ThumbsUp } from "lucide-react"
import type { CompanyApplicant } from "@/lib/supabase/company-applications"
import type { PoolCandidate } from "@/lib/supabase/candidate-pool"
import type { SavedCandidate } from "@/lib/supabase/saved-candidates"
import {
    groupApplicationsByCandidate,
    mergeCandidatePool,
    searchCandidates,
    type CandidateGroup
} from "@/lib/candidate-search"
import CandidateDetailsDrawer from "../candidaturas/CandidateDetailsDrawer"
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

    const candidates = useMemo(
        () => mergeCandidatePool(groupApplicationsByCandidate(applications), pool),
        [applications, pool]
    )
    const results = useMemo(() => searchCandidates(candidates, query), [candidates, query])
    const savedNoteById = useMemo(() => new Map(saved.map((s) => [s.candidateId, s.note])), [saved])

    const hasQuery = query.trim().length > 0
    const best = hasQuery ? results.filter((r) => (r.score ?? 0) > 80) : []
    const worthConsidering = hasQuery ? results.filter((r) => (r.score ?? 0) >= 60 && (r.score ?? 0) <= 80) : []

    const selectedApplicant = applications.find((a) => a.id === selectedApplicationId) ?? null
    const previewCandidate = candidates.find((c) => c.candidateId === previewCandidateId) ?? null
    const selectedSavedNote = selectedApplicant ? savedNoteById.get(selectedApplicant.candidateId) ?? null : null
    const previewSavedNote = previewCandidate ? savedNoteById.get(previewCandidate.candidateId) ?? null : null

    const openProfile = (candidate: CandidateGroup) => {
        const primary = candidate.applications[0]
        if (primary) {
            setSelectedApplicationId(primary.id)
        } else {
            setPreviewCandidateId(candidate.candidateId)
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

            {hasQuery ? (
                <div className="space-y-8">
                    <p className="text-sm text-slate-500 font-light -mt-1">
                        <span className="font-semibold text-slate-900">{best.length + worthConsidering.length}</span>{" "}
                        {best.length + worthConsidering.length === 1 ? "candidato encontrado" : "candidatos encontrados"}
                    </p>

                    <ResultSection
                        title="Os melhores"
                        description="Correspondência forte com a pesquisa (score acima de 80)"
                        icon={Trophy}
                        iconClass="text-amber-600 bg-amber-50"
                        items={best}
                        savedNoteById={savedNoteById}
                        onOpenProfile={openProfile}
                    />

                    <ResultSection
                        title="Vale considerar"
                        description="Correspondência razoável (score entre 60 e 80)"
                        icon={ThumbsUp}
                        iconClass="text-blue-700 bg-blue-50"
                        items={worthConsidering}
                        savedNoteById={savedNoteById}
                        onOpenProfile={openProfile}
                    />

                    {best.length === 0 && worthConsidering.length === 0 && (
                        <div className="p-2 sm:p-4 rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="text-center py-16">
                                <p className="text-slate-600 font-light text-sm">Nenhum candidato corresponde à pesquisa</p>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="p-2 sm:p-4 rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <p className="text-xs text-slate-400 font-light px-3 pt-2 pb-3">
                        {results.length} {results.length === 1 ? "candidato disponível" : "candidatos disponíveis"} — inclui
                        quem já se candidatou às tuas vagas e o banco de talentos pesquisável. Pesquisa por profissão,
                        competência ou nível para ordenar por score.
                    </p>
                    {results.length > 0 ? (
                        <ul className="divide-y divide-slate-100 px-2">
                            {results.map(({ candidate }) => (
                                <CandidateRow
                                    key={candidate.candidateId}
                                    candidate={candidate}
                                    score={null}
                                    isSaved={savedNoteById.has(candidate.candidateId)}
                                    onOpenProfile={openProfile}
                                />
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-16">
                            <p className="text-slate-600 font-light text-sm">Ainda não há candidatos para mostrar</p>
                        </div>
                    )}
                </div>
            )}

            <CandidateDetailsDrawer
                applicant={selectedApplicant}
                onClose={() => setSelectedApplicationId(null)}
                onStatusChange={() => {}}
                saving={false}
                savedNote={selectedSavedNote}
                readOnly
            />

            <CandidatePreviewDrawer
                candidate={previewCandidate}
                onClose={() => setPreviewCandidateId(null)}
                savedNote={previewSavedNote}
            />
        </>
    )
}

function ResultSection({
    title,
    description,
    icon: Icon,
    iconClass,
    items,
    savedNoteById,
    onOpenProfile
}: {
    title: string
    description: string
    icon: typeof Trophy
    iconClass: string
    items: { candidate: CandidateGroup; score: number | null }[]
    savedNoteById: Map<string, string>
    onOpenProfile: (candidate: CandidateGroup) => void
}) {
    if (items.length === 0) return null

    return (
        <div>
            <div className="flex items-center gap-2.5 mb-3">
                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${iconClass}`}>
                    <Icon className="w-4 h-4" strokeWidth={1.75} />
                </span>
                <div>
                    <h2 className="text-sm font-semibold text-slate-900">
                        {title} <span className="text-slate-400 font-normal">({items.length})</span>
                    </h2>
                    <p className="text-xs text-slate-400 font-light">{description}</p>
                </div>
            </div>

            <div className="p-2 sm:p-4 rounded-2xl border border-slate-200 bg-white shadow-sm">
                <ul className="divide-y divide-slate-100 px-2">
                    {items.map(({ candidate, score }) => (
                        <CandidateRow
                            key={candidate.candidateId}
                            candidate={candidate}
                            score={score}
                            isSaved={savedNoteById.has(candidate.candidateId)}
                            onOpenProfile={onOpenProfile}
                        />
                    ))}
                </ul>
            </div>
        </div>
    )
}

function CandidateRow({
    candidate,
    score,
    isSaved,
    onOpenProfile
}: {
    candidate: CandidateGroup
    score: number | null
    isSaved: boolean
    onOpenProfile: (candidate: CandidateGroup) => void
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
                    {score !== null && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-900 text-white text-xs font-semibold flex-shrink-0">
                            score {score}
                        </span>
                    )}
                    {isSaved && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium flex-shrink-0">
                            <BookmarkCheck className="w-3 h-3" strokeWidth={1.75} />
                            No pool
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

            <button
                type="button"
                onClick={() => onOpenProfile(candidate)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-blue-700 hover:bg-blue-50 transition-colors flex-shrink-0"
            >
                <Eye className="w-4 h-4" strokeWidth={1.75} />
                Ver perfil
            </button>
        </li>
    )
}
