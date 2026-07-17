"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { supabase } from "@/supabase/client"

export default function LogoutButton() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleLogout = async () => {
        setLoading(true)
        await supabase.auth.signOut()
        router.replace("/auth/login")
        router.refresh()
    }

    return (
        <button
            onClick={handleLogout}
            disabled={loading}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-red-600 transition-colors disabled:opacity-50"
        >
            <LogOut className="w-4 h-4" strokeWidth={1.75} />
            {loading ? "A sair..." : "Sair"}
        </button>
    )
}
