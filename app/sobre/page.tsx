import type { Metadata } from "next"
import Image from "next/image"
import { ShieldCheck, Sparkles, Users, MessageCircleHeart } from "lucide-react"
import Navigation from "@/components/landing/Navigation"
import Footer from "@/components/landing/Footer"
import CTASection from "@/components/landing/CTASection"
import Reveal from "@/components/landing/Reveal"

export const metadata: Metadata = {
    title: "Sobre",
    description: "Porque criámos a Kukalakala e como estamos a ligar candidatos e empresas em Angola.",
    alternates: { canonical: "/sobre" }
}

const pillars = [
    {
        icon: Users,
        title: "Para candidatos",
        description: "Um perfil profissional, candidaturas num clique e feedback claro sobre o que melhorar em cada oportunidade."
    },
    {
        icon: Sparkles,
        title: "Com apoio de IA",
        description: "Cada candidatura vem com uma análise de compatibilidade — para o candidato perceber onde está, e para a empresa poupar tempo a triar."
    },
    {
        icon: ShieldCheck,
        title: "Para empresas",
        description: "Publicar vagas, gerir candidaturas e agendar entrevistas num só lugar, com um selo de verificação que dá confiança a quem se candidata."
    }
]

const principles = [
    {
        title: "Verificação real",
        description: "Empresas submetem documentos e são revistas antes de ganharem o selo \"Verificada\" — não é um selo automático."
    },
    {
        title: "Pensada para Angola",
        description: "Do WhatsApp aos números de telefone locais, construída à volta de como as pessoas realmente comunicam aqui."
    },
    {
        title: "Transparência no processo",
        description: "Candidato e empresa falam diretamente na plataforma — sem se perder em emails ou grupos desorganizados."
    }
]

export default function SobrePage() {
    return (
        <div className="bg-white min-h-screen flex flex-col">
            <Navigation />

            <main className="flex-1">
                {/* Intro */}
                <section className="pt-40 pb-20 px-6">
                    <div className="max-w-3xl mx-auto text-center space-y-6">
                        <p className="text-sm font-medium text-blue-700 uppercase tracking-wider">
                            Sobre a Kukalakala
                        </p>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-slate-900 leading-tight">
                            A ligar Angola ao trabalho certo
                        </h1>
                        <p className="text-lg text-slate-600 leading-relaxed font-light max-w-2xl mx-auto">
                            Nascemos de um problema simples de identificar e difícil de resolver: empresas que não
                            encontram as pessoas certas, e candidatos qualificados que nunca chegam a ser vistos.
                        </p>
                    </div>
                </section>

                {/* Porque existimos */}
                <section className="py-16 px-6 bg-slate-50">
                    <div className="max-w-6xl mx-auto">
                        <Reveal className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <div>
                                <p className="text-sm font-medium text-blue-700 uppercase tracking-wider mb-4">
                                    Porque existimos
                                </p>
                                <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-6 leading-tight tracking-tight">
                                    Demasiado se perde entre emails e grupos de WhatsApp
                                </h2>
                                <p className="text-base text-slate-600 mb-4 leading-relaxed font-light">
                                    A maior parte dos processos de recrutamento em Angola ainda acontece de forma
                                    dispersa: vagas partilhadas em grupos, CVs perdidos numa caixa de entrada, entrevistas
                                    marcadas e esquecidas por trocas de mensagens que ninguém revê a tempo.
                                </p>
                                <p className="text-base text-slate-600 leading-relaxed font-light">
                                    A Kukalakala junta tudo isso num único lugar — para a empresa encontrar quem
                                    procura mais depressa, e para o candidato deixar de ser apenas mais um CV ignorado.
                                </p>

                                <div className="mt-8 p-5 rounded-xl border border-blue-100 bg-blue-50/50">
                                    <p className="text-sm text-slate-700 leading-relaxed font-light italic">
                                        &ldquo;Prefiro lançar agora e evoluir com quem realmente vai usar, do que
                                        esperar pela versão perfeita.&rdquo;
                                    </p>
                                    <p className="text-xs text-slate-500 mt-2 font-medium">— Nota do fundador</p>
                                </div>
                            </div>

                            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-slate-200 shadow-lg shadow-slate-200/50">
                                <Image
                                    src="https://images.unsplash.com/photo-1573496130407-57329f01f769?auto=format&fit=crop&w=900&q=80"
                                    alt="Equipa a colaborar em torno de uma mesa"
                                    fill
                                    sizes="(min-width: 1024px) 40vw, 90vw"
                                    className="object-cover"
                                />
                            </div>
                        </Reveal>
                    </div>
                </section>

                {/* O que fazemos */}
                <section className="py-24 px-6">
                    <div className="max-w-6xl mx-auto">
                        <Reveal className="text-center space-y-4 mb-16">
                            <p className="text-sm font-medium text-blue-700 uppercase tracking-wider">
                                O que fazemos
                            </p>
                            <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight">
                                Uma plataforma, os dois lados do mercado
                            </h2>
                        </Reveal>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {pillars.map((pillar, index) => (
                                <Reveal key={pillar.title} delay={index * 100}>
                                    <div className="h-full p-8 rounded-xl border border-slate-200 hover:border-blue-200 hover:bg-blue-50/30 hover:-translate-y-1.5 hover:shadow-lg hover:shadow-blue-100/60 transition-all duration-300">
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-50 mb-4">
                                            <pillar.icon className="w-6 h-6 text-blue-700" strokeWidth={1.5} />
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                            {pillar.title}
                                        </h3>
                                        <p className="text-sm text-slate-600 leading-relaxed font-light">
                                            {pillar.description}
                                        </p>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Princípios */}
                <section className="py-24 px-6 bg-slate-50">
                    <div className="max-w-6xl mx-auto">
                        <Reveal className="text-center space-y-4 mb-16">
                            <p className="text-sm font-medium text-blue-700 uppercase tracking-wider">
                                Como trabalhamos
                            </p>
                            <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight">
                                Os nossos princípios
                            </h2>
                        </Reveal>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {principles.map((principle, index) => (
                                <Reveal key={principle.title} delay={index * 100} className="p-8 rounded-xl bg-white border border-slate-200">
                                    <MessageCircleHeart className="w-6 h-6 text-blue-700 mb-4" strokeWidth={1.5} />
                                    <h3 className="text-base font-semibold text-slate-900 mb-2">
                                        {principle.title}
                                    </h3>
                                    <p className="text-sm text-slate-600 leading-relaxed font-light">
                                        {principle.description}
                                    </p>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>

                <CTASection />
            </main>

            <Footer />
        </div>
    )
}
