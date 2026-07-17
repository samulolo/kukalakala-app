import type { ReactNode } from "react"
import Navigation from "@/components/landing/Navigation"
import Footer from "@/components/landing/Footer"

interface LegalPageLayoutProps {
    title: string
    lastUpdated: string
    children: ReactNode
}

export default function LegalPageLayout({ title, lastUpdated, children }: LegalPageLayoutProps) {
    return (
        <div className="bg-white min-h-screen flex flex-col">
            <Navigation />

            <main className="flex-1 pt-32 pb-20 px-6">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight mb-2">
                        {title}
                    </h1>
                    <p className="text-sm text-slate-500 font-light mb-8">
                        Última atualização: {lastUpdated}
                    </p>

                    <div className="mb-10 p-4 rounded-xl bg-amber-50 border border-amber-100 text-sm text-amber-800 font-light leading-relaxed">
                        Este documento tem fins informativos e não substitui aconselhamento jurídico.
                        Recomendamos revisão por um advogado antes de o considerar juridicamente vinculativo.
                    </div>

                    <div className="space-y-10 text-slate-700 font-light leading-relaxed [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-slate-900 [&_h2]:mb-3 [&_h2]:tracking-tight [&_p]:mb-3 [&_ul]:mb-3 [&_ul]:space-y-1.5 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:text-slate-600 [&_strong]:font-medium [&_strong]:text-slate-900 [&_a]:text-blue-700 [&_a]:hover:text-blue-800">
                        {children}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
