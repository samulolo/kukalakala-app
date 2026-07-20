import { NextResponse } from "next/server"

// Rota temporária só para diagnosticar o problema do APP_URL em
// produção — mostra exatamente o que o servidor vê em runtime. Não
// expõe nada sensível (não é uma chave secreta). Remover depois de
// confirmarmos a causa.
export async function GET() {
    return NextResponse.json({
        APP_URL: process.env.APP_URL ?? null,
        VERCEL_ENV: process.env.VERCEL_ENV ?? null,
        NODE_ENV: process.env.NODE_ENV ?? null
    })
}
