import Link from "next/link"

interface FooterLink {
    label: string
    href: string
}

interface FooterSection {
    title: string
    links: FooterLink[]
}

const footerSections: FooterSection[] = [
    {
        title: "Produto",
        links: [
            { label: "Recursos", href: "#" },
            { label: "Preços", href: "#" },
            { label: "Segurança", href: "#" }
        ]
    },
    {
        title: "Empresa",
        links: [
            { label: "Sobre", href: "/sobre" },
            { label: "Blog", href: "#" },
            { label: "Contato", href: "/contato" }
        ]
    },
    {
        title: "Legal",
        links: [
            { label: "Privacidade", href: "/privacidade" },
            { label: "Termos", href: "/termos" },
            { label: "Cookies", href: "/privacidade#cookies" }
        ]
    }
]

export default function Footer() {
    return (
        <footer className="bg-slate-900 text-slate-400 py-12 px-6">
            <div className="max-w-6xl mx-auto">
                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="space-y-3">
                        <Link href="/" className="text-lg font-semibold text-white block">
                            Kukalakala
                        </Link>
                        <p className="text-sm leading-relaxed font-light">
                            Conectando os melhores talentos com as melhores oportunidades.
                        </p>
                    </div>

                    {/* Links */}
                    {footerSections.map((section, index) => (
                        <div key={index}>
                            <h3 className="font-medium text-white mb-4 text-sm uppercase tracking-wider">
                                {section.title}
                            </h3>
                            <ul className="space-y-3">
                                {section.links.map((link, linkIndex) => (
                                    <li key={linkIndex}>
                                        <Link
                                            href={link.href}
                                            className="text-sm font-light hover:text-white transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Divider */}
                <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm font-light">
                        &copy; {new Date().getFullYear()} Kukalakala. Todos os direitos reservados.
                    </p>
                    <div className="flex gap-6">
                        <Link href="#" className="text-sm font-light hover:text-white transition-colors">
                            Twitter
                        </Link>
                        <Link
                            href="https://www.linkedin.com/company/136104167/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-light hover:text-white transition-colors"
                        >
                            LinkedIn
                        </Link>
                        <Link href="#" className="text-sm font-light hover:text-white transition-colors">
                            Facebook
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
