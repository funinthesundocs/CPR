const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey);

async function verify() {
  try {
    const { data, error } = await supabase
      .from('timeline_events')
      .select('date_or_year, description, city, latitude, longitude')
      .eq('case_id', (await supabase
        .from('cases')
        .select('id')
        .eq('case_number', 'C-0001')
        .maybeSingle()
      ).data.id)
      .order('date_or_year', { ascending: true });

    if (error) {
      console.error('Error:', error);
      process.exit(1);
    }

    console.log(`\n📍 Timeline Events for C-0001 (${data.length} events):\n`);
    data.forEach(event => {
      console.log(`  Event: ${event.description}`);
      console.log(`  City Field: ${event.city}`);
      console.log(`  Lat/Lng: ${event.latitude}, ${event.longitude}`);
      console.log('');
    });

  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

verify();
