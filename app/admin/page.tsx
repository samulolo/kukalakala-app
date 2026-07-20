import { getPendingCompanyVerifications } from "@/lib/supabase/admin"
import AdminVerificationsClient from "./AdminVerificationsClient"

export default async function AdminPage() {
    const pending = await getPendingCompanyVerifications()

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-base font-semibold text-slate-900">Verificações de empresas pendentes</h2>
                <p className="text-sm text-slate-500 font-light mt-1">
                    {pending.length === 0
                        ? "Nenhum pedido por rever de momento."
                        : `${pending.length} ${pending.length === 1 ? "pedido" : "pedidos"} à espera de decisão.`}
                </p>
            </div>

            <AdminVerificationsClient initialPending={pending} />
        </div>
    )
}
