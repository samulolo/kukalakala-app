import { getMyProfile } from "@/lib/supabase/profile"
import ProfileForm from "./ProfileForm"

export default async function ProfilePage() {
    const profile = await getMyProfile()

    return <ProfileForm initialProfile={profile} />
}
