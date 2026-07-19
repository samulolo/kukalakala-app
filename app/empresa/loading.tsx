// Cobre /empresa e todas as rotas aninhadas (vagas, candidaturas,
// métricas, relatórios, perfil) — ver comentário em app/dashboard/loading.tsx.
export default function EmpresaLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-24 rounded-2xl border border-slate-200 bg-slate-100" />
                ))}
            </div>

            <div className="h-72 rounded-2xl border border-slate-200 bg-slate-100" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-48 rounded-2xl border border-slate-200 bg-slate-100" />
                <div className="h-48 rounded-2xl border border-slate-200 bg-slate-100" />
            </div>
        </div>
    )
}
