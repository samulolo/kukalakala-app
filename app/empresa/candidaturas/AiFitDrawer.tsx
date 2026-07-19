"use client"

import { X, Sparkles, ThumbsUp, AlertTriangle, Loader2 } from "lucide-react"
import type { CompanyApplicant } from "@/lib/supabase/company-applications"
import type { AiFitAnalysis, AiFitLevel } from "@/lib/ai/analyze-fit"

interface AiFitDrawerProps {
    applicant: CompanyApplicant | null
    onClose: () => void
    // Resultado, loading e erro vivem no componente pai (ver
    // CandidaturasClient.tsx), que é quem dispara a chamada real à IA —
    // este painel é só apresentação, para não disparar setState num
    // efeito aqui dentro.
    result: AiFitAnalysis | null
    loading: boolean
    error: string | null
}

const fitStyles: Record<AiFitLevel, string> = {
    Alto: "bg-emerald-50 text-emerald-700",
    Médio: "bg-amber-50 text-amber-700",
    Baixo: "bg-red-50 text-red-700"
}

export default function AiFitDrawer({ applicant, onClose, result, loading, error }: AiFitDrawerProps) {
    const isOpen = applicant !== null

    return (
        <>
            <div
                onClick={onClose}
                aria-hidden="true"
                className={`fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-[1px] transition-opacity duration-300 ${
                    isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
            />

            <aside
                role="dialog"
                aria-modal="true"
                aria-label="Análise de IA do candidato"
                className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[26rem] bg-white border-l border-slate-200 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
                    isOpen ? "translate-x-0" : "translate-x-full"
                }`}
            >
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 flex-shrink-0">
                    <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-blue-700" strokeWidth={1.75} />
                        Análise de IA
                    </h2>
                    <button
                        onClick={onClose}
                        aria-label="Fechar"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                        <X className="w-4.5 h-4.5" strokeWidth={1.75} />
                    </button>
                </div>

                {applicant && (
                    <div className="flex-1 overflow-y-auto px-5 py-5">
                        <div className="mb-5">
                            <p className="text-sm font-medium text-slate-900">{applicant.candidateName}</p>
                            <p className="text-xs text-slate-500 font-light">Candidatura a {applicant.jobTitle}</p>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <Loader2 className="w-6 h-6 text-blue-700 animate-spin mb-3" strokeWidth={1.75} />
                                <p className="text-sm text-slate-500 font-light">A analisar o perfil e o CV do candidato...</p>
                            </div>
                        ) : error ? (
                            <p className="text-sm text-red-600">{error}</p>
                        ) : result ? (
                            <>
                                <div className="mb-6 p-5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center gap-4">
                                    <div className={`flex-shrink-0 inline-flex items-center justify-center w-16 h-16 rounded-full text-xl font-semibold ${fitStyles[result.fitLevel]}`}>
                                        {result.score}
                                    </div>
                                    <div>
                                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium mb-1 ${fitStyles[result.fitLevel]}`}>
                                            {result.fitLevel} enquadramento
                                        </span>
                                        <p className="text-xs text-slate-500 font-light">Score de compatibilidade com a vaga</p>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <h4 className="text-sm font-semibold text-slate-900 mb-2">Resumo</h4>
                                    <p className="text-sm text-slate-600 font-light leading-relaxed">{result.summary}</p>
                                </div>

                                <div className="mb-6">
                                    <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-1.5">
                                        <ThumbsUp className="w-4 h-4 text-emerald-600" strokeWidth={1.75} />
                                        Pontos fortes
                                    </h4>
                                    <ul className="space-y-1.5">
                                        {result.strengths.map((item) => (
                                            <li key={item} className="text-sm text-slate-600 font-light flex gap-2">
                                                <span className="text-emerald-600">·</span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="mb-6">
                                    <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-1.5">
                                        <AlertTriangle className="w-4 h-4 text-amber-500" strokeWidth={1.75} />
                                        Pontos de atenção
                                    </h4>
                                    <ul className="space-y-1.5">
                                        {result.weaknesses.map((item) => (
                                            <li key={item} className="text-sm text-slate-600 font-light flex gap-2">
                                                <span className="text-amber-500">·</span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <p className="text-xs text-slate-400 font-light border-t border-slate-100 pt-4">
                                    Análise gerada por IA com base no perfil e no CV do candidato — usa como apoio à decisão, não como critério único.
                                </p>
                            </>
                        ) : null}
                    </div>
                )}
            </aside>
        </>
    )
}
