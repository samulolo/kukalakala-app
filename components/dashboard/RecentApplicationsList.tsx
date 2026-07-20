"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { MessageCircle, Sparkles } from "lucide-react"
import type { Application } from "@/lib/supabase/applications"
import type { AiFitAnalysis } from "@/lib/ai/analyze-fit"
import { getMyApplicationAiFit } from "@/lib/actions/ai-fit"
import StatusBadge from "./StatusBadge"
import MessagesDrawer from "./MessagesDrawer"
import CandidateJobFitDrawer from "./CandidateJobFitDrawer"

interface RecentApplicationsListProps {
    applications: Application[]
    // Candidatura a abrir automaticamente no painel de mensagens (vinda
    // de um link de notificação, ex. ?conversa=ID) — carregada à parte
    // porque pode não estar na lista/página atualmente visível.
    openConversation?: Application | null
}

export default function RecentApplicationsList({ applications, openConversation }: RecentApplicationsListProps) {
    const router = useRouter()
    const pathname = usePathname()
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const selected = applications.find((a) => a.id === selectedId) ?? (openConversation?.id === selectedId ? openConversation : null)

    // Ajusta o estado durante a renderização (em vez de um efeito) para
    // abrir a candidatura vinda da notificação assim que chega uma nova
    // — padrão recomendado pelo React para "adjusting state when props
    // change" sem disparar um render extra via efeito.
    //
    // Também repõe o guard a null assim que o parâmetro "?conversa="
    // desaparece da URL (depois de o limparmos no efeito abaixo). Sem
    // isto, uma notificação seguinte para a MESMA candidatura — o caso
    // normal numa conversa com várias mensagens — nunca voltaria a
    // abrir o painel, porque o id já teria ficado marcado como
    // "aplicado" e nunca mais haveria alteração para reagir.
    const [appliedOpenId, setAppliedOpenId] = useState<string | null>(null)
    if (openConversation && openConversation.id !== appliedOpenId) {
        setAppliedOpenId(openConversation.id)
        setSelectedId(openConversation.id)
    } else if (!openConversation && appliedOpenId !== null) {
        setAppliedOpenId(null)
    }

    // Limpa o parâmetro "?conversa=" da URL depois de aplicado, para que
    // fique disponível para consumir de novo numa próxima notificação.
    useEffect(() => {
        if (appliedOpenId) {
            router.replace(pathname, { scroll: false })
        }
    }, [appliedOpenId, pathname, router])

    const [fitApplicationId, setFitApplicationId] = useState<string | null>(null)
    const [fitLoading, setFitLoading] = useState(false)
    const [fitError, setFitError] = useState<string | null>(null)
    const [fitResult, setFitResult] = useState<AiFitAnalysis | null>(null)
    const fitApplication = applications.find((a) => a.id === fitApplicationId) ?? null

    const handleOpenFit = async (application: Application) => {
        setFitApplicationId(application.id)
        setFitLoading(true)
        setFitError(null)
        setFitResult(null)

        try {
            const { result, error } = await getMyApplicationAiFit(application.id)
            if (error) {
                setFitError(error)
            } else {
                setFitResult(result)
            }
        } catch {
            setFitError("Não foi possível gerar o feedback, tenta novamente.")
        } finally {
            setFitLoading(false)
        }
    }

    return (
        <>
            <ul className="divide-y divide-slate-100">
                {applications.map((application) => (
                    <li key={application.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3.5">
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                            <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold flex-shrink-0">
                                {application.company.charAt(0)}
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-slate-900 truncate">{application.jobTitle}</p>
                                <p className="text-xs text-slate-500 font-light truncate">
                                    {application.company} · {application.appliedAt}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 justify-between sm:justify-start pl-[3.125rem] sm:pl-0">
                            <StatusBadge status={application.status} />
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => handleOpenFit(application)}
                                    aria-label="Ver feedback de IA"
                                    title="Feedback de IA"
                                    className="p-2 rounded-lg text-slate-400 hover:text-blue-700 hover:bg-blue-50 transition-colors flex-shrink-0"
                                >
                                    <Sparkles className="w-4 h-4" strokeWidth={1.75} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedId(application.id)}
                                    aria-label="Abrir mensagens"
                                    title={
                                        application.interview?.status === "proposta"
                                            ? "Tens uma entrevista para confirmar"
                                            : "Mensagens"
                                    }
                                    className="relative p-2 rounded-lg text-slate-400 hover:text-blue-700 hover:bg-blue-50 transition-colors flex-shrink-0"
                                >
                                    <MessageCircle className="w-4 h-4" strokeWidth={1.75} />
                                    {application.interview?.status === "proposta" && (
                                        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-500" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>

            <MessagesDrawer
                applicationId={selectedId}
                title={selected?.company ?? ""}
                subtitle={selected?.jobTitle}
                interview={selected?.interview ?? null}
                onClose={() => setSelectedId(null)}
            />

            <CandidateJobFitDrawer
                isOpen={fitApplicationId !== null}
                jobTitle={fitApplication?.jobTitle ?? ""}
                company={fitApplication?.company ?? ""}
                result={fitResult}
                loading={fitLoading}
                error={fitError}
                onClose={() => setFitApplicationId(null)}
            />
        </>
    )
}
