"use client"

import { useRef, useState } from "react"
import { FileText, Loader2, Upload, X } from "lucide-react"
import { supabase } from "@/supabase/client"
import { getCvSignedUrl, removeCv, saveCvMetadata } from "@/lib/actions/cv"

const MAX_SIZE_BYTES = 5 * 1024 * 1024

const EXTENSION_MIME: Record<string, string> = {
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
}

function getExtension(filename: string): string {
    const parts = filename.split(".")
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ""
}

interface CvUploaderProps {
    initialFilename: string | null
    initialPath: string | null
    onChange?: (result: { filename: string | null; path: string | null }) => void
}

// Upload real de CV para o Supabase Storage (bucket privado "cvs"),
// direto do browser — evita fazer o ficheiro passar pelo servidor
// Next.js. É imediato: assim que o ficheiro é escolhido, é carregado
// e guardado, sem depender do botão "Guardar alterações" do resto
// do formulário de perfil.
export default function CvUploader({ initialFilename, initialPath, onChange }: CvUploaderProps) {
    const [filename, setFilename] = useState(initialFilename)
    const [path, setPath] = useState(initialPath)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState("")
    const inputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        e.target.value = ""
        if (!file) return

        setError("")

        const extension = getExtension(file.name)
        const mimeForExtension = EXTENSION_MIME[extension]
        if (!mimeForExtension) {
            setError("Formato não suportado. Usa PDF, DOC ou DOCX.")
            return
        }
        if (file.size > MAX_SIZE_BYTES) {
            setError("O ficheiro não pode exceder 5 MB.")
            return
        }

        setUploading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                setError("Precisas de iniciar sessão.")
                return
            }

            const storagePath = `${user.id}/cv.${extension}`
            const { error: uploadError } = await supabase.storage
                .from("cvs")
                .upload(storagePath, file, { upsert: true, contentType: file.type || mimeForExtension })

            if (uploadError) {
                console.error("Erro ao carregar CV: ", uploadError)
                setError("Não foi possível carregar o ficheiro. Tenta novamente.")
                return
            }

            const result = await saveCvMetadata(file.name, storagePath)
            if (result.error) {
                setError(result.error)
                return
            }

            setFilename(file.name)
            setPath(storagePath)
            onChange?.({ filename: file.name, path: storagePath })
        } catch (err) {
            console.error("Erro ao carregar CV: ", err)
            setError("Não foi possível carregar o ficheiro. Tenta novamente.")
        } finally {
            setUploading(false)
        }
    }

    const handleRemove = async () => {
        if (!path || uploading) return
        setUploading(true)
        setError("")
        try {
            const result = await removeCv(path)
            if (result.error) {
                setError(result.error)
                return
            }
            setFilename(null)
            setPath(null)
            onChange?.({ filename: null, path: null })
        } catch (err) {
            console.error("Erro ao remover CV: ", err)
            setError("Não foi possível remover o ficheiro. Tenta novamente.")
        } finally {
            setUploading(false)
        }
    }

    const handleView = async () => {
        if (!path) return
        const result = await getCvSignedUrl(path)
        if (result.url) {
            window.open(result.url, "_blank", "noopener,noreferrer")
        } else {
            setError(result.error || "Não foi possível abrir o ficheiro.")
        }
    }

    return (
        <div>
            {filename ? (
                <div className="flex items-center gap-3 px-3.5 py-3 rounded-lg border border-slate-200">
                    <FileText className="w-5 h-5 text-blue-700 flex-shrink-0" strokeWidth={1.75} />
                    <button
                        type="button"
                        onClick={handleView}
                        className="min-w-0 flex-1 text-left"
                        title="Ver ficheiro"
                    >
                        <p className="text-sm font-medium text-slate-900 truncate hover:underline">{filename}</p>
                        <p className="text-xs text-slate-400 font-light">Visível para empresas · clica para ver</p>
                    </button>
                    <button
                        type="button"
                        onClick={handleRemove}
                        disabled={uploading}
                        aria-label="Remover CV"
                        className="text-slate-400 hover:text-red-600 transition-colors flex-shrink-0 disabled:opacity-50"
                    >
                        {uploading ? (
                            <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.75} />
                        ) : (
                            <X className="w-4 h-4" strokeWidth={1.75} />
                        )}
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                    className="w-full flex flex-col items-center gap-2 px-3.5 py-8 rounded-lg border border-dashed border-slate-300 text-sm text-slate-500 text-center hover:border-blue-300 hover:bg-blue-50/30 transition-colors disabled:opacity-60"
                >
                    {uploading ? (
                        <Loader2 className="w-6 h-6 flex-shrink-0 animate-spin" strokeWidth={1.5} />
                    ) : (
                        <Upload className="w-6 h-6 flex-shrink-0" strokeWidth={1.5} />
                    )}
                    <span>{uploading ? "A carregar..." : "Clica para carregar o teu CV"}</span>
                    <span className="text-xs text-slate-400">PDF, DOC ou DOCX até 5 MB</span>
                </button>
            )}

            <input
                ref={inputRef}
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileChange}
                className="hidden"
            />

            {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
        </div>
    )
}
