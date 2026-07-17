import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function CTASection() {
    return (
        <section className="py-24 px-6">
            <div className="max-w-3xl mx-auto">
                <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-slate-50 border border-slate-200 p-12 md:p-16 text-center space-y-8">
                    <div className="space-y-4">
                        <h2 className="text-4xl md:text-5xl font-semibold text-slate-900 tracking-tight">
                            Pronto para começar?
                        </h2>
                        <p className="text-lg text-slate-600 max-w-xl mx-auto font-light">
                            Milhares de candidatos e empresas já estão encontrando sucesso na Kukalakala. Seja o próximo.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        <Link
                            href="/auth/login?type=candidate"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-800 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg"
                        >
                            Sou Candidato
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                            href="/auth/register?type=company"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-slate-300 text-slate-900 font-medium rounded-lg hover:border-slate-400 hover:bg-white transition-all duration-200"
                        >
                            Sou Empresa
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}
