/*
  # Seed Initial Data for CoPilot Platform

  This migration populates the database with realistic sample data
  that matches the admin dashboard UI exactly.
*/

-- Insert sample forms
INSERT INTO forms (name, form_type, url, icon, description) VALUES
('Post-Session Reflection', 'Post-Session Reflection', 'https://forms.copilot.com/post-session', '📝', 'Founder reflection after advisory sessions'),
('Advisor Feedback Form', 'Advisor Feedback', 'https://forms.copilot.com/advisor-feedback', '📋', 'Advisor feedback on session quality');

-- Insert calendars
INSERT INTO calendars (name, calendar_type, url, icon) VALUES
('Master Session Calendar', 'Master Session Calendar', 'https://calendar.copilot.com/sessions', '📅'),
('Masterclass Schedule', 'Masterclass Schedule', 'https://calendar.copilot.com/masterclass', '🎓');

-- Insert tools
INSERT INTO tools (name, tool_type, url, icon, description) VALUES
('Airtable Database', 'Database', 'https://airtable.com/copilot', '📊', 'Main database for tracking all program data'),
('Zoom Admin Panel', 'Video Conferencing', 'https://zoom.us/admin', '💬', 'Video conferencing management');

-- Insert program timeline
INSERT INTO program_timeline (month_number, title, description, status, founders_involved, advisors_involved) VALUES
(1, 'Onboarding & Matching', 'Initial setup and advisor-founder matching', 'completed', 15, 10),
(2, 'First Advisory Sessions', 'Beginning of regular advisory sessions', 'active', 28, 19),
(3, 'Masterclasses Begin', 'Group learning sessions start', 'upcoming', 25, 18),
(4, 'Progress Reviews', 'Mid-program assessment and adjustments', 'planned', 20, 15),
(5, 'Case Study Collection', 'Documenting success stories', 'planned', 18, 12),
(6, 'Final Reports & Graduation', 'Program completion and outcomes', 'planned', 15, 10);

-- Insert sample users (admin)
INSERT INTO users (full_name, email, role, auth_user_id) VALUES
('Admin User', 'admin@copilot.com', 'admin', gen_random_uuid());

-- Insert sample founders
INSERT INTO founders (full_name, email, startup_name, website, location_country, location_city, sector, stage, top_bottleneck, bottleneck_status, has_story, has_testimonial) VALUES
('Amara Okafor', 'amara@payfast.ng', 'PayFast', 'payfast.ng', 'Nigeria', 'Lagos', 'FinTech', 'Series A', 'International expansion strategy', 'Solved', true, true),
('Kwame Asante', 'kwame@farmconnect.gh', 'FarmConnect', 'farmconnect.gh', 'Ghana', 'Accra', 'AgriTech', 'Seed', 'Supply chain optimization', 'In Progress', false, true),
('Fatima Hassan', 'fatima@meditrack.ke', 'MediTrack', 'meditrack.ke', 'Kenya', 'Nairobi', 'HealthTech', 'Pre-Seed', 'Product-market fit', 'Solved', true, false),
('Thabo Molefe', 'thabo@learnza.co.za', 'LearnZA', 'learnza.co.za', 'South Africa', 'Cape Town', 'EdTech', 'Seed', 'User acquisition', 'In Progress', false, false);

-- Insert sample advisors
INSERT INTO advisors (full_name, email, linkedin_url, location_city, location_country, timezone, expertise_areas, status, notes, satisfaction_score, sessions_completed, founders_mentored) VALUES
('Sarah Johnson', 'sarah@example.com', 'linkedin.com/in/sarahjohnson', 'London', 'UK', 'GMT', ARRAY['Product Management', 'Go-to-Market'], 'Already matched', 'Excellent at international expansion strategies, has scaled 3 startups in Africa', 4.9, 8, 3),
('Michael Chen', 'michael@example.com', 'linkedin.com/in/michaelchen', 'San Francisco', 'USA', 'PST', ARRAY['FinTech', 'Fundraising'], 'Ready to be matched', 'Former VP at Stripe, deep FinTech expertise, African market experience', 4.8, 12, 2),
('Jennifer Liu', 'jennifer@example.com', 'linkedin.com/in/jenniferliu', 'Toronto', 'Canada', 'EST', ARRAY['Supply Chain', 'Operations'], 'Already matched', 'Supply chain optimization expert, worked with 10+ AgriTech companies', 4.7, 15, 4),
('David Rodriguez', 'david@example.com', 'linkedin.com/in/davidrodriguez', 'Barcelona', 'Spain', 'CET', ARRAY['HealthTech', 'Regulatory'], 'Already matched', 'Former McKinsey partner, specialized in healthcare innovation', 4.9, 10, 2);

-- Insert advisor-founder assignments
INSERT INTO advisor_founder_assignments (founder_id, advisor_id) VALUES
((SELECT id FROM founders WHERE full_name = 'Amara Okafor'), (SELECT id FROM advisors WHERE full_name = 'Sarah Johnson')),
((SELECT id FROM founders WHERE full_name = 'Amara Okafor'), (SELECT id FROM advisors WHERE full_name = 'Michael Chen')),
((SELECT id FROM founders WHERE full_name = 'Kwame Asante'), (SELECT id FROM advisors WHERE full_name = 'Jennifer Liu')),
((SELECT id FROM founders WHERE full_name = 'Fatima Hassan'), (SELECT id FROM advisors WHERE full_name = 'David Rodriguez')),
((SELECT id FROM founders WHERE full_name = 'Thabo Molefe'), (SELECT id FROM advisors WHERE full_name = 'Sarah Johnson'));

-- Insert sample sessions
INSERT INTO sessions (founder_id, advisor_id, session_type, title, session_date, status, duration_minutes, rating) VALUES
((SELECT id FROM founders WHERE full_name = 'Amara Okafor'), (SELECT id FROM advisors WHERE full_name = 'Sarah Johnson'), 'advisory', 'International Expansion Strategy', '2025-01-15 14:00:00+00', 'completed', 60, 5),
((SELECT id FROM founders WHERE full_name = 'Kwame Asante'), (SELECT id FROM advisors WHERE full_name = 'Jennifer Liu'), 'advisory', 'Supply Chain Optimization', '2025-01-20 15:00:00+00', 'completed', 45, 4),
((SELECT id FROM founders WHERE full_name = 'Fatima Hassan'), (SELECT id FROM advisors WHERE full_name = 'David Rodriguez'), 'advisory', 'Product-Market Fit Analysis', '2025-01-25 13:00:00+00', 'completed', 60, 5);

-- Insert current metrics
INSERT INTO metrics (date, active_founders_count, active_advisors_count, sessions_this_month, case_studies_ready) VALUES
(CURRENT_DATE, 28, 19, 45, 8);

-- Insert sample to-dos
INSERT INTO to_dos (title, priority, due_date, status) VALUES
('Review 3 new founder applications', 'high', CURRENT_DATE, 'pending'),
('Schedule Q2 advisor onboarding', 'medium', CURRENT_DATE + INTERVAL '2 days', 'pending'),
('Follow up on Session #47 outcomes', 'high', CURRENT_DATE + INTERVAL '1 day', 'pending'),
('Prepare monthly KPI report', 'low', CURRENT_DATE + INTERVAL '4 days', 'pending');

-- Insert case studies
INSERT INTO case_studies (founder_id, title, status) VALUES
((SELECT id FROM founders WHERE full_name = 'Amara Okafor'), 'PayFast: Scaling FinTech Across West Africa', 'Ready'),
((SELECT id FROM founders WHERE full_name = 'Fatima Hassan'), 'MediTrack: Finding Product-Market Fit in HealthTech', 'Ready');