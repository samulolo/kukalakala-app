interface EvolutionLineChartProps {
    data: { label: string; count: number }[]
    height?: number
}

// Gráfico de linhas simples em SVG (sem dependências externas) para
// mostrar a evolução de uma contagem ao longo de vários períodos.
export default function EvolutionLineChart({ data, height = 180 }: EvolutionLineChartProps) {
    const padding = 24
    const chartWidth = 640
    const chartHeight = height
    const maxCount = Math.max(1, ...data.map((d) => d.count))
    const stepX = data.length > 1 ? (chartWidth - padding * 2) / (data.length - 1) : 0

    const points = data.map((d, i) => {
        const x = data.length > 1 ? padding + stepX * i : chartWidth / 2
        const y = chartHeight - padding - (d.count / maxCount) * (chartHeight - padding * 2)
        return { x, y, label: d.label, count: d.count }
    })

    const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(" ")
    const areaPoints = points.length > 1
        ? `${points[0].x},${chartHeight - padding} ${polylinePoints} ${points[points.length - 1].x},${chartHeight - padding}`
        : ""

    return (
        <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight + 22}`}
            className="w-full"
            role="img"
            aria-label="Evolução das candidaturas"
        >
            {points.length > 1 && (
                <polygon points={areaPoints} fill="#1d4ed8" fillOpacity="0.08" />
            )}
            {points.length > 1 && (
                <polyline
                    points={polylinePoints}
                    fill="none"
                    stroke="#1d4ed8"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />
            )}
            {points.map((p) => (
                <g key={`${p.label}-${p.x}`}>
                    <circle cx={p.x} cy={p.y} r="3.5" fill="#1d4ed8" />
                    {p.count > 0 && (
                        <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="11" fontWeight="600" fill="#334155">
                            {p.count}
                        </text>
                    )}
                    <text x={p.x} y={chartHeight + 16} textAnchor="middle" fontSize="11" fill="#94a3b8">
                        {p.label}
                    </text>
                </g>
            ))}
        </svg>
    )
}
