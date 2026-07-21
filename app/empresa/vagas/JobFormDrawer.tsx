"use client"

import { useState } from "react"
import { X } from "lucide-react"
import type { CompanyJob, CompanyJobInput } from "@/lib/supabase/company-jobs"
import type { JobSkill, SkillLevel } from "@/lib/supabase/jobs"
import { createJob, updateJob } from "./actions"
import { useToast } from "@/components/dashboard/ToastContext"
import { ANGOLA_PROVINCES } from "@/lib/constants/angola-provinces"

const employmentTypes = ["Full-time", "Meio-período", "Híbrido", "Estágio"]

const skillLevels: { value: SkillLevel; label: string }[] = [
    { value: "obrigatorio", label: "Obrigatório" },
    { value: "importante", label: "Importante" },
    { value: "desejavel", label: "Desejável" }
]

const skillLevelStyle: Record<SkillLevel, string> = {
    obrigatorio: "bg-rose-50 text-rose-700",
    importante: "bg-amber-50 text-amber-700",
    desejavel: "bg-slate-100 text-slate-600"
}

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
    const [skills, setSkills] = useState<JobSkill[]>(job?.skills ?? [])
    const [skillName, setSkillName] = useState("")
    const [skillLevel, setSkillLevel] = useState<SkillLevel>("obrigatorio")
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")

    const handleAddSkill = () => {
        const name = skillName.trim()
        if (!name) return
        if (skills.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
            setSkillName("")
            return
        }
        setSkills((prev) => [...prev, { name, level: skillLevel }])
        setSkillName("")
    }

    const handleRemoveSkill = (name: string) => {
        setSkills((prev) => prev.filter((s) => s.name !== name))
    }

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

        if (skills.length === 0) {
            setError("Adiciona pelo menos uma competência, com o respetivo nível de importância")
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
            requirements: requirementsText.split("\n").map((l) => l.trim()).filter(Boolean),
            skills
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Localização</label>
                    <select value={form.location} onChange={handleChange("location")} className={inputClass}>
                        <option value="" disabled>Seleciona a província</option>
                        {ANGOLA_PROVINCES.map((province) => (
                            <option key={province} value={province}>{province}</option>
                        ))}
                    </select>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Competências</label>
                <p className="text-xs text-slate-400 font-light mb-1.5">
                    Adiciona as competências que procuras e o nível de importância de cada uma — usadas também
                    para pesar a análise de compatibilidade por IA de cada candidatura.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 mb-2.5">
                    <input
                        type="text"
                        value={skillName}
                        onChange={(e) => setSkillName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault()
                                handleAddSkill()
                            }
                        }}
                        placeholder="Ex: React"
                        className={`${inputClass} flex-1`}
                    />
                    <select
                        value={skillLevel}
                        onChange={(e) => setSkillLevel(e.target.value as SkillLevel)}
                        className={`${inputClass} sm:w-40`}
                    >
                        {skillLevels.map((level) => (
                            <option key={level.value} value={level.value}>{level.label}</option>
                        ))}
                    </select>
                    <button
                        type="button"
                        onClick={handleAddSkill}
                        className="px-3.5 py-2.5 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors flex-shrink-0"
                    >
                        Adicionar
                    </button>
                </div>

                {skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {skills.map((skill) => (
                            <span
                                key={skill.name}
                                className={`inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full text-xs font-medium ${skillLevelStyle[skill.level]}`}
                            >
                                {skill.name}
                                <span className="opacity-70">
                                    · {skillLevels.find((l) => l.value === skill.level)?.label}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveSkill(skill.name)}
                                    aria-label={`Remover ${skill.name}`}
                                    className="p-0.5 rounded-full hover:bg-black/10 transition-colors"
                                >
                                    <X className="w-3 h-3" strokeWidth={2} />
                                </button>
                            </span>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-slate-400 font-light">Ainda não adicionaste nenhuma competência.</p>
                )}
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
