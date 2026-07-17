"use client"

import { X, Heart, Trash2 } from "lucide-react"
import { useFavoritesDrawer } from "./FavoritesDrawerContext"
import { useApplications } from "./ApplicationsContext"

export default function FavoritesDrawer() {
    const { isOpen, close, savedJobs, toggleSaved } = useFavoritesDrawer()
    const { appliedJobIds, apply } = useApplications()

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={close}
                aria-hidden="true"
                className={`fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-[1px] transition-opacity duration-300 ${
                    isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
            />

            {/* Panel */}
            <aside
                role="dialog"
                aria-modal="true"
                aria-label="Vagas favoritas"
                className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[26rem] bg-white border-l border-slate-200 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
                    isOpen ? "translate-x-0" : "translate-x-full"
                }`}
            >
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <Heart className="w-4.5 h-4.5 text-blue-700" strokeWidth={1.75} fill="currentColor" />
                        <div>
                            <h2 className="text-sm font-semibold text-slate-900">Vagas favoritas</h2>
                            <p className="text-xs text-slate-500 font-light">{savedJobs.length} guardadas</p>
                        </div>
                    </div>
                    <button
                        onClick={close}
                        aria-label="Fechar"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                        <X className="w-4.5 h-4.5" strokeWidth={1.75} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-5">
                    {savedJobs.length > 0 ? (
                        <ul className="divide-y divide-slate-100">
                            {savedJobs.map((job) => {
                                const applied = appliedJobIds.has(job.id)
                                return (
                                    <li key={job.id} className="py-4 flex items-start gap-3">
                                        <span className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-lg bg-blue-700 text-white text-sm font-semibold">
                                            {job.company.charAt(0)}
                                        </span>

                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-slate-900 truncate">{job.title}</p>
                                            <p className="text-xs text-slate-500 font-light truncate">
                                                {job.company} · {job.location}
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => apply(job.id)}
                                                disabled={applied}
                                                className={`mt-1.5 text-xs font-medium transition-colors ${
                                                    applied ? "text-emerald-600 cursor-default" : "text-blue-700 hover:text-blue-800"
                                                }`}
                                            >
                                                {applied ? "Candidatura enviada" : "Candidatar-se"}
                                            </button>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => toggleSaved(job)}
                                            aria-label={`Remover ${job.title} dos favoritos`}
                                            title="Remover dos favoritos"
                                            className="flex-shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <Trash2 className="w-4.5 h-4.5" strokeWidth={1.75} />
                                        </button>
                                    </li>
                                )
                            })}
                        </ul>
                    ) : (
                        <div className="text-center py-16">
                            <Heart className="w-8 h-8 text-slate-300 mx-auto mb-3" strokeWidth={1.5} />
                            <p className="text-slate-600 font-light text-sm">
                                Ainda não guardaste nenhuma vaga
                            </p>
                        </div>
                    )}
                </div>
            </aside>
        </>
    )
}
