const fs = require('fs');
const env = fs.readFileSync('.env.local','utf8');
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/m)[1].trim();
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();

const CASE_ID = '3301d694-e80e-4288-8698-fb84cb678653';

// Keyed by date_or_year
const coordsByDate = {
  '2025-09-06': { lat: 16.0476743, lng: 108.2496587 }, // First Meeting
  '2025-09-20': { lat: 16.0502553, lng: 108.2453282 }, // Job Offer
  '2025-09-24': { lat: 16.0811604, lng: 108.2470304 }, // Work Begins
  '2025-09-25': { lat: 16.0257482, lng: 108.2405562 }, // Financial Support
  '2025-10-07': { lat: 16.0811604, lng: 108.2470304 }, // Sexual Crime Event
  '2025-10-10': { lat: 16.0544,    lng: 108.2022    }, // Documentation
  '2025-10-20': { lat: 16.0544,    lng: 108.2022    }, // Confrontation
  '2025-10-22': { lat: 16.0544,    lng: 108.2022    }, // Disassociation
};

async function main() {
  const r = await fetch(url+'/rest/v1/timeline_events?case_id=eq.'+CASE_ID+'&select=id,date_or_year&order=date_or_year', {
    headers:{'apikey':key,'Authorization':'Bearer '+key}
  });
  const events = await r.json();
  console.log('Found', events.length, 'events');

  for (const e of events) {
    const c = coordsByDate[e.date_or_year];
    if (!c) { console.log('No coords for date:', e.date_or_year); continue; }
    const res = await fetch(url+'/rest/v1/timeline_events?id=eq.'+e.id, {
      method: 'PATCH',
      headers:{'apikey':key,'Authorization':'Bearer '+key,'Content-Type':'application/json','Prefer':'return=minimal'},
      body: JSON.stringify({ latitude: c.lat, longitude: c.lng })
    });
    console.log(res.status, e.date_or_year, '->', c.lat, c.lng);
  }
  console.log('Done.');
}
main().catch(e => console.error(e));
