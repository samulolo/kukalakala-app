"use client"

import { useMemo, useState } from "react"
import { Search, Eye } from "lucide-react"
import type { AdminUserSummary, AdminUserType } from "@/lib/supabase/admin"
import AdminUserDetailDrawer from "./AdminUserDetailDrawer"

interface AdminUsersClientProps {
    users: AdminUserSummary[]
}

const typeLabel: Record<AdminUserType, string> = { candidato: "Candidato", empresa: "Empresa" }
const typeBadgeClass: Record<AdminUserType, string> = {
    candidato: "bg-blue-50 text-blue-700",
    empresa: "bg-violet-50 text-violet-700"
}
const verificationLabel: Record<string, string> = {
    verificado: "Verificada",
    pendente: "Pendente",
    rejeitado: "Rejeitada",
    nao_verificado: "Não verificada"
}

export default function AdminUsersClient({ users }: AdminUsersClientProps) {
    const [query, setQuery] = useState("")
    const [typeFilter, setTypeFilter] = useState<"all" | AdminUserType>("all")
    const [selected, setSelected] = useState<AdminUserSummary | null>(null)

    const candidateCount = users.filter((u) => u.type === "candidato").length
    const companyCount = users.filter((u) => u.type === "empresa").length

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        return users.filter((u) => {
            if (typeFilter !== "all" && u.type !== typeFilter) return false
            if (!q) return true
            return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
        })
    }, [users, query, typeFilter])

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[220px] max-w-sm">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={1.5} />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Procurar por nome ou email"
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-colors"
                    />
                </div>

                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as "all" | AdminUserType)}
                    className="px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-colors"
                >
                    <option value="all">Todos ({users.length})</option>
                    <option value="candidato">Candidatos ({candidateCount})</option>
                    <option value="empresa">Empresas ({companyCount})</option>
                </select>

                <span className="text-xs text-slate-400 font-light ml-auto">
                    {filtered.length} {filtered.length === 1 ? "resultado" : "resultados"}
                </span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                {filtered.length > 0 ? (
                    <ul className="divide-y divide-slate-100">
                        {filtered.map((user) => (
                            <li key={`${user.type}-${user.id}`} className="px-5 py-4 flex items-center gap-3">
                                <span className="flex-shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold">
                                    {user.name.charAt(0)}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
                                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${typeBadgeClass[user.type]}`}>
                                            {typeLabel[user.type]}
                                        </span>
                                        {user.verificationStatus && (
                                            <span className="inline-flex px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs font-medium flex-shrink-0">
                                                {verificationLabel[user.verificationStatus] ?? user.verificationStatus}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500 font-light truncate">{user.email || "Sem email"}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelected(user)}
                                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-blue-700 hover:bg-blue-50 transition-colors flex-shrink-0"
                                >
                                    <Eye className="w-4 h-4" strokeWidth={1.75} />
                                    Ver detalhes
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-slate-400 font-light py-16 text-center">Nenhum utilizador encontrado</p>
                )}
            </div>

            <AdminUserDetailDrawer user={selected} onClose={() => setSelected(null)} />
        </div>
    )
}
