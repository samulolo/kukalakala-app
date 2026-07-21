import { LucideIcon } from "lucide-react"

interface FeatureCardProps {
    icon: LucideIcon
    title: string
    description: string
}

export default function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
    return (
        <div className="group p-8 rounded-xl border border-slate-200 hover:border-blue-200 hover:bg-blue-50/30 hover:-translate-y-1.5 hover:shadow-lg hover:shadow-blue-100/60 transition-all duration-300">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-50 group-hover:bg-blue-100 group-hover:scale-110 mb-4 transition-all duration-300">
                <Icon className="w-6 h-6 text-blue-700" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {title}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed font-light">
                {description}
            </p>
        </div>
    )
}
