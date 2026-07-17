// Tipos e helpers puros do perfil — sem dependências de servidor
// (nada de "@/supabase/server" aqui), para poderem ser importados em
// segurança por Client Components como o ProfileForm.

export interface Profile {
    id: string
    fullName: string
    headline: string
    location: string
    phone: string
    bio: string
    level: string
    skills: string[]
    cvFilename: string | null
    cvPath: string | null
}

export interface ChecklistItem {
    label: string
    done: boolean
}

// Nota: o CV não faz parte deste input — o upload é imediato e
// independente do resto do formulário (ver components/dashboard/CvUploader.tsx
// e lib/actions/cv.ts), para não arriscar sobrepor um upload recente
// com um estado desatualizado quando o resto do perfil é guardado.
export interface ProfileInput {
    fullName: string
    headline: string
    location: string
    phone: string
    bio: string
    level: string
    skills: string[]
}

export function checklistFromProfile(profile: Pick<Profile, "fullName" | "location" | "phone" | "headline" | "level" | "bio" | "skills" | "cvFilename"> | null): ChecklistItem[] {
    return [
        { label: "Dados pessoais", done: Boolean(profile?.fullName && profile.location && profile.phone) },
        { label: "Experiência profissional", done: Boolean(profile?.headline && profile.level && profile.bio) },
        { label: "Currículo (CV)", done: Boolean(profile?.cvFilename) },
        { label: "Competências e certificações", done: Boolean(profile && profile.skills.length > 0) }
    ]
}

export function completionFromChecklist(checklist: ChecklistItem[]): number {
    if (checklist.length === 0) return 0
    return Math.round((checklist.filter((item) => item.done).length / checklist.length) * 100)
}
