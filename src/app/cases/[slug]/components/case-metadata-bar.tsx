import { CalendarIcon, MapPinIcon, ClockIcon, UsersIcon } from '@heroicons/react/24/outline'

type CaseMetadataBarProps = {
  caseTypes: string[]
  filedDate: string
  location: string | null
  relationshipType: string
  relationshipDuration: string
}

export function CaseMetadataBar({
  caseTypes,
  filedDate,
  location,
  relationshipType,
  relationshipDuration,
}: CaseMetadataBarProps) {
  return (
    <section aria-label="Case Dossier" className="bg-[#050505] py-16 relative border-t border-white/5">
      <div className="max-w-7xl w-full mx-auto px-6 sm:px-12">
        <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-white mb-12">The Dossier</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Filed Date */}
          <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 flex flex-col justify-between hover:bg-white/10 transition-colors duration-300">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 mb-6">
              <CalendarIcon className="h-6 w-6 text-white/50" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">Filed Date</p>
              <p className="text-2xl font-bold text-white tracking-tight">{filedDate}</p>
            </div>
          </div>

          {/* Card 2: Location */}
          {location && (
            <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 flex flex-col justify-between hover:bg-white/10 transition-colors duration-300">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 mb-6">
                <MapPinIcon className="h-6 w-6 text-white/50" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">Location</p>
                <p className="text-2xl font-bold text-white tracking-tight line-clamp-2 break-words">{location}</p>
              </div>
            </div>
          )}

          {/* Card 3: Relationship */}
          {relationshipType && (
            <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 flex flex-col justify-between hover:bg-white/10 transition-colors duration-300">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 mb-6">
                <UsersIcon className="h-6 w-6 text-white/50" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">Relationship</p>
                <p className="text-2xl font-bold text-white tracking-tight capitalize">{relationshipType.replace(/_/g, ' ')}</p>
              </div>
            </div>
          )}

          {/* Card 4: Duration */}
          {relationshipDuration && (
            <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 flex flex-col justify-between hover:bg-white/10 transition-colors duration-300">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 mb-6">
                <ClockIcon className="h-6 w-6 text-white/50" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">Duration</p>
                <p className="text-2xl font-bold text-white tracking-tight">{relationshipDuration}</p>
              </div>
            </div>
          )}
        </div>

        {/* Case Tags row */}
        {caseTypes.length > 0 && (
          <div className="mt-8 flex items-center gap-4 flex-wrap bg-white/5 border border-white/10 rounded-3xl p-6">
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Case Tags:</p>
            <div className="flex flex-wrap gap-2">
              {caseTypes.map((type, i) => (
                <span key={i} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm font-medium text-white/80 tracking-wide capitalize shadow-sm">
                  {type.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  )
}
