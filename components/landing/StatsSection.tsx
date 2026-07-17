interface Stat {
    value: string
    label: string
}

const stats: Stat[] = [
    { value: "50K+", label: "Candidatos Ativos" },
    { value: "5K+", label: "Empresas Parceiras" },
    { value: "100K+", label: "Vagas Preenchidas" }
]

export default function StatsSection() {
    return (
        <section className="py-24 px-6 bg-gradient-to-r from-blue-700 to-blue-800">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {stats.map((stat, index) => (
                        <div key={index} className="text-center space-y-2">
                            <p className="text-5xl md:text-6xl font-semibold text-white tracking-tight">
                                {stat.value}
                            </p>
                            <p className="text-blue-100 font-light">
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
