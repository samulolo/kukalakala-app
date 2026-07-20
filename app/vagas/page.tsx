import type { Metadata } from "next"
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

// Título/descrição refletem os filtros ativos ("Vagas de Marketing em
// Lisboa"), para pesquisas específicas terem um snippet relevante nos
// motores de busca. Canonical aponta para o próprio URL filtrado — cada
// combinação de filtros é uma página de resultados válida e indexável.
export async function generateMetadata({ searchParams }: VagasPageProps): Promise<Metadata> {
    const params = await searchParams
    const location = params.location ?? ""
    const category = params.category ?? ""
    const type = params.type ?? ""
    const page = Number(params.page) > 0 ? Number(params.page) : 1

    const parts: string[] = []
    if (category) parts.push(`de ${category}`)
    if (type) parts.push(type)
    if (location) parts.push(`em ${location}`)

    const title = parts.length > 0 ? `Vagas ${parts.join(" ")}` : "Vagas disponíveis"
    const description =
        parts.length > 0
            ? `Explora vagas ${parts.join(" ")} na Kukalakala, com análise de IA em cada candidatura.`
            : "Explora vagas de empresas que estão a contratar agora na Kukalakala, com análise de IA em cada candidatura."

    const canonicalParams = new URLSearchParams()
    if (params.q) canonicalParams.set("q", params.q)
    if (location) canonicalParams.set("location", location)
    if (category) canonicalParams.set("category", category)
    if (type) canonicalParams.set("type", type)
    if (page > 1) canonicalParams.set("page", String(page))
    const canonicalQuery = canonicalParams.toString()

    return {
        title,
        description,
        alternates: {
            canonical: canonicalQuery ? `/vagas?${canonicalQuery}` : "/vagas"
        },
        openGraph: { title, description },
        twitter: { title, description }
    }
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
