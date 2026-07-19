import { getMyJobAlerts } from "@/lib/supabase/job-alerts"
import AlertsList from "./AlertsList"

export default async function AlertasPage() {
    const alerts = await getMyJobAlerts()

    return <AlertsList alerts={alerts} />
}
