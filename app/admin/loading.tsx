// Cobre /admin e todas as rotas aninhadas (utilizadores, métricas,
// reports) — sem isto, navegar para o painel de admin não mostrava
// nenhum feedback instantâneo, o que parecia um travamento.
export default function AdminLoading() {
    return (
        <div className="space-y-4 animate-pulse">
            <div className="h-5 w-48 rounded bg-slate-100" />
            <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-20 rounded-2xl border border-slate-200 bg-slate-100" />
                ))}
            </div>
        </div>
    )
}
