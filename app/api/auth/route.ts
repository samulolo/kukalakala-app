import { createClient } from "@/supabase/server"
import { NextResponse } from "next/server"



export async function POST(request : Request){

    const supabase = await createClient()

    try {

        const {code} = await request.json()

        if (!code){
            return NextResponse.json(
                { error: true, message: 'Não foi possível identificar o utilizador (código em falta)' },
                { status: 400 }
            )
        }

        const {data, error} = await supabase.auth.exchangeCodeForSession(code)

        if(error){
            console.error("Houve um erro ao obter dados do utilizador: ", error)
            return NextResponse.json(
                { error: true, message: error.message, code: error.code },
                { status: 400 }
            )
        }

        // As contas de empresa autenticam-se sempre por email + palavra-passe.
        // Se este login social (Google/LinkedIn) corresponde a uma conta de
        // empresa, bloqueamos e terminamos de imediato a sessão que acabou
        // de ser criada pela troca de código.
        if (data.user?.user_metadata?.role === "company") {
            await supabase.auth.signOut()
            return NextResponse.json(
                {
                    error: true,
                    message: "Esta conta pertence a uma empresa. As empresas iniciam sessão através do formulário de email e palavra-passe."
                },
                { status: 403 }
            )
        }

        return NextResponse.json({ success: true })

    } catch(err) {
        console.error("Houve um erro ao iniciar sessão: ", err)
        return NextResponse.json(
            { error: true, message: 'Erro interno ao iniciar sessão' },
            { status: 500 }
        )
    }
}