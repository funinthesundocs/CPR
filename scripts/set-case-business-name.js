// Usage: node scripts/set-case-business-name.js C-0003 "Big Rig 4x4"
const fs = require('fs');
const env = fs.readFileSync('.env.local','utf8');
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/m)[1].trim();
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();

const [,, caseNumber, businessName] = process.argv;
if (!caseNumber || !businessName) {
  console.log('Usage: node scripts/set-case-business-name.js C-0003 "Big Rig 4x4"');
  process.exit(1);
}

async function main() {
  // Fetch current story_narrative
  const r = await fetch(url+'/rest/v1/cases?case_number=eq.'+caseNumber+'&select=id,story_narrative', {
    headers:{'apikey':key,'Authorization':'Bearer '+key}
  });
  const data = await r.json();
  if (!data.length) { console.log('Case not found:', caseNumber); return; }
  const { id, story_narrative } = data[0];

  // Merge business_name into existing story_narrative
  const updated = { ...(story_narrative || {}), business_name: businessName };

  const patch = await fetch(url+'/rest/v1/cases?id=eq.'+id, {
    method: 'PATCH',
    headers:{'apikey':key,'Authorization':'Bearer '+key,'Content-Type':'application/json','Prefer':'return=minimal'},
    body: JSON.stringify({ story_narrative: updated })
  });
  console.log(patch.status === 204 ? '✅' : '❌', caseNumber, 'business_name set to:', businessName);
}
main().catch(e => console.error(e));
