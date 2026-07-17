'use client'

import { Download } from "lucide-react"
import type { JobReportRow } from "@/lib/supabase/company-reports"

const statusOrder = ["Em análise", "Entrevista", "Aprovado", "Rejeitado"] as const

function escapeCsvValue(value: string | number): string {
    const str = String(value)
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`
    }
    return str
}

export default function ExportReportCsvButton({ rows }: { rows: JobReportRow[] }) {
    const handleExport = () => {
        const header = ["Vaga", "Estado", ...statusOrder, "Total"]
        const lines = [header.map(escapeCsvValue).join(",")]

        for (const row of rows) {
            const line = [
                row.jobTitle,
                row.isActive ? "Ativa" : "Pausada",
                ...statusOrder.map((status) => row.statusCounts[status]),
                row.total
            ]
            lines.push(line.map(escapeCsvValue).join(","))
        }

        // BOM no início para o Excel reconhecer o UTF-8 corretamente.
        const csvContent = "\uFEFF" + lines.join("\n")
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `relatorio-candidaturas-${new Date().toISOString().slice(0, 10)}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    return (
        <button
            type="button"
            onClick={handleExport}
            disabled={rows.length === 0}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg px-4 py-2 transition-colors"
        >
            <Download className="w-4 h-4" strokeWidth={1.75} />
            Exportar CSV
        </button>
    )
}
