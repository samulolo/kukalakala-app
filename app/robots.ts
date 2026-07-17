import type { MetadataRoute } from "next"

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

// Permite indexação das rotas públicas (landing, /vagas) e bloqueia as
// áreas autenticadas (dashboards, callback de auth, onboarding), que não
// têm valor de indexação e exigem sessão.
export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: ["/dashboard", "/empresa", "/onboarding", "/auth/callback", "/api"]
        },
        sitemap: `${siteUrl}/sitemap.xml`
    }
}
