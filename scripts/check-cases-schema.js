const fs = require('fs');
const env = fs.readFileSync('.env.local','utf8');
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/m)[1].trim();
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();

async function main() {
  // Get C-0003 full case row to see all available columns
  const r = await fetch(url+'/rest/v1/cases?case_number=eq.C-0003&select=*', {
    headers:{'apikey':key,'Authorization':'Bearer '+key}
  });
  const data = await r.json();
  const c = data[0];
  console.log('Cases table columns:');
  Object.keys(c).forEach(k => console.log(' ', k, ':', JSON.stringify(c[k])?.slice(0,80)));
}
main().catch(e => console.error(e));
