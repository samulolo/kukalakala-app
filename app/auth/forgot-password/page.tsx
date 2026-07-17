'use client'

import { useState } from "react"
import Input from "@/components/ui/Input"
import Link from "next/link"
import { supabase } from "@/supabase/client"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [error, setError] = useState("")
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if(!email){
            setError("O email é obrigatório")
            return
        }
        try {

            const {error, data} = await supabase.auth.resetPasswordForEmail(email)

            if(error){
                setError("Conta não encontrada, tente novamente!")
                return
            }

            console.log("DAdos: ", data)

        } catch(err){
            throw err
        }
        setSubmitted(true)

        if(submitted) setError("")
    }

    return (
        <section className="w-full flex items-center justify-center flex-col">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl shadow-slate-100 hover:shadow-2xl transition-shadow duration-300">
                <div className="mb-8 text-center">
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Recuperação de conta</p>
                    <h2 className="mt-4 text-xl font-semibold text-slate-900">Recuperar palavra-passe</h2>
                </div>

                {!submitted ? (
                    <form onSubmit={handleSubmit} className="space-y-5">
                           {error && (
                                <div className="bg-red-50 p-3 rounded border border-red-500">
                                    <p className="text-red-500 text-sm">{error}</p>
                                </div>
                            )}
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

                        <button
                            type="submit"
                            className="w-full py-3 px-4 mt-6 rounded-lg bg-blue-700 text-white font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
                        >
                            Enviar instruções
                        </button>
                    </form>
                ) : (
                    <div className="space-y-6 text-center">
                        <div>
                            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                                <svg
                                    className="w-8 h-8 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>
                            <p className="text-slate-600 text-sm">
                                Enviamos um link de recuperação para <strong>{email}</strong>
                            </p>
                            <p className="text-xs text-slate-500 mt-2">Verifique seu email para continuar</p>
                        </div>

                        <button
                            onClick={() => setSubmitted(false)}
                            className="w-full py-3 px-4 rounded-lg bg-blue-700 text-white font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
                        >
                            Usar outro email
                        </button>
                    </div>
                )}
            </div>

            <div className="flex flex-col items-center gap-2 mt-5">
                <Link href="/auth/login" className="text-sm text-blue-700 hover:text-blue-800 font-semibold p-2 transition">
                    ← Voltar para login
                </Link>
            </div>
        </section>
    )
}
