
export default function VagasLoading() {
    return (
        <div className="min-h-screen bg-white pt-36 pb-20 px-6 animate-pulse">
            <div className="max-w-6xl mx-auto">
                <div className="h-4 w-24 bg-slate-100 rounded mb-4" />
                <div className="h-10 w-72 bg-slate-100 rounded mb-8" />
                <div className="h-12 w-full max-w-xl bg-slate-100 rounded-lg mb-10" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-40 rounded-2xl border border-slate-200 bg-slate-100" />
                    ))}
                </div>
            </div>
        </div>
    )
}
