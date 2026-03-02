const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function listCases() {
  try {
    const { data, error } = await supabase
      .from('cases')
      .select('id, case_number, status');

    if (error) {
      console.error('Error fetching cases:', error);
      process.exit(1);
    }

    console.log('Available cases:');
    data.forEach(c => {
      console.log(`  ${c.case_number} - ${c.status}`);
    });

  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

listCases();
