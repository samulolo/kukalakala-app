'use client'
import { Suspense, useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getOauthUser } from "@/hooks/useAuth"

function CallbackContent(){

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const params = useSearchParams()
    const router = useRouter()

    const fetchDisparado = useRef(false)

    useEffect(() => {

        const code = params.get("code")
        if (!code) return
        if (fetchDisparado.current) return
        fetchDisparado.current = true

        const getSession = async function(){
            setLoading(true)
            const origin = window.location.origin

            try {

                const response = await getOauthUser(code, origin)

                if (!response || response.error){
                    console.log("Resposta da API: ", response)
                    setError(response?.message || "Houve um erro ao iniciar sessão, tente novamente")
                    return
                }

                console.log("Resposta da API: ", response)

                const type = params.get("type")
                router.replace(type === "company" ? "/empresa" : "/onboarding")

            } catch(err){
                console.log("houve um erro ao obter a sessão do utilizador: ", err)
                setError("Houve um erro ao iniciar sessão, tente novamente")
            }
            finally {
                setLoading(false)
            }
        }

        getSession()
    }, [params, router])

    return (
        <section className="flex flex-col items-center gap-3 text-center">
            {error ? (
                <>
                    <h2 className="text-slate-900 font-medium">Não foi possível iniciar sessão</h2>
                    <p className="text-sm text-red-600">{error}</p>
                    <button
                        onClick={() => router.replace("/auth/login")}
                        className="text-sm text-blue-700 hover:text-blue-800 font-semibold mt-2"
                    >
                        Voltar ao login
                    </button>
                </>
            ) : (
                <>
                    <svg className="mr-3 size-5 animate-spin ..." viewBox="0 0 24 24">
                    </svg>
                    <h2>{loading ? "A validar a sessão..." : "Estamos a preparar o seu painel"}</h2>
                </>
            )}
        </section>
    )
}

// useSearchParams() precisa de um limite de Suspense (recomendação do
// Next.js) — sem isto, o "next build" falha com "should be wrapped in
// a suspense boundary" porque esta página não pode ser pré-renderizada
// de forma estática sabendo à partida os parâmetros da URL (?code=...).
export default function Callback() {
    return (
        <Suspense fallback={null}>
            <CallbackContent />
        </Suspense>
    )
}
