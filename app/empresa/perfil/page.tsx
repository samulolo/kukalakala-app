import { getMyCompany } from "@/lib/supabase/company"
import CompanyProfileForm from "./CompanyProfileForm"

export default async function PerfilEmpresaPage() {
    const company = await getMyCompany()

    return <CompanyProfileForm initialCompany={company} />
}
