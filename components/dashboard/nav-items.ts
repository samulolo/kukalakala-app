import { Home, Sparkles, User, type LucideIcon } from "lucide-react"

export interface NavItem {
    label: string
    href: string
    icon: LucideIcon
    eyebrow: string
    title: string
    subtitle: string
}

// Rotas reais da dashboard. "Favoritas" não está aqui — é um painel
// expansível (FavoritesDrawer), não uma página própria.
export const navItems: NavItem[] = [
    {
        label: "Início",
        href: "/dashboard",
        icon: Home,
        eyebrow: "Painel",
        title: "Início",
        subtitle: "O resumo da tua atividade e do teu perfil"
    },
    {
        label: "Recomendadas",
        href: "/dashboard/recomendadas",
        icon: Sparkles,
        eyebrow: "Para ti",
        title: "Vagas recomendadas",
        subtitle: "Com base no teu perfil e candidaturas anteriores"
    },
    {
        label: "Perfil",
        href: "/dashboard/perfil",
        icon: User,
        eyebrow: "Conta",
        title: "O teu perfil",
        subtitle: "Visualiza e edita as tuas informações, competências e CV"
    }
]

export function getActiveNavItem(pathname: string): NavItem {
    return navItems.find((item) => item.href === pathname) ?? navItems[0]
}
