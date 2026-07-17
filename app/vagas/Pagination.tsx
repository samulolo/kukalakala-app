import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
    page: number
    totalPages: number
    buildHref: (page: number) => string
}

function buildPageList(current: number, total: number): (number | "...")[] {
    const delta = 1
    const list: (number | "...")[] = []

    for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
            list.push(i)
        } else if (list[list.length - 1] !== "...") {
            list.push("...")
        }
    }

    return list
}

// Links reais (não onClick) — deixa os motores de busca descobrir e
// indexar as páginas seguintes, e funciona sem JavaScript.
export default function Pagination({ page, totalPages, buildHref }: PaginationProps) {
    const pages = buildPageList(page, totalPages)
    const arrowClass =
        "inline-flex items-center justify-center w-9 h-9 rounded-lg border text-sm transition-colors flex-shrink-0"

    return (
        <nav className="flex items-center justify-center gap-1.5 mt-10 flex-wrap" aria-label="Paginação">
            {page > 1 ? (
                <Link
                    href={buildHref(page - 1)}
                    aria-label="Página anterior"
                    className={`${arrowClass} border-slate-200 text-slate-600 hover:bg-slate-50`}
                >
                    <ChevronLeft className="w-4 h-4" strokeWidth={1.75} />
                </Link>
            ) : (
                <span aria-hidden="true" className={`${arrowClass} border-slate-100 text-slate-300`}>
                    <ChevronLeft className="w-4 h-4" strokeWidth={1.75} />
                </span>
            )}

            {pages.map((p, index) =>
                p === "..." ? (
                    <span key={`ellipsis-${index}`} className="px-1.5 text-sm text-slate-400 select-none">
                        …
                    </span>
                ) : (
                    <Link
                        key={p}
                        href={buildHref(p)}
                        aria-current={p === page ? "page" : undefined}
                        className={`inline-flex items-center justify-center w-9 h-9 rounded-lg border text-sm font-medium transition-colors flex-shrink-0 ${
                            p === page
                                ? "border-blue-700 bg-blue-700 text-white"
                                : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                        {p}
                    </Link>
                )
            )}

            {page < totalPages ? (
                <Link
                    href={buildHref(page + 1)}
                    aria-label="Página seguinte"
                    className={`${arrowClass} border-slate-200 text-slate-600 hover:bg-slate-50`}
                >
                    <ChevronRight className="w-4 h-4" strokeWidth={1.75} />
                </Link>
            ) : (
                <span aria-hidden="true" className={`${arrowClass} border-slate-100 text-slate-300`}>
                    <ChevronRight className="w-4 h-4" strokeWidth={1.75} />
                </span>
            )}
        </nav>
    )
}
