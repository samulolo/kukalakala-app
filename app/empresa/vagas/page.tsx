import { getCompanyJobs } from "@/lib/supabase/company-jobs"
import VagasEmpresaClient from "./VagasEmpresaClient"

export default async function VagasEmpresaPage() {
    const jobs = await getCompanyJobs()

    return <VagasEmpresaClient jobs={jobs} />
}
