"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { LayoutDashboard, Menu, X } from "lucide-react"

interface MobileMenuProps {
    isLoggedIn: boolean
    dashboardHref: string
    dashboardLabel: string
}

const navLinks = [
    { href: "/#features", label: "Recursos" },
    { href: "/vagas", label: "Vagas" },
    { href: "/#how-it-works", label: "Como Funciona" }
]

export default function MobileMenu({ isLoggedIn, dashboardHref, dashboardLabel }: MobileMenuProps) {
    const [open, setOpen] = useState(false)
    const close = () => setOpen(false)

    // Impede o scroll do fundo enquanto o menu está aberto.
    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : ""
        return () => {
            document.body.style.overflow = ""
        }
    }, [open])

    return (
        <div className="md:hidden">
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                aria-label={open ? "Fechar menu" : "Abrir menu"}
                aria-expanded={open}
                className="relative z-50 inline-flex items-center justify-center w-9 h-9 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
            >
                <Menu
                    className={`w-5 h-5 absolute transition-all duration-200 ${
                        open ? "opacity-0 rotate-90 scale-75" : "opacity-100 rotate-0 scale-100"
                    }`}
                    strokeWidth={1.75}
                />
                <X
                    className={`w-5 h-5 absolute transition-all duration-200 ${
                        open ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-75"
                    }`}
                    strokeWidth={1.75}
                />
            </button>

            {/* Backdrop */}
            <div
                onClick={() => setOpen(false)}
                aria-hidden="true"
                className={`fixed inset-0 top-[65px] bg-slate-900/20 backdrop-blur-[1px] transition-opacity duration-300 ${
                    open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
            />

            {/* Painel — posicionado relativamente ao <nav> (fixed), que já
                atua como bloco de posicionamento para este "absolute". */}
            <div
                className={`absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-lg overflow-hidden transition-all duration-300 ease-in-out ${
                    open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
            >
                <div className="px-6 py-4 flex flex-col gap-1">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={close}
                            className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-700 transition-colors"
                        >
                            {link.label}
                        </Link>
                    ))}

                    <div className="h-px bg-slate-100 my-2" />

                    {isLoggedIn ? (
                        <Link
                            href={dashboardHref}
                            onClick={close}
                            className="inline-flex items-center gap-2 justify-center text-sm font-medium text-white bg-blue-700 px-4 py-3 rounded-lg hover:bg-blue-800 transition-colors"
                        >
                            <LayoutDashboard className="w-4 h-4" strokeWidth={1.75} />
                            {dashboardLabel}
                        </Link>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <Link
                                href="/auth/login"
                                onClick={close}
                                className="text-center text-sm font-medium text-slate-900 px-4 py-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                            >
                                Entrar
                            </Link>
                            <Link
                                href="/auth/register"
                                onClick={close}
                                className="text-center text-sm font-medium text-white bg-blue-700 px-4 py-3 rounded-lg hover:bg-blue-800 transition-colors"
                            >
                                Registar empresa
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
