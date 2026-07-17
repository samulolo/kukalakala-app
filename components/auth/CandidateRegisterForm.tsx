'use client'

import Link from "next/link"
import GoogleButton from "@/components/ui/GoogleButton"
import LinkedinButton from "@/components/ui/LinkedinButton"
import { providers } from "@/hooks/useAuth"
import { Props } from "./CandidateAuth"

export default function CandidateRegisterForm({ onClick }: Props) {
    const handleLogin = async function (provider: 'google' | 'linkedin') {
        const oauth = providers[provider]
        await oauth.signIn()
    }

    return (
        <section className="w-full flex items-center justify-center flex-col">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl shadow-slate-100 hover:shadow-2xl transition-shadow duration-300">
                <div className="mb-8 text-center">
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Bem-vindo</p>
                </div>

                <div className="space-y-3">
                    <GoogleButton
                        onClick={async () => await handleLogin('google')}
                        className="w-full bg-white hover:bg-slate-50 border border-slate-300 text-slate-700"
                    />
                    <LinkedinButton
                        onClick={async () => await handleLogin('linkedin')}
                        className="w-full bg-white hover:bg-slate-50 border border-slate-300 text-slate-700"
                    />
                </div>

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
                    <Link href="/auth/login?type=candidate" className="text-sm text-blue-700 hover:text-blue-800 font-semibold p-2 transition">
                        Iniciar sessão
                    </Link>
                    <span className="text-slate-300">•</span>
                    <button onClick={onClick} className="text-sm text-blue-700 hover:text-blue-800 font-semibold p-2 transition">
                        Empresa
                    </button>
                </div>
            </div>
        </section>
    )
}
