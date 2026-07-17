export default function CompanyIllustration() {
    return (
        <svg
            viewBox="0 0 420 420"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
            role="img"
            aria-label="Ilustração de um painel de recrutamento com candidatos e métricas"
        >
            <defs>
                <filter id="compCardShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#0f172a" floodOpacity="0.10" />
                </filter>
            </defs>

            {/* background blobs */}
            <circle cx="90" cy="80" r="100" fill="#1d4ed8" opacity="0.06" />
            <circle cx="350" cy="330" r="90" fill="#2563eb" opacity="0.06" />

            {/* Dashboard card */}
            <g transform="translate(45,50)" filter="url(#compCardShadow)">
                <rect width="280" height="230" rx="18" fill="white" stroke="#e2e8f0" strokeWidth="1.5" />
            </g>
            <g transform="translate(45,50)">
                {/* header */}
                <rect x="22" y="22" width="120" height="10" rx="5" fill="#0f172a" />
                <rect x="22" y="38" width="80" height="7" rx="3.5" fill="#94a3b8" />
                <rect x="222" y="20" width="36" height="30" rx="9" fill="#1d4ed8" />
                <path d="M 240 28 v 14 M 233 35 h 14" stroke="white" strokeWidth="2.5" strokeLinecap="round" />

                <line x1="22" y1="68" x2="258" y2="68" stroke="#e2e8f0" />

                {/* candidate row 1 */}
                <circle cx="38" cy="94" r="14" fill="#dbeafe" />
                <rect x="60" y="87" width="110" height="8" rx="4" fill="#0f172a" opacity="0.8" />
                <rect x="60" y="99" width="70" height="6" rx="3" fill="#cbd5e1" />
                <rect x="206" y="85" width="54" height="20" rx="10" fill="#ecfdf5" />
                <text x="233" y="99" textAnchor="middle" fontFamily="ui-sans-serif, system-ui" fontSize="9.5" fontWeight="600" fill="#059669">Aprovado</text>

                {/* candidate row 2 */}
                <circle cx="38" cy="140" r="14" fill="#dbeafe" />
                <rect x="60" y="133" width="100" height="8" rx="4" fill="#0f172a" opacity="0.8" />
                <rect x="60" y="145" width="76" height="6" rx="3" fill="#cbd5e1" />
                <rect x="206" y="131" width="54" height="20" rx="10" fill="#eff6ff" />
                <text x="233" y="145" textAnchor="middle" fontFamily="ui-sans-serif, system-ui" fontSize="9.5" fontWeight="600" fill="#1d4ed8">Em análise</text>

                {/* candidate row 3 */}
                <circle cx="38" cy="186" r="14" fill="#dbeafe" />
                <rect x="60" y="179" width="90" height="8" rx="4" fill="#0f172a" opacity="0.8" />
                <rect x="60" y="191" width="66" height="6" rx="3" fill="#cbd5e1" />
                <rect x="206" y="177" width="54" height="20" rx="10" fill="#f1f5f9" />
                <text x="233" y="191" textAnchor="middle" fontFamily="ui-sans-serif, system-ui" fontSize="9.5" fontWeight="600" fill="#475569">Nova</text>
            </g>

            {/* floating analytics chip */}
            <g transform="translate(300,290)" filter="url(#compCardShadow)">
                <rect width="90" height="70" rx="14" fill="white" stroke="#e2e8f0" strokeWidth="1.5" />
            </g>
            <g transform="translate(300,290)">
                <rect x="14" y="38" width="10" height="18" rx="2" fill="#bfdbfe" />
                <rect x="30" y="28" width="10" height="28" rx="2" fill="#60a5fa" />
                <rect x="46" y="18" width="10" height="38" rx="2" fill="#1d4ed8" />
                <rect x="62" y="30" width="10" height="26" rx="2" fill="#93c5fd" />
                <text x="45" y="14" textAnchor="middle" fontFamily="ui-sans-serif, system-ui" fontSize="9" fontWeight="600" fill="#0f172a">+38%</text>
            </g>
        </svg>
    )
}
