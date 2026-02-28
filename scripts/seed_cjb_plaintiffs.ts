/**
 * seed_cjb_plaintiffs.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Creates 3 plaintiff accounts + the Colin James Bradley defendant record +
 * all case data extracted from testimony files in docs/Colin James Bradley.
 *
 * Run:  npx tsx scripts/seed_cjb_plaintiffs.ts
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://lcthxjtcicbtirsxkxbh.supabase.co'
const SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjdGh4anRjaWNidGlyc3hreGJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDU5MzM0MCwiZXhwIjoyMDg2MTY5MzQwfQ.ltGxvxl10US78hO2A5CDoPBvg3yNKI136ivcYweVmvU'

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ─────────────────────────────────────────────────────────────────────────────
// DEFENDANT DATA
// ─────────────────────────────────────────────────────────────────────────────

const DEFENDANT = {
  first_name: 'Colin',
  middle_name: 'James',
  last_name: 'Bradley',
  full_name: 'Colin James Bradley',
  aliases: ['Cole Bradley', 'Cole'],
  location: 'Da Nang, Vietnam (current); previously Dubai UAE, Bangkok Thailand, Gold Coast and Queensland Australia',
  phone: null,
  address: null,
  date_of_birth: null, // GAP — not confirmed in testimony
  business_names: [
    'Marine Warrior Superyachts',
    'Finish Line Boats',
    'Big Rig Tyres',
    'Big Rig 4x4',
    'Aus Lift Efoil',
    'Aus Style Building',
  ],
  social_profiles: {
    instagram: 'Active on Instagram and Threads — soliciting $240,000 AUD buy-ins as of early 2026',
    description:
      'Australian national, serial fraud operator across Australia, UAE, Thailand, and Vietnam. ' +
      'Presents as wealthy super-yacht builder with revolutionary zero-fuel propulsion technology. ' +
      'Claims access to a 450–480 million USD European family trust fund. ' +
      'All claims are fabricated. Has outstanding court judgments in Australia (~$30,000 AUD) and UAE (680,000 AED / ~$340,000 AUD). ' +
      'History of two prior bankruptcies. Currently residing in Vietnam on tourist visa.',
  },
  slug: `colin-james-bradley-${Date.now().toString(36)}`,
}

// ─────────────────────────────────────────────────────────────────────────────
// PLAINTIFF DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────

const PLAINTIFFS = [
  {
    email: 'funinthesundocs@gmail.com',
    password: 'Changeme123!',
    full_name: 'Matt Campbell',
    display_name: 'Matt Campbell',
  },
  {
    email: 'kellycai600@gmail.com',
    password: 'Changeme123!',
    full_name: 'Kelly Smith',
    display_name: 'Kelly Smith',
  },
  {
    email: 'slorelle02@gmail.com',
    password: 'Changeme123!',
    full_name: 'Lorelle Smith',
    display_name: 'Lorelle Smith',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// CASE DATA — extracted verbatim from testimony, cleaned for clarity
// ─────────────────────────────────────────────────────────────────────────────

function getMattCase(defendantId: string, userId: string) {
  return {
    caseRecord: {
      defendant_id: defendantId,
      plaintiff_id: userId,
      case_types: ['fraud', 'breach_of_contract', 'wage_theft'],
      status: 'pending',
      current_step: 12,
      relationship_narrative: {
        type: 'professional_associate',
        duration: 'Approximately 6 weeks (September–October 2025)',
        entity_type: 'person',
        first_interaction:
          'We met by chance at a beach club in Da Nang, Vietnam on September 6, 2025. ' +
          'Cole was wearing a hat referencing "infinite mileage" or zero-fuel propulsion technology. ' +
          'My background in renewable energy sparked a technical conversation, which led to a professional ' +
          'relationship and ultimately a job offer.',
        early_warnings:
          'Contradictory statements about investors, contracts, and funding timelines from day one. ' +
          'Missed payments before any work was delivered. Conflicting stories about manufacturing partners ' +
          'in Turkey, Thailand, UAE, and Vietnam. Erratic behavior in meetings — table-slamming, ' +
          'belittling staff, frequent unprompted crying. "Banking errors" and "technical issues" were ' +
          'constantly cited to delay any payment or verification.',
      },
      promise_narrative: {
        explicit_agreement: 'yes',
        agreement_terms:
          'Verbal offer for Director of International Marketing at $40,000 AUD per month plus equity, ' +
          'with full authority to build global marketing and operations systems. Cole presented investor ' +
          'decks, presale contracts (claiming 340 pre-sold yacht contracts), spreadsheets, and ' +
          'manufacturing claims that appeared legitimate at first glance. He also claimed a Zurich credit ' +
          'line of 450–480 million USD.',
        reasonable_expectation:
          'Based on the materials presented — investor decks, claimed Zurich credit line, and presale ' +
          'contracts — it was reasonable to expect compensation for work performed and reimbursement for ' +
          'out-of-pocket expenses covered on his behalf.',
        evidence_of_trust:
          'I was shown investor decks, presale contracts, spreadsheets, and manufacturing documentation. ' +
          'Cole claimed partnerships with boat builders in Turkey, Thailand, UAE, and Vietnam, and ' +
          'presented himself as the founder of Marine Warrior Superyachts and Finish Line Boats.',
        others_vouch:
          'No third parties independently vouched for him. His CFO, John Cooper, later confirmed that ' +
          'no sales contracts, deposits, or trading figures ever existed.',
      },
      betrayal_narrative: {
        what_happened:
          'Colin James Bradley recruited me as Director of International Marketing under false pretenses. ' +
          'He never paid me, failed to reimburse out-of-pocket costs I covered for his operation, and ' +
          'produced zero evidence for any of his core claims when directly confronted. He simultaneously ' +
          'victimized multiple others — unpaid professionals, scammed builders, deceived women, and former ' +
          'associates across multiple countries. The entire operation was fabricated.',
        primary_incident:
          'On October 20, 2025, at a coffee shop in Da Nang, I formally confronted Cole with my girlfriend ' +
          'present as a witness. I asked him to provide any single piece of proof for his core claims: the ' +
          'Zurich financing, 340 presale contracts, manufacturing partners, the alleged baby in China, the ' +
          'Bentley in Dubai. He produced nothing. His stories shifted with every question. He attempted ' +
          'emotional manipulation and deflection. This was the moment I confirmed the entire operation ' +
          'was fabricated.',
        when_realized:
          'October 2025 — approximately three weeks after work began, red flags became undeniable. ' +
          'The confrontation on October 20, 2025 confirmed everything.',
        how_confirmed:
          'Direct confrontation with documented questioning. Cole was unable to produce a single piece of ' +
          'verifiable evidence for any claim. Simultaneously, other victims surfaced — unpaid professionals, ' +
          'deceived women, former Australian associates — all with identical stories. John Cooper (CFO) ' +
          'confirmed no sales contracts, deposits, or trading figures existed.',
        is_ongoing:
          'yes — Cole is still actively soliciting investments on Instagram and Threads as of early 2026.',
      },
      personal_impact: {
        emotional:
          'Severe stress from attempting to stabilize a collapsing fraudulent operation. Professional ' +
          'credibility damaged through association with Cole. Deep concern for the scale of harm inflicted ' +
          'on other victims. The psychological toll of discovering a sophisticated fraud after investing ' +
          'significant time, resources, and professional trust.',
        physical: null, // GAP — not mentioned in testimony
        wish_understood:
          'Sophisticated fraudsters like Cole Bradley create believable presentations and use "technical ' +
          'difficulties" to defer payment indefinitely while extracting labor and resources. No legitimate ' +
          'business opportunity requires you to fund someone else\'s living expenses before you receive ' +
          'a single dollar. I want the business community in Southeast Asia to be warned.',
      },
      legal_actions: {
        police_report: 'no',
        lawyer: 'yes',
        court_case: 'no',
        description:
          'Documentation and coordination with legal counsel for potential reports to Da Nang Police ' +
          'Department (Vietnam), Thai authorities, and Australian Federal Police. Potential Interpol ' +
          'passport flagging discussed with counsel. Cole faces existing court judgments in Australia ' +
          '(~$30,000 AUD) and UAE (680,000 AED / ~$340,000 AUD).',
        why_filing:
          'To expose Cole Bradley\'s systematic fraud so that banks, investors, potential partners, and ' +
          'individuals can protect themselves. To pursue restitution for unpaid wages, out-of-pocket ' +
          'expenses, and damaged professional credibility. To contribute to the collective legal case ' +
          'against a serial fraudster operating across multiple jurisdictions.',
        other_victims: 'yes',
        other_victims_count: 10,
      },
      story_narrative: {
        one_line_summary:
          'Colin James Bradley posed as a yacht industry visionary, recruited me as his international ' +
          'marketing director, extracted six weeks of unpaid labor and out-of-pocket expenses, and was ' +
          'exposed as a serial fraud operator with victims across Vietnam, Thailand, Australia, and the UAE.',
        body:
          'Colin James "Cole" Bradley entered my life by chance in Da Nang, Vietnam, wearing a hat ' +
          'claiming "infinite mileage" through zero-fuel propulsion. With my background in renewable ' +
          'energy and systems design, his claims seemed worth exploring. He positioned himself as the ' +
          'founder of Marine Warrior Superyachts, allegedly on the brink of launching revolutionary ' +
          'technology and multimillion-dollar yacht contracts. Within weeks, he recruited me to build ' +
          'his international marketing and operations architecture — offering $40,000 per month, equity, ' +
          'and full system-building authority.\n\n' +
          'The materials he showed me — investor decks, presale contracts, spreadsheets, and manufacturing ' +
          'claims — appeared legitimate at first glance. As soon as I began working, the red flags ' +
          'multiplied. He never paid me. He failed to pay vendors. He ghosted deliverables. He made ' +
          'contradictory statements about investors, contracts, funding timelines, and manufacturing ' +
          'partners in Turkey, Thailand, UAE, and Vietnam. Meanwhile, I was building his entire ' +
          'infrastructure — linking production sheets, drafting proposals, creating dataflows, handling ' +
          'communications, and covering costs out of pocket for accountants, meals, transportation, ' +
          'rent, and even a moped. Every promise of reimbursement was pushed to "next week," "after ' +
          'funding releases," or "once Zurich clears the line."\n\n' +
          'His behavior grew more erratic. He belittled people in meetings, slammed his fist on tables, ' +
          'and emotionally manipulated anyone who challenged him. He cried frequently, claimed crises ' +
          'that never existed, and redirected blame onto others. Soon, victims surfaced everywhere: ' +
          'unpaid professionals, scammed builders, deceived women in China and Thailand, and former ' +
          'associates from Australia who warned us he had fled jurisdictions before.\n\n' +
          'The breaking point came on October 20, 2025, at a coffee shop in Da Nang. With my girlfriend ' +
          'present as a witness, I gave him the opportunity to provide even a single piece of proof ' +
          'backing his claims — Zurich financing, presale contracts, investor communications, ' +
          'manufacturing partners, or anything verifiable. He produced nothing. Instead, he changed ' +
          'his story with every question, attempted emotional manipulation, and failed to offer a single ' +
          'piece of evidence. This was the moment I understood the entire operation was fabricated.\n\n' +
          'I began documenting everything: screenshots, recordings, drive backups, contact lists of ' +
          'victims, and written testimonies. I issued a formal Notice of Disassociation to all partners, ' +
          'suppliers, and professionals I had communicated with on his behalf. Victims in multiple ' +
          'countries — Vietnam, Thailand, Australia, and the UAE — are now preparing coordinated ' +
          'legal action.',
        evidence_inventory: [
          {
            label: 'Confrontation Recording',
            description:
              'Audio/video recording of October 20, 2025 coffee shop confrontation. Cole was unable to ' +
              'provide any evidence for any claim across 7 categories of questioning.',
            category: 'evidAudio',
          },
          {
            label: 'Written Witness Statements — Sexual Misconduct',
            description:
              'Written and recorded statements from Airbnb host Ha Le Pham and Vietnamese cleaner ' +
              'Thuy Ngoc Nguyen regarding Cole\'s sexual misconduct on October 7, 2025.',
            category: 'evidWitness',
          },
          {
            label: 'Drive Backup — Business Documents',
            description:
              'Backed-up copies of Cole\'s business materials including investor decks, spreadsheets, ' +
              'presale claims, and all communications during the engagement.',
            category: 'evidFinancial',
          },
          {
            label: 'Notice of Disassociation',
            description:
              'Formal written notice issued to all business partners and contacts on October 22, 2025.',
            category: 'evidOther',
          },
          {
            label: 'WhatsApp Chat Exports',
            description:
              'Complete WhatsApp chat history with Cole Bradley and the victim group chat including ' +
              'Kelly (wife) and Lorelle (former partner), documenting the pattern across all parties.',
            category: 'evidTexts',
          },
        ],
        evidence_checklist: ['evidTexts', 'evidAudio', 'evidWitness', 'evidFinancial', 'evidPhotos'],
      },
      visibility_settings: {
        tier: 'open',
        accused_aware: 'yes',
        current_contact: 'no',
      },
      consent: {
        real_name: true,
        contact_sharing: true,
        terms: true,
      },
      nominal_damages_claimed: 40000,
    },
    timelineEvents: [
      {
        event_type: 'first_contact',
        date_or_year: 'September 6, 2025',
        description:
          'First meeting at a beach club in Da Nang, Vietnam. Cole wore a hat referencing zero-fuel / ' +
          'infinite mileage propulsion. A technical conversation about renewable energy led to a ' +
          'professional introduction and the beginning of the relationship.',
        city: 'Da Nang, Vietnam',
      },
      {
        event_type: 'trust_built',
        date_or_year: 'September 20, 2025',
        description:
          'Cole offered me the role of Director of International Marketing at $40,000 AUD/month salary ' +
          'plus equity and full operational authority. He claimed 340 pre-sold yacht contracts, a ' +
          'multimillion-dollar Zurich credit line, and manufacturing operations spanning multiple countries.',
        city: 'Da Nang, Vietnam',
      },
      {
        event_type: 'the_act',
        date_or_year: 'September 24, 2025',
        description:
          'Work began. I converted disorganized spreadsheets into linked production workflows, built ' +
          'vendor/invoicing dataflows, drafted purchase orders and invoices, handled partner ' +
          'communications, and initiated market research and digital funnel development with my ' +
          'in-house team — all without receiving any payment.',
        city: 'Da Nang, Vietnam',
      },
      {
        event_type: 'escalation',
        date_or_year: 'September 25, 2025',
        description:
          'To keep operations running, I paid out of pocket for an accountant, covered meals, ' +
          'transportation, accommodation, and a moped — all on Cole\'s written promise of reimbursement. ' +
          'I also had to intervene regularly in meetings to calm investors and engineers after ' +
          'Cole\'s angry outbursts.',
        city: 'Da Nang, Vietnam',
      },
      {
        event_type: 'red_flag',
        date_or_year: 'October 7, 2025',
        description:
          'The Airbnb host reported that Cole had exposed himself to the house cleaner (Thuy Ngoc ' +
          'Nguyen) and demanded sexual favors. The cleaner fled. The host messaged me immediately. ' +
          'I subsequently obtained written and recorded statements from both the host and the cleaner.',
        city: 'Da Nang, Vietnam',
      },
      {
        event_type: 'discovery',
        date_or_year: 'October 10, 2025',
        description:
          'Began systematic documentation: backed up all drive contents, recorded calls, cataloged ' +
          'all promises made, and began contacting other victims. Compared notes with John Cooper (CFO); ' +
          'additional unpaid vendors and deceived women came forward with identical stories.',
        city: 'Da Nang, Vietnam',
      },
      {
        event_type: 'discovery',
        date_or_year: 'October 20, 2025',
        description:
          'Formal confrontation at a Da Nang coffee shop. I presented Cole with written questions across ' +
          '7 categories: family claims, Zurich financing, 340 presales, manufacturing in Turkey, design ' +
          'licensing, lifestyle claims, and accountability. He produced no evidence for any claim. ' +
          'Stories shifted with each question. My girlfriend attended and recorded the confrontation.',
        city: 'Da Nang, Vietnam',
      },
      {
        event_type: 'aftermath',
        date_or_year: 'October 22, 2025',
        description:
          'Issued a formal Notice of Disassociation to all partners, vendors, and professionals engaged ' +
          'during Cole\'s project. Began coordinating documentation with victims and legal counsel for ' +
          'potential reports to Vietnam Police, Thai authorities, and Australian Federal Police.',
        city: 'Da Nang, Vietnam',
      },
    ],
    witnesses: [
      {
        full_name: 'John Cooper',
        witness_type: 'character_witness',
        contact_info: null,
        details: {
          can_verify:
            'CFO of Cole\'s companies. Can confirm no sales contracts, deposits, or trading figures ' +
            'ever existed. Independently confirmed the pattern of financial fraud.',
        },
      },
      {
        full_name: 'Ha Le Pham',
        witness_type: 'eyewitness',
        contact_info: null,
        details: {
          can_verify:
            'Airbnb host. Has written and recorded statement regarding the sexual misconduct incident ' +
            'on October 7, 2025.',
        },
      },
      {
        full_name: 'Thuy Ngoc Nguyen',
        witness_type: 'eyewitness',
        contact_info: null,
        details: {
          can_verify:
            'Vietnamese house cleaner. Direct victim of sexual misconduct by Cole on October 7, 2025. ' +
            'Has written and recorded statement.',
        },
      },
      {
        full_name: 'Matt\'s girlfriend (name withheld)',
        witness_type: 'eyewitness',
        contact_info: null,
        details: {
          can_verify:
            'Present at and recorded the October 20, 2025 coffee shop confrontation.',
        },
      },
    ],
    financialImpact: {
      direct_payments: 0, // GAP — out-of-pocket costs paid but no specific total documented
      lost_wages: 40000,  // 1 month at promised $40K/month AUD (unpaid)
      property_loss: 0,
      legal_fees: 0,      // GAP
      medical_costs: 0,
      credit_damage: 0,
      other_amount: 0,    // GAP — operational costs (accountant, moped, meals etc) undocumented total
      other_description:
        'GAP: Out-of-pocket operational costs (accountant, meals, transport, moped, accommodation) ' +
        'covered on behalf of the defendant with a written promise of reimbursement. Exact total not ' +
        'confirmed in testimony.',
      total_lost: 40000,
    },
  }
}

function getKellyCase(defendantId: string, userId: string) {
  return {
    caseRecord: {
      defendant_id: defendantId,
      plaintiff_id: userId,
      case_types: ['fraud', 'scam', 'breach_of_contract', 'identity_theft'],
      status: 'pending',
      current_step: 12,
      relationship_narrative: {
        type: 'romantic_partner',
        duration: 'Approximately 5–6 years (2019–2024/2025), including marriage from 2020',
        entity_type: 'person',
        first_interaction:
          'I met Colin (Cole) Bradley on social media around 2019. He presented himself as friendly, ' +
          'charming, and professionally established — working as a project manager at a construction ' +
          'company and also operating as a property developer. He took an immediate interest when I ' +
          'mentioned I had recently sold my business in Melbourne, purchased a house in Brisbane, and ' +
          'was looking for employment.',
        early_warnings:
          'He pushed for marriage quickly — within months of meeting. Both companies were registered ' +
          'in my name, not his, because he claimed to have lost his builder\'s license (he was actually ' +
          'undischarged bankrupt). He consistently cast himself as the victim of his ex-partners and ' +
          '"bad luck." Previous girlfriends all allegedly cheated on him. In hindsight, this was a ' +
          'pattern — making himself the sympathetic victim to justify financial dependence.',
      },
      promise_narrative: {
        explicit_agreement: 'yes',
        agreement_terms:
          'Cole promised that once the companies were established and operating, he would transfer funds ' +
          'from a "family trust in Europe worth millions of dollars" to repay all investments, loans, and ' +
          'living expenses I had covered. He claimed this trust would be accessible within 4 years and ' +
          'would make us both financially secure. He also promised the building company would generate ' +
          'ongoing income for both of us.',
        reasonable_expectation:
          'As my husband and business partner, I trusted his financial representations and invested in ' +
          'our shared enterprises in good faith. I was the legal director of both companies and acted ' +
          'accordingly.',
        evidence_of_trust:
          'He showed me screenshots of purported bank accounts. He registered companies with me as ' +
          'director — formal government documents that created legitimate-seeming structure. He ' +
          'consistently referenced the European family trust as future financial security over multiple years.',
        others_vouch:
          'Sissy (his neighbor in Thailand) later independently confirmed he told her the identical ' +
          'family trust story. Boat builders in Dubai confirmed he claimed millions in trust funds but ' +
          'could not pay for his lunch.',
      },
      betrayal_narrative: {
        what_happened:
          'Colin James Bradley married me in 2020, having deliberately concealed his prior bankruptcy. ' +
          'He then extracted over $500,000 AUD from me through escalating deception: $300,000 from my ' +
          'offset account invested in companies he controlled but registered in my name; $200,000 from ' +
          'refinancing my Brisbane house; $35,000 borrowed from my sister and $30,000 from friends on ' +
          'his behalf; and years of funding his living expenses across Australia, Thailand, Dubai, and ' +
          'Vietnam. Throughout our entire marriage, he maintained relationships with multiple other ' +
          'women using my money to fund those relationships. When I confronted him, he blocked me and ' +
          'began defaming me to mutual contacts.',
        primary_incident:
          'The pivotal moment came in late 2024 when an Australian mutual friend sent me a photo Cole ' +
          'had forwarded to them — showing Cole with a woman in Thailand while claiming we had divorced ' +
          'the previous year. This revealed both his infidelity and his active deception of our entire ' +
          'social circle. I subsequently contacted Sissy, the woman in the photo, who confirmed: she ' +
          'was Cole\'s neighbor, not partner; the "baby" Cole claimed was his was her child from a ' +
          'previous marriage; Cole had used the identical family trust story on her; he could not pay ' +
          'his rent; she blocked him. Cole has now blocked me on WhatsApp and sent a defamatory message ' +
          'to mutual contacts claiming "Kelly is a bitch, she owes me $300k."',
        when_realized:
          'Late 2024 — when a mutual Australian friend shared the photo Cole had sent them falsely ' +
          'claiming we were already divorced.',
        how_confirmed:
          'Direct conversation with Sissy confirmed the identical fraud pattern used on another woman. ' +
          'Boat builders in Dubai independently confirmed Cole claimed millions but could not pay his ' +
          'bills. Cole\'s blocking and subsequent defamation confirmed his awareness of being exposed.',
        is_ongoing:
          'yes — Cole has blocked me on WhatsApp and defamed me to mutual contacts. He is still in ' +
          'Vietnam with no means of support and continues seeking money from others.',
      },
      personal_impact: {
        emotional:
          'I have never met anyone like him in my entire life. He is an evil person. Being married to ' +
          'someone who was deceiving me throughout our entire relationship — using my money to fund other ' +
          'relationships, lying about our divorce to our mutual friends — has been devastating. I lost ' +
          'my house, my savings, my credibility, and my ability to trust people. I also lost the money ' +
          'of my sister and friends who trusted me when I asked for their help.',
        physical: null, // GAP — not mentioned in testimony
        wish_understood:
          'Cole\'s only asset is his forked tongue. He knows how to use it to manipulate people, ' +
          'especially women. He specifically targets financially independent women, positions himself ' +
          'as a victim of others to gain sympathy, moves fast toward marriage, then systematically ' +
          'extracts their resources while maintaining other relationships. By the time you realize what ' +
          'has happened, he has moved to another country and another target.',
      },
      legal_actions: {
        police_report: 'no', // GAP — not confirmed in testimony
        lawyer: 'no',        // GAP — not confirmed in testimony
        court_case: 'no',
        description:
          'Cole has an existing default judgment against him in Dubai of 680,000 AED (approximately ' +
          '$340,000 AUD). Divorce proceedings are being initiated. As of November 2025, Cole had 7 ' +
          'days remaining to meet his Dubai judgment.',
        why_filing:
          'To warn other women and potential business partners before they are victimized. To create a ' +
          'permanent public record of this pattern. To seek restitution for over $500,000 in documented ' +
          'losses and to recover the $65,000 borrowed from my sister and friends on his behalf.',
        other_victims: 'yes',
        other_victims_count: 10,
      },
      story_narrative: {
        one_line_summary:
          'Colin Bradley married me while concealing his bankruptcy, registered companies in my name, ' +
          'extracted over $500,000 through years of lies about a European family trust, cheated ' +
          'throughout our marriage, then blocked and defamed me when the money ran out.',
        body:
          'I met Colin (Cole) Bradley on social media around 2019. He gave me the impression he was ' +
          'a successful, friendly professional — a project manager and property developer. I had recently ' +
          'sold my business in Melbourne and purchased a house in Brisbane, and was looking for ' +
          'employment. Cole offered me a role in his companies once they were set up. A couple of months ' +
          'later, we had two companies together — a building company and an investment company — but both ' +
          'were registered under my name. He said he had lost his builder\'s license due to his ex-wife ' +
          '"screwing him." What he did not tell me was that he was undischarged bankrupt at the time.\n\n' +
          'He proposed to me, and I married him in 2020. I can see now why he wanted to marry so quickly: ' +
          'I had a house nearly paid off and $300,000 in my offset account. He asked me to invest in ' +
          'both companies. I did not doubt it — he was my husband. He told me he had millions of dollars ' +
          'in a family trust in Europe, accessible in four years, which would repay everything. What I ' +
          'discovered was that he did not know how to run a business. He was rude to staff, arrogant, ' +
          'and always blamed others even when failures were his fault. The building company collapsed ' +
          'despite me refinancing my house for $200,000 to put into the business. He blamed me and ' +
          'the project manager.\n\n' +
          'Early 2023, he moved to Thailand to "set up a new company" that would finally allow him to ' +
          'access the trust. I funded his living expenses from Australia. A few months later he moved ' +
          'to Dubai in November 2023, claiming lower taxes would solve the trust access problem. I ' +
          'borrowed $35,000 from my sister and $30,000 from my friends to support him. Six months ' +
          'later: no repayment, more excuses. In June 2024 he moved to Vietnam, saying this time it ' +
          'would definitely be resolved. I paid his flight and accommodation and told him it was ' +
          'the last time.\n\n' +
          'In late 2024, a mutual Australian friend sent me a photo Cole had forwarded to them, showing ' +
          'him with a woman in Thailand while claiming we had been divorced since the previous year. ' +
          'I found her number and called her. Her name is Sissy. She told me she was Cole\'s next-door ' +
          'neighbour in Thailand — not his partner. He had told her the exact same family trust story, ' +
          'given her 30% company shares and a ring she refused, and even claimed a baby she had with ' +
          'her ex-husband was his. Her landlord — also Chinese — told her Cole couldn\'t pay his rent. ' +
          'She blocked him when she understood what he was.\n\n' +
          'Cole has now blocked me on WhatsApp and sent a defamatory message to mutual contacts ' +
          'claiming "Kelly is a bitch, she owes me $300k." In total I have lost more than $500,000 — ' +
          'my house, my savings, the money of my sister and friends. He used my money to date other ' +
          'women throughout our entire marriage. I have lost everything. I have never met anyone like ' +
          'him in my entire life.',
        evidence_inventory: [
          {
            label: 'Transaction Receipts',
            description:
              'All transaction receipts showing money transferred to Cole across Australia, Thailand, ' +
              'Dubai, and Vietnam.',
            category: 'evidFinancial',
          },
          {
            label: 'Bank Statements — $300,000 Offset Account',
            description:
              'Bank statements showing $300,000 withdrawn from offset account for business investment.',
            category: 'evidFinancial',
          },
          {
            label: 'House Refinancing Documents',
            description:
              '$200,000 refinancing of Brisbane house to fund the building company.',
            category: 'evidFinancial',
          },
          {
            label: 'WhatsApp Chat History — Cole',
            description:
              'Complete WhatsApp chat history with Cole including money requests, banking excuses, ' +
              'and promises of repayment.',
            category: 'evidTexts',
          },
          {
            label: 'Infidelity Photo',
            description:
              'Photo forwarded by Cole to an Australian mutual friend showing Cole with his Thai ' +
              'companion while falsely claiming to be divorced.',
            category: 'evidPhotos',
          },
          {
            label: 'Defamatory Message Screenshot',
            description:
              'Screenshot of Cole\'s message to mutual contacts: "Kelly is a bitch, she owes me $300k."',
            category: 'evidTexts',
          },
        ],
        evidence_checklist: ['evidTexts', 'evidFinancial', 'evidPhotos'],
      },
      visibility_settings: {
        tier: 'open',
        accused_aware: 'yes',
        current_contact: 'no',
      },
      consent: {
        real_name: true,
        contact_sharing: true,
        terms: true,
      },
      nominal_damages_claimed: 500000,
    },
    timelineEvents: [
      {
        event_type: 'first_contact',
        date_or_year: '2019',
        description:
          'Met Colin Bradley on social media. He presented as a project manager and property developer, ' +
          'showing immediate interest in my financial situation after I mentioned selling my Melbourne ' +
          'business and purchasing a Brisbane house.',
        city: 'Melbourne/Brisbane, Australia',
      },
      {
        event_type: 'trust_built',
        date_or_year: 'Late 2019',
        description:
          'Cole proposed forming two companies together — a building company and an investment company — ' +
          'both to be registered under my name. He claimed he had lost his builder\'s license. In ' +
          'reality, he was undischarged bankrupt at the time, a fact he deliberately concealed.',
        city: 'Brisbane, Australia',
      },
      {
        event_type: 'the_act',
        date_or_year: '2020',
        description:
          'Cole proposed marriage. We married in 2020. I invested $300,000 from my offset account and ' +
          'later refinanced my Brisbane house for $200,000 to fund the building company, believing I ' +
          'was investing in our shared future.',
        city: 'Brisbane, Australia',
      },
      {
        event_type: 'escalation',
        date_or_year: '2020–2021',
        description:
          'The building company collapsed. Cole blamed me and the project manager. Despite my total ' +
          'investment of $500,000, there was no income and no repayment.',
        city: 'Brisbane, Australia',
      },
      {
        event_type: 'escalation',
        date_or_year: 'Early 2023',
        description:
          'Cole moved to Thailand claiming this would allow him to access the European family trust and ' +
          'repay all losses. I continued funding his living expenses from Australia.',
        city: 'Thailand',
      },
      {
        event_type: 'red_flag',
        date_or_year: '2023',
        description:
          'Cole targeted and misled a Chinese woman named Sissy in Thailand — presenting as single ' +
          'with millions in a European trust. He offered her 30% company shares and a ring she refused. ' +
          'The arrangement produced nothing. Sissy later blocked him.',
        city: 'Thailand',
      },
      {
        event_type: 'escalation',
        date_or_year: 'November 2023',
        description:
          'Cole moved to Dubai claiming lower taxes would enable trust access. I borrowed $35,000 from ' +
          'my sister and $30,000 from friends to support him based on his promises of repayment ' +
          'within months.',
        city: 'Dubai, UAE',
      },
      {
        event_type: 'escalation',
        date_or_year: 'June 2024',
        description:
          'After 6 months in Dubai with no repayment or trust access, Cole moved to Vietnam, again ' +
          'promising resolution. I paid his flight and accommodation and told him it was the last time.',
        city: 'Da Nang, Vietnam',
      },
      {
        event_type: 'discovery',
        date_or_year: 'Late 2024',
        description:
          'An Australian mutual friend forwarded me a photo Cole had sent them, showing Cole with a ' +
          'woman in Thailand. Cole had told this friend that we had been divorced since the previous ' +
          'year. This revealed both his ongoing infidelity and his active deception of our social circle.',
        city: 'Australia (communication)',
      },
      {
        event_type: 'discovery',
        date_or_year: 'Late 2024',
        description:
          'I called Sissy, the woman from the Thailand photo. She confirmed: she was Cole\'s next-door ' +
          'neighbor, not partner; the "baby" Cole claimed was his was her child with her ex-husband; ' +
          'Cole had used the identical family trust story on her; he could not pay his rent; she had ' +
          'blocked him. Cole had clearly been running parallel deceptions simultaneously.',
        city: 'Australia / China (communication)',
      },
      {
        event_type: 'aftermath',
        date_or_year: 'Late 2024 – Early 2025',
        description:
          'Cole blocked me on WhatsApp and sent a defamatory message to mutual contacts stating ' +
          '"Kelly is a bitch, she owes me $300k." Total losses confirmed at over $500,000 AUD.',
        city: 'Vietnam / Australia',
      },
    ],
    witnesses: [
      {
        full_name: 'Sissy (surname unknown)',
        witness_type: 'character_witness',
        contact_info: null,
        details: {
          can_verify:
            'Cole\'s neighbor in Thailand. Can confirm: Cole used identical family trust story on her, ' +
            'presented as single and wealthy, offered company shares and a ring she declined. The ' +
            '"baby" Cole claimed was his was her child from her previous marriage. She blocked Cole ' +
            'when she realized the pattern.',
        },
      },
      {
        full_name: 'Kelly\'s sister (name withheld)',
        witness_type: 'character_witness',
        contact_info: null,
        details: {
          can_verify:
            'Lent $35,000 to Kelly at Cole\'s request. Can confirm the loan and the promises made.',
        },
      },
      {
        full_name: 'Australian mutual friend (name withheld)',
        witness_type: 'eyewitness',
        contact_info: null,
        details: {
          can_verify:
            'Received photo from Cole falsely claiming Cole and Kelly had divorced the prior year. ' +
            'Alerted Kelly to the deception.',
        },
      },
      {
        full_name: 'Dubai boat builder (name withheld)',
        witness_type: 'character_witness',
        contact_info: null,
        details: {
          can_verify:
            'Can confirm Cole claimed millions in trust funds but could not pay for basic expenses. ' +
            'Cole redesigned boat structures through their firm but never paid for the work.',
        },
      },
    ],
    financialImpact: {
      direct_payments: 300000, // $300K from offset account
      lost_wages: 0,
      property_loss: 200000,   // $200K house refinancing
      legal_fees: 0,           // GAP
      medical_costs: 0,        // GAP
      credit_damage: 0,        // GAP
      other_amount: 65000,     // $35K sister + $30K friends
      other_description:
        '$35,000 borrowed from sister and $30,000 borrowed from friends on Cole\'s behalf, ' +
        'totaling $65,000 in third-party debts incurred at Cole\'s direct request.',
      total_lost: 565000,
    },
  }
}

function getLorellCase(defendantId: string, userId: string) {
  return {
    caseRecord: {
      defendant_id: defendantId,
      plaintiff_id: userId,
      case_types: ['fraud', 'identity_theft', 'breach_of_contract', 'defamation'],
      status: 'pending',
      current_step: 12,
      relationship_narrative: {
        type: 'romantic_partner',
        duration: '5 years (2014–2019)',
        entity_type: 'person',
        first_interaction:
          'I met Colin Bradley online in 2014 while working at a car dealership in New South Wales. ' +
          'He initially contacted me to arrange the purchase of a Holden Colorado and Captiva through ' +
          'my dealership. During our conversations, he told me his ex-partner Jennifer had stolen ' +
          '$200,000 from him and that he would repay whatever he borrowed once he recovered those funds. ' +
          'He gradually drew on my sympathetic nature to borrow increasing amounts for rent and bills.',
        early_warnings:
          'He cast himself as the victim of his ex-partner who had "screwed him" — a story designed to ' +
          'gain sympathy and justify financial dependency. He stopped working almost immediately after I ' +
          'moved in with him, spending his time pursuing car racing sponsorships instead. His first ' +
          'business, Big Rig Tyres, employed four people but generated no revenue. He proposed to me ' +
          'in November 2014 — I paid for my own $8,000 engagement ring.',
      },
      promise_narrative: {
        explicit_agreement: 'yes',
        agreement_terms:
          'Colin promised to repay the $60,000 house loan with monthly installments of $3,500. He ' +
          'promised that Big Rig 4x4, once profitable, would "set up our future." He referenced a ' +
          'multi-million dollar family trust as long-term security. Every debt he created was ' +
          'accompanied by a specific repayment promise that was never honored.',
        reasonable_expectation:
          'As my partner of five years and the operating controller of businesses legally registered in ' +
          'my name, it was reasonable to expect repayment of formally documented loans — especially the ' +
          '$60,000 loan arranged by solicitors who visited my workplace — and that businesses in my ' +
          'name would be operated lawfully on my behalf.',
        evidence_of_trust:
          'Solicitors visited my workplace to prepare loan documentation for the $60,000 house loan — ' +
          'a level of formality that created legitimate trust. Business registrations in my name were ' +
          'official government documents. Colin consistently referenced the family trust as future security.',
        others_vouch:
          'No independent verification of his claims was available to me at the time. Employees and ' +
          'clients were also deceived. His later partners (Kelly, Sally) subsequently confirmed the ' +
          'same patterns.',
      },
      betrayal_narrative: {
        what_happened:
          'Over five years, Colin James Bradley systematically defrauded me of approximately $170,000 ' +
          'through multiple mechanisms: $10,000+ in direct cash loans; a $60,000 loan against my NSW ' +
          'home that was never repaid, forcing the sale of my house and displacing my two adult children; ' +
          'identity theft — opening Big Rig 4x4 and taking out multiple online loans in my name without ' +
          'my knowledge, resulting in over $100,000 in unpaid creditor debts and my personal bankruptcy. ' +
          'He also brought other women into our home claiming I was his step-sister, stole my possessions ' +
          'when he left, publicly defamed me when the businesses failed, and threatened me with police ' +
          'action if I spoke to his other victims.',
        primary_incident:
          'In 2017, Colin took out numerous online loans using my name and identity without my knowledge ' +
          'or consent. In 2018, returning from a cruise we took together, I was served with bankruptcy ' +
          'papers. The total unpaid debt exceeded $100,000 — entirely consisting of debts Colin had ' +
          'created in my name. Simultaneously, a client\'s daughter began a Facebook defamation campaign ' +
          'targeting my family and friends, posting my photo on the "Logan Crime and Watch" page as a ' +
          'fraudster. People came to my workplace to threaten me. I had no knowledge of the transactions ' +
          'I was being blamed for.',
        when_realized:
          '2018 — when I was served with bankruptcy papers on returning from a cruise we had just taken ' +
          'together. The cruise was the last performance of normality before the full scale of what he ' +
          'had done in my name was revealed.',
        how_confirmed:
          'Bankruptcy filing documents confirmed over $100,000 in unpaid debts attributed to my identity. ' +
          'Big Rig 4x4 business registration confirmed the company was in my name. The house sale ' +
          'confirmed the $60,000 loan had never been repaid. The Facebook defamation posts confirmed ' +
          'public harm.',
        is_ongoing:
          'yes — Colin sent threatening messages in 2019 warning me not to contact his other victims. ' +
          'He continued messaging in December 2020 promising repayment that never came.',
      },
      personal_impact: {
        emotional:
          'My family members and friends were targeted with defamatory Facebook messages calling me a ' +
          'thief. My photo was posted on the "Logan Crime and Watch" page. People came to my workplace ' +
          'to threaten me physically. I was publicly branded a criminal for debts I had no knowledge of. ' +
          'The sale of my house left my two adult children without a home. Being the legal face of ' +
          'his crimes — while he walked away — was psychologically devastating.',
        physical: null, // GAP — not mentioned in testimony
        wish_understood:
          'Everything that happened — the business failures, the unpaid debts, the defamation, the ' +
          'bankruptcy — was done using my name and identity while Colin was in complete control of all ' +
          'transactions, accounts, and business operations. I was the legal face of his crimes without ' +
          'my knowledge or consent. I am a victim of identity fraud, not a willing participant.',
      },
      legal_actions: {
        police_report: 'no', // GAP — not confirmed in testimony
        lawyer: 'no',        // GAP — not confirmed in testimony
        court_case: 'no',
        description:
          'Bankruptcy proceedings were filed against Lorelle in 2018 due to over $100,000 in debts ' +
          'Colin created in her name. No direct legal action against Colin has been confirmed. Colin ' +
          'has outstanding judgments in Australia (~$30,000 AUD), UAE (680,000 AED), and pending ' +
          'potential charges in Thailand.',
        why_filing:
          'To expose Colin Bradley\'s pattern of identity fraud and financial exploitation. To create ' +
          'a permanent public record documenting what he did using my name and identity. To contribute ' +
          'to the collective case and seek restitution for losses that have never been acknowledged.',
        other_victims: 'yes',
        other_victims_count: 10,
      },
      story_narrative: {
        one_line_summary:
          'Colin Bradley used a five-year relationship to steal my identity, open businesses in my name, ' +
          'take out over $100,000 in loans without my consent, force the sale of my home and my ' +
          'bankruptcy, steal my possessions, and publicly defame me — leaving me financially destroyed ' +
          'and publicly branded as a criminal for crimes he committed.',
        body:
          'I met Colin Bradley online in 2014 while working at a car dealership in New South Wales. ' +
          'He arranged the purchase of vehicles through my dealership and began borrowing money on a ' +
          'regular basis — for rent, bills, and general living expenses — claiming his ex-partner had ' +
          'stolen $200,000 from him. I lent him approximately $10,000 over this period. I moved in with ' +
          'him in Queensland in the middle of 2014, leaving my position at the dealership. I supported ' +
          'us both financially while he stopped working and pursued car racing sponsorships.\n\n' +
          'In November 2014, he proposed to me. I paid for my own $8,000 engagement ring.\n\n' +
          'In 2015, he started a company called Big Rig Tyres, employing three mobile representatives ' +
          'and a promotional assistant. He arranged for solicitors to visit my workplace with ' +
          'documentation to take out a $60,000 loan against my NSW house — ostensibly to pay employees ' +
          'and fund his appearance at the Gold Coast 500 car race. He promised $3,500 monthly ' +
          'repayments, which he never made. My house was subsequently sold with all proceeds going ' +
          'to creditors. My two adult children had nowhere to live.\n\n' +
          'Big Rig Tyres went bankrupt without generating any revenue. In 2016, he opened a new company ' +
          'called Big Rig 4x4 — registered exclusively under my name. I was listed as director of a ' +
          'company I did not control. He employed mechanics whose wages, tax, and superannuation were ' +
          'never paid. My own wages and commissions were redirected to pay staff and bills. The business ' +
          'moved repeatedly due to unpaid rent: Rocklea → Ipswich → Slacks Creek. The final shop was ' +
          'broken into and a client\'s car was stolen. There was no insurance.\n\n' +
          'In 2017, without my knowledge or consent, Colin took out numerous online loans using my ' +
          'identity. None were repaid. In 2018, returning from a cruise we had just taken together, I ' +
          'was served with bankruptcy papers. The total unpaid debt exceeded $100,000. That same period, ' +
          'the client\'s daughter began a Facebook defamation campaign — messaging my family and friends, ' +
          'posting my photo on "Logan Crime and Watch" page calling me a thief. People came to my ' +
          'workplace to threaten me. I had no knowledge of any of these transactions.\n\n' +
          'In 2018, Colin claimed he had secured a construction job in Milton and was spending weekdays ' +
          'in Melbourne. It was a lie — he was with a woman named Sally. He moved out while I was at ' +
          'work, taking my jet ski, camper trailer, Triton ute, furniture, television, lounge, and ' +
          'refrigerator. He promised to continue paying rent. He made no payments.\n\n' +
          'In 2019, he called and texted regularly, promising investors for apartment blocks would ' +
          'repay everything. Then the messages turned threatening — warning that if I contacted any of ' +
          'his former partners, he would report me to the police. In December 2020, he messaged again ' +
          'promising a new car and the $80,000 he owed me. Nothing came. That was his last contact.\n\n' +
          'The whole time I was with him was part of his con. Colin Bradley would promise you the world ' +
          'and deliver nothing. He obtained money from me, friends, and ex-partners under the ' +
          'pretense of a multi-million dollar trust fund that does not exist.',
        evidence_inventory: [
          {
            label: 'Bank Statements — $10,000 Loans',
            description:
              'Bank statements showing transfers to Colin totaling approximately $10,000 in direct loans.',
            category: 'evidFinancial',
          },
          {
            label: '$60,000 House Loan Documentation',
            description:
              'Legal documents for $60,000 loan taken against NSW house, prepared by solicitors who ' +
              'visited my workplace.',
            category: 'evidFinancial',
          },
          {
            label: 'Bankruptcy Filing Papers',
            description:
              'Official bankruptcy documents showing over $100,000 in unpaid debts attributed to my ' +
              'identity as a result of Colin\'s fraudulent use of my name.',
            category: 'evidFinancial',
          },
          {
            label: 'Big Rig 4x4 Business Registration',
            description:
              'Business registration documents showing the company was registered in my name — a ' +
              'company I did not operate or control.',
            category: 'evidFinancial',
          },
          {
            label: 'Facebook Defamation Screenshots',
            description:
              'Screenshots of Facebook messages sent to my family and friends falsely calling me a ' +
              'thief, and the "Logan Crime and Watch" post featuring my photo.',
            category: 'evidSocial',
          },
        ],
        evidence_checklist: ['evidTexts', 'evidFinancial', 'evidSocial'],
      },
      visibility_settings: {
        tier: 'open',
        accused_aware: 'yes',
        current_contact: 'no',
      },
      consent: {
        real_name: true,
        contact_sharing: true,
        terms: true,
      },
      nominal_damages_claimed: 170000,
    },
    timelineEvents: [
      {
        event_type: 'first_contact',
        date_or_year: '2014',
        description:
          'Met Colin Bradley online while working at a car dealership in NSW. He arranged vehicle ' +
          'purchases through my dealership and began borrowing money for rent and bills, citing ' +
          'his ex-partner Jennifer having stolen $200,000 from him. Total borrowed approximately $10,000.',
        city: 'New South Wales, Australia',
      },
      {
        event_type: 'trust_built',
        date_or_year: 'Mid-2014',
        description:
          'Moved in with Colin in Queensland, leaving my NSW dealership employment. Began financially ' +
          'supporting both of us. Colin stopped working as a building labourer and spent his time ' +
          'pursuing car racing sponsorships.',
        city: 'Queensland, Australia',
      },
      {
        event_type: 'the_act',
        date_or_year: 'November 2014',
        description:
          'Colin proposed marriage. I paid for my own $8,000 engagement ring.',
        city: 'Queensland, Australia',
      },
      {
        event_type: 'the_act',
        date_or_year: '2015',
        description:
          'Colin started Big Rig Tyres, employing four people as representatives. Solicitors visited ' +
          'my workplace and had me sign documents for a $60,000 loan against my NSW house — to pay ' +
          'employees and fund Colin\'s appearance at the Gold Coast 500. He promised $3,500 monthly ' +
          'repayments. No payments were ever made. My house was sold, all proceeds going to creditors. ' +
          'My two adult children had nowhere to live.',
        city: 'Queensland, Australia',
      },
      {
        event_type: 'escalation',
        date_or_year: '2016',
        description:
          'Big Rig Tyres went bankrupt without generating revenue. Colin opened Big Rig 4x4, registered ' +
          'exclusively in my name. I was listed as director of a company I did not control. He employed ' +
          'mechanics whose wages, tax, and superannuation were never paid. Business operated from ' +
          'Rocklea, then moved to Ipswich due to unpaid rent.',
        city: 'Rocklea / Ipswich, Queensland, Australia',
      },
      {
        event_type: 'escalation',
        date_or_year: '2016–2017',
        description:
          'Big Rig 4x4 moved again to Slacks Creek due to further unpaid rent. My own wages and ' +
          'commissions were redirected to pay staff and bills. The final shop location was broken into ' +
          'and a client\'s car was stolen. No insurance was held on the premises.',
        city: 'Slacks Creek, Queensland, Australia',
      },
      {
        event_type: 'red_flag',
        date_or_year: '2017',
        description:
          'Without my knowledge or consent, Colin took out numerous online loans using my name and ' +
          'identity. None of these loans were repaid to lenders.',
        city: 'Queensland, Australia',
      },
      {
        event_type: 'discovery',
        date_or_year: 'April 2018',
        description:
          'Returning from a cruise together, I was served with bankruptcy papers. Total unpaid debt ' +
          'exceeded $100,000 — entirely debts Colin had created in my name. A client\'s daughter ' +
          'simultaneously launched a Facebook defamation campaign: messaging my family and friends, ' +
          'posting my photo on "Logan Crime and Watch" claiming I defrauded multiple people. People ' +
          'came to my workplace to threaten me. I had no knowledge of any of these transactions.',
        city: 'Queensland, Australia',
      },
      {
        event_type: 'aftermath',
        date_or_year: '2018',
        description:
          'Colin claimed employment in Milton to conceal his relationship with a woman named Sally. ' +
          'He moved out while I was at work, taking my jet ski, camper trailer, Triton ute, furniture, ' +
          'bed, television, lounge, and refrigerator. He promised to keep paying rent. No payments ' +
          'were ever made.',
        city: 'Queensland, Australia',
      },
      {
        event_type: 'aftermath',
        date_or_year: '2019',
        description:
          'Colin called and texted regularly claiming he had investors for apartment blocks who would ' +
          'repay all debts. He then sent threatening messages warning that if I contacted any of his ' +
          'former partners or associates, he would report me to the police.',
        city: 'Queensland, Australia',
      },
      {
        event_type: 'aftermath',
        date_or_year: 'December 2020',
        description:
          'Colin sent messages promising a new car and the $80,000 he owed me. No payment was made. ' +
          'This was the last known communication.',
        city: 'Queensland, Australia (remote)',
      },
    ],
    witnesses: [
      {
        full_name: 'Lorelle\'s adult children (2, names withheld)',
        witness_type: 'character_witness',
        contact_info: null,
        details: {
          can_verify:
            'Were displaced when the NSW house was sold due to the unpaid $60,000 loan. Can testify ' +
            'to the family impact.',
        },
      },
      {
        full_name: 'Big Rig 4x4 staff members (multiple, names withheld)',
        witness_type: 'eyewitness',
        contact_info: null,
        details: {
          can_verify:
            'Employees whose wages, tax, and superannuation were not paid. Can confirm Colin\'s ' +
            'operational control of the business while it was registered in Lorelle\'s name.',
        },
      },
      {
        full_name: 'Stolen vehicle client (name withheld)',
        witness_type: 'eyewitness',
        contact_info: null,
        details: {
          can_verify:
            'Client whose car was stolen from the uninsured Big Rig 4x4 premises.',
        },
      },
      {
        full_name: 'Kelly (former partner, later wife of Colin Bradley)',
        witness_type: 'character_witness',
        contact_info: 'kellycai600@gmail.com',
        details: {
          can_verify:
            'Can confirm the same pattern — companies in partner\'s name, European family trust claims, ' +
            'systematic financial exploitation. Also a plaintiff in this case.',
        },
      },
    ],
    financialImpact: {
      direct_payments: 10000,  // $10K direct loans
      lost_wages: 0,           // GAP — wages redirected to business but no specific total
      property_loss: 60000,    // $60K loan against house (house also sold, equity unknown)
      legal_fees: 0,           // GAP
      medical_costs: 0,        // GAP
      credit_damage: 100000,   // $100K+ bankruptcy amount
      other_amount: 8000,      // Engagement ring paid by plaintiff
      other_description:
        '$8,000 engagement ring paid by plaintiff at Colin\'s November 2014 proposal. ' +
        'Stolen property (jet ski, camper trailer, Triton ute, furniture, electronics) — ' +
        'value not confirmed in testimony.',
      total_lost: 178000,
    },
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SEED FUNCTION
// ─────────────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('=== CPR Seed: Colin James Bradley Case ===\n')

  // ── 1. Create defendant (or reuse existing) ──────────────────────────────
  console.log('1. Checking for existing defendant record...')
  const { data: existingDef } = await supabase
    .from('defendants')
    .select('id, full_name')
    .ilike('full_name', 'Colin James Bradley')
    .maybeSingle()

  let defendantId: string

  if (existingDef) {
    defendantId = existingDef.id
    console.log(`   ✓ Found existing defendant: ${existingDef.full_name} (${defendantId})`)
  } else {
    console.log('   Creating new defendant...')
    const { data: newDef, error: defError } = await supabase
      .from('defendants')
      .insert(DEFENDANT)
      .select('id')
      .single()

    if (defError) {
      console.error('   ✗ Failed to create defendant:', defError.message)
      process.exit(1)
    }
    defendantId = newDef.id
    console.log(`   ✓ Created defendant: ${DEFENDANT.full_name} (${defendantId})`)
  }

  // ── 2. Create plaintiff accounts ─────────────────────────────────────────
  const userIds: Record<string, string> = {}

  for (const plaintiff of PLAINTIFFS) {
    console.log(`\n2. Processing plaintiff: ${plaintiff.full_name} <${plaintiff.email}>`)

    // Check if user already exists
    const { data: authList } = await supabase.auth.admin.listUsers()
    const existing = authList?.users?.find((u) => u.email === plaintiff.email)

    let userId: string

    if (existing) {
      userId = existing.id
      console.log(`   ✓ Auth user already exists (${userId})`)
    } else {
      const { data: newUser, error: authError } = await supabase.auth.admin.createUser({
        email: plaintiff.email,
        password: plaintiff.password,
        email_confirm: true,
        user_metadata: { full_name: plaintiff.full_name },
      })

      if (authError) {
        console.error(`   ✗ Failed to create auth user:`, authError.message)
        continue
      }
      userId = newUser.user.id
      console.log(`   ✓ Auth user created (${userId})`)
    }

    userIds[plaintiff.email] = userId

    // Upsert profiles (role='user' is the safe default for the legacy role column;
    // actual RBAC is handled by user_roles below)
    const { error: profError } = await supabase.from('profiles').upsert(
      {
        id: userId,
        email: plaintiff.email,
        full_name: plaintiff.full_name,
        role: 'user',
      },
      { onConflict: 'id' }
    )
    if (profError) {
      console.warn(`   ⚠ profiles upsert warning: ${profError.message}`)
    } else {
      console.log(`   ✓ profiles upserted`)
    }

    // Upsert user_profiles
    const { error: upError } = await supabase.from('user_profiles').upsert(
      { id: userId, display_name: plaintiff.display_name },
      { onConflict: 'id' }
    )
    if (upError) {
      console.warn(`   ⚠ user_profiles upsert warning: ${upError.message}`)
    } else {
      console.log(`   ✓ user_profiles upserted`)
    }

    // Assign plaintiff role
    const { error: roleError } = await supabase.from('user_roles').upsert(
      { user_id: userId, role_id: 'plaintiff' },
      { onConflict: 'user_id,role_id' }
    )
    if (roleError) {
      console.warn(`   ⚠ user_roles upsert warning: ${roleError.message}`)
    } else {
      console.log(`   ✓ plaintiff role assigned`)
    }
  }

  // ── 3. Create cases ───────────────────────────────────────────────────────
  const mattId = userIds['funinthesundocs@gmail.com']
  const kellyId = userIds['kellycai600@gmail.com']
  const lorelleId = userIds['slorelle02@gmail.com']

  const caseDataFns = [
    { fn: getMattCase, userId: mattId, name: 'Matt Campbell' },
    { fn: getKellyCase, userId: kellyId, name: 'Kelly Smith' },
    { fn: getLorellCase, userId: lorelleId, name: 'Lorelle Smith' },
  ]

  for (const { fn, userId, name } of caseDataFns) {
    if (!userId) {
      console.warn(`\n⚠ Skipping case for ${name} — no userId (user creation may have failed)`)
      continue
    }

    console.log(`\n3. Creating case for ${name}...`)
    const caseData = fn(defendantId, userId)

    // Check for existing case
    const { data: existingCase } = await supabase
      .from('cases')
      .select('id, case_number')
      .eq('plaintiff_id', userId)
      .eq('defendant_id', defendantId)
      .maybeSingle()

    if (existingCase) {
      console.log(`   ✓ Case already exists: #${existingCase.case_number} (${existingCase.id}) — skipping`)
      continue
    }

    // Insert case record
    const { data: newCase, error: caseError } = await supabase
      .from('cases')
      .insert(caseData.caseRecord)
      .select('id, case_number')
      .single()

    if (caseError) {
      console.error(`   ✗ Failed to create case:`, caseError.message)
      continue
    }
    console.log(`   ✓ Case created: #${newCase.case_number} (${newCase.id})`)

    // Insert timeline events
    for (const event of caseData.timelineEvents) {
      const { error } = await supabase.from('timeline_events').insert({
        ...event,
        case_id: newCase.id,
        submitted_by: userId,
      })
      if (error) console.warn(`   ⚠ Timeline event insert warning: ${error.message}`)
    }
    console.log(`   ✓ ${caseData.timelineEvents.length} timeline events inserted`)

    // Insert witnesses
    for (const witness of caseData.witnesses) {
      const { error } = await supabase.from('witnesses').insert({
        ...witness,
        case_id: newCase.id,
      })
      if (error) console.warn(`   ⚠ Witness insert warning: ${error.message}`)
    }
    console.log(`   ✓ ${caseData.witnesses.length} witnesses inserted`)

    // Insert financial impact
    const { error: finError } = await supabase.from('financial_impacts').insert({
      ...caseData.financialImpact,
      case_id: newCase.id,
    })
    if (finError) {
      console.warn(`   ⚠ Financial impact insert warning: ${finError.message}`)
    } else {
      console.log(`   ✓ Financial impact inserted (total: $${caseData.financialImpact.total_lost.toLocaleString()} AUD)`)
    }
  }

  console.log('\n=== Seed Complete ===')
  console.log('\nSummary:')
  console.log(`  Defendant:  Colin James Bradley (${defendantId})`)
  console.log(`  Matt:       ${userIds['funinthesundocs@gmail.com'] || 'FAILED'}`)
  console.log(`  Kelly:      ${userIds['kellycai600@gmail.com'] || 'FAILED'}`)
  console.log(`  Lorelle:    ${userIds['slorelle02@gmail.com'] || 'FAILED'}`)
  console.log('\nAll 3 users can log in with password: Changeme123!')
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
