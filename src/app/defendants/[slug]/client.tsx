'use client'

import { HeroSection } from '@/components/defendant-page/HeroSection'
import { HeroText } from '@/components/defendant-page/HeroText'
import { StoryInfographic } from '@/components/defendant-page/StoryInfographic'
import { InfoBoxes } from '@/components/defendant-page/InfoBoxes'
import { CaseSummaryModule } from '@/components/defendant-page/CaseSummaryModule'
import { SlideDeckSection } from '@/components/defendant-page/SlideDeckSection'
import { CaseTimeline } from '@/components/defendant-page/CaseTimeline'
import { LocationMap } from '@/components/defendant-page/LocationMap'
import { EvidenceVault } from '@/components/defendant-page/EvidenceVault'
import { InlineVoting } from '@/components/defendant-page/InlineVoting'

// Accent palette derived dynamically from --primary (user's selected theme color)
// via CSS color-mix — no hardcoded values, responds to theme changes automatically

interface PlaintiffPageClientProps {
  caseNumber: string
  status: string
  filedAt: string
  plaintiffName: string
  plaintiffPhoto: string | null
  defendantName: string
  defendantPhoto: string | null
  tagline: string
  notebookSummary: string
  briefingContent: string
  testimonyFields: { label: string; value: string }[]
  infographicUrl: string
  audioUrl?: string
  pdfUrl: string | null
  summaryImage1Url: string
  summaryImage2Url: string
  infoBoxes: { label: string; value: string }[]
  timeline: any[]
  locations: { name: string; date: string; description: string; coordinates?: string }[]
  evidence: any[]
  evidenceInventory: { label: string; category: string; description: string }[]
  financialTotal: number
  caseId: string
  votingOpen: boolean
  caseNarratives: Record<string, any>
}

export function PlaintiffPageClient(props: PlaintiffPageClientProps) {
  const caseTitle = `${props.plaintiffName} vs. ${props.defendantName}`

  return (
    <>
      {/* Derive accent palette from user's primary theme color */}
      <style>{`
        :root {
          --accent-100: color-mix(in srgb, var(--primary) 15%, white);
          --accent-300: color-mix(in srgb, var(--primary) 45%, white);
          --accent-500: var(--primary);
          --accent-700: color-mix(in srgb, var(--primary) 60%, black);
          --accent-900: color-mix(in srgb, var(--primary) 20%, black);
        }
      `}</style>

      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'LegalCase',
          'name': caseTitle,
          'description': props.notebookSummary,
          'datePublished': props.filedAt,
          'breadcrumb': {
            '@type': 'BreadcrumbList',
            'itemListElement': [
              { '@type': 'ListItem', 'position': 1, 'name': 'Cases', 'item': '/cases' },
              { '@type': 'ListItem', 'position': 2, 'name': props.defendantName },
              { '@type': 'ListItem', 'position': 3, 'name': `${props.plaintiffName}'s Case` },
            ],
          },
        })}}
      />

      {/* Full-bleed dark wrapper — cancels root layout p-6 */}
      <div
        className="-mx-6 -mt-6 -mb-6 w-[calc(100%+3rem)] bg-[#050505] text-white selection:bg-[var(--accent-500)]/30 selection:text-white overflow-x-hidden"
      >
        {/* SECTION 01 — Hero */}
        <HeroSection
          plaintiffName={props.plaintiffName}
          defendantName={props.defendantName}
          plaintiffPhoto={props.plaintiffPhoto}
          defendantPhoto={props.defendantPhoto}
          status={props.status}
        />

        {/* SECTION 02 — Hero Text */}
        <HeroText
          plaintiffName={props.plaintiffName}
          plaintiffPhoto={props.plaintiffPhoto}
          defendantName={props.defendantName}
          tagline={props.tagline}
          caseNumber={props.caseNumber}
          filedAt={props.filedAt}
        />

        {/* SECTION 03 — Story Infographic */}
        <StoryInfographic
          infographicUrl={props.infographicUrl}
          audioUrl={props.audioUrl}
          caseTitle={caseTitle}
        />

        {/* SECTION 04 — Four Info Boxes */}
        <InfoBoxes boxes={props.infoBoxes} />

        {/* SECTION 05 — Case Summary */}
        <CaseSummaryModule
          notebookSummary={props.notebookSummary}
          briefingDocContent={props.briefingContent}
          testimonyFields={props.testimonyFields}
          financialTotal={props.financialTotal}
          caseNarratives={props.caseNarratives}
          evidenceInventory={props.evidenceInventory}
          evidence={props.evidence}
          summaryImage1Url={props.summaryImage1Url}
          summaryImage2Url={props.summaryImage2Url}
        />

        {/* SECTION 06 — Slide Deck */}
        <SlideDeckSection pdfUrl={props.pdfUrl} />

        {/* SECTION 07 — Case Timeline */}
        <CaseTimeline events={props.timeline} />

        {/* SECTION 08 — Location Map / Fraud Trail */}
        <LocationMap locations={props.locations} />

        {/* SECTION 09 — Evidence Vault */}
        <EvidenceVault
          evidence={props.evidence}
          evidenceInventory={props.evidenceInventory}
        />

        {/* SECTION 10 — Inline Voting */}
        <InlineVoting
          caseId={props.caseId}
          votingOpen={props.votingOpen}
          status={props.status}
        />

        {/* Footer spacer */}
        <div className="h-32" />
      </div>
    </>
  )
}
