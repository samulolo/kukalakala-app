"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { X, ArrowRight, ArrowLeft, Check } from "lucide-react"
import { completeOnboarding, skipOnboarding } from "./actions"
import CvUploader from "@/components/dashboard/CvUploader"
import { ONBOARDING_SKIPPED_KEY } from "@/lib/onboarding-skip-flag"

interface StepDef {
    id: string
    eyebrow: string
    title: string
    subtitle: string
}

const steps: StepDef[] = [
    {
        id: "pessoal",
        eyebrow: "Passo 1 de 4",
        title: "Dados pessoais",
        subtitle: "Para começarmos, conta-nos quem és"
    },
    {
        id: "experiencia",
        eyebrow: "Passo 2 de 4",
        title: "Experiência profissional",
        subtitle: "O que procuras e o que já fizeste até aqui"
    },
    {
        id: "cv",
        eyebrow: "Passo 3 de 4",
        title: "Currículo (CV)",
        subtitle: "Carrega o teu CV para acelerar as tuas candidaturas"
    },
    {
        id: "skills",
        eyebrow: "Passo 4 de 4",
        title: "Competências e certificações",
        subtitle: "Adiciona as tuas principais competências"
    }
]

const experienceLevels = ["Estagiário(a)", "Júnior", "Pleno", "Sénior", "Liderança"]

export default function OnboardingClient({ initialName }: { initialName: string }) {
    const router = useRouter()
    const [stepIndex, setStepIndex] = useState(0)

    const [form, setForm] = useState({
        name: initialName,
        location: "",
        phone: "",
        headline: "",
        level: "",
        bio: ""
    })
    const [skills, setSkills] = useState<string[]>([])
    const [skillInput, setSkillInput] = useState("")
    const [cv, setCv] = useState<{ filename: string | null; path: string | null }>({ filename: null, path: null })
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")
    const [skipping, setSkipping] = useState(false)

    const step = steps[stepIndex]
    const isLastStep = stepIndex === steps.length - 1
    const progress = ((stepIndex + 1) / steps.length) * 100

    const inputClass =
        "w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-colors"

    const handleChange = (field: keyof typeof form) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }))
    }

    const addSkill = () => {
        const value = skillInput.trim()
        if (value && !skills.includes(value)) {
            setSkills((prev) => [...prev, value])
        }
        setSkillInput("")
    }

    const removeSkill = (skill: string) => {
        setSkills((prev) => prev.filter((s) => s !== skill))
    }

    const handleNext = async () => {
        if (isLastStep) {
            setSaving(true)
            setError("")
            try {
                const result = await completeOnboarding({
                    fullName: form.name,
                    headline: form.headline,
                    location: form.location,
                    phone: form.phone,
                    bio: form.bio,
                    level: form.level,
                    skills,
                    searchable: false
                })

                if (result.error) {
                    setError(result.error)
                    return
                }

                router.push("/dashboard")
            } catch {
                setError("Não foi possível guardar o teu perfil, tenta novamente")
            } finally {
                setSaving(false)
            }
            return
        }
        setStepIndex((prev) => prev + 1)
    }

    const handleBack = () => {
        setStepIndex((prev) => Math.max(0, prev - 1))
    }

    // Grava uma linha mínima de perfil (só o nome) para o onboarding não
    // reaparecer nos próximos logins, e sinaliza a dashboard para mostrar
    // um toast a lembrar de completar o resto do perfil mais tarde.
    const handleSkip = async () => {
        if (skipping) return
        setSkipping(true)
        try {
            await skipOnboarding(form.name)
        } catch {
            // Melhor deixar o candidato sair do que bloqueá-lo aqui — o
            // pior cenário é o onboarding reaparecer no próximo login.
        } finally {
            sessionStorage.setItem(ONBOARDING_SKIPPED_KEY, "1")
            router.push("/dashboard")
        }
    }

    return (
        <div className="space-y-6">
            {/* Progress */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-blue-700 uppercase tracking-wider">
                        {step.eyebrow}
                    </span>
                    <button
                        onClick={handleSkip}
                        disabled={skipping}
                        className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-60"
                    >
                        {skipping ? "A sair..." : "Preencher mais tarde"}
                    </button>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-200">
                    <div
                        className="h-1.5 rounded-full bg-blue-700 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Card */}
            <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
                <h1 className="text-xl font-semibold text-slate-900 tracking-tight mb-1">
                    {step.title}
                </h1>
                <p className="text-sm text-slate-500 font-light mb-6">
                    {step.subtitle}
                </p>

                {step.id === "pessoal" && (
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nome completo</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={handleChange("name")}
                                placeholder="O teu nome"
                                className={inputClass}
                            />
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
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Telefone</label>
                                <input
                                    type="tel"
                                    value={form.phone}
                                    onChange={handleChange("phone")}
                                    placeholder="+244 900 000 000"
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {step.id === "experiencia" && (
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Cargo pretendido</label>
                            <input
                                type="text"
                                value={form.headline}
                                onChange={handleChange("headline")}
                                placeholder="Ex: Engenheiro(a) de Software"
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
                                        onClick={() => setForm((prev) => ({ ...prev, level }))}
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
                    </div>
                )}

                {step.id === "cv" && (
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Currículo (CV)</label>
                        <CvUploader
                            initialFilename={cv.filename}
                            initialPath={cv.path}
                            onChange={setCv}
                        />
                        <p className="text-xs text-slate-400 font-light mt-2">
                            Podes fazer isto mais tarde no teu perfil, se preferires.
                        </p>
                    </div>
                )}

                {step.id === "skills" && (
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Competências</label>
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
                )}
            </div>

            {error && (
                <p className="text-sm text-red-600 text-center">{error}</p>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between">
                <button
                    onClick={handleBack}
                    disabled={stepIndex === 0 || saving}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors disabled:opacity-0 disabled:pointer-events-none"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar
                </button>

                <button
                    onClick={handleNext}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-60"
                >
                    {isLastStep ? (
                        <>
                            {saving ? "A guardar..." : "Concluir"}
                            <Check className="w-4 h-4" />
                        </>
                    ) : (
                        <>
                            Continuar
                            <ArrowRight className="w-4 h-4" />
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}
