"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"

type Audience = "candidate" | "company"

interface AudienceContent {
    headlineLead: string
    headlineAccent: string
    subheadline: string
    ctaLabel: string
    ctaLink: string
    secondaryLabel: string
    secondaryLink: string
    imageSrc: string
    imageAlt: string
}

const content: Record<Audience, AudienceContent> = {
    candidate: {
        headlineLead: "Encontre o seu",
        headlineAccent: "próximo desafio",
        subheadline:
            "Explore vagas reais em Angola, candidate-se em segundos e recebe feedback de IA em cada candidatura.",
        ctaLabel: "Sou Candidato",
        ctaLink: "/auth/login?type=candidate",
        secondaryLabel: "Sou Empresa",
        secondaryLink: "/auth/register?type=company",
        imageSrc: "https://images.unsplash.com/photo-1653669485641-8582ad808121?auto=format&fit=crop&w=1200&q=80",
        imageAlt: "Candidato a trabalhar no portátil, a candidatar-se a uma vaga"
    },
    company: {
        headlineLead: "Encontre os melhores",
        headlineAccent: "talentos para a equipa",
        subheadline:
            "Publique vagas, receba candidaturas com análise de IA e contrate mais rápido, com confiança.",
        ctaLabel: "Sou Empresa",
        ctaLink: "/auth/register?type=company",
        secondaryLabel: "Sou Candidato",
        secondaryLink: "/auth/login?type=candidate",
        imageSrc: "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?auto=format&fit=crop&w=1200&q=80",
        imageAlt: "Entrevista de trabalho entre uma empresa e uma candidata"
    }
}

export default function HeroSection() {
    const [audience, setAudience] = useState<Audience>("candidate")
    const current = content[audience]

    return (
        <section className="relative overflow-hidden pt-40 pb-24 px-6">
            <div
                className="absolute -top-40 -right-24 w-[34rem] h-[34rem] rounded-full bg-blue-100/50 blur-3xl pointer-events-none"
                aria-hidden="true"
            />
            <div
                className="absolute top-1/3 -left-40 w-[26rem] h-[26rem] rounded-full bg-blue-50 blur-3xl pointer-events-none"
                aria-hidden="true"
            />
            <div className="relative z-10 max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Content */}
                    <div className="space-y-8">
                        {/* Toggle candidato / empresa */}
                        <div className="inline-flex items-center gap-1 p-1 rounded-full bg-slate-100">
                            <button
                                type="button"
                                onClick={() => setAudience("company")}
                                aria-pressed={audience === "company"}
                                className={`px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wide transition-all duration-200 ${
                                    audience === "company"
                                        ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                                        : "text-blue-700 hover:text-blue-800"
                                }`}
                            >
                                Contratar talento
                            </button>
                            <button
                                type="button"
                                onClick={() => setAudience("candidate")}
                                aria-pressed={audience === "candidate"}
                                className={`px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wide transition-all duration-200 ${
                                    audience === "candidate"
                                        ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                                        : "text-blue-700 hover:text-blue-800"
                                }`}
                            >
                                Ser contratado
                            </button>
                        </div>

                        {/* Headline */}
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-slate-900 leading-tight">
                            {current.headlineLead}
                            <span className="block text-blue-700">{current.headlineAccent}</span>
                        </h1>

                        {/* Subheadline */}
                        <p className="text-lg md:text-xl text-slate-600 max-w-2xl leading-relaxed font-light">
                            {current.subheadline}
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Link
                                href={current.ctaLink}
                                className="px-8 py-4 bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-800 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg text-center"
                            >
                                {current.ctaLabel}
                            </Link>
                            <Link
                                href={current.secondaryLink}
                                className="px-8 py-4 border-2 border-slate-200 text-slate-900 font-medium rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 text-center"
                            >
                                {current.secondaryLabel}
                            </Link>
                        </div>
                    </div>

                    {/* Foto */}
                    <div className="hidden lg:block relative">
                        <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-slate-200 shadow-xl shadow-slate-200/50">
                            <Image
                                src={current.imageSrc}
                                alt={current.imageAlt}
                                fill
                                sizes="(min-width: 1024px) 40vw, 0px"
                                className="object-cover"
                                priority
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
