"use client"

import { useState, useSyncExternalStore } from "react"
import Link from "next/link"
import { Cookie } from "lucide-react"
import { COOKIE_CONSENT_NAME, COOKIE_CONSENT_MAX_AGE_SECONDS } from "@/lib/cookie-consent"

type ConsentChoice = "accepted" | "rejected"

// "Já estamos no browser, depois da hidratação?" sem efeito nem
// setState — mesmo padrão usado em MobileNavDrawer.tsx: o servidor e a
// primeira passagem do cliente (hidratação) devolvem sempre "false"
// (para baterem certo um com o outro), e só depois passa a "true". Sem
// isto, teríamos de comparar o HTML do servidor com o cookie real do
// browser logo na primeira renderização, o que causaria um mismatch
// de hidratação.
const subscribeNever = () => () => {}
function useIsMounted(): boolean {
    return useSyncExternalStore(subscribeNever, () => true, () => false)
}

function hasStoredConsent(): boolean {
    if (typeof document === "undefined") return false
    return document.cookie.split("; ").some((entry) => entry.startsWith(`${COOKIE_CONSENT_NAME}=`))
}

function setConsentCookie(value: ConsentChoice) {
    document.cookie = `${COOKIE_CONSENT_NAME}=${value}; path=/; max-age=${COOKIE_CONSENT_MAX_AGE_SECONDS}; SameSite=Lax`
}

// Aviso de cookies (conformidade RGPD/LGPD). A decisão de mostrar ou
// não fica inteiramente no browser — de propósito, nunca lida a partir
// de cookies() no layout raiz, porque isso tornaria TODA a app
// dinâmica e travaria a navegação (o mesmo motivo pelo qual as
// notificações foram tiradas de app/dashboard/layout.tsx e
// app/empresa/layout.tsx). Mostra-se a qualquer visitante — página
// pública ou já autenticado — até decidir, e a escolha fica guardada
// num cookie próprio, válido por um ano.
export default function CookieConsentBanner() {
    const mounted = useIsMounted()
    const [manuallyDismissed, setManuallyDismissed] = useState(false)

    if (!mounted || manuallyDismissed || hasStoredConsent()) return null

    const handleChoice = (value: ConsentChoice) => {
        setConsentCookie(value)
        setManuallyDismissed(true)
    }

    return (
        <div role="region" aria-label="Aviso de cookies" className="fixed inset-x-0 bottom-0 z-[70] p-4 sm:p-5">
            <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white shadow-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <Cookie className="hidden sm:block w-7 h-7 text-blue-700 flex-shrink-0" strokeWidth={1.5} />

                <p className="flex-1 min-w-0 text-sm text-slate-700 font-light leading-relaxed">
                    Usamos cookies estritamente necessários para manter a tua sessão e proteger a plataforma. Podes
                    ler mais na nossa{" "}
                    <Link
                        href="/privacidade#cookies"
                        className="text-blue-700 font-medium hover:text-blue-800 underline underline-offset-2"
                    >
                        Política de Cookies
                    </Link>
                    .
                </p>

                <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                        type="button"
                        onClick={() => handleChoice("rejected")}
                        className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        Rejeitar
                    </button>
                    <button
                        type="button"
                        onClick={() => handleChoice("accepted")}
                        className="px-4 py-2.5 rounded-lg bg-blue-700 text-white text-sm font-medium hover:bg-blue-800 transition-colors"
                    >
                        Aceitar
                    </button>
                </div>
            </div>
        </div>
    )
}
