const fs = require('fs');
const env = fs.readFileSync('.env.local','utf8');
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/m)[1].trim();
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();

async function q(path) {
  const r = await fetch(url+'/rest/v1/'+path, {headers:{'apikey':key,'Authorization':'Bearer '+key}});
  return r.json();
}

async function main() {
  console.log('=== SKILL DRY-RUN: Next Unbuilt Case ===\n');

  // Step 1: Find C-0003
  const cases = await q('cases?case_number=eq.C-0003&select=id,case_number,plaintiff_id,status');
  if (!cases.length) { console.log('❌ C-0003 not found'); return; }
  const c = cases[0];
  console.log('✅ STEP 1: Case found:', c.case_number, '| status:', c.status, '| id:', c.id);

  // Plaintiff name → artifactSlug
  const profiles = await q('user_profiles?id=eq.'+c.plaintiff_id+'&select=display_name');
  const name = profiles[0]?.display_name || 'Unknown';
  const slug = name.toLowerCase().trim().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');
  console.log('   Plaintiff:', name, '→ slug:', slug);

  // Step 2: Check artifact folders exist
  const agentDir = '.agent/artifacts/'+slug;
  const publicDir = 'public/artifacts/'+slug;
  const agentExists = fs.existsSync(agentDir);
  const publicExists = fs.existsSync(publicDir);
  console.log('\n--- STEP 2: Artifact Folders ---');
  console.log(agentExists ? '✅' : '❌ MISSING', agentDir);
  console.log(publicExists ? '✅' : '❌ MISSING', publicDir);
  if (agentExists) {
    const files = fs.readdirSync(agentDir);
    console.log('   Files:', files.length ? files.join(', ') : '(empty)');
    ['tagline.txt','notebook-summary.txt','briefing.md'].forEach(f => {
      console.log('  ', fs.existsSync(agentDir+'/'+f) ? '✅' : '❌ MISSING', f);
    });
  }

  // CRITICAL: Timeline events check
  const events = await q('timeline_events?case_id=eq.'+c.id+'&select=id,date_or_year,city,latitude,longitude,description&order=date_or_year');
  console.log('\n--- CRITICAL PREREQUISITE: Timeline Data ---');
  console.log('   Total events:', events.length);

  const missingCity = events.filter(e => !e.city);
  const missingLatLng = events.filter(e => e.latitude == null || e.longitude == null);
  const uniqueCoords = new Set(events.filter(e=>e.latitude&&e.longitude).map(e=>`${parseFloat(e.latitude).toFixed(4)},${parseFloat(e.longitude).toFixed(4)}`));

  console.log(missingCity.length === 0 ? '✅' : '❌ BLOCKER', 'City field populated:', events.length - missingCity.length+'/'+events.length);
  console.log(missingLatLng.length === 0 ? '✅' : '❌ BLOCKER', 'Lat/lng populated:', events.length - missingLatLng.length+'/'+events.length);
  console.log('   Unique coordinate points:', uniqueCoords.size, '(map will show', uniqueCoords.size, 'pins)');

  if (missingLatLng.length > 0) {
    console.log('\n   ⚠️  EVENTS MISSING LAT/LNG (will collapse to 1 map marker):');
    missingLatLng.forEach(e => console.log('     -', e.date_or_year, '|', e.city, '|', (e.description||'').slice(0,50)));
  }
  if (uniqueCoords.size <= 1 && events.length > 1) {
    console.log('\n   🚨 MAP WILL SHOW ONLY 1 MARKER — lat/lng must be populated before building');
  }

  // Tagline check
  console.log('\n--- STEP 3: Tagline ---');
  const taglinePath = agentDir+'/tagline.txt';
  if (fs.existsSync(taglinePath)) {
    const t = fs.readFileSync(taglinePath,'utf8').trim();
    console.log(t.length <= 40 ? '✅' : '❌ TOO LONG ('+t.length+' chars)', '"'+t+'"');
  } else {
    console.log('❌ MISSING tagline.txt — must generate from NotebookLM');
  }

  // Summary check
  console.log('\n--- STEP 4: Notebook Summary ---');
  const summaryPath = agentDir+'/notebook-summary.txt';
  if (fs.existsSync(summaryPath)) {
    const s = fs.readFileSync(summaryPath,'utf8').trim();
    const words = s.split(/\s+/).length;
    console.log(words <= 200 ? '✅' : '❌ TOO LONG ('+words+' words)', 'Word count:', words);
  } else {
    console.log('❌ MISSING notebook-summary.txt — must generate from NotebookLM');
  }

  // Briefing check
  console.log('\n--- STEP 5: Briefing ---');
  const briefingPath = agentDir+'/briefing.md';
  if (fs.existsSync(briefingPath)) {
    const b = fs.readFileSync(briefingPath,'utf8');
    const sections = (b.match(/^## /gm)||[]).length;
    console.log(sections >= 8 ? '✅' : '⚠️ ONLY '+sections+' SECTIONS (need 10)', sections, 'sections found');
  } else {
    console.log('❌ MISSING briefing.md — must generate from NotebookLM');
  }

  // Public artifacts
  console.log('\n--- STEP 6: Public Artifacts ---');
  ['podcast.mp3','slides.pdf','infographic-landscape.jpg'].forEach(f => {
    const p = publicDir+'/'+f;
    if (fs.existsSync(p)) {
      const size = fs.statSync(p).size;
      console.log(size > 1000 ? '✅' : '❌ EMPTY FILE', f, '('+Math.round(size/1024)+'KB)');
    } else {
      console.log('❌ MISSING', f);
    }
  });

  // Summary
  console.log('\n=== SIMULATION RESULT ===');
  const blockers = [
    missingCity.length > 0 && 'Missing city fields ('+missingCity.length+' events)',
    missingLatLng.length > 0 && 'Missing lat/lng ('+missingLatLng.length+' events) → map will show '+(uniqueCoords.size||1)+' marker(s)',
    !fs.existsSync(taglinePath) && 'Missing tagline.txt',
    !fs.existsSync(summaryPath) && 'Missing notebook-summary.txt',
    !fs.existsSync(briefingPath) && 'Missing briefing.md',
  ].filter(Boolean);

  if (blockers.length) {
    console.log('🚨 BLOCKERS ('+blockers.length+'):');
    blockers.forEach(b => console.log('  ❌', b));
    console.log('\nDO NOT BUILD until blockers resolved.');
  } else {
    console.log('✅ ALL CHECKS PASSED — safe to build');
  }
}
main().catch(e => console.error(e));
