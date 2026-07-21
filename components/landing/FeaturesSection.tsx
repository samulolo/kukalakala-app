import { Search, Sparkles, BellRing, MessageCircle, BarChart3, Briefcase } from "lucide-react"
import FeatureCard from "./FeatureCard"
import Reveal from "./Reveal"

const features = [
    {
        icon: Search,
        title: "Procura Inteligente",
        description: "Filtre vagas por palavra-chave, localização, categoria e tipo para encontrar o que procura mais rápido"
    },
    {
        icon: Sparkles,
        title: "Análise por Inteligência Artificial",
        description: "A IA lê o teu perfil e o teu CV e dá-te um score de compatibilidade com cada vaga, pontos fortes, fracos e sugestões concretas de melhoria"
    },
    {
        icon: BellRing,
        title: "Alertas de Vagas",
        description: "Guarda uma pesquisa como alerta e recebe um email assim que surgir uma vaga nova que combine contigo"
    },
    {
        icon: MessageCircle,
        title: "Mensagens Diretas",
        description: "Comunique diretamente com a empresa ou o candidato sobre cada candidatura, sem sair da plataforma"
    },
    {
        icon: BarChart3,
        title: "Análises Detalhadas",
        description: "Acompanhe a evolução das suas candidaturas ou vagas com gráficos e métricas claras"
    },
    {
        icon: Briefcase,
        title: "Gestão Profissional",
        description: "Crie, publique e gerencie vagas com um dashboard intuitivo e poderoso"
    }
]

export default function FeaturesSection() {
    return (
        <section id="features" className="py-24 px-6 bg-gradient-to-b from-white to-slate-50">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <Reveal className="text-center space-y-4 mb-16">
                    <p className="text-sm font-medium text-blue-700 uppercase tracking-wider">
                        Recursos Principais
                    </p>
                    <h2 className="text-4xl md:text-5xl font-semibold text-slate-900 tracking-tight">
                        Tudo que você precisa
                    </h2>
                    <p className="text-base text-slate-600 max-w-2xl mx-auto font-light leading-relaxed">
                        Uma plataforma completa e integrada para conectar os melhores talentos com as melhores oportunidades
                    </p>
                </Reveal>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <Reveal key={index} delay={(index % 3) * 80}>
                            <FeatureCard
                                icon={feature.icon}
                                title={feature.title}
                                description={feature.description}
                            />
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    )
}
