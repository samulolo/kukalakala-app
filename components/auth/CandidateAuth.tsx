'use client'

import { useState } from "react"
import GoogleButton from "@/components/ui/GoogleButton"
import LinkedinButton from "@/components/ui/LinkedinButton"
import { providers } from "@/hooks/useAuth"
import Link from "next/link"



export type Props = {
    onClick? :() => void
}

export default function CandidateAuth({onClick} : Props) {

    const [loadingProvider, setLoadingProvider] = useState<'google' | 'linkedin' | null>(null)
    const [authError, setAuthError] = useState<string | null>(null)

    const handleLogin = async function(provider : 'google' | 'linkedin'){
        setAuthError(null)
        setLoadingProvider(provider)
        try {
            const oauth = providers[provider]
            await oauth.signIn()
            // Se signIn() resolver sem redirecionar (ex: browser bloqueou
            // a navegação), avisamos em vez de deixar o botão preso em
            // "A abrir...".
        } catch (err) {
            setAuthError(
                err instanceof Error
                    ? err.message
                    : "Não foi possível iniciar sessão. Verifica a tua ligação à internet e tenta novamente."
            )
        } finally {
            setLoadingProvider(null)
        }
    }


    return (
        <section className="w-full flex items-center justify-center flex-col">

            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl shadow-slate-100 hover:shadow-2xl transition-shadow duration-300">
                <div className="mb-8 text-center">
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Bem-vindo de volta</p>
                </div>

                {authError && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {authError}
                    </div>
                )}

                <div className="space-y-3">
                    <GoogleButton
                    disabled={loadingProvider !== null}
                    loading={loadingProvider === 'google'}
                    onClick={ async () => await handleLogin('google')}
                     className="w-full bg-white hover:bg-slate-50 border border-slate-300 text-slate-700" />
                    <LinkedinButton
                    disabled={loadingProvider !== null}
                    loading={loadingProvider === 'linkedin'}
                    onClick={ async () => await handleLogin('linkedin')}
                     className="w-full bg-white hover:bg-slate-50 border border-slate-300 text-slate-700" />
                </div>
            </div>
            <div className="flex flex-col items-center gap-2 mt-5">
                <div className="flex items-center gap-2 ">
                    <div className="border-b border-slate-500 w-20 h-1"></div>
                    <span className="text-xs text-slate-500">Para empresas</span>
                    <div className="border-b border-slate-500 w-20 h-1"></div>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/auth/register?type=candidate" className="text-sm text-blue-700 hover:text-blue-800 font-semibold p-2 transition">Criar conta</Link>
                    <span className="text-slate-300">•</span>
                    <button onClick={onClick} className="text-sm text-blue-700 hover:text-blue-800 font-semibold p-2 transition">Empresa</button>
                </div>
            </div>

        </section>
    )
}
