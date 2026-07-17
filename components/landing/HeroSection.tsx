import Link from "next/link"
import { Sparkles } from "lucide-react"
import HeroIllustration from "./HeroIllustration"

export default function HeroSection() {
    return (
        <section className="pt-40 pb-24 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Content */}
                    <div className="space-y-8">
                        {/* Badge */}
                        <div className="inline-block">
                            <div className="flex items-center gap-2 text-sm font-medium text-blue-700 bg-blue-50 px-4 py-2 rounded-full border border-blue-200">
                                <Sparkles className="w-4 h-4" />
                                Bem-vindo à Kukalakala
                            </div>
                        </div>

                        {/* Headline */}
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-slate-900 leading-tight">
                            A plataforma para conectar
                            <span className="block text-blue-700">talentos e oportunidades</span>
                        </h1>

                        {/* Subheadline */}
                        <p className="text-lg md:text-xl text-slate-600 max-w-2xl leading-relaxed font-light">
                            Empresas contratam os melhores talentos. Candidatos encontram as melhores oportunidades. Tudo em um só lugar.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Link
                                href="/auth/register?type=candidate"
                                className="px-8 py-4 bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-800 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg text-center"
                            >
                                Sou Candidato
                            </Link>
                            <Link
                                href="/auth/register?type=company"
                                className="px-8 py-4 border-2 border-slate-200 text-slate-900 font-medium rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 text-center"
                            >
                                Sou Empresa
                            </Link>
                        </div>
                    </div>

                    {/* Illustration */}
                    <div className="hidden lg:block">
                        <HeroIllustration />
                    </div>
                </div>
            </div>
        </section>
    )
}
