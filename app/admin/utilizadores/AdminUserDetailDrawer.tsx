"use client"

import { useEffect, useState } from "react"
import { X, Mail, MapPin, Phone, Briefcase, Globe, Calendar, Send } from "lucide-react"
import type { AdminUserSummary, AdminCandidateDetail, AdminCompanyDetail } from "@/lib/supabase/admin"
import { fetchAdminCandidateDetail, fetchAdminCompanyDetail } from "./actions"

interface AdminUserDetailDrawerProps {
    user: AdminUserSummary | null
    onClose: () => void
}

const verificationLabel: Record<string, string> = {
    verificado: "Verificada",
    pendente: "Pendente",
    rejeitado: "Rejeitada",
    nao_verificado: "Não verificada"
}

export default function AdminUserDetailDrawer({ user, onClose }: AdminUserDetailDrawerProps) {
    const isOpen = user !== null

    return (
        <>
            <div
                onClick={onClose}
                aria-hidden="true"
                className={`fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-[1px] transition-opacity duration-300 ${
                    isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
            />
            <aside
                role="dialog"
                aria-modal="true"
                aria-label="Detalhes do utilizador"
                className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[28rem] bg-white border-l border-slate-200 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
                    isOpen ? "translate-x-0" : "translate-x-full"
                }`}
            >
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 flex-shrink-0">
                    <h2 className="text-sm font-semibold text-slate-900">Detalhes</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Fechar"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                        <X className="w-4.5 h-4.5" strokeWidth={1.75} />
                    </button>
                </div>

                {user && (
                    <div className="flex-1 overflow-y-auto px-5 py-5">
                        <UserDetailContent key={`${user.type}-${user.id}`} user={user} />
                    </div>
                )}
            </aside>
        </>
    )
}

function UserDetailContent({ user }: { user: AdminUserSummary }) {
    const [loading, setLoading] = useState(true)
    const [candidate, setCandidate] = useState<AdminCandidateDetail | null>(null)
    const [company, setCompany] = useState<AdminCompanyDetail | null>(null)

    useEffect(() => {
        let active = true

        const load = async () => {
            if (user.type === "candidato") {
                const result = await fetchAdminCandidateDetail(user.id)
                if (active) {
                    setCandidate(result)
                    setLoading(false)
                }
            } else {
                const result = await fetchAdminCompanyDetail(user.id)
                if (active) {
                    setCompany(result)
                    setLoading(false)
                }
            }
        }
        load()

        return () => {
            active = false
        }
    }, [user])

    if (loading) {
        return <p className="text-sm text-slate-400 font-light">A carregar...</p>
    }

    if (user.type === "candidato") {
        return candidate ? (
            <CandidateDetail candidate={candidate} />
        ) : (
            <p className="text-sm text-red-600">Não foi possível carregar os detalhes.</p>
        )
    }

    return company ? (
        <CompanyDetail company={company} />
    ) : (
        <p className="text-sm text-red-600">Não foi possível carregar os detalhes.</p>
    )
}

function CandidateDetail({ candidate }: { candidate: AdminCandidateDetail }) {
    return (
        <div className="space-y-5">
            <div>
                <h3 className="text-lg font-semibold text-slate-900">{candidate.fullName}</h3>
                {candidate.headline && <p className="text-sm text-slate-500 font-light mt-0.5">{candidate.headline}</p>}
            </div>

            <div className="space-y-2.5 text-sm">
                {candidate.email && (
                    <div className="flex items-center gap-2.5 text-slate-600">
                        <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" strokeWidth={1.5} />
                        <span className="truncate">{candidate.email}</span>
                    </div>
                )}
                {candidate.phone && (
                    <div className="flex items-center gap-2.5 text-slate-600">
                        <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" strokeWidth={1.5} />
                        <span>{candidate.phone}</span>
                    </div>
                )}
                {candidate.location && (
                    <div className="flex items-center gap-2.5 text-slate-600">
                        <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" strokeWidth={1.5} />
                        <span>{candidate.location}</span>
                    </div>
                )}
                {candidate.level && (
                    <div className="flex items-center gap-2.5 text-slate-600">
                        <Briefcase className="w-4 h-4 text-slate-400 flex-shrink-0" strokeWidth={1.5} />
                        <span>{candidate.level}</span>
                    </div>
                )}
                <div className="flex items-center gap-2.5 text-slate-600">
                    <Send className="w-4 h-4 text-slate-400 flex-shrink-0" strokeWidth={1.5} />
                    <span>
                        {candidate.applicationCount} {candidate.applicationCount === 1 ? "candidatura" : "candidaturas"}
                    </span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-600">
                    <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" strokeWidth={1.5} />
                    <span>Registado em {new Date(candidate.createdAt).toLocaleDateString("pt-PT")}</span>
                </div>
            </div>

            {candidate.skills.length > 0 && (
                <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Competências</p>
                    <div className="flex flex-wrap gap-1.5">
                        {candidate.skills.map((skill) => (
                            <span key={skill} className="inline-flex px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {candidate.bio && (
                <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Sobre</p>
                    <p className="text-sm text-slate-600 font-light whitespace-pre-wrap">{candidate.bio}</p>
                </div>
            )}
        </div>
    )
}

function CompanyDetail({ company }: { company: AdminCompanyDetail }) {
    return (
        <div className="space-y-5">
            <div>
                <h3 className="text-lg font-semibold text-slate-900">{company.companyName}</h3>
                <span className="inline-flex mt-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs font-medium">
                    {verificationLabel[company.verificationStatus] ?? company.verificationStatus}
                </span>
            </div>

            <div className="space-y-2.5 text-sm">
                {company.email && (
                    <div className="flex items-center gap-2.5 text-slate-600">
                        <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" strokeWidth={1.5} />
                        <span className="truncate">{company.email}</span>
                    </div>
                )}
                {company.sector && (
                    <div className="flex items-center gap-2.5 text-slate-600">
                        <Briefcase className="w-4 h-4 text-slate-400 flex-shrink-0" strokeWidth={1.5} />
                        <span>{company.sector}</span>
                    </div>
                )}
                {company.location && (
                    <div className="flex items-center gap-2.5 text-slate-600">
                        <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" strokeWidth={1.5} />
                        <span>{company.location}</span>
                    </div>
                )}
                {company.website && (
                    <div className="flex items-center gap-2.5 text-slate-600">
                        <Globe className="w-4 h-4 text-slate-400 flex-shrink-0" strokeWidth={1.5} />
                        <span className="truncate">{company.website}</span>
                    </div>
                )}
                <div className="flex items-center gap-2.5 text-slate-600">
                    <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" strokeWidth={1.5} />
                    <span>Registada em {new Date(company.createdAt).toLocaleDateString("pt-PT")}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-xs text-slate-500 font-light">Vagas publicadas</p>
                    <p className="text-lg font-semibold text-slate-900">{company.jobCount}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-xs text-slate-500 font-light">Candidaturas recebidas</p>
                    <p className="text-lg font-semibold text-slate-900">{company.applicationCount}</p>
                </div>
            </div>
        </div>
    )
}
