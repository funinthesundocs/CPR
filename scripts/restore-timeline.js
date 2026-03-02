const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey);

const timelineEvents = [
  {
    year: '2025-09-06',
    title: 'First Meeting',
    description: 'Met Cole by chance at a beach club in Da Nang. He wore a hat referencing "infinite mileage"/zero-fuel propulsion. They spoke about renewable energy and marine propulsion; he positioned himself as a visionary founder behind Marine Warrior/Finish Line.',
    city: 'Da Nang, Vietnam',
    lat: 16.0476743,
    lng: 108.2496587,
    type: 'meeting'
  },
  {
    year: '2025-09-20',
    title: 'Job Offer',
    description: 'Cole recruited him for "Director of International Marketing," offering $40,000/month, equity, and authority to build global systems. He also claimed multimillion-dollar funding, ~340 presales, and a Zurich credit line.',
    city: 'Da Nang, Vietnam',
    lat: 16.0502553,
    lng: 108.2453282,
    type: 'agreement'
  },
  {
    year: '2025-09-24',
    title: 'Work Begins',
    description: 'Began structuring the business -- converting messy spreadsheets into linked workflows; building production/vendor/invoicing dataflows; drafting POs/invoices; handling partner communications; initiating market research and a digital funnel.',
    city: 'Da Nang, Vietnam',
    lat: 16.0811604,
    lng: 108.2470304,
    type: 'employment'
  },
  {
    year: '2025-09-25',
    title: 'Financial Support',
    description: 'Paid for an accountant, covered meals, transport, and helped with rent and a moped, with Cole\'s written promise of reimbursement. Meetings frequently required intervention to calm investors/engineers after Cole\'s outbursts.',
    city: 'Da Nang, Vietnam',
    lat: 16.0257482,
    lng: 108.2405562,
    type: 'transaction'
  },
  {
    year: '2025-10-07',
    title: 'Sexual Crime Event',
    description: 'While operating from an Airbnb Matt arranged, the host reported that Cole exposed himself to the cleaner and demanded sex. The cleaner fled; the host messaged Matt with details immediately.',
    city: 'Da Nang, Vietnam',
    lat: 16.0811604,
    lng: 108.2470304,
    type: 'incident'
  },
  {
    year: '2025-10-10',
    title: 'Documentation',
    description: 'After warning signs -- missed payments, conflicting stories -- began systematic documentation: backing up drive contents, recording calls, cataloging promises, and contacting victims. Compared notes with John; more unpaid vendors and misled women came forward.',
    city: 'Da Nang, Vietnam',
    lat: 16.0544,
    lng: 108.2022,
    type: 'evidence'
  },
  {
    year: '2025-10-20',
    title: 'Confrontation',
    description: 'At a Da Nang coffee shop, asked Cole to show any proof for his core claims -- Zurich line, 340 presales, manufacturing partners, even personal claims. He produced nothing; stories shifted; he deflected emotionally. Matt\'s girlfriend attended and recorded.',
    city: 'Da Nang, Vietnam',
    lat: 16.0544,
    lng: 108.2022,
    type: 'confrontation'
  },
  {
    year: '2025-10-22',
    title: 'Disassociation',
    description: 'Issued a formal Notice of Disassociation to partners, vendors, and professionals. Began coordinating documentation with victims and counsel for potential reports to Vietnam Police and Australian authorities.',
    city: 'Da Nang, Vietnam',
    lat: 16.0544,
    lng: 108.2022,
    type: 'separation'
  }
];

async function restore() {
  try {
    const { data: caseData } = await supabase
      .from('cases')
      .select('id, plaintiff_id')
      .eq('case_number', 'C-0001')
      .maybeSingle();

    const caseId = caseData.id;
    const plaintiffId = caseData.plaintiff_id;
    
    console.log(`🔄 Restoring timeline for C-0001...\n`);

    // Delete current events
    await supabase
      .from('timeline_events')
      .delete()
      .eq('case_id', caseId);

    // Insert restored events
    const { data, error } = await supabase
      .from('timeline_events')
      .insert(
        timelineEvents.map(event => ({
          case_id: caseId,
          date_or_year: event.year,
          description: event.description,
          city: event.city,
          latitude: event.lat,
          longitude: event.lng,
          submitted_by: plaintiffId,
          event_type: event.type,
        }))
      )
      .select();

    if (error) {
      console.error('❌ Error:', error);
      process.exit(1);
    }

    console.log(`✅ Successfully restored ${data.length} timeline events:\n`);
    data.forEach((event) => {
      console.log(`  📌 ${event.date_or_year} — ${event.description.substring(0, 60)}...`);
    });
    console.log('\n✨ Timeline restored with full descriptions and coordinates!');

  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

restore();
