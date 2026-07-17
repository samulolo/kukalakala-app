"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowUpRight, Check, Lock } from "lucide-react"
import { applyToJob } from "@/app/dashboard/actions"

interface ApplyButtonProps {
    jobId: string
    isAuthenticated: boolean
    isCandidate: boolean
    initiallyApplied: boolean
    /** Estilo compacto (link inline, usado no JobCard) vs botão largo (página de detalhes). */
    variant?: "compact" | "full"
}

// Botão de candidatura para as rotas públicas (/vagas, /vagas/[id]).
// Centraliza as 3 regras de negócio pedidas:
//  1. Só candidatos autenticados podem candidatar-se (não autenticado -> link para login).
//  2. Contas de empresa não podem candidatar-se (desativado com explicação).
//  3. Uma vaga só pode receber uma candidatura por candidato (estado "aplicado"
//     vem do servidor e a constraint unique(candidate_id, job_id) na BD é o
//     backstop final, mesmo que o estado otimista falhe).
export default function ApplyButton({
    jobId,
    isAuthenticated,
    isCandidate,
    initiallyApplied,
    variant = "compact"
}: ApplyButtonProps) {
    const [applied, setApplied] = useState(initiallyApplied)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleApply = async () => {
        if (applied || loading) return
        setLoading(true)
        setError(null)

        const result = await applyToJob(jobId)

        if (result.error) {
            setError(result.error)
            setLoading(false)
            return
        }

        setApplied(true)
        setLoading(false)
    }

    const compactClass =
        "inline-flex items-center gap-1 text-sm font-medium transition-colors"
    const fullClass =
        "w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-colors"

    if (!isAuthenticated) {
        return (
            <Link
                href="/auth/login?type=candidate"
                className={
                    variant === "compact"
                        ? `${compactClass} text-blue-700 hover:text-blue-800`
                        : `${fullClass} bg-blue-700 text-white hover:bg-blue-800`
                }
            >
                Candidatar-se
                <ArrowUpRight className="w-4 h-4" />
            </Link>
        )
    }

    if (!isCandidate) {
        return (
            <span
                title="Apenas contas de candidato podem candidatar-se a vagas"
                className={
                    variant === "compact"
                        ? `${compactClass} text-slate-400 cursor-not-allowed`
                        : `${fullClass} bg-slate-100 text-slate-400 cursor-not-allowed`
                }
            >
                <Lock className="w-4 h-4" />
                Apenas candidatos
            </span>
        )
    }

    return (
        <div className={variant === "full" ? "w-full" : undefined}>
            <button
                type="button"
                onClick={handleApply}
                disabled={applied || loading}
                className={
                    variant === "compact"
                        ? `${compactClass} ${applied ? "text-emerald-600 cursor-default" : "text-blue-700 hover:text-blue-800"}`
                        : `${fullClass} ${
                              applied
                                  ? "bg-emerald-50 text-emerald-700 cursor-default"
                                  : "bg-blue-700 text-white hover:bg-blue-800"
                          }`
                }
            >
                {applied ? (
                    <>
                        <Check className="w-4 h-4" />
                        Candidatura enviada
                    </>
                ) : loading ? (
                    "A candidatar..."
                ) : (
                    <>
                        Candidatar-se
                        <ArrowUpRight className="w-4 h-4" />
                    </>
                )}
            </button>
            {error && (
                <p className="mt-1.5 text-xs text-red-600">{error}</p>
            )}
        </div>
    )
}
