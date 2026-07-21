import type { Metadata } from "next"
import Navigation from "@/components/landing/Navigation"
import Footer from "@/components/landing/Footer"
import ContactForm from "./ContactForm"

export const metadata: Metadata = {
    title: "Contacto",
    description: "Fala com a equipa da Kukalakala — tira dúvidas, sugere melhorias ou pede ajuda.",
    alternates: { canonical: "/contato" }
}

export default function ContatoPage() {
    return (
        <div className="bg-white min-h-screen flex flex-col">
            <Navigation />

            <main className="flex-1">
                <section className="pt-40 pb-24 px-6">
                    <div className="max-w-xl mx-auto">
                        <div className="text-center space-y-4 mb-12">
                            <p className="text-sm font-medium text-blue-700 uppercase tracking-wider">Contacto</p>
                            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-slate-900 leading-tight">
                                Fala connosco
                            </h1>
                            <p className="text-base text-slate-600 leading-relaxed font-light">
                                Dúvidas, sugestões ou algo que não está a funcionar como devia — escreve-nos e
                                respondemos o mais rápido possível.
                            </p>
                        </div>

                        <ContactForm />
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}
