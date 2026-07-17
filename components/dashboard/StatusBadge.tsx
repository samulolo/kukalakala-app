import type { ApplicationStatus } from "@/lib/supabase/applications"

const styles: Record<ApplicationStatus, string> = {
    "Em análise": "bg-blue-50 text-blue-700",
    "Entrevista": "bg-amber-50 text-amber-700",
    "Aprovado": "bg-emerald-50 text-emerald-700",
    "Rejeitado": "bg-slate-100 text-slate-500"
}

const dotStyles: Record<ApplicationStatus, string> = {
    "Em análise": "bg-blue-700",
    "Entrevista": "bg-amber-500",
    "Aprovado": "bg-emerald-600",
    "Rejeitado": "bg-slate-400"
}

export default function StatusBadge({ status }: { status: ApplicationStatus }) {
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${styles[status]}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[status]}`} />
            {status}
        </span>
    )
}
