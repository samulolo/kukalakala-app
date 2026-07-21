"use client"

import { useState } from "react"
import { CheckCircle2 } from "lucide-react"
import { submitContactMessage } from "@/lib/actions/contact"

const inputClass =
    "w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-colors"

export default function ContactForm() {
    const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" })
    const [sending, setSending] = useState(false)
    const [error, setError] = useState("")
    const [sent, setSent] = useState(false)

    const handleChange = (field: keyof typeof form) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setSending(true)
        try {
            const result = await submitContactMessage(form)
            if (result.error) {
                setError(result.error)
                return
            }
            setSent(true)
        } catch {
            setError("Não foi possível enviar a mensagem, tenta novamente")
        } finally {
            setSending(false)
        }
    }

    if (sent) {
        return (
            <div className="p-8 rounded-2xl border border-emerald-200 bg-emerald-50 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-3" strokeWidth={1.75} />
                <p className="text-sm font-medium text-emerald-900">Mensagem enviada com sucesso.</p>
                <p className="text-sm text-emerald-700 font-light mt-1">
                    Vamos responder-te o mais rápido possível.
                </p>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Nome</label>
                    <input
                        type="text"
                        required
                        value={form.name}
                        onChange={handleChange("name")}
                        placeholder="O teu nome"
                        className={inputClass}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                    <input
                        type="email"
                        required
                        value={form.email}
                        onChange={handleChange("email")}
                        placeholder="tu@email.com"
                        className={inputClass}
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Assunto</label>
                <input
                    type="text"
                    required
                    value={form.subject}
                    onChange={handleChange("subject")}
                    placeholder="Sobre o que é a tua mensagem?"
                    className={inputClass}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Mensagem</label>
                <textarea
                    required
                    value={form.message}
                    onChange={handleChange("message")}
                    rows={6}
                    placeholder="Escreve a tua mensagem aqui"
                    className={inputClass}
                />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
                type="submit"
                disabled={sending}
                className="px-6 py-3 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-60"
            >
                {sending ? "A enviar..." : "Enviar mensagem"}
            </button>
        </form>
    )
}
