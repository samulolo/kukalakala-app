import Link from "next/link"
import { ArrowRight } from "lucide-react"
import Reveal from "./Reveal"

export default function CTASection() {
    return (
        <section className="py-24 px-6">
            <div className="max-w-3xl mx-auto">
                <Reveal className="relative rounded-2xl bg-gradient-to-br from-blue-50 to-slate-50 border border-slate-200 p-12 md:p-16 text-center space-y-8 overflow-hidden">
                    <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-blue-200/30 blur-3xl pointer-events-none" />
                    <div className="relative space-y-4">
                        <h2 className="text-4xl md:text-5xl font-semibold text-slate-900 tracking-tight">
                            Pronto para começar?
                        </h2>
                        <p className="text-lg text-slate-600 max-w-xl mx-auto font-light">
                            Candidatos encontram vagas relevantes, com feedback de IA em cada candidatura. Empresas encontram os candidatos certos, mais rápido. Sê dos primeiros.
                        </p>
                    </div>

                    <div className="relative flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        <Link
                            href="/auth/login?type=candidate"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-800 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg"
                        >
                            Sou Candidato
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                            href="/auth/register?type=company"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-slate-300 text-slate-900 font-medium rounded-lg hover:border-slate-400 hover:bg-white transition-all duration-200 transform hover:-translate-y-0.5"
                        >
                            Sou Empresa
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </Reveal>
            </div>
        </section>
    )
}
