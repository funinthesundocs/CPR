const fs = require('fs');
const env = fs.readFileSync('.env.local','utf8');
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/m)[1].trim();
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();

async function main() {
  // Get defendant for C-0003
  const r = await fetch(url+'/rest/v1/cases?case_number=eq.C-0003&select=id,defendants(*)', {
    headers:{'apikey':key,'Authorization':'Bearer '+key}
  });
  const data = await r.json();
  const defendant = data[0]?.defendants;
  console.log('Defendant for C-0003:');
  console.log(JSON.stringify(defendant, null, 2));
}
main().catch(e => console.error(e));
