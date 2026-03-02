-- Inject timeline events for Matt Campbell case with coordinates
-- First, find the case ID (you may need to update the case identifier)

-- Option 1: If you know the case number, use it directly
-- Otherwise, replace 'MATT_CAMPBELL_CASE_NUMBER' with the actual case number

WITH target_case AS (
  SELECT id FROM cases
  WHERE case_number = 'MATT_CAMPBELL_CASE_NUMBER'
  LIMIT 1
)

INSERT INTO timeline_events (case_id, date_or_year, description, city, latitude, longitude, created_at, updated_at)
SELECT
  tc.id,
  year::text,
  event,
  city,
  lat::float,
  lng::float,
  now(),
  now()
FROM target_case tc,
(VALUES
  (1, 'First Meeting (beach club)', 'Da Nang, Vietnam', 16.0476743, 108.2496587),
  (2, 'Job Offer', 'Da Nang, Vietnam', 16.0502553, 108.2453282),
  (3, 'Work Begins', 'Da Nang, Vietnam', 16.0811604, 108.2470304),
  (4, 'Financial Support', 'Da Nang, Vietnam', 16.0257482, 108.2405562),
  (5, 'Sexual Crime Event (Airbnb)', 'Da Nang, Vietnam', 16.0811604, 108.2470304),
  (6, 'Documentation', 'Da Nang, Vietnam', 16.0544, 108.2022),
  (7, 'Confrontation (coffee shop)', 'Da Nang, Vietnam', 16.0544, 108.2022),
  (8, 'Disassociation', 'Da Nang, Vietnam', 16.0544, 108.2022)
) AS events(year, event, city, lat, lng);

-- Verify insertion
SELECT * FROM timeline_events
WHERE case_id = (SELECT id FROM cases WHERE case_number = 'MATT_CAMPBELL_CASE_NUMBER');
