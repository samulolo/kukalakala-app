import { Home, Send, Sparkles, User, Bell, type LucideIcon } from "lucide-react"

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
        label: "Candidaturas",
        href: "/dashboard/candidaturas",
        icon: Send,
        eyebrow: "Atividade",
        title: "As tuas candidaturas",
        subtitle: "Todas as vagas a que já te candidataste, com o estado atual de cada uma"
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
        label: "Alertas",
        href: "/dashboard/alertas",
        icon: Bell,
        eyebrow: "Notificações",
        title: "Alertas de vagas",
        subtitle: "Recebe um email sempre que surgir uma vaga nova que combine com uma pesquisa tua"
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
