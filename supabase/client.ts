import { createBrowserClient } from "@supabase/ssr";



const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!


export const supabase = createBrowserClient(supabaseUrl, supabaseKey, {
    auth: {
        detectSessionInUrl: false // impede que o supabse detete o código na url e crie a sessão automaticamente
    }
})