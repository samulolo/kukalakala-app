"use client"

import { useMemo, useState } from "react"
import { Plus, Pencil, Trash2, Users, Pause, Play, Search } from "lucide-react"
import type { CompanyJob } from "@/lib/supabase/company-jobs"
import { deleteJob, toggleJobActive } from "./actions"
import JobFormDrawer from "./JobFormDrawer"

type StatusFilter = "all" | "active" | "paused"

export default function VagasEmpresaClient({ jobs }: { jobs: CompanyJob[] }) {
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [editingJob, setEditingJob] = useState<CompanyJob | null>(null)
    const [busyId, setBusyId] = useState<string | null>(null)
    const [query, setQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")

    const filteredJobs = useMemo(() => {
        const q = query.trim().toLowerCase()

        return jobs.filter((job) => {
            if (statusFilter === "active" && !job.isActive) return false
            if (statusFilter === "paused" && job.isActive) return false

            if (!q) return true
            return [job.title, job.location, job.category, job.type]
                .join(" ")
                .toLowerCase()
                .includes(q)
        })
    }, [jobs, query, statusFilter])

    const openCreate = () => {
        setEditingJob(null)
        setDrawerOpen(true)
    }

    const openEdit = (job: CompanyJob) => {
        setEditingJob(job)
        setDrawerOpen(true)
    }

    const handleToggleActive = async (job: CompanyJob) => {
        setBusyId(job.id)
        await toggleJobActive(job.id, !job.isActive)
        setBusyId(null)
    }

    const handleDelete = async (job: CompanyJob) => {
        if (!window.confirm(`Eliminar a vaga "${job.title}"? Esta ação não pode ser desfeita.`)) return
        setBusyId(job.id)
        await deleteJob(job.id)
        setBusyId(null)
    }

    const selectClass =
        "px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-colors"

    return (
        <>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={1.5} />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Procurar por título, localização ou categoria"
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-colors"
                    />
                </div>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                    className={`${selectClass} flex-shrink-0`}
                >
                    <option value="all">Todos os estados</option>
                    <option value="active">Ativas</option>
                    <option value="paused">Pausadas</option>
                </select>

                <button
                    type="button"
                    onClick={openCreate}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-700 text-white text-sm font-medium hover:bg-blue-800 transition-colors flex-shrink-0"
                >
                    <Plus className="w-4 h-4" strokeWidth={2} />
                    Nova vaga
                </button>
            </div>

            <div className="p-2 sm:p-4 rounded-2xl border border-slate-200 bg-white shadow-sm">
                {jobs.length > 0 ? (
                    filteredJobs.length > 0 ? (
                        <ul className="divide-y divide-slate-100 px-2">
                            {filteredJobs.map((job) => (
                                <li key={job.id} className="py-4 flex items-center gap-4">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium text-slate-900 truncate">{job.title}</p>
                                            <span
                                                className={`px-2 py-0.5 rounded-full text-[11px] font-medium flex-shrink-0 ${
                                                    job.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                                                }`}
                                            >
                                                {job.isActive ? "Ativa" : "Pausada"}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 font-light truncate">
                                            {job.location} · {job.type} · {job.postedAt}
                                        </p>
                                    </div>

                                    <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 font-light flex-shrink-0">
                                        <Users className="w-3.5 h-3.5" strokeWidth={1.5} />
                                        {job.applicantCount}
                                    </div>

                                    <div className="flex-shrink-0 flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => handleToggleActive(job)}
                                            disabled={busyId === job.id}
                                            aria-label={job.isActive ? `Pausar ${job.title}` : `Retomar ${job.title}`}
                                            title={job.isActive ? "Pausar" : "Retomar"}
                                            className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
                                        >
                                            {job.isActive ? (
                                                <Pause className="w-4.5 h-4.5" strokeWidth={1.75} />
                                            ) : (
                                                <Play className="w-4.5 h-4.5" strokeWidth={1.75} />
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => openEdit(job)}
                                            aria-label={`Editar ${job.title}`}
                                            title="Editar"
                                            className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-slate-400 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                                        >
                                            <Pencil className="w-4.5 h-4.5" strokeWidth={1.75} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(job)}
                                            disabled={busyId === job.id}
                                            aria-label={`Eliminar ${job.title}`}
                                            title="Eliminar"
                                            className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                                        >
                                            <Trash2 className="w-4.5 h-4.5" strokeWidth={1.75} />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-16">
                            <p className="text-slate-600 font-light text-sm">
                                Nenhuma vaga encontrada
                            </p>
                        </div>
                    )
                ) : (
                    <div className="text-center py-16">
                        <p className="text-slate-600 font-light text-sm mb-3">
                            Ainda não publicaste nenhuma vaga
                        </p>
                        <button
                            type="button"
                            onClick={openCreate}
                            className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:text-blue-800 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Criar a primeira vaga
                        </button>
                    </div>
                )}
            </div>

            <JobFormDrawer job={editingJob} isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
        </>
    )
}
