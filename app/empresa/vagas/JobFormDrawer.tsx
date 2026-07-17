"use client"

import { useState } from "react"
import { X } from "lucide-react"
import type { CompanyJob, CompanyJobInput } from "@/lib/supabase/company-jobs"
import { createJob, updateJob } from "./actions"
import { useToast } from "@/components/dashboard/ToastContext"

const employmentTypes = ["Full-time", "Meio-período", "Híbrido", "Estágio"]

interface JobFormDrawerProps {
    job: CompanyJob | null
    isOpen: boolean
    onClose: () => void
}

export default function JobFormDrawer({ job, isOpen, onClose }: JobFormDrawerProps) {
    const isEditing = job !== null

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                aria-hidden="true"
                className={`fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-[1px] transition-opacity duration-300 ${
                    isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
            />

            {/* Panel */}
            <aside
                role="dialog"
                aria-modal="true"
                aria-label={isEditing ? "Editar vaga" : "Nova vaga"}
                className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[30rem] bg-white border-l border-slate-200 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
                    isOpen ? "translate-x-0" : "translate-x-full"
                }`}
            >
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 flex-shrink-0">
                    <h2 className="text-sm font-semibold text-slate-900">{isEditing ? "Editar vaga" : "Nova vaga"}</h2>
                    <button
                        onClick={onClose}
                        aria-label="Fechar"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                        <X className="w-4.5 h-4.5" strokeWidth={1.75} />
                    </button>
                </div>

                {/* A key ligada ao job + estado de abertura força um novo
                    "mount" do formulário sempre que abre, para os campos
                    partirem sempre dos dados atuais (sem useEffect). */}
                <JobFormFields key={`${job?.id ?? "new"}|${isOpen}`} job={job} onClose={onClose} />
            </aside>
        </>
    )
}

function JobFormFields({ job, onClose }: { job: CompanyJob | null; onClose: () => void }) {
    const isEditing = job !== null
    const { showToast } = useToast()

    const [form, setForm] = useState({
        title: job?.title ?? "",
        location: job?.location ?? "",
        type: job?.type ?? employmentTypes[0],
        category: job?.category ?? "",
        salaryRange: job?.salaryRange ?? ""
    })
    const [description, setDescription] = useState(job?.description ?? "")
    const [responsibilitiesText, setResponsibilitiesText] = useState(job?.responsibilities.join("\n") ?? "")
    const [requirementsText, setRequirementsText] = useState(job?.requirements.join("\n") ?? "")
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")

    const inputClass =
        "w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-colors"

    const handleChange = (field: keyof typeof form) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!form.title.trim() || !form.location.trim() || !form.category.trim() || !form.salaryRange.trim()) {
            setError("Preenche pelo menos título, localização, categoria e faixa salarial")
            return
        }

        setSaving(true)
        setError("")

        const input: CompanyJobInput = {
            title: form.title,
            location: form.location,
            type: form.type,
            category: form.category,
            salaryRange: form.salaryRange,
            description,
            responsibilities: responsibilitiesText.split("\n").map((l) => l.trim()).filter(Boolean),
            requirements: requirementsText.split("\n").map((l) => l.trim()).filter(Boolean)
        }

        try {
            const result = isEditing ? await updateJob(job.id, input) : await createJob(input)

            if (result.error) {
                setError(result.error)
                return
            }

            showToast(isEditing ? "Vaga atualizada com sucesso!" : "Vaga publicada com sucesso!", "success")
            onClose()
        } catch {
            setError("Não foi possível guardar a vaga, tenta novamente")
        } finally {
            setSaving(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Título da vaga</label>
                <input
                    type="text"
                    value={form.title}
                    onChange={handleChange("title")}
                    placeholder="Ex: Engenheiro(a) Frontend React"
                    className={inputClass}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Localização</label>
                    <input
                        type="text"
                        value={form.location}
                        onChange={handleChange("location")}
                        placeholder="Luanda, Angola"
                        className={inputClass}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Tipo</label>
                    <select value={form.type} onChange={handleChange("type")} className={inputClass}>
                        {employmentTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Categoria</label>
                    <input
                        type="text"
                        value={form.category}
                        onChange={handleChange("category")}
                        placeholder="Tecnologia"
                        className={inputClass}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Faixa salarial</label>
                    <input
                        type="text"
                        value={form.salaryRange}
                        onChange={handleChange("salaryRange")}
                        placeholder="350.000 - 500.000 Kz"
                        className={inputClass}
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Descrição</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="Descreve a vaga e o contexto da equipa"
                    className={inputClass}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Responsabilidades</label>
                <p className="text-xs text-slate-400 font-light mb-1.5">Uma por linha</p>
                <textarea
                    value={responsibilitiesText}
                    onChange={(e) => setResponsibilitiesText(e.target.value)}
                    rows={4}
                    placeholder={"Desenvolver e manter...\nColaborar com design..."}
                    className={inputClass}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Requisitos</label>
                <p className="text-xs text-slate-400 font-light mb-1.5">Um por linha</p>
                <textarea
                    value={requirementsText}
                    onChange={(e) => setRequirementsText(e.target.value)}
                    rows={4}
                    placeholder={"3+ anos de experiência...\nBoa comunicação..."}
                    className={inputClass}
                />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
                type="submit"
                disabled={saving}
                className="w-full px-4 py-3 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-60"
            >
                {saving ? "A guardar..." : isEditing ? "Guardar alterações" : "Publicar vaga"}
            </button>
        </form>
    )
}
