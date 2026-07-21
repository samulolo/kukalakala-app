import Link from "next/link"
import { Briefcase, Users, Clock, TrendingUp, ArrowUpRight } from "lucide-react"
import { getCompanyJobs } from "@/lib/supabase/company-jobs"
import { getCompanyApplications } from "@/lib/supabase/company-applications"
import { buildMonthlyEvolution } from "@/lib/supabase/company-metrics"
import StatCard from "@/components/dashboard/StatCard"
import StatusBadge from "@/components/dashboard/StatusBadge"
import EvolutionLineChart from "@/components/dashboard/EvolutionLineChart"

export default async function EmpresaHomePage() {
    const [jobs, applications] = await Promise.all([getCompanyJobs(), getCompanyApplications()])

    const activeJobsCount = jobs.filter((job) => job.isActive).length
    const pendingCount = applications.filter((a) => a.status === "Em análise").length
    const approvedCount = applications.filter((a) => a.status === "Aprovado").length
    const hiringRate = applications.length > 0 ? Math.round((approvedCount / applications.length) * 100) : 0
    const recentApplications = applications.slice(0, 6)
    const monthlyEvolution = buildMonthlyEvolution(applications.map((a) => a.createdAt))

    return (
        <div className="space-y-6">

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={Briefcase}
                    label="Vagas ativas"
                    value={String(activeJobsCount)}
                />
                <StatCard
                    icon={Users}
                    label="Candidaturas recebidas"
                    value={String(applications.length)}
                />
                <StatCard
                    icon={Clock}
                    label="Por analisar"
                    value={String(pendingCount)}
                />
                <StatCard
                    icon={TrendingUp}
                    label="Taxa média de contratação"
                    value={applications.length > 0 ? `${hiringRate}%` : "—"}
                />
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
                <h2 className="text-base font-semibold text-slate-900 mb-4">Evolução das candidaturas</h2>
                {applications.length > 0 ? (
                    <EvolutionLineChart data={monthlyEvolution} />
                ) : (
                    <p className="text-sm text-slate-400 font-light py-12 text-center">
                        Ainda não recebeste nenhuma candidatura
                    </p>
                )}
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-slate-900">Candidaturas recentes</h2>
                    <Link
                        href="/empresa/candidaturas"
                        className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-800 transition-colors"
                    >
                        Ver todas
                        <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                {recentApplications.length > 0 ? (
                    <ul className="divide-y divide-slate-100">
                        {recentApplications.map((application) => (
                            <li key={application.id} className="py-3.5 flex items-center gap-3.5">
                                <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold flex-shrink-0">
                                    {application.candidateName.charAt(0)}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-slate-900 truncate">{application.candidateName}</p>
                                    <p className="text-xs text-slate-500 font-light truncate">
                                        {application.jobTitle} · {application.appliedAt}
                                    </p>
                                </div>
                                <StatusBadge status={application.status} />
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-slate-600 font-light text-sm">
                            Ainda não recebeste nenhuma candidatura
                        </p>
                        <Link
                            href="/empresa/vagas"
                            className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:text-blue-800 transition-colors mt-2"
                        >
                            Publicar uma vaga
                            <ArrowUpRight className="w-4 h-4" />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
