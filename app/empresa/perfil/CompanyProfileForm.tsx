"use client"

import { useState } from "react"
import { Globe, MapPin, Building2, Check } from "lucide-react"
import type { Company } from "@/lib/supabase/company"
import { saveCompany } from "./actions"
import { COMPANY_SECTORS } from "@/lib/company-sectors"

export default function CompanyProfileForm({ initialCompany }: { initialCompany: Company | null }) {
    const [form, setForm] = useState({
        companyName: initialCompany?.companyName ?? "",
        website: initialCompany?.website ?? "",
        sector: initialCompany?.sector ?? "",
        description: initialCompany?.description ?? "",
        location: initialCompany?.location ?? "",
        postalCode: initialCompany?.postalCode ?? ""
    })

    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState("")

    const initials = (form.companyName || "?")
        .split(" ")
        .map((part) => part.charAt(0))
        .slice(0, 2)
        .join("")
        .toUpperCase()

    const inputClass =
        "w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-colors"

    const handleChange = (field: keyof typeof form) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }))
        setSaved(false)
    }

    const sectorOptions =
        form.sector && !COMPANY_SECTORS.includes(form.sector)
            ? [form.sector, ...COMPANY_SECTORS]
            : COMPANY_SECTORS

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setError("")

        try {
            const result = await saveCompany(form)

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

    return (
        <div className="space-y-6">
            <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white text-xl font-semibold flex-shrink-0">
                        {initials}
                    </div>

                    <div className="min-w-0 flex-1">
                        <h1 className="text-xl font-semibold text-slate-900 tracking-tight mb-1">
                            {form.companyName || "O nome da tua empresa"}
                        </h1>
                        <p className="text-sm text-slate-600 font-light mb-2">
                            {form.sector || "Setor por preencher"}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-light">
                            {form.location && (
                                <span className="inline-flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
                                    {form.location}
                                </span>
                            )}
                            {form.website && (
                                <span className="inline-flex items-center gap-1">
                                    <Globe className="w-3.5 h-3.5" strokeWidth={1.5} />
                                    {form.website}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-5">
                <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-4.5 h-4.5 text-blue-700" strokeWidth={1.75} />
                    Informações da empresa
                </h2>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Nome da empresa</label>
                    <input type="text" value={form.companyName} onChange={handleChange("companyName")} className={inputClass} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Website</label>
                        <input
                            type="text"
                            value={form.website}
                            onChange={handleChange("website")}
                            placeholder="www.empresa.com"
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Setor</label>
                        <select
                            value={form.sector}
                            onChange={handleChange("sector")}
                            className={inputClass}
                        >
                            <option value="">Seleciona o setor</option>
                            {sectorOptions.map((sector) => (
                                <option key={sector} value={sector}>{sector}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Código postal</label>
                        <input
                            type="text"
                            value={form.postalCode}
                            onChange={handleChange("postalCode")}
                            className={inputClass}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Sobre a empresa</label>
                    <textarea
                        value={form.description}
                        onChange={handleChange("description")}
                        placeholder="Conta um pouco sobre a empresa, a missão e a cultura de equipa"
                        rows={4}
                        className={inputClass}
                    />
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
        </div>
    )
}
