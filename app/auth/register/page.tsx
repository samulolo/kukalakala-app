import CompanyRegisterForm from "@/components/CompanyRegisterForm"

// Registo é só para empresas — o candidato autentica-se sempre via
// /auth/login (Google/LinkedIn tratam de criar a conta e iniciar
// sessão no mesmo passo, não há formulário de registo separado).
export default function RegisterPage() {
    return <CompanyRegisterForm />
}
