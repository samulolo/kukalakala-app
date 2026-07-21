import Link from "next/link"
import { ShieldAlert, ShieldCheck, ShieldQuestion, ShieldX } from "lucide-react"
import type { VerificationStatus } from "@/lib/supabase/company"

interface VerificationBannerProps {
    status: VerificationStatus
    rejectionReason: string
}

// Lembrete persistente em todo o painel da empresa enquanto a
// verificação não estiver concluída — a empresa vê isto até resolver,
// não é um toast que desaparece sozinho. Não mostra nada quando já
// está "verificado".
export default function VerificationBanner({ status, rejectionReason }: VerificationBannerProps) {
    if (status === "verificado") return null

    if (status === "pendente") {
        return (
            <div className="mb-6 p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
                <ShieldQuestion className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" strokeWidth={1.75} />
                <p className="text-sm text-slate-600 font-light">
                    O teu pedido de verificação está em análise. Avisamos assim que houver uma decisão.
                </p>
            </div>
        )
    }

    if (status === "rejeitado") {
        return (
            <div className="mb-6 p-4 rounded-xl border border-rose-200 bg-rose-50 flex items-start gap-3 flex-wrap sm:flex-nowrap">
                <ShieldX className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" strokeWidth={1.75} />
                <div className="flex-1 min-w-0">
                    <p className="text-sm text-rose-800 font-light">
                        O teu pedido de verificação foi rejeitado{rejectionReason ? `: ${rejectionReason}` : "."}
                    </p>
                    <Link href="/empresa/perfil" className="inline-block mt-1.5 text-sm font-medium text-rose-700 hover:text-rose-800">
                        Submeter novo documento →
                    </Link>
                </div>
            </div>
        )
    }

    // nao_verificado
    return (
        <div className="mb-6 p-4 rounded-xl border border-amber-200 bg-amber-50 flex items-start gap-3 flex-wrap sm:flex-nowrap">
            <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" strokeWidth={1.75} />
            <div className="flex-1 min-w-0">
                <p className="text-sm text-amber-800 font-light">
                    A tua empresa ainda não está verificada. Empresas verificadas mostram um selo de confiança nas
                    suas vagas.
                </p>
                <Link href="/empresa/perfil" className="inline-flex items-center gap-1.5 mt-1.5 text-sm font-medium text-amber-800 hover:text-amber-900">
                    <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2} />
                    Verificar agora →
                </Link>
            </div>
        </div>
    )
}
