const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey);

async function listAllCases() {
  try {
    const { data, error } = await supabase
      .from('cases')
      .select('id, case_number, status, created_at');

    if (error) {
      console.error('Error fetching cases:', error);
      process.exit(1);
    }

    console.log(`Found ${data.length} cases:\n`);
    data.forEach(c => {
      console.log(`  Case #: ${c.case_number} (ID: ${c.id})`);
      console.log(`  Status: ${c.status}`);
      console.log(`  Created: ${new Date(c.created_at).toLocaleDateString()}`);
      console.log('');
    });

  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

listAllCases();
