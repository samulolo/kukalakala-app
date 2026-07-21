"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ShieldCheck, Users, BarChart3 } from "lucide-react"

const navItems = [
    { label: "Verificações", href: "/admin", icon: ShieldCheck },
    { label: "Utilizadores", href: "/admin/utilizadores", icon: Users },
    { label: "Métricas", href: "/admin/metricas", icon: BarChart3 }
]

export default function AdminNav() {
    const pathname = usePathname()

    return (
        <nav className="flex items-center gap-1">
            {navItems.map((item) => {
                const active = pathname === item.href
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            active ? "bg-blue-50 text-blue-700" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                        }`}
                    >
                        <item.icon className="w-4 h-4" strokeWidth={1.75} />
                        {item.label}
                    </Link>
                )
            })}
        </nav>
    )
}
