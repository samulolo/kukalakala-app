import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!



export const createClient = async function(){

    const cookieStore = await cookies()

    return createServerClient(
        supabaseUrl, supabaseKey, {


            cookies: {
                getAll(){
                    return cookieStore.getAll()
                },
                setAll(cookieToSet){

                    try {
                        cookieToSet.forEach(({name, value, options}) => {
                            cookieStore.set(name, value, options)
                        })

                    } catch {
                        // Server Components não podem escrever cookies —
                        // esperado quando isto corre fora de uma Server
                        // Action/Route Handler. O middleware (proxy.ts) já
                        // trata da renovação do cookie de sessão.
                    }
                }

            }

        }
    )
}

// getUser() revalida o token contra a Supabase (chamada de rede) e, sem
// isto, cada função em lib/supabase/*.ts que precisa de saber "quem é o
// utilizador" fazia a sua própria chamada — uma única navegação a
// /dashboard chegava a disparar 7-9 pedidos de rede iguais em sequência,
// o que se sentia como lentidão a navegar. React.cache() partilha o
// resultado por todas as chamadas dentro do mesmo request/render,
// reduzindo isso a 1 chamada real — sem abdicar da revalidação (ao
// contrário de usar getSession(), que só lê o cookie sem confirmar que
// ainda é válido no servidor).
export const getVerifiedUser = cache(async () => {
    const supabase = await createClient()
    return supabase.auth.getUser()
})