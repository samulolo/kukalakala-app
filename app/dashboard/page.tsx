import Link from "next/link"
import { CheckCircle2, Circle, ArrowUpRight, Send, MessageSquare, TrendingUp, Heart } from "lucide-react"
import { getMyProfile, checklistFromProfile, completionFromChecklist } from "@/lib/supabase/profile"
import { getMyApplications, getMyApplicationSummaryById, getMyApplicationsTimeline } from "@/lib/supabase/applications"
import { getSavedJobIds } from "@/lib/supabase/saved-jobs"
import StatusBadge from "@/components/dashboard/StatusBadge"
import StatCard from "@/components/dashboard/StatCard"
import FavoritesTrigger from "@/components/dashboard/FavoritesTrigger"
import RecentApplicationsList from "@/components/dashboard/RecentApplicationsList"

const barColors: Record<string, string> = {
    "Em análise": "bg-blue-700",
    "Entrevista": "bg-amber-500",
    "Aprovado": "bg-emerald-600",
    "Rejeitado": "bg-slate-400"
}

interface DashboardHomePageProps {
    searchParams: Promise<{ conversa?: string }>
}

export default async function DashboardHomePage({ searchParams }: DashboardHomePageProps) {
    const { conversa } = await searchParams

    const [profile, applications, timeline, savedJobIds, openConversation] = await Promise.all([
        getMyProfile(),
        getMyApplications(),
        getMyApplicationsTimeline(),
        getSavedJobIds(),
        conversa ? getMyApplicationSummaryById(conversa) : Promise.resolve(null)
    ])

    const name = profile?.fullName || "Candidato(a)"
    const initials = name
        .split(" ")
        .map((part) => part.charAt(0))
        .slice(0, 2)
        .join("")
        .toUpperCase()

    const checklist = checklistFromProfile(profile)
    const completion = completionFromChecklist(checklist)

    const interviewCount = applications.filter((a) => a.status === "Entrevista").length

    // Taxa de resposta real: candidaturas que já saíram de "Em análise"
    // (a empresa reagiu, seja para entrevista, aprovação ou rejeição)
    // sobre o total. Sem seta de tendência — não guardamos histórico de
    // estados passados para comparar com um período anterior.
    const respondedCount = applications.filter((a) => a.status !== "Em análise").length
    const responseRate = applications.length > 0 ? Math.round((respondedCount / applications.length) * 100) : 0

    const now = new Date()
    const appliedThisMonthCount = applications.filter((a) => {
        const created = new Date(a.createdAt)
        return created.getFullYear() === now.getFullYear() && created.getMonth() === now.getMonth()
    }).length

    // getMyApplications() já vem ordenado por mais recente primeiro — a
    // rota principal só mostra uma pré-visualização; a lista completa
    // fica em /dashboard/candidaturas.
    const recentApplications = applications.slice(0, 3)

    return (
        <div className="space-y-6">

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={Send}
                    label="Candidaturas enviadas"
                    value={String(applications.length)}
                    trend={appliedThisMonthCount > 0 ? { value: `+${appliedThisMonthCount} este mês`, positive: true } : undefined}
                />
                <StatCard
                    icon={MessageSquare}
                    label="Em entrevista"
                    value={String(interviewCount)}
                />
                <StatCard
                    icon={TrendingUp}
                    label="Taxa de resposta"
                    value={`${responseRate}%`}
                />
                <StatCard
                    icon={Heart}
                    label="Vagas favoritas"
                    value={String(savedJobIds.length)}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                <div className="lg:col-span-1 p-6 rounded-2xl border border-slate-200 bg-white shadow-sm h-fit">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white font-semibold">
                            {initials}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">{name}</p>
                            <p className="text-xs text-slate-500 font-light truncate">
                                {profile?.headline || "Cargo por preencher"} · {profile?.location || "Localização por preencher"}
                            </p>
                        </div>
                    </div>

                    <div className="mb-5">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-medium text-slate-600">Perfil completo</span>
                            <span className="text-xs font-semibold text-blue-700">{completion}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-100">
                            <div
                                className="h-1.5 rounded-full bg-blue-700"
                                style={{ width: `${completion}%` }}
                            />
                        </div>
                    </div>

                    <ul className="space-y-2.5 mb-5">
                        {checklist.map((item) => (
                            <li key={item.label} className="flex items-center gap-2 text-sm">
                                {item.done ? (
                                    <CheckCircle2 className="w-4 h-4 text-blue-700 flex-shrink-0" strokeWidth={1.75} />
                                ) : (
                                    <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" strokeWidth={1.75} />
                                )}
                                <span className={item.done ? "text-slate-600" : "text-slate-400"}>
                                    {item.label}
                                </span>
                            </li>
                        ))}
                    </ul>

                    <Link
                        href="/dashboard/perfil"
                        className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:text-blue-800 transition-colors"
                    >
                        Ver e editar perfil
                        <ArrowUpRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="lg:col-span-2 p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-semibold text-slate-900">Candidaturas recentes</h2>
                        <div className="flex items-center gap-4">
                            <Link
                                href="/dashboard/candidaturas"
                                className="text-xs font-medium text-blue-700 hover:text-blue-800 transition-colors"
                            >
                                Ver todas
                            </Link>
                            <FavoritesTrigger className="text-xs font-medium text-blue-700 hover:text-blue-800 transition-colors">
                                Ver favoritas
                            </FavoritesTrigger>
                        </div>
                    </div>

                    {recentApplications.length > 0 ? (
                        <RecentApplicationsList applications={recentApplications} openConversation={openConversation} />
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-slate-600 font-light text-sm">
                                Ainda não te candidataste a nenhuma vaga
                            </p>
                            <Link
                                href="/dashboard/recomendadas"
                                className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:text-blue-800 transition-colors mt-2"
                            >
                                Ver vagas recomendadas
                                <ArrowUpRight className="w-4 h-4" />
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <h2 className="text-base font-semibold text-slate-900 mb-4">Evolução das candidaturas</h2>
                    {timeline.totalApplications > 0 ? (
                        <div className="flex items-end justify-between gap-2 h-36">
                            {timeline.monthlyEvolution.map((month) => {
                                const maxMonthCount = Math.max(1, ...timeline.monthlyEvolution.map((m) => m.count))
                                return (
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
                                )
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400 font-light py-12 text-center">
                            Ainda não te candidataste a nenhuma vaga
                        </p>
                    )}
                </div>

                <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <h2 className="text-base font-semibold text-slate-900 mb-4">Candidaturas por estado</h2>
                    {timeline.totalApplications > 0 ? (
                        <div className="space-y-4">
                            {timeline.statusBreakdown.map((item) => {
                                const maxStatusCount = Math.max(1, ...timeline.statusBreakdown.map((s) => s.count))
                                return (
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
                                )
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400 font-light py-12 text-center">
                            Ainda não te candidataste a nenhuma vaga
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}
