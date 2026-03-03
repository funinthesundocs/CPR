const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await supabase
    .from('timeline_events')
    .select('id, date_or_year, description', { count: 'exact' })
    .eq('case_id', '3301d694-e80e-4288-8698-fb84cb678653');
  
  console.log(`Total timeline_events in DB: ${data?.length || 0}`);
  if (data) {
    data.forEach((e, i) => {
      console.log(`  ${i+1}. ${e.date_or_year}: ${e.description.substring(0, 50)}...`);
    });
  }
  if (error) console.error('Error:', error);
}
check();
