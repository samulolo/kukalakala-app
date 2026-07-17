import Link from "next/link"
import { Check } from "lucide-react"
import { ReactNode } from "react"

interface Benefit {
    title: string
    description: string
}

interface UserTypeSectionProps {
    type: "candidate" | "company"
    title: string
    description: string
    benefits: Benefit[]
    ctaText: string
    ctaLink: string
    illustration: ReactNode
    caption: string
}

export default function UserTypeSection({
    type,
    title,
    description,
    benefits,
    ctaText,
    ctaLink,
    illustration,
    caption
}: UserTypeSectionProps) {
    const isCandidate = type === "candidate"

    return (
        <section className={`py-24 px-6 ${!isCandidate ? "bg-slate-50" : ""}`}>
            <div className="max-w-6xl mx-auto">
                <div className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center ${!isCandidate ? "lg:grid-cols-2" : ""}`}>
                    {/* Content */}
                    <div className={!isCandidate ? "lg:order-2" : ""}>
                        <p className="text-sm font-medium text-blue-700 uppercase tracking-wider mb-4">
                            {isCandidate ? "Para Candidatos" : "Para Empresas"}
                        </p>

                        <h2 className="text-4xl md:text-5xl font-semibold text-slate-900 mb-6 leading-tight tracking-tight">
                            {title}
                        </h2>

                        <p className="text-lg text-slate-600 mb-8 leading-relaxed font-light">
                            {description}
                        </p>

                        {/* Benefits */}
                        <ul className="space-y-5 mb-8">
                            {benefits.map((benefit, index) => (
                                <li key={index} className="flex gap-4">
                                    <div className="flex-shrink-0 mt-1">
                                        <Check className="w-5 h-5 text-blue-700" strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-slate-900 mb-1">
                                            {benefit.title}
                                        </h4>
                                        <p className="text-slate-600 text-sm font-light">
                                            {benefit.description}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        {/* CTA */}
                        <Link
                            href={ctaLink}
                            className="inline-block px-8 py-3 bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-800 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg"
                        >
                            {ctaText}
                        </Link>
                    </div>

                    {/* Visual */}
                    <div className={!isCandidate ? "lg:order-1" : ""}>
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl aspect-square p-8 border border-blue-200">
                            {illustration}
                        </div>
                        <p className="text-center text-sm text-slate-500 font-light mt-4 tracking-tight">
                            {caption}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}
