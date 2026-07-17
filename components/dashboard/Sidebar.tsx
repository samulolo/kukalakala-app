"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowLeft, ChevronRight } from "lucide-react"
import { navItems } from "./nav-items"

export default function Sidebar({ email }: { email: string }) {
    const pathname = usePathname()
    const initials = email.slice(0, 2).toUpperCase()

    return (
        <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-slate-200 bg-white">
            <div className="px-5 py-6">
                <Link href="/" className="flex items-center gap-2.5">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-700 text-white text-sm font-semibold">
                        K
                    </span>
                    <span className="text-base font-semibold tracking-tight text-slate-900">
                        Kukalakala
                    </span>
                </Link>
            </div>

            <nav className="flex-1 px-3 space-y-0.5">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
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
                    className="flex items-center gap-3 pl-4 pr-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                    <ArrowLeft className="w-4.5 h-4.5" strokeWidth={1.75} />
                    Voltar ao site
                </Link>
            </div>

            <Link
                href="/dashboard/perfil"
                className="mx-3 mb-4 flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            >
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-700 text-white text-xs font-semibold flex-shrink-0">
                    {initials}
                </span>
                <span className="min-w-0 flex-1">
                    <span className="block text-xs font-medium text-slate-900 truncate">{email}</span>
                    <span className="block text-xs text-slate-400 font-light">Ver perfil</span>
                </span>
                <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" strokeWidth={1.75} />
            </Link>
        </aside>
    )
}
