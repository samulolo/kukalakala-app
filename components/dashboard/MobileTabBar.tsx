"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { navItems } from "./nav-items"

export default function MobileTabBar() {
    const pathname = usePathname()

    return (
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/90 backdrop-blur-xl border-t border-slate-200 flex items-stretch">
            {navItems.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                            isActive ? "text-blue-700" : "text-slate-400"
                        }`}
                    >
                        <Icon className="w-5 h-5" strokeWidth={isActive ? 2 : 1.75} />
                        {item.label}
                    </Link>
                )
            })}
        </nav>
    )
}
