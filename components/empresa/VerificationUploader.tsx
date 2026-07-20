"use client"

import { useRef, useState } from "react"
import { Loader2, ShieldCheck, Upload } from "lucide-react"
import { supabase } from "@/supabase/client"
import { submitVerification } from "@/lib/actions/verification"
import type { VerificationStatus } from "@/lib/supabase/company"

const MAX_SIZE_BYTES = 5 * 1024 * 1024

const EXTENSION_MIME: Record<string, string> = {
    pdf: "application/pdf",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png"
}

function getExtension(filename: string): string {
    const parts = filename.split(".")
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ""
}

const statusStyle: Record<VerificationStatus, string> = {
    nao_verificado: "bg-slate-100 text-slate-600",
    pendente: "bg-amber-50 text-amber-700",
    verificado: "bg-emerald-50 text-emerald-700",
    rejeitado: "bg-rose-50 text-rose-700"
}

const statusLabel: Record<VerificationStatus, string> = {
    nao_verificado: "Não verificado",
    pendente: "Em análise",
    verificado: "Verificado",
    rejeitado: "Rejeitado"
}

interface VerificationUploaderProps {
    status: VerificationStatus
    rejectionReason: string
}

// Upload real do documento de verificação (NIF, alvará/certidão
// comercial) para o Storage (bucket privado "verification-docs"),
// direto do browser — mesmo padrão do CvUploader. Depois de carregado,
// submete-o para revisão (fica "pendente" até um admin decidir).
export default function VerificationUploader({ status, rejectionReason }: VerificationUploaderProps) {
    const [currentStatus, setCurrentStatus] = useState(status)
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
            setError("Formato não suportado. Usa PDF, JPG ou PNG.")
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

            const storagePath = `${user.id}/documento.${extension}`
            const { error: uploadError } = await supabase.storage
                .from("verification-docs")
                .upload(storagePath, file, { upsert: true, contentType: file.type || mimeForExtension })

            if (uploadError) {
                console.error("Erro ao carregar documento de verificação: ", uploadError)
                setError("Não foi possível carregar o ficheiro. Tenta novamente.")
                return
            }

            const result = await submitVerification(storagePath)
            if (result.error) {
                setError(result.error)
                return
            }

            setCurrentStatus("pendente")
        } catch (err) {
            console.error("Erro ao submeter verificação: ", err)
            setError("Não foi possível submeter o documento. Tenta novamente.")
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                    <ShieldCheck className="w-4 h-4 text-slate-400" strokeWidth={1.75} />
                    Verificação da empresa
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${statusStyle[currentStatus]}`}>
                    {statusLabel[currentStatus]}
                </span>
            </div>

            {currentStatus === "verificado" && (
                <p className="text-xs text-slate-500 font-light">
                    A tua empresa está verificada — o selo aparece nas tuas vagas publicadas.
                </p>
            )}

            {currentStatus === "pendente" && (
                <p className="text-xs text-slate-500 font-light">
                    Documento em análise. Avisamos assim que houver uma decisão.
                </p>
            )}

            {currentStatus === "rejeitado" && rejectionReason && (
                <p className="text-xs text-rose-600 font-light mb-2">Motivo: {rejectionReason}</p>
            )}

            {currentStatus !== "verificado" && (
                <div className="mt-2">
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        disabled={uploading}
                        className="w-full flex flex-col items-center gap-1.5 px-3.5 py-5 rounded-lg border border-dashed border-slate-300 text-sm text-slate-500 text-center hover:border-blue-300 hover:bg-blue-50/30 transition-colors disabled:opacity-60"
                    >
                        {uploading ? (
                            <Loader2 className="w-5 h-5 flex-shrink-0 animate-spin" strokeWidth={1.5} />
                        ) : (
                            <Upload className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
                        )}
                        <span>
                            {uploading
                                ? "A carregar..."
                                : currentStatus === "rejeitado"
                                    ? "Carregar novo documento"
                                    : "Carregar NIF ou alvará comercial"}
                        </span>
                        <span className="text-xs text-slate-400">PDF, JPG ou PNG até 5 MB</span>
                    </button>
                    <input
                        ref={inputRef}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </div>
            )}

            {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
        </div>
    )
}
