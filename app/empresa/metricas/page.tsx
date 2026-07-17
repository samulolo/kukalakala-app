import { Briefcase, PauseCircle, Users, TrendingUp } from "lucide-react"
import { getCompanyMetrics } from "@/lib/supabase/company-metrics"
import StatCard from "@/components/dashboard/StatCard"
import StatusBadge from "@/components/dashboard/StatusBadge"

const barColors: Record<string, string> = {
    "Em análise": "bg-blue-700",
    "Entrevista": "bg-amber-500",
    "Aprovado": "bg-emerald-600",
    "Rejeitado": "bg-slate-400"
}

export default async function MetricasPage() {
    const metrics = await getCompanyMetrics()

    const maxStatusCount = Math.max(1, ...metrics.statusBreakdown.map((item) => item.count))
    const maxDayCount = Math.max(1, ...metrics.last7Days.map((day) => day.count))
    const maxMonthCount = Math.max(1, ...metrics.monthlyEvolution.map((month) => month.count))
    const maxTopJobCount = Math.max(1, ...metrics.topJobs.map((job) => job.count))

    return (
        <div className="space-y-6">

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Briefcase} label="Vagas ativas" value={String(metrics.activeJobs)} />
                <StatCard icon={PauseCircle} label="Vagas pausadas" value={String(metrics.pausedJobs)} />
                <StatCard icon={Users} label="Candidaturas recebidas" value={String(metrics.totalApplications)} />
                <StatCard
                    icon={TrendingUp}
                    label="Média por vaga"
                    value={metrics.avgApplicationsPerJob.toString().replace(".", ",")}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <h2 className="text-base font-semibold text-slate-900 mb-4">Funil de candidaturas</h2>
                    {metrics.totalApplications > 0 ? (
                        <div className="space-y-4">
                            {metrics.statusBreakdown.map((item) => (
                                <div key={item.status}>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <StatusBadge status={item.status} />
                                        <span className="text-sm font-medium text-slate-700">{item.count}</span>
                                    </div>
                                    <div className="w-full h-2 rounded-full bg-slate-100">
                                        <div
                                            className={`h-2 rounded-full ${barColors[item.status]}`}
                                            style={{ width: `${(item.count / maxStatusCount) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400 font-light py-10 text-center">
                            Ainda sem candidaturas para mostrar
                        </p>
                    )}
                </div>

                <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <h2 className="text-base font-semibold text-slate-900 mb-4">Candidaturas nos últimos 7 dias</h2>
                    {metrics.totalApplications > 0 ? (
                        <div className="flex items-end justify-between gap-2 h-36">
                            {metrics.last7Days.map((day) => (
                                <div key={day.date} className="flex-1 flex flex-col items-center gap-2 h-full">
                                    <div className="w-full flex-1 flex items-end">
                                        <div
                                            className="w-full rounded-t-md bg-blue-700 transition-all"
                                            style={{ height: day.count === 0 ? "2px" : `${(day.count / maxDayCount) * 100}%` }}
                                            title={`${day.count} candidatura(s)`}
                                        />
                                    </div>
                                    <span className="text-[11px] text-slate-400 font-light">{day.label}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400 font-light py-10 text-center">
                            Ainda sem candidaturas para mostrar
                        </p>
                    )}
                </div>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
                <h2 className="text-base font-semibold text-slate-900 mb-4">Evolução das candidaturas recebidas</h2>
                {metrics.totalApplications > 0 ? (
                    <div className="flex items-end justify-between gap-2 h-40">
                        {metrics.monthlyEvolution.map((month) => (
                            <div key={month.month} className="flex-1 flex flex-col items-center gap-2 h-full">
                                <div className="w-full flex-1 flex items-end">
                                    <div
                                        className="w-full rounded-t-md bg-blue-700 transition-all"
                                        style={{ height: month.count === 0 ? "2px" : `${(month.count / maxMonthCount) * 100}%` }}
                                        title={`${month.count} candidatura(s)`}
                                    />
                                </div>
                                <span className="text-[11px] text-slate-400 font-light">{month.label}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-slate-400 font-light py-10 text-center">
                        Ainda sem candidaturas para mostrar
                    </p>
                )}
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
                <h2 className="text-base font-semibold text-slate-900 mb-4">Vagas com mais candidaturas</h2>
                {metrics.topJobs.length > 0 ? (
                    <ul className="divide-y divide-slate-100">
                        {metrics.topJobs.map((job, index) => (
                            <li key={job.jobId} className="py-3.5 flex items-center gap-3.5">
                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold flex-shrink-0">
                                    {index + 1}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-slate-900 truncate">{job.jobTitle}</p>
                                    <div className="w-full h-1.5 rounded-full bg-slate-100 mt-1.5">
                                        <div
                                            className="h-1.5 rounded-full bg-blue-700"
                                            style={{ width: `${(job.count / maxTopJobCount) * 100}%` }}
                                        />
                                    </div>
                                </div>
                                <span className="text-sm font-medium text-slate-700 flex-shrink-0">{job.count}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-slate-400 font-light py-10 text-center">
                        {metrics.totalJobs === 0
                            ? "Ainda não publicaste nenhuma vaga"
                            : "Ainda sem candidaturas para mostrar"}
                    </p>
                )}
            </div>
        </div>
    )
}
