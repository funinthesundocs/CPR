const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey);

const timelineEvents = [
  { year: '1', event: 'First Meeting (beach club)', coords: '16.0476743, 108.2496587', lat: 16.0476743, lng: 108.2496587, type: 'meeting' },
  { year: '2', event: 'Job Offer', coords: '16.0502553, 108.2453282', lat: 16.0502553, lng: 108.2453282, type: 'agreement' },
  { year: '3', event: 'Work Begins', coords: '16.0811604, 108.2470304', lat: 16.0811604, lng: 108.2470304, type: 'employment' },
  { year: '4', event: 'Financial Support', coords: '16.0257482, 108.2405562', lat: 16.0257482, lng: 108.2405562, type: 'transaction' },
  { year: '5', event: 'Sexual Crime Event (Airbnb)', coords: '16.0811604, 108.2470304', lat: 16.0811604, lng: 108.2470304, type: 'incident' },
  { year: '6', event: 'Documentation', coords: '16.0544, 108.2022', lat: 16.0544, lng: 108.2022, type: 'evidence' },
  { year: '7', event: 'Confrontation (coffee shop)', coords: '16.0544, 108.2022', lat: 16.0544, lng: 108.2022, type: 'confrontation' },
  { year: '8', event: 'Disassociation', coords: '16.0544, 108.2022', lat: 16.0544, lng: 108.2022, type: 'separation' },
];

async function injectTimeline() {
  try {
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('id, plaintiff_id')
      .eq('case_number', 'C-0001')
      .maybeSingle();

    if (caseError || !caseData) {
      console.error('Error finding case C-0001:', caseError);
      process.exit(1);
    }

    const caseId = caseData.id;
    const plaintiffId = caseData.plaintiff_id;
    
    console.log(`✓ Found case C-0001 with ID: ${caseId}`);
    console.log(`✓ Plaintiff ID: ${plaintiffId}\n`);

    const { error: deleteError } = await supabase
      .from('timeline_events')
      .delete()
      .eq('case_id', caseId);

    if (deleteError) {
      console.error('Error deleting existing events:', deleteError);
      process.exit(1);
    }

    console.log('✓ Cleared existing timeline events\n');

    const { data, error } = await supabase
      .from('timeline_events')
      .insert(
        timelineEvents.map(event => ({
          case_id: caseId,
          date_or_year: event.year,
          description: event.event,
          city: event.coords,
          latitude: event.lat,
          longitude: event.lng,
          submitted_by: plaintiffId,
          event_type: event.type,
        }))
      )
      .select();

    if (error) {
      console.error('Error inserting timeline events:', error);
      process.exit(1);
    }

    console.log(`✅ Successfully injected ${data.length} timeline events into C-0001:\n`);
    data.forEach((event) => {
      console.log(`  ${event.date_or_year}. ${event.description}`);
      console.log(`     📍 ${event.city} (lat: ${event.latitude}, lng: ${event.longitude})\n`);
    });

  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

injectTimeline();
