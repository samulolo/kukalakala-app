export default function CandidateIllustration() {
    return (
        <svg
            viewBox="0 0 420 420"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
            role="img"
            aria-label="Ilustração de uma pessoa a pesquisar e candidatar-se a vagas"
        >
            <defs>
                <filter id="candCardShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#0f172a" floodOpacity="0.10" />
                </filter>
            </defs>

            {/* background blob */}
            <circle cx="330" cy="90" r="110" fill="#1d4ed8" opacity="0.06" />
            <circle cx="70" cy="340" r="90" fill="#2563eb" opacity="0.06" />

            {/* Journey path */}
            <path
                d="M 60 330 C 120 300, 130 250, 190 230 S 300 190, 340 140"
                stroke="#93c5fd"
                strokeWidth="2.5"
                strokeDasharray="5 8"
                strokeLinecap="round"
                fill="none"
            />
            <circle cx="60" cy="330" r="7" fill="#93c5fd" />
            <circle cx="190" cy="230" r="7" fill="#60a5fa" />

            {/* Goal flag badge */}
            <g transform="translate(340,140)" filter="url(#candCardShadow)">
                <circle r="26" fill="#1d4ed8" />
            </g>
            <g transform="translate(340,140)">
                <path d="M -6 -12 L -6 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M -6 -12 L 9 -7 L -6 -2 Z" fill="white" />
            </g>

            {/* Search / job results window */}
            <g transform="translate(50,54)" filter="url(#candCardShadow)">
                <rect width="270" height="200" rx="18" fill="white" stroke="#e2e8f0" strokeWidth="1.5" />
            </g>
            <g transform="translate(50,54)">
                {/* window bar */}
                <circle cx="24" cy="24" r="5" fill="#f87171" />
                <circle cx="42" cy="24" r="5" fill="#fbbf24" />
                <circle cx="60" cy="24" r="5" fill="#34d399" />

                {/* search bar */}
                <rect x="20" y="42" width="230" height="30" rx="15" fill="#f1f5f9" />
                <circle cx="36" cy="57" r="6" fill="none" stroke="#94a3b8" strokeWidth="2" />
                <line x1="40.5" y1="61.5" x2="45" y2="66" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
                <rect x="54" y="53" width="90" height="8" rx="4" fill="#cbd5e1" />

                {/* result row 1 */}
                <rect x="20" y="86" width="230" height="52" rx="12" fill="#eff6ff" />
                <rect x="34" y="100" width="32" height="24" rx="7" fill="#1d4ed8" />
                <rect x="78" y="102" width="120" height="9" rx="4.5" fill="#0f172a" />
                <rect x="78" y="118" width="80" height="7" rx="3.5" fill="#94a3b8" />

                {/* result row 2 */}
                <rect x="20" y="146" width="230" height="40" rx="12" fill="white" stroke="#e2e8f0" />
                <rect x="34" y="158" width="24" height="16" rx="5" fill="#dbeafe" />
                <rect x="70" y="156" width="100" height="8" rx="4" fill="#0f172a" opacity="0.75" />
                <rect x="70" y="170" width="64" height="6" rx="3" fill="#cbd5e1" />
            </g>
        </svg>
    )
}
