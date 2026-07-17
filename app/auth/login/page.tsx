'use client'

import { Suspense, useState, useEffect, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import CandidateAuth from "@/components/auth/CandidateAuth"
import CompanyLoginForm from "@/components/CompanyLoginForm"

function LoginPageContent() {

    const router = useRouter()
    const searchParams = useSearchParams()
    const [type, setType] = useState(() => {
        const typeParam = searchParams.get("type")
        return typeParam === "company" ? "company" : "candidate"
    })
    const Component = useMemo(() => type === 'candidate' ? CandidateAuth : CompanyLoginForm, [type])

    useEffect(() => {
        const params = new URLSearchParams()
        params.set("type", type)
        const updatedUrl = window.location.origin + window.location.pathname + "?" + params.toString()
        router.replace(updatedUrl)
    }, [type, router])

    return (
        <Component onClick={() => setType((prev) => prev === 'candidate' ? 'company' : 'candidate')} />
    )
}

// useSearchParams() precisa de um limite de Suspense (recomendação do
// Next.js) — sem isto, a hidratação deste ramo pode falhar de forma
// silenciosa em ligações mais lentas, deixando os onClick (Google,
// LinkedIn, alternar Candidato/Empresa) sem resposta, apesar dos links
// simples (<a href>) continuarem a funcionar por navegação nativa.
export default function LoginPage() {
    return (
        <Suspense fallback={null}>
            <LoginPageContent />
        </Suspense>
    )
}
