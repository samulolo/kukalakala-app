import { getAllUsers } from "@/lib/supabase/admin"
import AdminUsersClient from "./AdminUsersClient"

export default async function AdminUsersPage() {
    const users = await getAllUsers()

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-base font-semibold text-slate-900">Utilizadores</h2>
                <p className="text-sm text-slate-500 font-light mt-1">
                    {users.length} {users.length === 1 ? "registo" : "registos"} na plataforma.
                </p>
            </div>

            <AdminUsersClient users={users} />
        </div>
    )
}
