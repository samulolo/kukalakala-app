import { Search, Zap, BarChart3, Briefcase, Lock, Globe } from "lucide-react"
import FeatureCard from "./FeatureCard"

const features = [
    {
        icon: Search,
        title: "Procura Inteligente",
        description: "Encontre oportunidades perfeitas com filtros avançados e recomendações personalizadas"
    },
    {
        icon: Zap,
        title: "Rápido e Simples",
        description: "Processo de candidatura intuitivo que leva minutos de início a fim"
    },
    {
        icon: BarChart3,
        title: "Análises Detalhadas",
        description: "Acompanhe suas candidaturas e obtenha insights valiosos sobre seu progresso"
    },
    {
        icon: Briefcase,
        title: "Gestão Profissional",
        description: "Crie, publique e gerencie vagas com um dashboard intuitivo e poderoso"
    },
    {
        icon: Lock,
        title: "Segurança Garantida",
        description: "Seus dados estão protegidos com encriptação de nível empresarial"
    },
    {
        icon: Globe,
        title: "Alcance Global",
        description: "Conecte-se com talentos e oportunidades de todo o mundo"
    }
]

export default function FeaturesSection() {
    return (
        <section id="features" className="py-24 px-6 bg-gradient-to-b from-white to-slate-50">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center space-y-4 mb-16">
                    <p className="text-sm font-medium text-blue-700 uppercase tracking-wider">
                        Recursos Principais
                    </p>
                    <h2 className="text-4xl md:text-5xl font-semibold text-slate-900 tracking-tight">
                        Tudo que você precisa
                    </h2>
                    <p className="text-base text-slate-600 max-w-2xl mx-auto font-light leading-relaxed">
                        Uma plataforma completa e integrada para conectar os melhores talentos com as melhores oportunidades
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <FeatureCard
                            key={index}
                            icon={feature.icon}
                            title={feature.title}
                            description={feature.description}
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}
