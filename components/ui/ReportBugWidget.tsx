"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { Bug, X, CheckCircle2 } from "lucide-react"
import { submitBugReport } from "@/lib/actions/bug-report"

// Botão flutuante presente nos dois painéis (candidato e empresa) —
// abre um formulário mínimo (só "o que aconteceu?") para reportar um
// erro. O tipo de utilizador, nome e email são resolvidos no servidor
// a partir da sessão, não pedidos aqui, para manter o formulário curto.
export default function ReportBugWidget() {
    const pathname = usePathname()
    const [open, setOpen] = useState(false)
    const [description, setDescription] = useState("")
    const [sending, setSending] = useState(false)
    const [error, setError] = useState("")
    const [sent, setSent] = useState(false)

    const handleClose = () => {
        setOpen(false)
        // Pequeno atraso para não "piscar" o conteúdo enquanto o painel
        // ainda está a animar para fora.
        setTimeout(() => {
            setDescription("")
            setError("")
            setSent(false)
        }, 300)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setSending(true)
        try {
            const result = await submitBugReport({ description, pageUrl: pathname })
            if (result.error) {
                setError(result.error)
                return
            }
            setSent(true)
        } catch {
            setError("Não foi possível enviar o report, tenta novamente")
        } finally {
            setSending(false)
        }
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-30 inline-flex items-center gap-2 px-4 py-3 rounded-full bg-slate-900 text-white text-sm font-medium shadow-lg hover:bg-slate-800 transition-colors"
            >
                <Bug className="w-4 h-4" strokeWidth={1.75} />
                <span className="hidden sm:inline">Reportar erro</span>
            </button>

            <div
                onClick={handleClose}
                aria-hidden="true"
                className={`fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-[1px] transition-opacity duration-300 ${
                    open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
            />

            <aside
                role="dialog"
                aria-modal="true"
                aria-label="Reportar erro"
                className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[26rem] bg-white border-l border-slate-200 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
                    open ? "translate-x-0" : "translate-x-full"
                }`}
            >
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 flex-shrink-0">
                    <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                        <Bug className="w-4 h-4 text-slate-400" strokeWidth={1.75} />
                        Reportar erro
                    </h2>
                    <button
                        type="button"
                        onClick={handleClose}
                        aria-label="Fechar"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                        <X className="w-4.5 h-4.5" strokeWidth={1.75} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-5">
                    {sent ? (
                        <div className="p-6 rounded-2xl border border-emerald-200 bg-emerald-50 text-center">
                            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-3" strokeWidth={1.75} />
                            <p className="text-sm font-medium text-emerald-900">Report enviado, obrigado.</p>
                            <p className="text-sm text-emerald-700 font-light mt-1">
                                Vamos rever o mais rápido possível.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <p className="text-sm text-slate-500 font-light">
                                Conta-nos o que aconteceu — o que estavas a fazer e o que esperavas que acontecesse.
                            </p>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">O que aconteceu?</label>
                                <textarea
                                    required
                                    autoFocus
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={7}
                                    placeholder="Descreve o erro que encontraste..."
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-colors"
                                />
                            </div>

                            {error && <p className="text-sm text-red-600">{error}</p>}

                            <button
                                type="submit"
                                disabled={sending}
                                className="w-full px-4 py-3 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-60"
                            >
                                {sending ? "A enviar..." : "Enviar report"}
                            </button>
                        </form>
                    )}
                </div>
            </aside>
        </>
    )
}
