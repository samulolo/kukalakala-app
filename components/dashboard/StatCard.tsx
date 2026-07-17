import { ArrowUp, ArrowDown, type LucideIcon } from "lucide-react"

interface StatCardProps {
    icon: LucideIcon
    label: string
    value: string
    trend?: {
        value: string
        positive: boolean
    }
}

export default function StatCard({ icon: Icon, label, value, trend }: StatCardProps) {
    return (
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-blue-50">
                    <Icon className="w-4.5 h-4.5 text-blue-700" strokeWidth={1.75} />
                </div>
                {trend && (
                    <span
                        className={`inline-flex items-center gap-0.5 text-xs font-medium ${
                            trend.positive ? "text-emerald-600" : "text-red-500"
                        }`}
                    >
                        {trend.positive ? (
                            <ArrowUp className="w-3 h-3" strokeWidth={2.5} />
                        ) : (
                            <ArrowDown className="w-3 h-3" strokeWidth={2.5} />
                        )}
                        {trend.value}
                    </span>
                )}
            </div>
            <p className="text-2xl font-semibold text-slate-900 tracking-tight">{value}</p>
            <p className="text-xs text-slate-500 font-light mt-1">{label}</p>
        </div>
    )
}
