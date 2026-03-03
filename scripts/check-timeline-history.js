const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey);

async function check() {
  try {
    // Check if there's a case_versions table
    const { data: versions, error: vError } = await supabase
      .from('case_versions')
      .select('*')
      .eq('case_id', '3301d694-e80e-4288-8698-fb84cb678653')
      .order('created_at', { ascending: false })
      .limit(5);

    if (vError) {
      console.log('No case_versions table or error:', vError.message);
    } else if (versions && versions.length > 0) {
      console.log('Found case versions:', versions);
    } else {
      console.log('No previous versions found');
    }

    // Check case_drafts
    const { data: drafts, error: dError } = await supabase
      .from('case_drafts')
      .select('form_data')
      .eq('case_id', '3301d694-e80e-4288-8698-fb84cb678653')
      .order('created_at', { ascending: false })
      .limit(1);

    if (!dError && drafts && drafts.length > 0) {
      console.log('\n\nCase draft form_data:');
      console.log(JSON.stringify(drafts[0].form_data, null, 2));
    }

  } catch (err) {
    console.error('Error:', err);
  }
}

check();
