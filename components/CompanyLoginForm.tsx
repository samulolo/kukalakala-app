'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import Input from "@/components/ui/Input"
import Link from "next/link"
import { supabase } from "@/supabase/client"
import { Props } from "./auth/CandidateAuth"



export default function CompanyLoginForm({onClick}: Props) {

    const router = useRouter()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        setSubmitting(true)
        setSubmitError("")

        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password })

            if (error) {
                setSubmitError(error.message === "Invalid login credentials"
                    ? "Email ou palavra-passe incorretos"
                    : error.message)
                return
            }

            router.push("/empresa")
        } catch {
            setSubmitError("Não foi possível iniciar sessão, tenta novamente")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <section className="w-full flex items-center justify-center flex-col">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl shadow-slate-100 hover:shadow-2xl transition-shadow duration-300">
                <div className="mb-8 text-center">
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Bem-vindo de volta</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                        <Input
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-slate-700">Palavra-passe</label>
                            <Link href="/auth/forgot-password" className="text-xs text-blue-700 hover:text-blue-800 transition">
                                Esqueceu a palavra-passe?
                            </Link>
                        </div>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                        />
                    </div>

                    {submitError && <p className="text-red-500 text-sm">{submitError}</p>}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3 px-4 mt-6 rounded-lg bg-blue-700 text-white font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:opacity-60"
                    >
                        {submitting ? "A entrar..." : "Entrar"}
                    </button>
                </form>
            </div>

            <div className="flex flex-col items-center gap-2 mt-5">
                <div className="flex items-center gap-2">
                    <div className="border-b border-slate-500 w-20 h-1"></div>
                    <span className="text-xs text-slate-500">Não tem conta?</span>
                    <div className="border-b border-slate-500 w-20 h-1"></div>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/auth/register?type=company" className="text-sm text-blue-700 hover:text-blue-800 font-semibold p-2 transition">
                        Criar conta
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
