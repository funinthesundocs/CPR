'use client'

import { EllipsisHorizontalIcon, BuildingOffice2Icon, SquaresPlusIcon, PlayIcon } from '@heroicons/react/24/outline'

interface FooterSocialLink {
  platform: 'twitter' | 'linkedin' | 'instagram' | 'youtube'
  url: string
}

interface FooterSocialLinksProps {
  links?: FooterSocialLink[]
}

const DEFAULT_LINKS: FooterSocialLink[] = [
  { platform: 'twitter', url: '#' },
  { platform: 'linkedin', url: '#' },
  { platform: 'instagram', url: '#' },
  { platform: 'youtube', url: '#' }
]

const ICON_MAP: Record<string, React.ReactNode> = {
  twitter: <EllipsisHorizontalIcon className="h-5 w-5" />,
  linkedin: <BuildingOffice2Icon className="h-5 w-5" />,
  instagram: <SquaresPlusIcon className="h-5 w-5" />,
  youtube: <PlayIcon className="h-5 w-5" />
}

export function FooterSocialLinks({ links = DEFAULT_LINKS }: FooterSocialLinksProps) {
  return (
    <div className="flex flex-row gap-4 justify-center">
      {links.map((link) => (
        <a
          key={link.platform}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/70 hover:text-white/100 transition-colors"
          aria-label={`Follow us on ${link.platform}`}
        >
          {ICON_MAP[link.platform]}
        </a>
      ))}
    </div>
  )
}
