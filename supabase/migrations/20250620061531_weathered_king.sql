/*
  # Seed Data for CoPilot Platform
  
  This migration adds realistic sample data that matches the admin dashboard UI exactly.
  All data is designed to showcase the platform's capabilities with real-world scenarios.
*/

-- Insert admin users
INSERT INTO public.users (auth_user_id, full_name, email, role) VALUES
  (gen_random_uuid(), 'Admin User', 'admin@copilot.com', 'admin'),
  (gen_random_uuid(), 'Program Coordinator', 'coordinator@copilot.com', 'coordinator');

-- Insert sample founders (these will be linked to auth users when they sign up)
INSERT INTO public.founders (id, full_name, email, startup_name, location_city, location_country, sector, stage, top_bottleneck, bottleneck_status, has_story, has_testimonial, website, revenue_last_12_months, team_size) VALUES
  (gen_random_uuid(), 'Amara Okafor', 'amara@payfast.ng', 'PayFast', 'Lagos', 'Nigeria', 'FinTech', 'Series A', 'International expansion strategy', 'Solved', true, true, 'payfast.ng', 850000, 12),
  (gen_random_uuid(), 'Kwame Asante', 'kwame@farmconnect.gh', 'FarmConnect', 'Accra', 'Ghana', 'AgriTech', 'Seed', 'Supply chain optimization', 'In Progress', false, true, 'farmconnect.gh', 320000, 8),
  (gen_random_uuid(), 'Fatima Hassan', 'fatima@meditrack.ke', 'MediTrack', 'Nairobi', 'Kenya', 'HealthTech', 'Pre-Seed', 'Product-market fit', 'Solved', true, false, 'meditrack.ke', 45000, 4),
  (gen_random_uuid(), 'Thabo Molefe', 'thabo@learnza.co.za', 'LearnZA', 'Cape Town', 'South Africa', 'EdTech', 'Seed', 'User acquisition', 'In Progress', false, false, 'learnza.co.za', 180000, 6);

-- Insert sample advisors (these will be linked to auth users when they sign up)
INSERT INTO public.advisors (id, full_name, email, linkedin_url, location_city, location_country, timezone, expertise_areas, status, notes, sessions_completed, founders_mentored, average_session_rating, average_likelihood_to_recommend, overall_score, badge_level) VALUES
  (gen_random_uuid(), 'Sarah Johnson', 'sarah@example.com', 'https://linkedin.com/in/sarahjohnson', 'London', 'United Kingdom', 'GMT', ARRAY['FinTech', 'Strategy', 'Fundraising'], 'Already matched', 'Excellent track record with African fintech startups', 15, 3, 4.8, 9.2, 92, 'Gold Ribbon'),
  (gen_random_uuid(), 'Michael Chen', 'michael@example.com', 'https://linkedin.com/in/michaelchen', 'San Francisco', 'United States', 'PST', ARRAY['Product', 'Growth', 'SaaS'], 'Already matched', 'Former VP Product at major tech company', 12, 2, 4.6, 8.8, 88, 'Silver Ribbon'),
  (gen_random_uuid(), 'Jennifer Liu', 'jennifer@example.com', 'https://linkedin.com/in/jenniferliu', 'Toronto', 'Canada', 'EST', ARRAY['AgriTech', 'Operations', 'Supply Chain'], 'Ready to be matched', 'Deep expertise in agricultural supply chains', 8, 1, 4.9, 9.5, 95, 'Platinum Ribbon'),
  (gen_random_uuid(), 'David Rodriguez', 'david@example.com', 'https://linkedin.com/in/davidrodriguez', 'Madrid', 'Spain', 'CET', ARRAY['HealthTech', 'Regulatory', 'Compliance'], 'Already matched', 'Former healthcare regulatory executive', 10, 2, 4.7, 9.0, 90, 'Gold Ribbon'),
  (gen_random_uuid(), 'Angela Wright', 'angela@example.com', 'https://linkedin.com/in/angelawright', 'Sydney', 'Australia', 'AEST', ARRAY['EdTech', 'Marketing', 'User Acquisition'], 'Ready to be matched', 'Marketing expert with education focus', 6, 1, 4.5, 8.5, 85, 'Silver Ribbon');

-- Create advisor-founder assignments
WITH founder_ids AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY full_name) as rn FROM public.founders
),
advisor_ids AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY full_name) as rn FROM public.advisors
)
INSERT INTO public.advisor_founder_assignments (founder_id, advisor_id, status)
SELECT f.id, a.id, 'active'
FROM founder_ids f
JOIN advisor_ids a ON f.rn <= a.rn
WHERE f.rn <= 4 AND a.rn <= 5;

-- Insert sample sessions
WITH founders AS (SELECT id, full_name FROM public.founders),
     advisors AS (SELECT id, full_name FROM public.advisors)
INSERT INTO public.sessions (founder_id, advisor_id, session_type, title, session_date, duration_minutes, status, notes, rating, advisor_rating, likelihood_to_recommend) 
SELECT 
  f.id, 
  a.id,
  'advisory',
  'Strategic Planning Session',
  CURRENT_DATE - INTERVAL '7 days' + (ROW_NUMBER() OVER ()) * INTERVAL '3 days',
  60,
  CASE WHEN RANDOM() > 0.3 THEN 'completed' ELSE 'scheduled' END,
  'Productive discussion on growth strategies',
  CASE WHEN RANDOM() > 0.3 THEN FLOOR(RANDOM() * 2 + 4)::integer ELSE NULL END,
  CASE WHEN RANDOM() > 0.3 THEN FLOOR(RANDOM() * 2 + 4)::integer ELSE NULL END,
  CASE WHEN RANDOM() > 0.3 THEN FLOOR(RANDOM() * 3 + 8)::integer ELSE NULL END
FROM founders f
CROSS JOIN advisors a
LIMIT 15;

-- Insert case studies
INSERT INTO public.case_studies (founder_id, title, status, featured, published_at)
SELECT 
  id,
  startup_name || ' Growth Story',
  CASE 
    WHEN RANDOM() > 0.7 THEN 'Ready'
    WHEN RANDOM() > 0.4 THEN 'In Progress'
    ELSE 'Draft'
  END,
  RANDOM() > 0.8,
  CASE WHEN RANDOM() > 0.7 THEN CURRENT_DATE - INTERVAL '30 days' ELSE NULL END
FROM public.founders;

-- Insert current metrics
INSERT INTO public.metrics (date, active_founders_count, active_advisors_count, sessions_this_month, case_studies_ready, total_sessions_completed)
VALUES (
  CURRENT_DATE,
  (SELECT COUNT(*) FROM public.founders),
  (SELECT COUNT(*) FROM public.advisors),
  (SELECT COUNT(*) FROM public.sessions WHERE DATE_TRUNC('month', session_date) = DATE_TRUNC('month', CURRENT_DATE)),
  (SELECT COUNT(*) FROM public.case_studies WHERE status = 'Ready'),
  (SELECT COUNT(*) FROM public.sessions WHERE status = 'completed')
);

-- Insert forms
INSERT INTO public.forms (name, form_type, icon, description, is_active) VALUES
  ('Post-Session Reflection', 'Post-Session Reflection', '📝', 'Founder reflection after advisory sessions', true),
  ('Advisor Feedback Form', 'Advisor Feedback', '⭐', 'Feedback form for advisors', true),
  ('Founder Application', 'Founder Application', '🚀', 'Application form for new founders', true),
  ('Advisor Application', 'Advisor Application', '👨‍🏫', 'Application form for new advisors', true);

-- Insert program timeline
INSERT INTO public.program_timeline (month_number, title, description, status, founders_involved, advisors_involved, start_date, end_date) VALUES
  (1, 'Onboarding & Matching', 'Initial founder onboarding and advisor matching process', 'completed', 15, 10, '2024-01-01', '2024-01-31'),
  (2, 'First Advisory Sessions', 'Kick-off sessions between matched founder-advisor pairs', 'active', 28, 19, '2024-02-01', '2024-02-29'),
  (3, 'Masterclasses Begin', 'Group masterclasses on key business topics', 'upcoming', 25, 18, '2024-03-01', '2024-03-31'),
  (4, 'Progress Reviews', 'Mid-program progress assessment and adjustments', 'planned', 20, 15, '2024-04-01', '2024-04-30'),
  (5, 'Case Study Collection', 'Documentation of success stories and learnings', 'planned', 18, 12, '2024-05-01', '2024-05-31'),
  (6, 'Final Reports & Graduation', 'Program completion and impact assessment', 'planned', 15, 10, '2024-06-01', '2024-06-30');

-- Insert calendars
INSERT INTO public.calendars (name, calendar_type, icon, is_active) VALUES
  ('Master Session Calendar', 'Master Session Calendar', '📅', true),
  ('Masterclass Schedule', 'Masterclass Schedule', '🎓', true);

-- Insert tools
INSERT INTO public.tools (name, tool_type, icon, status, description) VALUES
  ('Airtable Database', 'Database', '📊', 'active', 'Main database for tracking all program data'),
  ('Zoom Admin Panel', 'Video Conferencing', '💻', 'active', 'Video conferencing platform for sessions');

-- Insert to-dos
INSERT INTO public.to_dos (title, priority, due_date, status, linked_entity_type)
SELECT 
  CASE 
    WHEN RANDOM() > 0.7 THEN 'Review 3 new founder applications'
    WHEN RANDOM() > 0.4 THEN 'Schedule Q2 advisor onboarding'
    WHEN RANDOM() > 0.2 THEN 'Follow up on Session #47 outcomes'
    ELSE 'Prepare monthly KPI report'
  END,
  CASE 
    WHEN RANDOM() > 0.7 THEN 'high'
    WHEN RANDOM() > 0.3 THEN 'medium'
    ELSE 'low'
  END,
  CURRENT_DATE + (RANDOM() * 7)::integer,
  'pending',
  CASE 
    WHEN RANDOM() > 0.5 THEN 'founder'
    ELSE 'session'
  END
FROM generate_series(1, 4);

-- Insert advisor testimonials
INSERT INTO public.advisor_testimonials (advisor_id, founder_id, testimonial_text, is_featured)
SELECT 
  a.id,
  f.id,
  CASE 
    WHEN RANDOM() > 0.5 THEN 'Working with this advisor completely transformed our approach to international markets. Their insights were invaluable.'
    ELSE 'The strategic guidance we received helped us avoid costly mistakes and accelerate our growth by 6 months.'
  END,
  RANDOM() > 0.7
FROM public.advisors a
CROSS JOIN public.founders f
WHERE EXISTS (
  SELECT 1 FROM public.advisor_founder_assignments afa 
  WHERE afa.advisor_id = a.id AND afa.founder_id = f.id
)
LIMIT 8;

-- Insert founder goals
INSERT INTO public.founder_goals (founder_id, goal_title, goal_description, target_date, status, progress_percentage)
SELECT 
  id,
  CASE 
    WHEN RANDOM() > 0.7 THEN 'Increase monthly revenue by 50%'
    WHEN RANDOM() > 0.4 THEN 'Launch in 2 new markets'
    WHEN RANDOM() > 0.2 THEN 'Build strategic partnerships'
    ELSE 'Optimize conversion funnel'
  END,
  'Detailed goal description and success metrics',
  CURRENT_DATE + INTERVAL '90 days',
  'active',
  FLOOR(RANDOM() * 80 + 10)::integer
FROM public.founders;

-- Insert founder reflections
INSERT INTO public.founder_reflections (founder_id, reflection_type, title, content, shared_with_advisors, is_featured)
SELECT 
  id,
  CASE 
    WHEN RANDOM() > 0.6 THEN 'win'
    WHEN RANDOM() > 0.3 THEN 'challenge'
    ELSE 'reflection'
  END,
  CASE 
    WHEN RANDOM() > 0.5 THEN 'Major breakthrough in customer acquisition'
    ELSE 'Lessons learned from failed product launch'
  END,
  'Detailed reflection on recent experiences, challenges overcome, and insights gained during the advisory process.',
  true,
  RANDOM() > 0.8
FROM public.founders;

-- Insert advisor resources
INSERT INTO public.advisor_resources (advisor_id, title, description, resource_type, is_published, target_audience)
SELECT 
  id,
  CASE 
    WHEN RANDOM() > 0.7 THEN 'Market Entry Strategy Template'
    WHEN RANDOM() > 0.4 THEN 'Financial Planning Spreadsheet'
    WHEN RANDOM() > 0.2 THEN 'Customer Interview Guide'
    ELSE 'Pitch Deck Template'
  END,
  'Comprehensive resource to help founders with specific business challenges',
  CASE 
    WHEN RANDOM() > 0.6 THEN 'template'
    WHEN RANDOM() > 0.3 THEN 'document'
    ELSE 'tool'
  END,
  RANDOM() > 0.3,
  'all'
FROM public.advisors;

-- Insert session notes
INSERT INTO public.session_notes (session_id, notes_content, ai_summary, action_items, key_insights)
SELECT 
  id,
  'Detailed session notes covering discussion points, decisions made, and next steps identified.',
  'AI-generated summary highlighting key discussion points and outcomes.',
  '["Follow up on market research", "Schedule investor meeting", "Review financial projections"]'::jsonb,
  '["Market timing is crucial", "Focus on customer retention", "Consider strategic partnerships"]'::jsonb
FROM public.sessions
WHERE status = 'completed'
LIMIT 10;

-- Create functions for calculating metrics
CREATE OR REPLACE FUNCTION calculate_monthly_metrics_comparison()
RETURNS TABLE (
  current_month_founders bigint,
  previous_month_founders bigint,
  current_month_advisors bigint,
  previous_month_advisors bigint,
  current_month_sessions bigint,
  previous_month_sessions bigint,
  current_month_case_studies bigint,
  previous_month_case_studies bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.founders WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)) as current_month_founders,
    (SELECT COUNT(*) FROM public.founders WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')) as previous_month_founders,
    (SELECT COUNT(*) FROM public.advisors WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)) as current_month_advisors,
    (SELECT COUNT(*) FROM public.advisors WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')) as previous_month_advisors,
    (SELECT COUNT(*) FROM public.sessions WHERE DATE_TRUNC('month', session_date) = DATE_TRUNC('month', CURRENT_DATE)) as current_month_sessions,
    (SELECT COUNT(*) FROM public.sessions WHERE DATE_TRUNC('month', session_date) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')) as previous_month_sessions,
    (SELECT COUNT(*) FROM public.case_studies WHERE status = 'Ready' AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)) as current_month_case_studies,
    (SELECT COUNT(*) FROM public.case_studies WHERE status = 'Ready' AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')) as previous_month_case_studies;
END;
$$ LANGUAGE plpgsql;

-- Create function for advisor performance calculation
CREATE OR REPLACE FUNCTION calculate_advisor_performance(advisor_uuid uuid)
RETURNS TABLE (
  avg_rating numeric,
  avg_likelihood numeric,
  overall_score numeric,
  badge_level text
) AS $$
DECLARE
  avg_session_rating numeric;
  avg_likelihood_recommend numeric;
  calculated_score numeric;
  calculated_badge text;
BEGIN
  -- Calculate average session rating
  SELECT AVG(advisor_rating) INTO avg_session_rating
  FROM public.sessions 
  WHERE advisor_id = advisor_uuid AND advisor_rating IS NOT NULL;
  
  -- Calculate average likelihood to recommend
  SELECT AVG(likelihood_to_recommend) INTO avg_likelihood_recommend
  FROM public.sessions 
  WHERE advisor_id = advisor_uuid AND likelihood_to_recommend IS NOT NULL;
  
  -- Calculate overall score (weighted average)
  calculated_score := COALESCE(
    (COALESCE(avg_session_rating, 0) * 20 + COALESCE(avg_likelihood_recommend, 0) * 10) / 2, 
    0
  );
  
  -- Determine badge level
  calculated_badge := CASE 
    WHEN calculated_score >= 95 THEN 'Platinum Ribbon'
    WHEN calculated_score >= 90 THEN 'Gold Ribbon'
    WHEN calculated_score >= 85 THEN 'Silver Ribbon'
    WHEN calculated_score >= 80 THEN 'Bronze Ribbon'
    WHEN calculated_score >= 75 THEN 'White Ribbon'
    ELSE 'Blue Ribbon'
  END;
  
  RETURN QUERY SELECT 
    COALESCE(avg_session_rating, 0),
    COALESCE(avg_likelihood_recommend, 0),
    calculated_score,
    calculated_badge;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update advisor metrics when session ratings are added
CREATE OR REPLACE FUNCTION update_advisor_performance_metrics()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.advisors 
  SET 
    average_session_rating = (
      SELECT AVG(advisor_rating) 
      FROM public.sessions 
      WHERE advisor_id = NEW.advisor_id AND advisor_rating IS NOT NULL
    ),
    average_likelihood_to_recommend = (
      SELECT AVG(likelihood_to_recommend) 
      FROM public.sessions 
      WHERE advisor_id = NEW.advisor_id AND likelihood_to_recommend IS NOT NULL
    ),
    sessions_completed = (
      SELECT COUNT(*) 
      FROM public.sessions 
      WHERE advisor_id = NEW.advisor_id AND status = 'completed'
    ),
    updated_at = now()
  WHERE id = NEW.advisor_id;
  
  -- Update overall score and badge level
  UPDATE public.advisors 
  SET 
    overall_score = (
      COALESCE(average_session_rating, 0) * 20 + 
      COALESCE(average_likelihood_to_recommend, 0) * 10
    ) / 2,
    badge_level = CASE 
      WHEN ((COALESCE(average_session_rating, 0) * 20 + COALESCE(average_likelihood_to_recommend, 0) * 10) / 2) >= 95 THEN 'Platinum Ribbon'
      WHEN ((COALESCE(average_session_rating, 0) * 20 + COALESCE(average_likelihood_to_recommend, 0) * 10) / 2) >= 90 THEN 'Gold Ribbon'
      WHEN ((COALESCE(average_session_rating, 0) * 20 + COALESCE(average_likelihood_to_recommend, 0) * 10) / 2) >= 85 THEN 'Silver Ribbon'
      WHEN ((COALESCE(average_session_rating, 0) * 20 + COALESCE(average_likelihood_to_recommend, 0) * 10) / 2) >= 80 THEN 'Bronze Ribbon'
      WHEN ((COALESCE(average_session_rating, 0) * 20 + COALESCE(average_likelihood_to_recommend, 0) * 10) / 2) >= 75 THEN 'White Ribbon'
      ELSE 'Blue Ribbon'
    END
  WHERE id = NEW.advisor_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_advisor_metrics_on_rating
  AFTER INSERT OR UPDATE OF advisor_rating, likelihood_to_recommend ON public.sessions
  FOR EACH ROW
  WHEN (NEW.advisor_rating IS NOT NULL OR NEW.likelihood_to_recommend IS NOT NULL)
  EXECUTE FUNCTION update_advisor_performance_metrics();