"use client"

import { useState } from "react"
import Link from "next/link"
import { CheckCircle2, Circle, X } from "lucide-react"
import { dismissOnboardingChecklist } from "@/app/empresa/actions"

interface OnboardingChecklistProps {
    profileComplete: boolean
    hasJob: boolean
    hasApplication: boolean
}

// Escondemos assim que a empresa dispensa (persistido no servidor, ver
// dismissOnboardingChecklist) ou quando os 3 passos ficam concluídos —
// o "allDone" já vem calculado do servidor para evitar mostrar e logo
// a seguir esconder no primeiro render.
export default function OnboardingChecklist({ profileComplete, hasJob, hasApplication }: OnboardingChecklistProps) {
    const [dismissed, setDismissed] = useState(false)

    const steps = [
        {
            label: "Completa o perfil da empresa",
            description: "Setor, descrição, localização e contacto ajudam candidatos a confiar na tua vaga.",
            done: profileComplete,
            href: "/empresa/perfil"
        },
        {
            label: "Publica a tua primeira vaga",
            description: "Sem vagas ativas a tua empresa não aparece nas pesquisas dos candidatos.",
            done: hasJob,
            href: "/empresa/vagas"
        },
        {
            label: "Recebe a tua primeira candidatura",
            description: "Assim que alguém se candidatar, vais poder analisar o perfil e avançar o processo.",
            done: hasApplication,
            href: "/empresa/candidaturas"
        }
    ]

    const doneCount = steps.filter((step) => step.done).length
    const allDone = doneCount === steps.length

    if (dismissed || allDone) return null

    const handleDismiss = () => {
        setDismissed(true)
        dismissOnboardingChecklist().catch(() => {})
    }

    return (
        <div className="mb-6 p-5 rounded-2xl border border-blue-100 bg-blue-50/40 relative">
            <button
                type="button"
                onClick={handleDismiss}
                aria-label="Dispensar checklist"
                title="Dispensar"
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white/70 transition-colors"
            >
                <X className="w-4 h-4" strokeWidth={1.75} />
            </button>

            <div className="pr-8 mb-4">
                <h2 className="text-sm font-semibold text-slate-900">Vamos começar</h2>
                <p className="text-xs text-slate-500 font-light mt-0.5">
                    Completa estes passos para tirar o máximo proveito da Kukalakala.
                </p>
            </div>

            <div className="h-1.5 rounded-full bg-white/80 overflow-hidden mb-4">
                <div
                    className="h-full rounded-full bg-blue-700 transition-all duration-500"
                    style={{ width: `${(doneCount / steps.length) * 100}%` }}
                />
            </div>

            <ul className="space-y-2.5">
                {steps.map((step) => (
                    <li key={step.label} className="flex items-start gap-3">
                        {step.done ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" strokeWidth={1.75} />
                        ) : (
                            <Circle className="w-5 h-5 text-slate-300 flex-shrink-0 mt-0.5" strokeWidth={1.75} />
                        )}
                        <div className="min-w-0 flex-1">
                            {step.done ? (
                                <p className="text-sm font-medium text-slate-500 line-through decoration-slate-300">
                                    {step.label}
                                </p>
                            ) : (
                                <Link
                                    href={step.href}
                                    className="text-sm font-medium text-slate-900 hover:text-blue-700 transition-colors"
                                >
                                    {step.label}
                                </Link>
                            )}
                            <p className="text-xs text-slate-500 font-light mt-0.5">{step.description}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}
