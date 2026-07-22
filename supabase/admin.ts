import { createClient as createSupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

// Cliente com a service role key — ignora RLS por completo. Só deve
// ser usado em código que corre fora do pedido de um utilizador
// autenticado (ex: o cron do resumo semanal, que precisa de agregar
// dados de todas as empresas de uma vez). Nunca importar isto a partir
// de uma server action ligada à sessão de um utilizador — para esses
// casos usa sempre supabase/server.ts.
export function createAdminClient() {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!serviceRoleKey) {
        throw new Error("SUPABASE_SERVICE_ROLE_KEY não está definida")
    }

    return createSupabaseClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    })
}
