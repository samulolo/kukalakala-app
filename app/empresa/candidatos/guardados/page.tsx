import { getSavedCandidates } from "@/lib/supabase/saved-candidates"
import SavedCandidateCard from "./SavedCandidateCard"

export default async function GuardadosPage() {
    const saved = await getSavedCandidates()

    return (
        <div className="space-y-4">
            <p className="text-sm text-slate-500 font-light">
                Candidatos que guardaste para reavaliar no futuro — mesmo quando não contratados agora
            </p>

            {saved.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                    {saved.map((candidate) => (
                        <SavedCandidateCard key={candidate.candidateId} candidate={candidate} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 rounded-2xl border border-slate-200 bg-white">
                    <p className="text-slate-600 font-light text-sm">
                        Ainda não guardaste nenhum candidato. Vai a &ldquo;Candidatos&rdquo; e guarda quem quiseres
                        reavaliar no futuro.
                    </p>
                </div>
            )}
        </div>
    )
}
