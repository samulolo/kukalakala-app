import { Send, Sparkles, MessageCircle, CalendarClock, CheckCircle2 } from "lucide-react"
import Reveal from "./Reveal"

interface Stage {
    icon: typeof Send
    title: string
    description: string
}

const stages: Stage[] = [
    {
        icon: Send,
        title: "Candidatura enviada",
        description: "O candidato candidata-se em segundos — perfil e CV chegam de imediato à empresa, sem formulários repetidos."
    },
    {
        icon: Sparkles,
        title: "Análise por IA",
        description: "A IA lê o CV e o perfil e devolve um score de compatibilidade instantâneo com os requisitos da vaga."
    },
    {
        icon: MessageCircle,
        title: "Conversa direta",
        description: "Empresa e candidato falam diretamente na plataforma — sem se perder em emails ou grupos de WhatsApp."
    },
    {
        icon: CalendarClock,
        title: "Entrevista agendada",
        description: "A empresa propõe data e modo; o candidato confirma ou recusa sem sair da candidatura."
    },
    {
        icon: CheckCircle2,
        title: "Decisão e resposta",
        description: "O estado da candidatura é atualizado e o candidato é avisado por email — e por WhatsApp, quando disponível."
    }
]

export default function HiringPipelineSection() {
    return (
        <section className="py-24 px-6">
            <div className="max-w-3xl mx-auto">
                <Reveal className="text-center space-y-4 mb-16">
                    <p className="text-sm font-medium text-blue-700 uppercase tracking-wider">
                        Pipeline de Contratação
                    </p>
                    <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight">
                        Da candidatura à contratação, sem sair da plataforma
                    </h2>
                </Reveal>

                <div className="relative">
                    {/* Linha vertical */}
                    <div className="absolute left-6 top-2 bottom-2 w-px bg-blue-100" aria-hidden="true" />

                    <div className="space-y-10">
                        {stages.map((stage, index) => (
                            <Reveal key={stage.title} delay={index * 90} className="relative flex gap-6">
                                <div className="relative z-10 flex-shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-full bg-white border-2 border-blue-200 text-blue-700 shadow-sm">
                                    <stage.icon className="w-5 h-5" strokeWidth={1.75} />
                                </div>
                                <div className="pt-2">
                                    <p className="text-xs font-medium text-blue-700 uppercase tracking-wider mb-1">
                                        Etapa {index + 1}
                                    </p>
                                    <h3 className="text-lg font-semibold text-slate-900 mb-1.5">
                                        {stage.title}
                                    </h3>
                                    <p className="text-sm text-slate-600 leading-relaxed font-light">
                                        {stage.description}
                                    </p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
