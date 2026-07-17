'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Mail } from "lucide-react"
import Input from "@/components/ui/Input"
import Link from "next/link"
import { supabase } from "@/supabase/client"
import { Props } from "./auth/CandidateAuth"

export default function CompanyRegisterForm({ onClick }: Props) {
    const router = useRouter()

    const [formData, setFormData] = useState({
        companyName: "",
        email: "",
        password: "",
        confirmPassword: ""
    })

    const [errors, setErrors] = useState({
        companyName: "",
        email: "",
        password: "",
        confirmPassword: ""
    })

    const [submitting, setSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState("")
    const [awaitingConfirmation, setAwaitingConfirmation] = useState(false)

    const validateForm = () => {
        const newErrors = { companyName: "", email: "", password: "", confirmPassword: "" }

        if (!formData.companyName.trim()) {
            newErrors.companyName = "Nome da empresa é obrigatório"
        }
        if (!formData.email.trim()) {
            newErrors.email = "Email é obrigatório"
        }
        if (formData.password.length < 6) {
            newErrors.password = "Senha deve ter pelo menos 6 caracteres"
        }
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "As senhas não coincidem"
        }

        setErrors(newErrors)
        return Object.values(newErrors).every(error => !error)
    }

    const handleSubmit = async (e: React.FormEvent) => {
     
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        setSubmitting(true)
        setSubmitError("")

        try {
            const { data, error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback?type=company`,
                    data: {
                        role: "company",
                        company_name: formData.companyName
                    }
                }
            })

            if (error) {
                setSubmitError(error.message)
                return
            }

            // A Supabase não devolve erro quando o email já pertence a uma
            // conta existente (é proposital, para não permitir enumerar
            // contas por email). A forma documentada de detetar isto é
            // verificar se "identities" vem vazio — só acontece quando o
            // signUp "colidiu" com um utilizador já registado.
            if (data.user && data.user.identities && data.user.identities.length === 0) {
                setSubmitError("Este email já está registado. Inicia sessão em vez de criar uma nova conta.")
                return
            }

            if (data.session) {
                // Confirmação de email desativada no projeto: a sessão já
                // está ativa, podemos ir diretos para o painel.
                router.push("/empresa")
                return
            }

            // Confirmação de email ativada: falta clicar no link enviado.
            setAwaitingConfirmation(true)
        } catch {
            setSubmitError("Não foi possível criar a conta, tenta novamente")
        } finally {
            setSubmitting(false)
        }
    }

    if (awaitingConfirmation) {
        return (
            <section className="w-full flex items-center justify-center flex-col">
                <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl shadow-slate-100 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-blue-700 mb-4">
                        <Mail className="w-5 h-5" strokeWidth={1.75} />
                    </div>
                    <h2 className="text-lg font-semibold text-slate-900 mb-2">Confirma o teu email</h2>
                    <p className="text-sm text-slate-600 font-light">
                        Enviámos um link de confirmação para <strong className="font-medium text-slate-900">{formData.email}</strong>.
                        Clica nele para ativares a conta da tua empresa.
                    </p>
                </div>
            </section>
        )
    }

    return (
        <section className="w-full flex items-center justify-center flex-col">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl shadow-slate-100 hover:shadow-2xl transition-shadow duration-300">
                <div className="mb-8 text-center">
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Criar conta</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Nome da Empresa</label>
                        <Input
                            type="text"
                            placeholder="Sua Empresa Ltda"
                            value={formData.companyName}
                            onChange={(e) => setFormData((previous) => ({...previous, companyName: e.target.value}))}
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                        />
                        {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                        <Input
                            type="email"
                            placeholder="empresa@email.com"
                            value={formData.email}
                            onChange={(e) => setFormData((previous) => ({...previous, email: e.target.value}))}
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Palavra-passe</label>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData((previous) => ({...previous, password: e.target.value}))}
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                        />
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Confirmar Palavra-passe</label>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData((previous) => ({...previous, confirmPassword: e.target.value}))}
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                        />
                        {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                    </div>

                    {submitError && <p className="text-red-500 text-sm">{submitError}</p>}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3 px-4 mt-6 rounded-lg bg-blue-700 text-white font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:opacity-60"
                    >
                        {submitting ? "A criar conta..." : "Criar Conta"}
                    </button>
                </form>

                <p className="mt-6 text-center text-xs text-slate-500">
                    Ao registrar, você concorda com nossos <Link href="#" className="text-blue-700 hover:text-blue-800">Termos de Serviço</Link>
                </p>
            </div>

            <div className="flex flex-col items-center gap-2 mt-5">
                <div className="flex items-center gap-2">
                    <div className="border-b border-slate-500 w-20 h-1"></div>
                    <span className="text-xs text-slate-500">Já tem conta?</span>
                    <div className="border-b border-slate-500 w-20 h-1"></div>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/auth/login?type=company" className="text-sm text-blue-700 hover:text-blue-800 font-semibold p-2 transition">
                        Iniciar sessão
                    </Link>
                    <span className="text-slate-300">•</span>
                    <button onClick={onClick} className="text-sm text-blue-700 hover:text-blue-800 font-semibold p-2 transition">
                        Candidato
                    </button>
                </div>
            </div>
        </section>
    )
}
