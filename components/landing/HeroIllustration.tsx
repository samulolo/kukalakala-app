export default function HeroIllustration() {
    const dots = []
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            dots.push({ cx: 428 + col * 16, cy: 36 + row * 16 })
        }
    }

    return (
        <svg
            viewBox="0 0 560 600"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
            role="img"
            aria-label="Ilustração de um perfil de candidato correspondendo a uma vaga publicada"
        >
            <defs>
                <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="#0f172a" floodOpacity="0.12" />
                </filter>
            </defs>

            {/* Soft background blobs */}
            <circle cx="450" cy="130" r="150" fill="#2563eb" opacity="0.07" />
            <circle cx="70" cy="470" r="130" fill="#1d4ed8" opacity="0.06" />

            {/* Dot grid accent */}
            <g fill="#94a3b8" opacity="0.35">
                {dots.map((d, i) => (
                    <circle key={i} cx={d.cx} cy={d.cy} r="2.5" />
                ))}
            </g>

            {/* Job card (back) */}
            <g transform="translate(36,326) rotate(-6)" filter="url(#cardShadow)">
                <rect width="272" height="158" rx="18" fill="white" stroke="#e2e8f0" strokeWidth="1.5" />
            </g>
            <g transform="translate(36,326) rotate(-6)">
                <rect x="22" y="22" width="44" height="44" rx="12" fill="#1d4ed8" />
                <text x="44" y="51" textAnchor="middle" fontFamily="ui-sans-serif, system-ui" fontSize="20" fontWeight="600" fill="white">K</text>

                <rect x="82" y="30" width="150" height="10" rx="5" fill="#0f172a" />
                <rect x="82" y="48" width="105" height="8" rx="4" fill="#94a3b8" />

                <rect x="22" y="90" width="94" height="26" rx="13" fill="#eff6ff" />
                <text x="69" y="107" textAnchor="middle" fontFamily="ui-sans-serif, system-ui" fontSize="11" fontWeight="500" fill="#1d4ed8">Full-time</text>

                <rect x="126" y="90" width="90" height="26" rx="13" fill="#f1f5f9" />
                <text x="171" y="107" textAnchor="middle" fontFamily="ui-sans-serif, system-ui" fontSize="11" fontWeight="500" fill="#475569">Remoto</text>

                <rect x="22" y="132" width="228" height="1" fill="#e2e8f0" />
                <rect x="22" y="140" width="60" height="8" rx="4" fill="#cbd5e1" />
            </g>

            {/* Candidate profile card (front) */}
            <g transform="translate(214,48) rotate(3)" filter="url(#cardShadow)">
                <rect width="302" height="224" rx="20" fill="white" stroke="#e2e8f0" strokeWidth="1.5" />
            </g>
            <g transform="translate(214,48) rotate(3)">
                {/* avatar */}
                <circle cx="54" cy="58" r="30" fill="#dbeafe" />
                <circle cx="54" cy="50" r="11" fill="#60a5fa" />
                <path d="M30 82 a24 20 0 0 1 48 0 z" fill="#60a5fa" />

                <rect x="98" y="44" width="140" height="10" rx="5" fill="#0f172a" />
                <rect x="98" y="62" width="96" height="8" rx="4" fill="#94a3b8" />

                <rect x="24" y="102" width="254" height="1" fill="#e2e8f0" />

                {/* skill chips */}
                <rect x="24" y="120" width="58" height="24" rx="12" fill="#eff6ff" />
                <text x="53" y="136" textAnchor="middle" fontFamily="ui-sans-serif, system-ui" fontSize="10.5" fontWeight="500" fill="#1d4ed8">React</text>

                <rect x="90" y="120" width="60" height="24" rx="12" fill="#eff6ff" />
                <text x="120" y="136" textAnchor="middle" fontFamily="ui-sans-serif, system-ui" fontSize="10.5" fontWeight="500" fill="#1d4ed8">Node.js</text>

                <rect x="158" y="120" width="66" height="24" rx="12" fill="#eff6ff" />
                <text x="191" y="136" textAnchor="middle" fontFamily="ui-sans-serif, system-ui" fontSize="10.5" fontWeight="500" fill="#1d4ed8">UI/UX</text>

                {/* match bar */}
                <text x="24" y="178" fontFamily="ui-sans-serif, system-ui" fontSize="11" fontWeight="600" fill="#0f172a">Compatibilidade</text>
                <text x="278" y="178" textAnchor="end" fontFamily="ui-sans-serif, system-ui" fontSize="11" fontWeight="600" fill="#1d4ed8">92%</text>
                <rect x="24" y="186" width="254" height="8" rx="4" fill="#eff6ff" />
                <rect x="24" y="186" width="234" height="8" rx="4" fill="#1d4ed8" />
            </g>

            {/* Connector + match badge */}
            <path
                d="M 150 300 C 190 260, 210 230, 224 210"
                stroke="#93c5fd"
                strokeWidth="2"
                strokeDasharray="4 7"
                strokeLinecap="round"
                fill="none"
            />
            <g transform="translate(150,300)" filter="url(#cardShadow)">
                <circle r="24" fill="#1d4ed8" />
            </g>
            <g transform="translate(150,300)">
                <path d="M -9 0 L -2 7 L 10 -8" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </g>
        </svg>
    )
}
