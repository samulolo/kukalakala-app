// Cobre /dashboard e todas as rotas aninhadas (candidaturas, recomendadas,
// perfil) que ainda não tenham o seu próprio loading.tsx. Sem isto, o
// Next.js só mostra alguma coisa depois de TODOS os dados da página
// seguinte estarem prontos — com esta rota fica visível de imediato ao
// clicar num link, o que resolve a sensação de navegação "travada".
export default function DashboardLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-24 rounded-2xl border border-slate-200 bg-slate-100" />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="h-64 rounded-2xl border border-slate-200 bg-slate-100" />
                <div className="lg:col-span-2 h-64 rounded-2xl border border-slate-200 bg-slate-100" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-48 rounded-2xl border border-slate-200 bg-slate-100" />
                <div className="h-48 rounded-2xl border border-slate-200 bg-slate-100" />
            </div>
        </div>
    )
}
