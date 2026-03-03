'use client'

import AU from 'country-flag-icons/react/3x2/AU'
import TH from 'country-flag-icons/react/3x2/TH'
import AE from 'country-flag-icons/react/3x2/AE'
import VN from 'country-flag-icons/react/3x2/VN'
import CN from 'country-flag-icons/react/3x2/CN'
import US from 'country-flag-icons/react/3x2/US'
import GB from 'country-flag-icons/react/3x2/GB'
import EU from 'country-flag-icons/react/3x2/EU'

type CountryCode = 'AU' | 'TH' | 'AE' | 'VN' | 'CN' | 'US' | 'GB' | 'EU'

const FLAG_COMPONENTS: Record<CountryCode, React.ComponentType<any>> = {
  AU,
  TH,
  AE,
  VN,
  CN,
  US,
  GB,
  EU,
}

interface FlagIconProps {
  countryCode: CountryCode | null
  className?: string
}

export function FlagIcon({ countryCode, className = 'h-24 w-32 rounded-md' }: FlagIconProps) {
  if (!countryCode || !FLAG_COMPONENTS[countryCode]) return null

  const FlagComponent = FLAG_COMPONENTS[countryCode]
  return <FlagComponent className={className} style={{ width: '100%', height: '100%', objectFit: 'cover' }} preserveAspectRatio="xMidYMid slice" />
}
