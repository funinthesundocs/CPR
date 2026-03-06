'use client'

import Link from 'next/link'

interface FooterTestimonialCardProps {
  plaintiffName?: string
  plaintiffCase?: string
  quote?: string
  caseLink?: string
}

const DEFAULT_TESTIMONIAL = {
  plaintiffName: 'Plaintiff',
  plaintiffCase: 'Case',
  quote: 'The Court of Public Record gave me a voice when the traditional justice system failed.',
  caseLink: '/cases'
}

export function FooterTestimonialCard({
  plaintiffName = DEFAULT_TESTIMONIAL.plaintiffName,
  plaintiffCase = DEFAULT_TESTIMONIAL.plaintiffCase,
  quote = DEFAULT_TESTIMONIAL.quote,
  caseLink = DEFAULT_TESTIMONIAL.caseLink
}: FooterTestimonialCardProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-6 max-w-2xl">
      <p className="text-base italic text-white/90 mb-4">
        &quot;{quote}&quot;
      </p>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-white">— {plaintiffName}</p>
          <p className="text-xs text-white/60">{plaintiffCase}</p>
        </div>
        <Link
          href={caseLink}
          className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Read Case →
        </Link>
      </div>
    </div>
  )
}
