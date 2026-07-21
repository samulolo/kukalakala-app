import { Home, Briefcase, Users, Search, Bookmark, Building2, BarChart3, FileText, type LucideIcon } from "lucide-react"

export interface NavItem {
    label: string
    href: string
    icon: LucideIcon
    eyebrow: string
    title: string
    subtitle: string
}

export const navItems: NavItem[] = [
    {
        label: "Início",
        href: "/empresa",
        icon: Home,
        eyebrow: "Painel",
        title: "Início",
        subtitle: "O resumo da atividade das tuas vagas"
    },
    {
        label: "Vagas",
        href: "/empresa/vagas",
        icon: Briefcase,
        eyebrow: "Recrutamento",
        title: "As tuas vagas",
        subtitle: "Cria, edita e gere as vagas que publicaste"
    },
    {
        label: "Candidaturas",
        href: "/empresa/candidaturas",
        icon: Users,
        eyebrow: "Recrutamento",
        title: "Candidaturas",
        subtitle: "Acompanha e avalia quem se candidatou às tuas vagas"
    },
    {
        label: "Candidatos",
        href: "/empresa/candidatos",
        icon: Search,
        eyebrow: "Recrutamento",
        title: "Pesquisar candidatos",
        subtitle: "Encontra, entre quem já se candidatou, quem melhor encaixa numa vaga"
    },
    {
        label: "Guardados",
        href: "/empresa/candidatos/guardados",
        icon: Bookmark,
        eyebrow: "Recrutamento",
        title: "Candidatos guardados",
        subtitle: "Quem guardaste para reavaliar no futuro, com as tuas notas"
    },
    {
        label: "Métricas",
        href: "/empresa/metricas",
        icon: BarChart3,
        eyebrow: "Recrutamento",
        title: "Métricas",
        subtitle: "O desempenho das tuas vagas e candidaturas"
    },
    {
        label: "Relatórios",
        href: "/empresa/relatorios",
        icon: FileText,
        eyebrow: "Recrutamento",
        title: "Relatórios",
        subtitle: "Candidaturas por vaga, prontas para exportar"
    },
    {
        label: "Perfil",
        href: "/empresa/perfil",
        icon: Building2,
        eyebrow: "Conta",
        title: "Perfil da empresa",
        subtitle: "Visualiza e edita as informações da tua empresa"
    }
]

export function getActiveNavItem(pathname: string): NavItem {
    return navItems.find((item) => item.href === pathname) ?? navItems[0]
}
