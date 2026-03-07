'use client'

export function OnlineStatusBadge() {
    return (
        <>
            <style>{`
                @keyframes scanPulse {
                    0%, 100% { opacity: 1; letter-spacing: 0.22em; }
                    50%       { opacity: 0.2; letter-spacing: 0.35em; }
                }
                @keyframes dotBlink {
                    0%, 100% { opacity: 1; }
                    50%       { opacity: 0.2; }
                }
            `}</style>

            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                userSelect: 'none',
            }}>
                {/* Live dot */}
                <span style={{
                    display: 'inline-block',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    boxShadow: '0 0 8px color-mix(in srgb, var(--primary) 80%, transparent)',
                    animation: 'dotBlink 1.4s ease-in-out infinite',
                    flexShrink: 0,
                }} />

                <span style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '0.22em',
                    color: 'hsl(var(--foreground))',
                    whiteSpace: 'nowrap',
                }}>
                    LIVE INVESTIGATION
                </span>

                <span style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '0.22em',
                    color: 'var(--primary)',
                    animation: 'scanPulse 1.8s ease-in-out infinite',
                    whiteSpace: 'nowrap',
                }}>
                    SCANNING
                </span>
            </div>
        </>
    )
}
