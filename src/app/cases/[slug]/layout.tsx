// Case detail pages are full-bleed dark — no padding wrapper needed.
// All other pages rely on the root layout's main for spacing.
export default function CaseDetailLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
