interface Step {
    number: number
    title: string
    description: string
}

const steps: Step[] = [
    {
        number: 1,
        title: "Criar Conta",
        description: "Registre-se em minutos. Escolha se é candidato ou empresa e complete seu perfil."
    },
    {
        number: 2,
        title: "Explorar",
        description: "Candidatos procuram vagas. Empresas publicam oportunidades e recebem candidaturas."
    },
    {
        number: 3,
        title: "Conectar",
        description: "Inicie conversas, avalie candidatos e feche a melhor oportunidade para ambos."
    }
]

export default function HowItWorksSection() {
    return (
        <section id="how-it-works" className="py-16 px-6 bg-slate-50">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center space-y-2 mb-10">
                    <p className="text-xs font-medium text-blue-700 uppercase tracking-wider">
                        Processo Simples
                    </p>
                    <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight">
                        Como funciona
                    </h2>
                    <p className="text-sm text-slate-600 max-w-xl mx-auto font-light">
                        Três passos simples para começar sua jornada
                    </p>
                </div>

                {/* Steps */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {steps.map((step) => (
                        <div key={step.number} className="relative">
                            {/* Connector Line (hidden on mobile) */}
                            {step.number < 3 && (
                                <div className="hidden md:block absolute top-6 left-[60%] w-[calc(100%+24px)] h-0.5 bg-gradient-to-r from-blue-300 to-blue-50" />
                            )}

                            {/* Step Card */}
                            <div className="relative z-10 text-center space-y-2">
                                {/* Step Number */}
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white font-semibold text-base mx-auto shadow-md">
                                    {step.number}
                                </div>

                                {/* Content */}
                                <div>
                                    <h3 className="text-base font-semibold text-slate-900 mb-1">
                                        {step.title}
                                    </h3>
                                    <p className="text-slate-600 text-xs leading-relaxed font-light">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
