"use client"

import { useState } from "react"
import { Bookmark, BookmarkCheck } from "lucide-react"
import { saveCandidate, unsaveCandidate } from "./actions"

interface SaveToPoolSectionProps {
    candidateId: string
    // null = ainda não guardado; string (mesmo vazia) = já está no pool
    initialNote: string | null
}

// Secção reutilizada nos dois painéis de candidato (candidaturas e
// pesquisa) para guardar alguém no pool da empresa com uma nota — ex:
// "Não contratamos agora mas poderemos apreciar no futuro". Não
// depende de existir uma candidatura: guarda-se pelo candidateId.
export default function SaveToPoolSection({ candidateId, initialNote }: SaveToPoolSectionProps) {
    const [saved, setSaved] = useState(initialNote !== null)
    const [note, setNote] = useState(initialNote ?? "")
    const [editing, setEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")

    const handleSave = async () => {
        setSaving(true)
        setError("")
        const result = await saveCandidate(candidateId, note)
        setSaving(false)
        if (result.error) {
            setError(result.error)
            return
        }
        setSaved(true)
        setEditing(false)
    }

    const handleRemove = async () => {
        setSaving(true)
        setError("")
        const result = await unsaveCandidate(candidateId)
        setSaving(false)
        if (result.error) {
            setError(result.error)
            return
        }
        setSaved(false)
        setNote("")
        setEditing(false)
    }

    const showForm = !saved || editing

    return (
        <div className="mb-6 p-4 rounded-xl border border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                    {saved ? (
                        <BookmarkCheck className="w-4 h-4 text-blue-700 flex-shrink-0" strokeWidth={1.75} />
                    ) : (
                        <Bookmark className="w-4 h-4 text-slate-400 flex-shrink-0" strokeWidth={1.75} />
                    )}
                    Pool de candidatos
                </h4>
                {saved && !editing && (
                    <button
                        type="button"
                        onClick={() => setEditing(true)}
                        className="text-xs font-medium text-blue-700 hover:text-blue-800 flex-shrink-0"
                    >
                        Editar nota
                    </button>
                )}
            </div>

            {!showForm ? (
                <>
                    <p className="text-sm text-slate-600 font-light leading-relaxed whitespace-pre-wrap">
                        {note || "Sem nota."}
                    </p>
                    <button
                        type="button"
                        onClick={handleRemove}
                        disabled={saving}
                        className="mt-2 text-xs font-medium text-rose-600 hover:text-rose-700 disabled:opacity-50"
                    >
                        Remover do pool
                    </button>
                </>
            ) : (
                <>
                    <p className="text-xs text-slate-400 font-light mb-2">
                        Guarda este candidato para reavaliares no futuro, com uma nota — ex: &ldquo;Não contratamos
                        agora mas poderemos apreciar no futuro&rdquo;.
                    </p>
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={3}
                        placeholder="Não contratamos agora mas poderemos apreciar no futuro"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-colors mb-2"
                    />
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving}
                            className="px-3.5 py-1.5 rounded-lg bg-blue-700 text-white text-xs font-medium hover:bg-blue-800 transition-colors disabled:opacity-60"
                        >
                            {saving ? "A guardar..." : saved ? "Guardar nota" : "Guardar no pool"}
                        </button>
                        {editing && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditing(false)
                                    setNote(initialNote ?? "")
                                    setError("")
                                }}
                                className="text-xs font-medium text-slate-500 hover:text-slate-700"
                            >
                                Cancelar
                            </button>
                        )}
                    </div>
                </>
            )}
            {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
        </div>
    )
}
