import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!


// Áreas protegidas, separadas por papel — uma conta de empresa não deve
// conseguir navegar no painel do candidato e vice-versa.
const candidateOnlyPrefixes = ["/dashboard", "/onboarding"]
const companyOnlyPrefixes = ["/empresa"]

// Rotas que não fazem sentido visitar com sessão já iniciada — um
// utilizador autenticado que tente lá entrar é reencaminhado para o
// seu painel em vez de ver o formulário de login/registo.
const authOnlyPrefixes = ["/auth/login", "/auth/register"]

export async function proxy(request: NextRequest) {

    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
            getAll() {
                return request.cookies.getAll()
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                supabaseResponse = NextResponse.next({ request })
                cookiesToSet.forEach(({ name, value, options }) =>
                    supabaseResponse.cookies.set(name, value, options)
                )
            }
        }
    })

    // getUser() (e não getSession()) porque revalida o token contra a
    // Supabase em vez de confiar cegamente no cookie. É esta chamada que,
    // como efeito colateral, renova o access token quando ele expira.
    const { data: { user } } = await supabase.auth.getUser()

    const { pathname } = request.nextUrl
    const isCandidateArea = candidateOnlyPrefixes.some((prefix) => pathname.startsWith(prefix))
    const isCompanyArea = companyOnlyPrefixes.some((prefix) => pathname.startsWith(prefix))
    const isProtected = isCandidateArea || isCompanyArea

    if (!user && isProtected) {
        const url = request.nextUrl.clone()
        url.pathname = "/auth/login"
        url.searchParams.set("redirectTo", pathname)
        if (isCompanyArea) {
            url.searchParams.set("type", "company")
        }
        return NextResponse.redirect(url)
    }

    if (user) {
        const isCompanyUser = user.user_metadata?.role === "company"

        // Conta de empresa a tentar entrar no painel do candidato (ou
        // vice-versa) — devolve-a à área que lhe pertence.
        if (isCandidateArea && isCompanyUser) {
            const url = request.nextUrl.clone()
            url.pathname = "/empresa"
            url.search = ""
            return NextResponse.redirect(url)
        }

        if (isCompanyArea && !isCompanyUser) {
            const url = request.nextUrl.clone()
            url.pathname = "/dashboard"
            url.search = ""
            return NextResponse.redirect(url)
        }

        const isAuthOnly = authOnlyPrefixes.some((prefix) => pathname.startsWith(prefix))

        if (isAuthOnly) {
            const url = request.nextUrl.clone()
            url.pathname = isCompanyUser ? "/empresa" : "/dashboard"
            url.search = ""
            return NextResponse.redirect(url)
        }
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"
    ]
}
