import Navigation from "@/components/landing/Navigation"
import Footer from "@/components/landing/Footer"
import { getJobs } from "@/lib/supabase/jobs"
import VagasClient from "./VagasClient"

export default async function VagasPage() {
    const jobs = await getJobs()

    return (
        <div className="bg-white min-h-screen flex flex-col">
            <Navigation />

            <main className="flex-1">
                <VagasClient jobs={jobs} />
            </main>

            <Footer />
        </div>
    )
}
