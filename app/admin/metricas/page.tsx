import { Users, Building2, Briefcase, Send, ShieldCheck, Clock, CheckCircle2 } from "lucide-react"
import { getPlatformMetrics } from "@/lib/supabase/admin"
import StatCard from "@/components/dashboard/StatCard"
import EvolutionLineChart from "@/components/dashboard/EvolutionLineChart"

export default async function AdminMetricsPage() {
    const metrics = await getPlatformMetrics()

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-base font-semibold text-slate-900">Métricas gerais</h2>
                <p className="text-sm text-slate-500 font-light mt-1">Visão geral do crescimento da plataforma.</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Users} label="Candidatos registados" value={String(metrics.totalCandidates)} />
                <StatCard icon={Building2} label="Empresas registadas" value={String(metrics.totalCompanies)} />
                <StatCard icon={Briefcase} label="Vagas publicadas" value={String(metrics.totalJobs)} />
                <StatCard icon={Send} label="Candidaturas totais" value={String(metrics.totalApplications)} />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={CheckCircle2} label="Vagas ativas" value={String(metrics.activeJobs)} />
                <StatCard icon={ShieldCheck} label="Empresas verificadas" value={String(metrics.verifiedCompanies)} />
                <StatCard icon={Clock} label="Verificações pendentes" value={String(metrics.pendingVerifications)} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <h2 className="text-base font-semibold text-slate-900 mb-4">Novos candidatos por mês</h2>
                    {metrics.totalCandidates > 0 ? (
                        <EvolutionLineChart data={metrics.candidateSignups} />
                    ) : (
                        <p className="text-sm text-slate-400 font-light py-12 text-center">Ainda sem registos de candidatos</p>
                    )}
                </div>
                <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <h2 className="text-base font-semibold text-slate-900 mb-4">Novas empresas por mês</h2>
                    {metrics.totalCompanies > 0 ? (
                        <EvolutionLineChart data={metrics.companySignups} />
                    ) : (
                        <p className="text-sm text-slate-400 font-light py-12 text-center">Ainda sem registos de empresas</p>
                    )}
                </div>
            </div>
        </div>
    )
}
