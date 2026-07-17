'use client'

import { Suspense, useState, useMemo, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import CandidateRegisterForm from "@/components/auth/CandidateRegisterForm"
import CompanyRegisterForm from "@/components/CompanyRegisterForm"

function RegisterPageContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [type, setType] = useState(() => {
        const typeParam = searchParams.get("type")
        return typeParam === "company" ? "company" : "candidate"
    })
    const Component = useMemo(() => type === 'candidate' ? CandidateRegisterForm : CompanyRegisterForm, [type])

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
// silenciosa em ligações mais lentas, deixando os onClick sem resposta
// apesar dos links simples continuarem a funcionar por navegação nativa.
export default function RegisterPage() {
    return (
        <Suspense fallback={null}>
            <RegisterPageContent />
        </Suspense>
    )
}
