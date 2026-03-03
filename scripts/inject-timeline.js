const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const timelineEvents = [
  { year: '1', event: 'First Meeting (beach club)', city: 'Da Nang, Vietnam', lat: 16.0476743, lng: 108.2496587 },
  { year: '2', event: 'Job Offer', city: 'Da Nang, Vietnam', lat: 16.0502553, lng: 108.2453282 },
  { year: '3', event: 'Work Begins', city: 'Da Nang, Vietnam', lat: 16.0811604, lng: 108.2470304 },
  { year: '4', event: 'Financial Support', city: 'Da Nang, Vietnam', lat: 16.0257482, lng: 108.2405562 },
  { year: '5', event: 'Sexual Crime Event (Airbnb)', city: 'Da Nang, Vietnam', lat: 16.0811604, lng: 108.2470304 },
  { year: '6', event: 'Documentation', city: 'Da Nang, Vietnam', lat: 16.0544, lng: 108.2022 },
  { year: '7', event: 'Confrontation (coffee shop)', city: 'Da Nang, Vietnam', lat: 16.0544, lng: 108.2022 },
  { year: '8', event: 'Disassociation', city: 'Da Nang, Vietnam', lat: 16.0544, lng: 108.2022 },
];

async function injectTimeline() {
  try {
    // Get the case ID for C-0001
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('id')
      .eq('case_number', 'C-0001')
      .single();

    if (caseError || !caseData) {
      console.error('Case C-0001 not found:', caseError);
      process.exit(1);
    }

    const caseId = caseData.id;
    console.log(`Found case C-0001 with ID: ${caseId}`);

    // Delete existing timeline events for this case
    const { error: deleteError } = await supabase
      .from('timeline_events')
      .delete()
      .eq('case_id', caseId);

    if (deleteError) {
      console.error('Error deleting existing events:', deleteError);
      process.exit(1);
    }

    console.log('Cleared existing timeline events');

    // Insert new timeline events
    const { data, error } = await supabase
      .from('timeline_events')
      .insert(
        timelineEvents.map(event => ({
          case_id: caseId,
          date_or_year: event.year,
          description: event.event,
          city: event.city,
          latitude: event.lat,
          longitude: event.lng,
        }))
      )
      .select();

    if (error) {
      console.error('Error inserting timeline events:', error);
      process.exit(1);
    }

    console.log(`✅ Successfully injected ${data.length} timeline events`);
    console.log('Timeline events:');
    data.forEach((event, i) => {
      console.log(`  ${i + 1}. ${event.description} - ${event.city} (${event.latitude}, ${event.longitude})`);
    });

  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

injectTimeline();
