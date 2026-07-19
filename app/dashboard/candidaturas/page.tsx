import { getMyApplicationsPage, type ApplicationStatus } from "@/lib/supabase/applications"
import CandidaturasFilterClient from "./CandidaturasFilterClient"

const validStatuses: ApplicationStatus[] = ["Em análise", "Entrevista", "Aprovado", "Rejeitado"]

interface CandidaturasPageProps {
    searchParams: Promise<{
        q?: string
        status?: string
        page?: string
    }>
}

export default async function CandidaturasPage({ searchParams }: CandidaturasPageProps) {
    const params = await searchParams
    const page = Number(params.page) > 0 ? Number(params.page) : 1

    const status: ApplicationStatus | "" = validStatuses.includes(params.status as ApplicationStatus)
        ? (params.status as ApplicationStatus)
        : ""

    const filters = { q: params.q ?? "", status }

    const applicationsPage = await getMyApplicationsPage({ ...filters, page })

    return (
        <CandidaturasFilterClient
            key={`${filters.q}|${filters.status}|${page}`}
            applicationsPage={applicationsPage}
            initialFilters={filters}
        />
    )
}
