# CPR Full Spec — AI-Optimized for Antigravity
**Status**: READY FOR PHASED BUILD | Follow 4-phase instructions below | Updated: Feb 11, 2026

---

## 🎯 BUILD INSTRUCTIONS

**You are building**: CPR: Court of Public Record — a social accountability platform where plaintiffs file cases against defendants. When 2+ independent plaintiffs name the same person (convergence), the public investigates, votes, and delivers verdicts. All records are permanent, searchable, and SEO-indexed.

**Tech Stack**: Next.js 16 (App Router, ISR, Server Components) + Supabase (PostgreSQL, Auth, Storage, Realtime, Edge Functions)

**Scale**: Millions of users, mobile-first PWA, 7 languages

**Prototype Example**: Colin James Bradley — 10+ plaintiffs, 5 countries

---

## 📋 HOW TO USE THIS SPEC

### Setup (One Time - 5min)
1. Open Antigravity.ai → New Project: "CPR Court"
2. Upload this PDF
3. Connect your Supabase project (Settings → API → Project URL)
4. Ready to paste Phase 1 prompt below

### Build Process (4 Phases - 90min total)
- **Phase 1**: Database schema (42 tables) — 15min
- **Phase 2**: Core pages (defendant page + case form) — 20min  
- **Phase 3**: Voting + realtime messaging — 20min
- **Phase 4**: Safety systems + internationalization — 15min

**After each phase**: Check preview link, test key features, then proceed to next phase.

---

## 🚀 PHASE 1: DATABASE SCHEMA (15min)

### Paste This Into Antigravity:
```
You are a senior Next.js 16 + Supabase architect building CPR: Court of Public Record.

PHASE 1: Generate Supabase Database Schema

TASK:
1. Parse the attached CPR spec PDF
2. Generate EXACT 42-table schema.sql matching Layers A-K below
3. Add all indexes from Index Strategy section
4. Add RLS policies:
   - Public: Read defendants, cases (non-draft only)
   - Authenticated: Full access to own cases, read-only others
   - Admin: Full access all tables
5. Create Supabase migrations folder structure

STUBS FOR OPEN DECISIONS:
- Convergence matching: Exact name match (case-insensitive)
- Case numbering: C-{first 8 chars of UUID}
- ISR revalidation: 30 seconds

OUTPUT:
- schema.sql file with all 42 tables
- migration files (numbered: 001_initial_schema.sql)
- ERD diagram preview
- Supabase deploy preview link

STACK: PostgreSQL via Supabase
GOAL: Runnable via `supabase db push`

Reference the complete schema layers below.
```

### Check Phase 1 Success:
- [ ] 42 tables created?
- [ ] All indexes present?
- [ ] Deploy link works? (Test: `SELECT * FROM defendants LIMIT 1;`)
- [ ] No SQL errors?

**If broken**: Reply "Fix schema: Match spec Layer X table Y exactly"

**When done**: Share schema.sql file + deploy link with project owner

---

## 🗄️ COMPLETE SCHEMA (42 Tables in 11 Layers)

### Layer A: Core Case System (11 tables)

#### defendants
```sql
CREATE TABLE defendants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text,
  middle_name text,
  last_name text,
  full_name text NOT NULL,
  aliases text[],
  photo_url text,
  location text,
  date_of_birth text,
  phone text,
  address text,
  business_names text[],
  social_profiles jsonb,
  status text DEFAULT 'active',
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);
```

#### cases
```sql
CREATE TABLE cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number text UNIQUE NOT NULL,
  defendant_id uuid REFERENCES defendants(id) NOT NULL,
  plaintiff_id uuid REFERENCES auth.users(id) NOT NULL,
  case_types text[],
  status text NOT NULL,
  original_language text NOT NULL,
  current_step int DEFAULT 1,
  relationship_narrative jsonb,
  promise_narrative jsonb,
  betrayal_narrative jsonb,
  personal_impact jsonb,
  legal_actions jsonb,
  story_narrative jsonb,
  visibility_settings jsonb,
  consent jsonb,
  nominal_damages_claimed numeric,
  is_locked boolean DEFAULT false,
  is_archived boolean DEFAULT false,
  locked_by uuid REFERENCES auth.users(id),
  voting_deadline timestamptz,
  verdict_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### case_drafts
```sql
CREATE TABLE case_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  case_id uuid REFERENCES cases(id),
  defendant_id uuid REFERENCES defendants(id),
  role text NOT NULL,
  current_step int DEFAULT 1,
  form_data jsonb NOT NULL,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, case_id, role)
);
```

#### financial_impacts
```sql
CREATE TABLE financial_impacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES cases(id) NOT NULL UNIQUE,
  direct_payments numeric,
  lost_wages numeric,
  property_loss numeric,
  legal_fees numeric,
  medical_costs numeric,
  credit_damage numeric,
  other_amount numeric,
  other_description text,
  total_lost numeric NOT NULL,
  recovery_status text,
  amount_recovered numeric,
  created_at timestamptz DEFAULT now()
);
```

#### timeline_events
```sql
CREATE TABLE timeline_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES cases(id) NOT NULL,
  submitted_by uuid REFERENCES auth.users(id) NOT NULL,
  event_type text NOT NULL,
  date_or_year text NOT NULL,
  description text NOT NULL,
  country text,
  city text,
  latitude float,
  longitude float,
  witnesses_present text[],
  evidence_refs jsonb,
  original_language text NOT NULL,
  sort_order int,
  is_immutable boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
```

#### evidence
```sql
CREATE TABLE evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES cases(id) NOT NULL,
  submitted_by uuid REFERENCES auth.users(id) NOT NULL,
  title text NOT NULL,
  description text,
  category text NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL,
  file_hash text NOT NULL,
  is_verified boolean DEFAULT false,
  is_immutable boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
```

#### witnesses
```sql
CREATE TABLE witnesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES cases(id) NOT NULL,
  witness_type text NOT NULL,
  full_name text NOT NULL,
  contact_info text,
  details jsonb,
  created_at timestamptz DEFAULT now()
);
```

#### defendant_responses
```sql
CREATE TABLE defendant_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES cases(id) NOT NULL,
  defendant_user_id uuid REFERENCES auth.users(id) NOT NULL,
  subject_heading text NOT NULL,
  body_html text NOT NULL,
  original_language text NOT NULL,
  sort_order int,
  created_at timestamptz DEFAULT now()
);
```

#### case_versions
```sql
CREATE TABLE case_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES cases(id) NOT NULL,
  version_number int NOT NULL,
  edited_by uuid REFERENCES auth.users(id) NOT NULL,
  changed_fields text[],
  previous_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);
```

#### case_roles
```sql
CREATE TABLE case_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES cases(id) NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  role text NOT NULL,
  side text,
  motivation text,
  abilities text[],
  status text DEFAULT 'pending',
  appointed_by uuid REFERENCES auth.users(id),
  assigned_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### case_followers
```sql
CREATE TABLE case_followers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES cases(id) NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  notify_email boolean DEFAULT true,
  notify_in_app boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(case_id, user_id)
);
```

### Layer B: Voting & Verdicts (4 tables)

#### votes
```sql
CREATE TABLE votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES cases(id) NOT NULL,
  voter_id uuid REFERENCES auth.users(id) NOT NULL,
  guilt_score int NOT NULL CHECK (guilt_score BETWEEN 1 AND 10),
  nominal_approved boolean DEFAULT false,
  punitive_amount numeric,
  justification text,
  voted_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(case_id, voter_id)
);
```

#### verdict_results
```sql
CREATE TABLE verdict_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES cases(id) NOT NULL UNIQUE,
  total_votes int NOT NULL,
  average_guilt_score numeric NOT NULL,
  verdict text NOT NULL,
  nominal_approved_pct numeric,
  nominal_amount numeric,
  median_punitive numeric,
  total_restitution numeric,
  computed_at timestamptz DEFAULT now()
);
```

#### restitution_orders
```sql
CREATE TABLE restitution_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES cases(id) NOT NULL,
  defendant_user_id uuid REFERENCES auth.users(id) NOT NULL,
  plaintiff_user_id uuid REFERENCES auth.users(id) NOT NULL,
  nominal_amount numeric NOT NULL,
  punitive_amount numeric,
  total_amount numeric NOT NULL,
  deadline timestamptz NOT NULL,
  status text DEFAULT 'outstanding',
  created_at timestamptz DEFAULT now()
);
```

#### payments
```sql
CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES restitution_orders(id) NOT NULL,
  amount numeric NOT NULL,
  stripe_charge_id text,
  status text NOT NULL,
  paid_at timestamptz DEFAULT now()
);
```

### Layer C: Social (5 tables)

#### user_profiles
```sql
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  display_name text NOT NULL,
  tagline text,
  avatar_url text,
  cover_photo_url text,
  bio text NOT NULL,
  language text DEFAULT 'en',
  is_verified boolean DEFAULT false,
  profile_completion int DEFAULT 0,
  trust_score numeric DEFAULT 0,
  follower_count int DEFAULT 0,
  following_count int DEFAULT 0,
  case_count int DEFAULT 0,
  is_comment_banned boolean DEFAULT false,
  last_active_at timestamptz DEFAULT now(),
  joined_at timestamptz DEFAULT now()
);
```

#### user_follows
```sql
CREATE TABLE user_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid REFERENCES auth.users(id) NOT NULL,
  following_id uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id)
);
```

#### friendships
```sql
CREATE TABLE friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid REFERENCES auth.users(id) NOT NULL,
  addressee_id uuid REFERENCES auth.users(id) NOT NULL,
  status text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(requester_id, addressee_id)
);
```

#### posts
```sql
CREATE TABLE posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES auth.users(id) NOT NULL,
  title text NOT NULL,
  body_html text NOT NULL,
  original_language text NOT NULL,
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### post_comments
```sql
CREATE TABLE post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) NOT NULL,
  author_id uuid REFERENCES auth.users(id) NOT NULL,
  parent_id uuid REFERENCES post_comments(id),
  body text NOT NULL,
  original_language text NOT NULL,
  upvote_count int DEFAULT 0,
  downvote_count int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
```

### Layer D: Case Comments (2 tables)

#### comments
```sql
CREATE TABLE comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  commentable_type text NOT NULL,
  commentable_id uuid NOT NULL,
  author_id uuid REFERENCES auth.users(id) NOT NULL,
  parent_id uuid REFERENCES comments(id),
  body text NOT NULL,
  original_language text NOT NULL,
  upvote_count int DEFAULT 0,
  downvote_count int DEFAULT 0,
  is_flagged boolean DEFAULT false,
  flag_count int DEFAULT 0,
  is_hidden boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
```

#### comment_votes
```sql
CREATE TABLE comment_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid REFERENCES comments(id) NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  vote_type text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(comment_id, user_id)
);
```

### Layer E: Messaging (3 tables)

#### conversations
```sql
CREATE TABLE conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  title text,
  created_at timestamptz DEFAULT now(),
  last_message_at timestamptz DEFAULT now()
);
```

#### conversation_participants
```sql
CREATE TABLE conversation_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  joined_at timestamptz DEFAULT now(),
  last_read_at timestamptz,
  UNIQUE(conversation_id, user_id)
);
```

#### messages
```sql
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) NOT NULL,
  sender_id uuid REFERENCES auth.users(id) NOT NULL,
  body text NOT NULL,
  original_language text NOT NULL,
  attachment_url text,
  attachment_type text,
  created_at timestamptz DEFAULT now()
);
```

### Layer F: Notifications (1 table)

#### notifications
```sql
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  type text NOT NULL,
  case_id uuid REFERENCES cases(id),
  title text NOT NULL,
  body text NOT NULL,
  action_url text,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);
```

### Layer G: Caching & Admin (2 tables)

#### defendant_page_cache
```sql
CREATE TABLE defendant_page_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  defendant_id uuid REFERENCES defendants(id) NOT NULL UNIQUE,
  page_data jsonb NOT NULL,
  computed_at timestamptz DEFAULT now()
);
```

#### defendant_timeline_visibility
```sql
CREATE TABLE defendant_timeline_visibility (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  defendant_id uuid REFERENCES defendants(id) NOT NULL,
  timeline_event_id uuid REFERENCES timeline_events(id) NOT NULL,
  is_visible boolean DEFAULT true,
  toggled_by uuid REFERENCES auth.users(id),
  UNIQUE(defendant_id, timeline_event_id)
);
```

### Layer H: Achievements (2 tables)

#### achievements
```sql
CREATE TABLE achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  icon_url text,
  category text NOT NULL,
  points int DEFAULT 0
);
```

#### user_achievements
```sql
CREATE TABLE user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  achievement_id uuid REFERENCES achievements(id) NOT NULL,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);
```

### Layer I: Role Submissions (4 tables)

#### witness_submissions
```sql
CREATE TABLE witness_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES cases(id) NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  connection_to_case text NOT NULL,
  events_witnessed jsonb,
  timeline_observations jsonb,
  evidence_urls text[],
  visibility_preferences jsonb,
  original_language text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);
```

#### expert_submissions
```sql
CREATE TABLE expert_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES cases(id) NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  credentials jsonb NOT NULL,
  field_of_expertise text NOT NULL,
  methodology text NOT NULL,
  professional_statement text NOT NULL,
  conflict_disclosure text,
  findings jsonb,
  financial_assessment jsonb,
  supporting_docs text[],
  original_language text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);
```

#### investigator_submissions
```sql
CREATE TABLE investigator_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES cases(id) NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  credentials jsonb NOT NULL,
  methodology text NOT NULL,
  investigation_report text NOT NULL,
  findings jsonb,
  financial_evidence jsonb,
  connected_cases jsonb,
  original_language text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);
```

#### law_enforcement_submissions
```sql
CREATE TABLE law_enforcement_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES cases(id) NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  agency_badge jsonb NOT NULL,
  official_records jsonb,
  actions_taken text NOT NULL,
  statement text NOT NULL,
  evidence_provided text[],
  original_language text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);
```

### Layer J: Internationalization (2 tables)

#### content_translations
```sql
CREATE TABLE content_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL,
  content_id uuid NOT NULL,
  field_name text NOT NULL,
  source_language text NOT NULL,
  target_language text NOT NULL,
  translated_text text NOT NULL,
  is_stale boolean DEFAULT false,
  translated_at timestamptz DEFAULT now(),
  UNIQUE(content_type, content_id, field_name, target_language)
);
```

#### translation_queue
```sql
CREATE TABLE translation_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL,
  content_id uuid NOT NULL,
  field_name text NOT NULL,
  source_language text NOT NULL,
  source_text text NOT NULL,
  priority text DEFAULT 'normal',
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);
```

### Layer K: Safety System (2 tables)

#### safety_switches
```sql
CREATE TABLE safety_switches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  case_id uuid REFERENCES cases(id) NOT NULL,
  is_active boolean DEFAULT true,
  check_in_frequency_hours int NOT NULL,
  max_missed_checkins int DEFAULT 3,
  missed_count int DEFAULT 0,
  last_checkin_at timestamptz DEFAULT now(),
  next_checkin_due timestamptz NOT NULL,
  triggered_at timestamptz,
  created_at timestamptz DEFAULT now()
);
```

#### emergency_contacts
```sql
CREATE TABLE emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  full_name text NOT NULL,
  relationship text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  created_at timestamptz DEFAULT now()
);
```

---

## 📊 INDEX STRATEGY (Phase 1 Must Include)

```sql
-- Defendant search
CREATE INDEX idx_def_name_trgm ON defendants USING gin(full_name gin_trgm_ops);
CREATE INDEX idx_def_aliases ON defendants USING gin(aliases);
CREATE INDEX idx_def_slug ON defendants (slug);

-- Case filtering
CREATE INDEX idx_cases_defendant ON cases (defendant_id);
CREATE INDEX idx_cases_plaintiff ON cases (plaintiff_id);
CREATE INDEX idx_cases_status ON cases (status) WHERE is_archived = false;
CREATE INDEX idx_cases_types ON cases USING gin(case_types);
CREATE INDEX idx_cases_created ON cases (created_at DESC);

-- Financial
CREATE INDEX idx_financial_case ON financial_impacts (case_id);
CREATE INDEX idx_financial_total ON financial_impacts (total_lost DESC);

-- Timeline
CREATE INDEX idx_timeline_case ON timeline_events (case_id, sort_order);
CREATE INDEX idx_timeline_geo ON timeline_events (latitude, longitude) WHERE latitude IS NOT NULL;

-- Votes
CREATE INDEX idx_votes_case ON votes (case_id);
CREATE INDEX idx_votes_voter ON votes (voter_id);

-- Comments
CREATE INDEX idx_comments_target ON comments (commentable_type, commentable_id);
CREATE INDEX idx_comments_parent ON comments (parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX idx_comments_flagged ON comments (is_flagged) WHERE is_flagged = true;

-- Messages
CREATE INDEX idx_messages_convo ON messages (conversation_id, created_at DESC);
CREATE INDEX idx_convo_parts ON conversation_participants (user_id);

-- Social
CREATE INDEX idx_follows_follower ON user_follows (follower_id);
CREATE INDEX idx_follows_following ON user_follows (following_id);
CREATE INDEX idx_friends_user ON friendships (requester_id, status);

-- Notifications
CREATE INDEX idx_notif_user ON notifications (user_id, read_at) WHERE read_at IS NULL;

-- Translations
CREATE INDEX idx_trans_content ON content_translations (content_type, content_id, target_language);
CREATE INDEX idx_trans_queue ON translation_queue (status, priority);

-- Safety
CREATE INDEX idx_safety_active ON safety_switches (is_active, next_checkin_due) WHERE is_active = true;

-- Submissions
CREATE INDEX idx_witness_sub ON witness_submissions (case_id, status);
CREATE INDEX idx_expert_sub ON expert_submissions (case_id, status);
CREATE INDEX idx_investigator_sub ON investigator_submissions (case_id, status);
CREATE INDEX idx_law_sub ON law_enforcement_submissions (case_id, status);
```

---

## 🚀 PHASE 2: CORE PAGES (20min)

### Paste This After Phase 1 Success:
```
PHASE 2: Build Core Next.js Pages using Phase 1 database.

TASK:
1. Create /defendants/[slug] page:
   - Fetch from defendant_page_cache.page_data (jsonb)
   - Display: Photo, name, aliases, timeline, linked cases list
   - ISR: Revalidate every 30 seconds
   - Mobile-first Tailwind, shadcn/ui components
   
2. Create /cases/new form (12-step wizard):
   - Step 1: Search defendants (trigram fuzzy on full_name)
   - Steps 2-12: Save to case_drafts.form_data (jsonb) on each step
   - Auto-save every 30 seconds
   - Progress indicator
   - Submit button on Step 12
   
3. Create / (home):
   - Hero section
   - Trending defendants (top 10 by case count)
   - How it works (6-step explanation)
   - Live stats counter

4. Stub API routes:
   - /api/cases/draft (POST to case_drafts)
   - /api/defendants/search (GET with fuzzy match)
   - /api/cases/submit (POST to cases, trigger convergence check)

OUTPUT:
- Full Next.js app/ directory structure
- React Server Components where possible
- Tailwind + shadcn/ui styled
- Deploy preview link (Vercel/Netlify)

STACK: Next.js 16 App Router, React Server Components, Tailwind CSS
GOAL: Working defendant page + case submission form
```

### Check Phase 2 Success:
- [ ] Defendant page loads with cached data?
- [ ] Case form saves drafts as you progress?
- [ ] Search finds defendants (fuzzy match)?
- [ ] Mobile responsive?

**Share**: Deploy URL with test defendant page

---

## 🗳️ PHASE 3: VOTING & REALTIME (20min)

### Paste This After Phase 2 Success:
```
PHASE 3: Add voting system + Supabase Realtime.

TASK:
1. Create /cases/[case-number]/vote page:
   - 1-10 slider for guilt_score
   - Yes/No toggle for nominal_approved
   - Optional punitive_amount input (max 2x nominal)
   - Text field for justification
   - Submit → INSERT into votes table
   - Check UNIQUE(case_id, voter_id)
   
2. Verdict computation (Edge Function):
   - Trigger when: 400 votes OR voting_deadline reached
   - Calculate: AVG(guilt_score)
   - Verdict: ≥6 = "guilty", ≤5 = "innocent"
   - INSERT into verdict_results
   - Update cases.status to 'verdict_guilty' or 'verdict_innocent'
   
3. Supabase Realtime setup:
   - Subscribe to notifications table for current user
   - Subscribe to messages table for conversations
   - Display toast notification on new items
   - Badge count on header icon
   
4. Anti-gaming stubs:
   - CAPTCHA on vote submit (Turnstile)
   - Scroll tracking (engagement proof)
   - IP fingerprint storage

OUTPUT:
- Working voting page
- Real-time notifications
- Verdict auto-computation demo
- Updated deploy link

STACK: Supabase Edge Functions, Realtime subscriptions, Cloudflare Turnstile
GOAL: End-to-end vote → verdict flow
```

### Check Phase 3 Success:
- [ ] Vote form submits?
- [ ] Verdict computes at 400 votes?
- [ ] Notifications appear in realtime?
- [ ] CAPTCHA blocks rapid voting?

---

## 🛡️ PHASE 4: SAFETY & INTERNATIONALIZATION (15min)

### Paste This After Phase 3 Success:
```
PHASE 4: Add safety systems + multi-language support.

TASK:
1. Dead Man's Switch (/profile/safety):
   - Form: Check-in frequency (24h/72h/7d), max misses, emergency contacts
   - Save to safety_switches + emergency_contacts
   - Background job: Check next_checkin_due every hour
   - If missed_count >= max → Email emergency contacts + admin alert
   - Push notification: "Check in now" button (one-tap)
   
2. Evidence tamper-proofing:
   - File upload → Compute SHA-256 hash
   - Store in evidence.file_hash
   - Display hash on evidence page (QR code)
   - Verification: Re-hash on download, compare
   
3. Internationalization (next-intl):
   - 7 languages: en, th, ar, vi, zh, es, ja
   - Static UI: JSON translation files
   - User content: On write → Edge Function queues translation
   - Stub: Microsoft Translator API (free tier)
   - Display "View original" toggle
   - Language switcher in header (globe icon, stores in user_profiles.language)
   
4. PWA setup:
   - next-pwa configuration
   - Offline form save (service worker)
   - Install prompt
   - Push notification permission
   
5. PDF export (/cases/[id]/export):
   - Full case file with QR verification code
   - Evidence list with SHA-256 hashes
   - Timeline, financial impact, verdict details
   - Watermark: "Court of Public Record"

OUTPUT:
- Safety switch setup page
- Multi-language interface (at least English + one other)
- PWA installable
- PDF export working
- Final production-ready deploy link

STACK: next-intl, next-pwa, jsPDF, Microsoft Translator API
GOAL: Full safety + i18n implementation
```

### Check Phase 4 Success:
- [ ] Safety switch activates check-ins?
- [ ] Language switcher works?
- [ ] PWA installs on mobile?
- [ ] PDF exports with hashes?

---

## ✅ ALIGNMENT ANSWERS (Immutable Business Rules)

These decisions are FINAL. Do not deviate unless partner explicitly approves.

| Q | Question | Answer |
|---|----------|--------|
| Q1 | Data priority | Queryable fields fast, narrative bulk-loaded (jsonb) |
| Q2 | Scale | Millions of users, PostgreSQL with proper indexing |
| Q3 | Narrative search | Nice-to-have, not primary filter |
| Q4 | Form save | Auto-save + manual save to case_drafts |
| Q5 | Submission flow | Submit → admin review → live |
| Q6 | Editing | Editable with audit trail until verdict, then locked |
| Q7 | Consumers | Public: defendant pages. Auth: plaintiff pages + interactions |
| Q8 | Convergence | 2+ independent plaintiffs required |
| Q9 | Evidence | Supabase Storage + SHA-256 hash tamper-proof |
| Q10 | Lifecycle | draft → pending → admin_review → investigation → judgment → verdict → restitution |
| Q12 | Case structure | Separate cases per plaintiff, linked by defendant |
| Q13 | Defendant profile | Admin/AI curates from all plaintiff submissions |
| Q14 | Editability | Audit trail until verdict; super admin only after |
| Q15 | Defendant response | Rich-text posts, subject headings, defendant + super admin |
| V1 | Voting close | Whichever first: deadline OR 400 votes |
| V2 | Voting scale | 1-10, unweighted, hidden until verdict |
| V3 | Verdict line | ≥6 = guilty, ≤5 = innocent |
| V4 | Per-case | Each plaintiff case gets its own independent verdict |
| V5 | Vote changes | Yes, before close |
| V7 | Restitution | Nominal + Punitive (capped 2x) = max 3x |
| V8 | Anti-gaming | Email + phone + CAPTCHA + engagement proof + IP/device fingerprint |
| S1 | Trust Score | Activity + verdict accuracy. 0-100. No peer rating |
| S2 | Posts | Blog-style on profile, commentable |
| S4 | Network | Follow anyone + mutual friends for DMs |
| S5 | Messaging | 1-on-1, attachments, groups. Realtime. Friends-only (admin exempt) |
| S6 | Comments | Threaded + upvote/downvote |
| G1 | Storage | Separate buckets per content type |
| G2 | Moderation | Auto-hide after X flags → admin reviews |
| B1 | Tech | Next.js App Router |
| B2 | RLS | Direct reads + Edge Functions for writes |
| F2 | Registration | Email/password or social + forced name & bio |
| F5 | Search | Defendant-centric: name, type, status, location, date, financial |
| F7 | Access | Public: defendant pages + browse. Auth: everything else |
| X1 | Attorneys | Appointed by client. One per side. Same access as client |
| X2 | Jury | Most important user. Vote + comment + profile |
| X3 | Realtime | Messages + notifications via Supabase Realtime |
| L1 | View original | Toggle between translated and original text |
| P1 | Evidence hash | SHA-256 per file upload |
| P2 | Safety tiers | Open / Shielded / Protected / Proxy Filing |
| P3 | Dead Man's Switch | Push check-in system for plaintiffs/witnesses |
| P4 | PWA | Mobile-first with offline form save and push notifications |
| P5 | PDF Export | Full case file with QR verification code |

---

## 🔄 CASE LIFECYCLE (Status Flow)

```
User Flow:
Plaintiff starts form (draft)
    ↓
Submit
    ↓
2nd plaintiff matches? → pending_convergence
    ↓
Admin reviews → admin_review
    ↓
Approved → investigation (public case page live)
    ↓
Admin opens voting → judgment
    ↓
Voting closes (400 votes OR deadline)
    ↓
≥6 avg → verdict_guilty → restitution
≤5 avg → verdict_innocent → archived
    ↓
Payment period
    ↓
Paid → resolved
Unpaid past deadline → outstanding
    ↓
Locked + archived (admin can reactivate)
```

**Editability by Status:**
| Status | Editable? | By Whom? |
|--------|-----------|----------|
| draft | Fully | Plaintiff |
| pending_convergence | Fully | Plaintiff |
| admin_review | Yes | Plaintiff + Admin |
| investigation | Audit trail | Plaintiff + Participants |
| judgment | Evidence only | Participants |
| Post-verdict | No | Super Admin only |

---

## 🌍 INTERNATIONALIZATION DETAILS

### 7 Supported Languages:
- English (en) — Default
- Thai (th)
- Arabic (ar) — RTL layout
- Vietnamese (vi)
- Chinese (zh) — Mandarin
- Spanish (es)
- Japanese (ja)

### Implementation:
1. **Static UI**: next-intl with 7 JSON files (generated in IDE)
2. **User Content**: Translate on write (not on read)
   - Content submitted → stored in original language
   - Edge Function auto-translates to 6 other languages
   - Stored in content_translations table
   - Reader gets instant pre-computed translation
   - "View original" toggle always available
3. **Translation Service**:
   - Microsoft Translator free tier (2M chars/month)
   - If exhausted → LibreTranslate self-hosted ($5/mo unlimited)
4. **Quality Control**:
   - Users can flag bad translations
   - Admin reviews via translation_queue
   - Critical testimony manually verified

### URL Pattern:
```
/defendants/colin-james-bradley        ← English (default)
/th/defendants/colin-james-bradley     ← Thai
/ar/defendants/colin-james-bradley     ← Arabic (RTL)
/vi/defendants/colin-james-bradley     ← Vietnamese
/zh/defendants/colin-james-bradley     ← Chinese
/es/defendants/colin-james-bradley     ← Spanish
/ja/defendants/colin-james-bradley     ← Japanese
```

---

## 🛡️ SAFETY SYSTEM DETAILS

### Safety Tiers (Plaintiff/Witness Visibility):
| Tier | Description |
|------|-------------|
| Open | Full identity visible |
| Shielded | Display name only, no photo, restricted profile |
| Protected | Anonymous code name (Plaintiff A). Admin-only identity |
| Proxy | Filed through attorney/advocate. No direct platform interaction |

### Dead Man's Switch Flow:
1. Plaintiff/witness activates switch in profile settings
2. Sets check-in frequency (24h / 72h / 7 days)
3. Sets max missed check-ins before trigger (e.g., 3)
4. Enters emergency contacts (name, phone, email, relationship)
5. Receives push notification at each interval: "Check in now"
6. Taps "I'm safe" button → One tap, done
7. If missed → missed_count increments
8. If missed_count >= max → TRIGGER:
   - Emergency contacts notified (email + SMS)
   - Platform admin alerted
   - Community notification on case page
   - Alert badge on defendant page

### Evidence Tamper-Proofing:
1. File uploaded → SHA-256 hash computed → stored in evidence.file_hash
2. Timestamp recorded (created_at)
3. File stored in Supabase Storage (immutable URL)
4. Hash is immutable (is_immutable = true)
5. Any challenge → Re-compute hash → Match proves integrity
6. Admin can mark evidence as "verified" (is_verified = true)
7. PDF export includes hashes for legal use

---

## 📱 ROUTING & PAGES

### Public Routes (No Auth Required):
| Route | Content |
|-------|---------|
| / | Hero, trending defendants, featured cases, how it works, live stats |
| /defendants | Browse/search all defendants |
| /defendants/[slug] | THE defendant page (one per person, ISR cached) |
| /how-it-works | 6-step explanation of the process |
| /about | Platform mission and team |
| /legal | Terms of service, privacy policy |
| /contact | Contact form |

### Authenticated Routes (Login Required):
| Route | Content |
|-------|---------|
| /cases/[case-number] | Individual plaintiff case page |
| /profile | User's own profile (Dashboard, Posts, Achievements, Network) |
| /profile/[username] | Public user profile |
| /messages | Inbox + conversations (Supabase Realtime) |
| /notifications | Activity feed (Supabase Realtime) |
| /cases/new | New Case Form (12 steps) |
| /cases/[id]/join | Join Case wizard (3 steps for support roles) |
| /cases/[id]/vote | Voting page (1-10 guilt scale) |
| /settings | Account settings, language, safety switch |

### Admin Routes (Admin Role Required):
| Route | Content |
|-------|---------|
| /admin | Dashboard stats (cases, users, votes, verdicts) |
| /admin/cases | Case queue + approvals + convergence checks |
| /admin/convergence | Defendant identity matching interface |
| /admin/evidence | Searchable evidence database |
| /admin/timeline | Master timeline curation |
| /admin/users | User management + role assignments |
| /admin/moderation | Flagged content queue |
| /admin/translations | Translation review queue |
| /admin/archive | Archive/reactivate cases |
| /admin/activity | Audit log (all admin actions) |

---

## 🎯 TRUST SCORE CALCULATION

**Formula**: Trust Score = Activity (0-60) + Verdict Accuracy (0-40) = 0-100

### Activity Component (0-60):
- +2 per case participated in
- +1 per vote cast
- +1 per evidence submitted
- +3 per case reaching verdict
- +5 defendant paying restitution
- +2 per positively-voted comment
- Cap at 60 points

### Verdict Accuracy Component (0-40):
Per completed verdict:
- Within ±2 of final average → +4 points
- Within ±3 → +2 points
- Off by >3 → +0 points

Normalized to 0-40 scale. Minimum 10 verdicts required to compute.

---

## 🚨 MODERATION SYSTEM

### Auto-Moderation:
1. User flags content (comment, post, evidence)
2. flag_count increments
3. If flag_count >= threshold (e.g., 5) → auto-hide (is_hidden = true)
4. Item appears in /admin/moderation queue
5. Admin reviews: Approve (un-hide) OR Remove (delete)

### Defendant Comment Ban:
- If defendant violates comment rules repeatedly
- Admin toggles user_profiles.is_comment_banned = true
- Defendant enters read-only mode (can view, cannot post/comment)
- Does not affect defendant_responses on own cases
- Not a full ban (can still file own cases as plaintiff)

### Activity Log:
All admin actions logged to audit trail:
- Who: admin user ID
- What: Action taken (approved/rejected/banned/edited)
- When: Timestamp
- Where: Which case/user/content

---

## 📦 SUPABASE STORAGE BUCKETS

| Bucket | Max Size | Access Policy |
|--------|----------|---------------|
| avatars | 5 MB | Owner write, public read |
| cover-photos | 5 MB | Owner write, public read |
| defendant-photos | 5 MB | Plaintiff write, public read |
| evidence | 50 MB | Participants write, public read after verified |
| post-images | 10 MB | Author write, public read |
| message-attachments | 25 MB | Participants only (private) |

---

## ✅ ANTI-GAMING MEASURES

1. **Email verification** — Required before voting
2. **Phone verification** — 1 account per phone number
3. **CAPTCHA** — On vote submit (Cloudflare Turnstile)
4. **Engagement proof** — Scroll/click tracking (must spend 2min on case)
5. **IP fingerprinting** — Detect vote farms
6. **Device fingerprinting** — Track hardware signatures
7. **Email alias detection** — Block user+1@gmail.com patterns
8. **Vote pattern analysis** — Flag bulk identical votes
9. **Rate limiting** — Max 10 votes per hour per user
10. **Trust Score gating** — Low trust users flagged for review

---

## 🔍 SEARCH IMPLEMENTATION

Defendant-centric search with filters:

### Search Fields:
- **Name** — Trigram fuzzy match (finds "Mike" when searching "Michael")
- **Aliases** — GIN array search
- **Case types** — Multi-select filter (GIN array)
- **Case status** — Enum filter
- **Location** — Defendant location + timeline event locations
- **Date range** — Filed date range picker
- **Financial range** — Total damages slider

### Query Example:
```sql
SELECT d.* FROM defendants d
JOIN cases c ON c.defendant_id = d.id
WHERE 
  d.full_name % 'search term'  -- Trigram similarity
  AND c.case_types && ARRAY['fraud']  -- Array overlap
  AND c.status = 'investigation'
  AND c.created_at BETWEEN '2024-01-01' AND '2024-12-31'
ORDER BY similarity(d.full_name, 'search term') DESC
LIMIT 50;
```

---

## 📄 PDF CASE EXPORT FORMAT

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       CASE FILE — C-2847
       Court of Public Record
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DEFENDANT: Colin James Bradley
PLAINTIFF: [name or code name per safety tier]

FILED: January 15, 2026
STATUS: Verdict — Guilty (7.8/10)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TESTIMONY
[Full relationship/promise/betrayal narratives]

TIMELINE OF EVENTS
[Chronological list with locations, dates, witnesses]

FINANCIAL IMPACT
Total Claimed: $125,000
- Direct payments: $50,000
- Lost wages: $45,000
- Legal fees: $20,000
- Credit damage: $10,000

EVIDENCE
1. Email correspondence (SHA-256: a3f8b2...)
2. Bank statements (SHA-256: c7d1e4...)
3. Witness testimony recording (SHA-256: 9f2b8a...)

VERDICT DETAILS
Total Votes: 427
Average Guilt Score: 7.8/10
Verdict: GUILTY
Nominal Approved: 89%
Restitution Ordered: $312,500

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[QR Code]
Verify at: courtofpublicrecord.com/cases/C-2847

Generated: February 11, 2026
Watermark: Court of Public Record — Permanent Archive
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🎓 ROLE DEFINITIONS

11 roles in the system:

| Role | Description | Access Level |
|------|-------------|--------------|
| **plaintiff** | Files case, full edit rights pre-verdict | Own cases full, others read |
| **defendant** | Named in case, can post responses | Own responses, case read |
| **witness** | Observed events, submits testimony | Case read, own submission edit |
| **attorney** | Represents plaintiff or defendant | Client-level access (one per side) |
| **expert_witness** | Professional analysis (forensic, financial, etc.) | Case read, own submission edit |
| **investigator** | Third-party investigation | Case read, own submission edit |
| **jury_member** | Votes on case (most important role) | Case read, vote, comment |
| **law_enforcement** | Official reports, evidence custody | Case read, own submission edit |
| **admin** | Platform moderator | All access except super admin edits |
| **super_admin** | Full system access | Everything including post-verdict edits |
| **observer** | Follows case, no active participation | Read-only |

---

## 📊 QUERY OPTIMIZATION (Performance Targets)

### Page Load Targets:
| Page | Max Tables | Max Query Time | Target |
|------|-----------|----------------|--------|
| Defendant Page | 1 (cached) | <50ms | Sub-second load |
| Case Page | 5 | <200ms | Under 1 second |
| Browse Defendants | 1 | <100ms | Instant pagination |
| Voting Dashboard | 2 | <150ms | Smooth interaction |
| User Profile | 3 | <120ms | Fast social features |
| Search Results | 2 | <180ms | Real-time feel |

### Caching Strategy:
- **Defendant pages**: ISR 30s revalidation via defendant_page_cache.page_data (jsonb)
- **Case lists**: On-demand ISR, revalidate on case update
- **User profiles**: CDN cache 5min
- **Static content**: Permanent CDN cache

---

## 🎯 REMAINING PARTNER DECISIONS

**IMPORTANT**: These items need your input during or after build:

1. **Convergence fuzzy matching** — Exact name match OK, or want trigram similarity threshold?
2. **Case number format** — C-0001 sequential or C-{uuid} randomized?
3. **ISR revalidation trigger** — Webhook on case update, or time-based only?
4. **Achievement badges** — What specific achievements? (First vote, 10 verdicts, etc.)
5. **Legal framework** — Terms of service wording, liability disclaimers, DMCA process
6. **Admin onboarding** — How many initial admins? Training process?
7. **Launch strategy** — Private beta or public launch? How to seed first defendants?

---

## 🎬 SUCCESS METRICS

After 4 phases complete, you should have:

✅ **Phase 1**: 42-table database deployed to Supabase  
✅ **Phase 2**: Working defendant page + case submission form  
✅ **Phase 3**: End-to-end voting with real-time notifications  
✅ **Phase 4**: Multi-language support + safety systems active  

**Total Build Time**: ~90 minutes (excluding partner decisions)

**Final Output**: Production-ready MVP with Colin James Bradley demo case

---

## 📞 SUPPORT

**If Antigravity gets stuck**:
1. Copy the exact error message
2. Ask: "Fix this based on CPR spec: [paste error]"
3. Share output with project owner for escalation

**Common Issues**:
- "Too many tables" → Ask to focus on Layers A-C first (20 tables)
- "RLS errors" → Temporarily disable RLS, build pages, re-enable
- "Slow queries" → Check indexes were created from Index Strategy section

---

**Ready to build? Start with Phase 1 prompt above. Good luck! 🚀**