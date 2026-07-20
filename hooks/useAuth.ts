import { supabase } from "@/supabase/client";

interface SignIn{
    signIn:  () => Promise<void>;
}

class SignInWithGoogle implements SignIn {

    async signIn(){

        try{
            // window.location.origin em vez de um valor fixo — no
            // telemóvel (ou em qualquer ambiente que não seja
            // literalmente "localhost:3000" no browser do developer)
            // um baseUrl fixo faz o Google devolver a sessão para um
            // endereço que não existe nesse dispositivo.
            const {error} = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`
                }
            })
            if(error){
                throw error
            }

        } catch(err){
            console.error("Erro ao iniciar sessão com o Google: ", err)
            throw err
        }
    }
}

class SignInWithLinkedin implements SignIn {

    async signIn(){

        try{
            const {error} = await supabase.auth.signInWithOAuth({
                provider: 'linkedin_oidc',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`
                }
            })

            if(error){
                throw error
            }

        } catch(err){
            console.error("Erro ao iniciar sessão com o LinkedIn: ", err)
            throw err
        }

    }
}



const getOauthUser = async(code: string | null, origin: string ) => {

    if (!code) return { error: true, message: 'Código de autorização em falta' }

    const response = await fetch(`${origin}/api/auth`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({code})
    })

    const data = await response.json()

    if (!response.ok){
        console.error("Erro ao salvar a sessão do utilizador: ", data)
    }

    return data

}

        
const providers = {
    google: new SignInWithGoogle(),
    linkedin: new SignInWithLinkedin(),
} as const;


export { providers, getOauthUser };


