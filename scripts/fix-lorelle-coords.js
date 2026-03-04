const fs = require('fs');
const env = fs.readFileSync('.env.local','utf8');
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/m)[1].trim();
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();

const CASE_ID = 'a0abf368-30e2-4e83-b6c9-4e7e6760dfd3';

// Keyed by date_or_year — derived from suburb/city names
const coordsByDate = {
  '2014':           { lat: -32.2569, lng: 148.6011 }, // Dubbo area NSW — car dealership regional NSW
  'Mid-2014':       { lat: -27.4698, lng: 153.0251 }, // Brisbane QLD — moved in together
  'November 2014':  { lat: -27.4698, lng: 153.0251 }, // Brisbane — Colin proposed
  '2015':           { lat: -27.5381, lng: 153.0073 }, // Rocklea QLD — Big Rig Tyres area
  '2016':           { lat: -27.6154, lng: 152.7608 }, // Ipswich QLD — Big Rig Tyres bankruptcy
  '2016–2017':      { lat: -27.6527, lng: 153.1213 }, // Slacks Creek QLD
  '2017':           { lat: -27.4689, lng: 153.0235 }, // Brisbane QLD — fraudulent loans
  'April 2018':     { lat: -27.4698, lng: 153.0251 }, // Brisbane — served with AVO returning from cruise
  '2018':           { lat: -27.4672, lng: 152.9928 }, // Milton Brisbane — claimed employment
  '2019':           { lat: -27.4698, lng: 153.0251 }, // Brisbane — phone contact
  'December 2020':  { lat: -27.4698, lng: 153.0251 }, // Brisbane (remote) — promises via messages
};

async function main() {
  const r = await fetch(url+'/rest/v1/timeline_events?case_id=eq.'+CASE_ID+'&select=id,date_or_year&order=date_or_year', {
    headers:{'apikey':key,'Authorization':'Bearer '+key}
  });
  const events = await r.json();
  console.log('Found', events.length, 'events');

  for (const e of events) {
    const c = coordsByDate[e.date_or_year];
    if (!c) { console.log('⚠️  No coords mapped for date:', e.date_or_year); continue; }
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
