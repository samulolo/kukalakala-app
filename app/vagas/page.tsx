import Navigation from "@/components/landing/Navigation"
import Footer from "@/components/landing/Footer"
import { getJobFilterOptions, getJobsPage } from "@/lib/supabase/jobs"
import { getViewerApplicationState } from "@/lib/supabase/applications"
import VagasClient from "./VagasClient"

interface VagasPageProps {
    searchParams: Promise<{
        q?: string
        location?: string
        category?: string
        type?: string
        page?: string
    }>
}

export default async function VagasPage({ searchParams }: VagasPageProps) {
    const params = await searchParams
    const page = Number(params.page) > 0 ? Number(params.page) : 1

    const filters = {
        q: params.q ?? "",
        location: params.location ?? "",
        category: params.category ?? "",
        type: params.type ?? ""
    }

    const [jobsPage, filterOptions, viewer] = await Promise.all([
        getJobsPage({ ...filters, page }),
        getJobFilterOptions(),
        getViewerApplicationState()
    ])

    return (
        <div className="bg-white min-h-screen flex flex-col">
            <Navigation />

            <main className="flex-1">
                {/* key força um novo "mount" sempre que os filtros/página mudam
                    na URL, para o estado local dos inputs (VagasClient) partir
                    sempre dos valores atuais em vez de ficar preso ao primeiro
                    valor com que montou. */}
                <VagasClient
                    key={`${filters.q}|${filters.location}|${filters.category}|${filters.type}|${page}`}
                    jobsPage={jobsPage}
                    filterOptions={filterOptions}
                    initialFilters={filters}
                    viewer={viewer}
                />
            </main>

            <Footer />
        </div>
    )
}
