import type { MetadataRoute } from "next"
import { getJobs } from "@/lib/supabase/jobs"

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

// Sitemap dinâmico: páginas estáticas públicas + uma entrada por vaga
// ativa. Regenerado a cada pedido do crawler (rota pública, sem cache
// específico configurado) para nunca listar vagas já fechadas.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const jobs = await getJobs()

    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: siteUrl,
            changeFrequency: "weekly",
            priority: 1
        },
        {
            url: `${siteUrl}/vagas`,
            changeFrequency: "hourly",
            priority: 0.9
        },
        {
            url: `${siteUrl}/auth/register`,
            changeFrequency: "monthly",
            priority: 0.5
        },
        {
            url: `${siteUrl}/privacidade`,
            changeFrequency: "yearly",
            priority: 0.3
        },
        {
            url: `${siteUrl}/termos`,
            changeFrequency: "yearly",
            priority: 0.3
        }
    ]

    const jobRoutes: MetadataRoute.Sitemap = jobs.map((job) => ({
        url: `${siteUrl}/vagas/${job.id}`,
        lastModified: job.createdAt,
        changeFrequency: "daily",
        priority: 0.7
    }))

    return [...staticRoutes, ...jobRoutes]
}
