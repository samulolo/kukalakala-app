"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, ArrowLeft, ChevronRight } from "lucide-react"
import { navItems } from "./nav-items"

interface MobileNavDrawerProps {
    companyName: string
    email: string
}

// Com 8 itens no menu, a antiga barra fixa no fundo (um item por
// coluna) ficava demasiado apertada em ecrãs pequenos. Em vez disso,
// um único botão abre este menu de lado — o mesmo conteúdo da Sidebar
// de desktop, só que escondido por omissão em mobile.
export default function MobileNavDrawer({ companyName, email }: MobileNavDrawerProps) {
    const pathname = usePathname()
    const [open, setOpen] = useState(false)
    const initials = companyName.slice(0, 2).toUpperCase()

    return (
        <div className="md:hidden">
            <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Abrir menu"
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
                <Menu className="w-5 h-5" strokeWidth={1.75} />
            </button>

            <div
                onClick={() => setOpen(false)}
                aria-hidden="true"
                className={`fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-[1px] transition-opacity duration-300 ${
                    open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
            />

            <aside
                role="dialog"
                aria-modal="true"
                aria-label="Menu"
                className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[80vw] bg-white border-r border-slate-200 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
                    open ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="flex items-center justify-between px-5 py-5">
                    <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-700 text-white text-sm font-semibold">
                            K
                        </span>
                        <span className="text-base font-semibold tracking-tight text-slate-900">
                            Kukalakala
                        </span>
                    </Link>
                    <button
                        type="button"
                        onClick={() => setOpen(false)}
                        aria-label="Fechar menu"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                        <X className="w-4.5 h-4.5" strokeWidth={1.75} />
                    </button>
                </div>

                <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        const Icon = item.icon
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className={`relative flex items-center gap-3 pl-4 pr-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                    isActive
                                        ? "bg-blue-50 text-blue-700"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                }`}
                            >
                                {isActive && (
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-full bg-blue-700" />
                                )}
                                <Icon className="w-4.5 h-4.5" strokeWidth={1.75} />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                <div className="px-3 pb-3">
                    <Link
                        href="/"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 pl-4 pr-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                        <ArrowLeft className="w-4.5 h-4.5" strokeWidth={1.75} />
                        Voltar ao site
                    </Link>
                </div>

                <Link
                    href="/empresa/perfil"
                    onClick={() => setOpen(false)}
                    className="mx-3 mb-4 flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-700 text-white text-xs font-semibold flex-shrink-0">
                        {initials}
                    </span>
                    <span className="min-w-0 flex-1">
                        <span className="block text-xs font-medium text-slate-900 truncate">{companyName}</span>
                        <span className="block text-xs text-slate-400 font-light truncate">{email}</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" strokeWidth={1.75} />
                </Link>
            </aside>
        </div>
    )
}
