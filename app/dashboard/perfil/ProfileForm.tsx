"use client"

import { useState } from "react"
import { MapPin, Phone, BadgeCheck, Check, X, Search } from "lucide-react"
import { checklistFromProfile, completionFromChecklist, type Profile } from "@/lib/profile-utils"
import { saveProfile } from "./actions"
import CvUploader from "@/components/dashboard/CvUploader"

const experienceLevels = ["Estagiário(a)", "Júnior", "Pleno", "Sénior", "Liderança"]

export default function ProfileForm({ initialProfile }: { initialProfile: Profile | null }) {
    const [form, setForm] = useState({
        name: initialProfile?.fullName ?? "",
        headline: initialProfile?.headline ?? "",
        location: initialProfile?.location ?? "",
        phone: initialProfile?.phone ?? "",
        bio: initialProfile?.bio ?? "",
        level: initialProfile?.level ?? ""
    })
    const [searchable, setSearchable] = useState(initialProfile?.searchable ?? false)
    const [skills, setSkills] = useState<string[]>(initialProfile?.skills ?? [])
    const [skillInput, setSkillInput] = useState("")
    const [cv, setCv] = useState({
        filename: initialProfile?.cvFilename ?? null,
        path: initialProfile?.cvPath ?? null
    })

    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState("")

    const initials = (form.name || "?")
        .split(" ")
        .map((part) => part.charAt(0))
        .slice(0, 2)
        .join("")
        .toUpperCase()

    const checklist = checklistFromProfile({
        fullName: form.name,
        location: form.location,
        phone: form.phone,
        headline: form.headline,
        level: form.level,
        bio: form.bio,
        skills,
        cvFilename: cv.filename
    })
    const completion = completionFromChecklist(checklist)

    const inputClass =
        "w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-colors"

    const handleChange = (field: keyof typeof form) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }))
        setSaved(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setError("")
        try {
            const result = await saveProfile({
                fullName: form.name,
                headline: form.headline,
                location: form.location,
                phone: form.phone,
                bio: form.bio,
                level: form.level,
                skills,
                searchable
            })

            if (result.error) {
                setError(result.error)
                return
            }

            setSaved(true)
        } catch {
            setError("Não foi possível guardar as alterações, tenta novamente")
        } finally {
            setSaving(false)
        }
    }

    const addSkill = () => {
        const value = skillInput.trim()
        if (value && !skills.includes(value)) {
            setSkills((prev) => [...prev, value])
        }
        setSkillInput("")
        setSaved(false)
    }

    const removeSkill = (skill: string) => {
        setSkills((prev) => prev.filter((s) => s !== skill))
        setSaved(false)
    }

    return (
        <div className="space-y-6">
            {/* Header: resumo ao vivo do que está preenchido em baixo */}
            <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white text-xl font-semibold flex-shrink-0">
                        {initials}
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
                                {form.name || "O teu nome"}
                            </h1>
                            {form.level && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                                    <BadgeCheck className="w-3.5 h-3.5" strokeWidth={1.75} />
                                    {form.level}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-slate-600 font-light mb-2">
                            {form.headline || "Cargo pretendido por preencher"}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-light">
                            {form.location && (
                                <span className="inline-flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
                                    {form.location}
                                </span>
                            )}
                            {form.phone && (
                                <span className="inline-flex items-center gap-1">
                                    <Phone className="w-3.5 h-3.5" strokeWidth={1.5} />
                                    {form.phone}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-6">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-slate-600">Perfil completo</span>
                        <span className="text-xs font-semibold text-blue-700">{completion}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100">
                        <div
                            className="h-1.5 rounded-full bg-blue-700 transition-all duration-300"
                            style={{ width: `${completion}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Dados pessoais e experiência */}
                    <form onSubmit={handleSubmit} className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-5">
                        <h2 className="text-base font-semibold text-slate-900">Informações</h2>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nome completo</label>
                            <input type="text" value={form.name} onChange={handleChange("name")} className={inputClass} />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Cargo pretendido</label>
                                <input type="text" value={form.headline} onChange={handleChange("headline")} className={inputClass} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Localização</label>
                                <input type="text" value={form.location} onChange={handleChange("location")} className={inputClass} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Telefone</label>
                            <input
                                type="tel"
                                value={form.phone}
                                onChange={handleChange("phone")}
                                placeholder="+244 900 000 000"
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nível de experiência</label>
                            <div className="flex flex-wrap gap-2">
                                {experienceLevels.map((level) => (
                                    <button
                                        key={level}
                                        type="button"
                                        onClick={() => {
                                            setForm((prev) => ({ ...prev, level }))
                                            setSaved(false)
                                        }}
                                        className={`px-3.5 py-2 rounded-lg text-sm font-medium border transition-colors ${
                                            form.level === level
                                                ? "bg-blue-50 border-blue-200 text-blue-700"
                                                : "border-slate-200 text-slate-600 hover:bg-slate-50"
                                        }`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Sobre ti</label>
                            <textarea
                                value={form.bio}
                                onChange={handleChange("bio")}
                                placeholder="Conta um pouco sobre a tua experiência e objetivos de carreira"
                                rows={4}
                                className={inputClass}
                            />
                        </div>

                        <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-slate-50">
                            <div className="flex items-start gap-3">
                                <Search className="w-4.5 h-4.5 text-slate-400 mt-0.5 flex-shrink-0" strokeWidth={1.75} />
                                <div>
                                    <p className="text-sm font-medium text-slate-900">Visível para empresas em pesquisas</p>
                                    <p className="text-xs text-slate-500 font-light mt-0.5">
                                        Permite que qualquer empresa te encontre ao pesquisar candidatos, mesmo sem
                                        te candidatares diretamente a uma vaga.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                role="switch"
                                aria-checked={searchable}
                                onClick={() => {
                                    setSearchable((prev) => !prev)
                                    setSaved(false)
                                }}
                                className={`relative inline-flex flex-shrink-0 items-center h-6 w-11 rounded-full transition-colors ${
                                    searchable ? "bg-blue-700" : "bg-slate-300"
                                }`}
                            >
                                <span
                                    className={`inline-block w-4 h-4 transform rounded-full bg-white transition-transform ${
                                        searchable ? "translate-x-6" : "translate-x-1"
                                    }`}
                                />
                            </button>
                        </div>

                        {error && <p className="text-sm text-red-600">{error}</p>}

                        <div className="flex items-center gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-2.5 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-60"
                            >
                                {saving ? "A guardar..." : "Guardar alterações"}
                            </button>
                            {saved && !saving && (
                                <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
                                    <Check className="w-4 h-4" strokeWidth={2} />
                                    Guardado
                                </span>
                            )}
                        </div>
                    </form>

                    {/* Competências */}
                    <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <h2 className="text-base font-semibold text-slate-900 mb-3">Competências</h2>
                        <p className="text-xs text-slate-400 font-light mb-3">
                            As alterações aqui só ficam gravadas quando clicares em &ldquo;Guardar alterações&rdquo; acima.
                        </p>
                        <div className="flex gap-2 mb-3">
                            <input
                                type="text"
                                value={skillInput}
                                onChange={(e) => setSkillInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault()
                                        addSkill()
                                    }
                                }}
                                placeholder="Ex: React, Gestão de Projetos..."
                                className={inputClass}
                            />
                            <button
                                type="button"
                                onClick={addSkill}
                                className="px-4 py-2.5 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors flex-shrink-0"
                            >
                                Adicionar
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {skills.length === 0 && (
                                <p className="text-xs text-slate-400 font-light">
                                    Ainda não adicionaste nenhuma competência
                                </p>
                            )}
                            {skills.map((skill) => (
                                <span
                                    key={skill}
                                    className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium"
                                >
                                    {skill}
                                    <button
                                        type="button"
                                        onClick={() => removeSkill(skill)}
                                        aria-label={`Remover ${skill}`}
                                        className="hover:text-blue-900"
                                    >
                                        <X className="w-3.5 h-3.5" strokeWidth={2} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Currículo */}
                <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm h-fit">
                    <h2 className="text-base font-semibold text-slate-900 mb-3">Currículo</h2>
                    <p className="text-xs text-slate-400 font-light mb-3">
                        O carregamento é imediato — não precisa de &ldquo;Guardar alterações&rdquo;.
                    </p>
                    <CvUploader
                        initialFilename={cv.filename}
                        initialPath={cv.path}
                        onChange={(result) => {
                            setCv(result)
                            setSaved(false)
                        }}
                    />
                </div>
            </div>
        </div>
    )
}
