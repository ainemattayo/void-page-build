/*
  # CoPilot Platform Schema - Auth-Based User Management
  
  1. Core Tables
    - Enhanced founders and advisors tables (building on your auth foundation)
    - Users table for admin/coordinator roles
    - Sessions, assignments, and program management tables
  
  2. Security
    - Row Level Security (RLS) enabled on all tables
    - Role-based access policies
    - Admin-only access for sensitive data
  
  3. Features
    - Complete admin dashboard data structure
    - Founder-advisor matching system
    - Session tracking and case study management
    - Program timeline and metrics
*/

-- STEP 1: Create users table for admin/coordinator roles (non-auth users)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text CHECK (role IN ('admin', 'coordinator', 'advisor', 'founder')) NOT NULL,
  status text CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- STEP 2: Enhance the founders table (building on your foundation)
ALTER TABLE public.founders ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE public.founders ADD COLUMN IF NOT EXISTS location_city text;
ALTER TABLE public.founders ADD COLUMN IF NOT EXISTS location_country text;
ALTER TABLE public.founders ADD COLUMN IF NOT EXISTS website text;
ALTER TABLE public.founders ADD COLUMN IF NOT EXISTS top_bottleneck text;
ALTER TABLE public.founders ADD COLUMN IF NOT EXISTS bottleneck_status text CHECK (bottleneck_status IN ('Solved', 'In Progress')) DEFAULT 'In Progress';
ALTER TABLE public.founders ADD COLUMN IF NOT EXISTS has_story boolean DEFAULT false;
ALTER TABLE public.founders ADD COLUMN IF NOT EXISTS has_testimonial boolean DEFAULT false;
ALTER TABLE public.founders ADD COLUMN IF NOT EXISTS revenue_last_12_months numeric;
ALTER TABLE public.founders ADD COLUMN IF NOT EXISTS team_size integer;
ALTER TABLE public.founders ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Add constraints for founders
ALTER TABLE public.founders ADD CONSTRAINT founders_sector_check 
  CHECK (sector IN ('FinTech', 'AgriTech', 'HealthTech', 'EdTech', 'ClimaTech', 'Other'));
ALTER TABLE public.founders ADD CONSTRAINT founders_stage_check 
  CHECK (stage IN ('Pre-Seed', 'Seed', 'Series A', 'Other'));

-- STEP 3: Enhance the advisors table (building on your foundation)
ALTER TABLE public.advisors ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE public.advisors ADD COLUMN IF NOT EXISTS linkedin_url text;
ALTER TABLE public.advisors ADD COLUMN IF NOT EXISTS location_city text;
ALTER TABLE public.advisors ADD COLUMN IF NOT EXISTS location_country text;
ALTER TABLE public.advisors ADD COLUMN IF NOT EXISTS expertise_areas text[];
ALTER TABLE public.advisors ADD COLUMN IF NOT EXISTS status text CHECK (status IN ('Already matched', 'Ready to be matched')) DEFAULT 'Ready to be matched';
ALTER TABLE public.advisors ADD COLUMN IF NOT EXISTS sessions_completed integer DEFAULT 0;
ALTER TABLE public.advisors ADD COLUMN IF NOT EXISTS founders_mentored integer DEFAULT 0;
ALTER TABLE public.advisors ADD COLUMN IF NOT EXISTS average_session_rating numeric DEFAULT 0;
ALTER TABLE public.advisors ADD COLUMN IF NOT EXISTS average_likelihood_to_recommend numeric DEFAULT 0;
ALTER TABLE public.advisors ADD COLUMN IF NOT EXISTS overall_score numeric DEFAULT 0;
ALTER TABLE public.advisors ADD COLUMN IF NOT EXISTS badge_level text DEFAULT 'Blue Ribbon';
ALTER TABLE public.advisors ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Drop the old expertise column and use expertise_areas
ALTER TABLE public.advisors DROP COLUMN IF EXISTS expertise;

-- STEP 4: Create advisor-founder assignments table
CREATE TABLE IF NOT EXISTS public.advisor_founder_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_id uuid REFERENCES public.founders(id) ON DELETE CASCADE,
  advisor_id uuid REFERENCES public.advisors(id) ON DELETE CASCADE,
  assigned_at timestamptz DEFAULT now(),
  status text CHECK (status IN ('active', 'completed', 'paused')) DEFAULT 'active',
  UNIQUE(founder_id, advisor_id)
);

-- STEP 5: Create sessions table
CREATE TABLE IF NOT EXISTS public.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_id uuid REFERENCES public.founders(id) ON DELETE SET NULL,
  advisor_id uuid REFERENCES public.advisors(id) ON DELETE SET NULL,
  session_type text CHECK (session_type IN ('advisory', 'masterclass', 'group')) DEFAULT 'advisory',
  title text,
  session_date timestamptz,
  duration_minutes integer DEFAULT 60,
  status text CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')) DEFAULT 'scheduled',
  notes text,
  outcome text,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  zoom_link text,
  calendar_event_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  advisor_rating integer CHECK (advisor_rating >= 1 AND advisor_rating <= 5),
  likelihood_to_recommend integer CHECK (likelihood_to_recommend >= 1 AND likelihood_to_recommend <= 10),
  founder_testimonial text
);

-- STEP 6: Create case studies table
CREATE TABLE IF NOT EXISTS public.case_studies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_id uuid REFERENCES public.founders(id) ON DELETE CASCADE,
  title text NOT NULL,
  content jsonb,
  status text CHECK (status IN ('Ready', 'In Progress', 'Draft')) DEFAULT 'Draft',
  featured boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- STEP 7: Create metrics table
CREATE TABLE IF NOT EXISTS public.metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date UNIQUE NOT NULL,
  active_founders_count integer DEFAULT 0,
  active_advisors_count integer DEFAULT 0,
  sessions_this_month integer DEFAULT 0,
  case_studies_ready integer DEFAULT 0,
  total_sessions_completed integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- STEP 8: Create forms table
CREATE TABLE IF NOT EXISTS public.forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  form_type text CHECK (form_type IN ('Post-Session Reflection', 'Advisor Feedback', 'Founder Application', 'Advisor Application')),
  url text,
  is_active boolean DEFAULT true,
  icon text,
  description text,
  created_at timestamptz DEFAULT now()
);

-- STEP 9: Create program timeline table
CREATE TABLE IF NOT EXISTS public.program_timeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month_number integer UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  status text CHECK (status IN ('completed', 'active', 'upcoming', 'planned')) DEFAULT 'planned',
  founders_involved integer DEFAULT 0,
  advisors_involved integer DEFAULT 0,
  start_date date,
  end_date date,
  created_at timestamptz DEFAULT now()
);

-- STEP 10: Create calendars table
CREATE TABLE IF NOT EXISTS public.calendars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  calendar_type text CHECK (calendar_type IN ('Master Session Calendar', 'Masterclass Schedule')),
  url text,
  icon text,
  last_synced_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- STEP 11: Create to-dos table
CREATE TABLE IF NOT EXISTS public.to_dos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  priority text CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  due_date date,
  assigned_to uuid REFERENCES public.users(id) ON DELETE SET NULL,
  status text CHECK (status IN ('pending', 'completed')) DEFAULT 'pending',
  linked_entity_type text CHECK (linked_entity_type IN ('founder', 'advisor', 'session')),
  linked_entity_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- STEP 12: Create tools table
CREATE TABLE IF NOT EXISTS public.tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  tool_type text CHECK (tool_type IN ('Database', 'Video Conferencing', 'Analytics', 'Communication')),
  url text,
  icon text,
  status text CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
  description text,
  created_at timestamptz DEFAULT now()
);

-- STEP 13: Create advisor testimonials table
CREATE TABLE IF NOT EXISTS public.advisor_testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  advisor_id uuid REFERENCES public.advisors(id) ON DELETE CASCADE,
  founder_id uuid REFERENCES public.founders(id) ON DELETE CASCADE,
  testimonial_text text NOT NULL,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- STEP 14: Create advisor monthly reports table
CREATE TABLE IF NOT EXISTS public.advisor_monthly_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  advisor_id uuid REFERENCES public.advisors(id) ON DELETE CASCADE,
  month integer CHECK (month >= 1 AND month <= 12) NOT NULL,
  year integer NOT NULL,
  content jsonb,
  submitted_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(advisor_id, month, year)
);

-- STEP 15: Create founder goals table
CREATE TABLE IF NOT EXISTS public.founder_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_id uuid REFERENCES public.founders(id) ON DELETE CASCADE,
  goal_title text NOT NULL,
  goal_description text,
  target_date date,
  status text CHECK (status IN ('active', 'completed', 'paused', 'cancelled')) DEFAULT 'active',
  progress_percentage integer CHECK (progress_percentage >= 0 AND progress_percentage <= 100) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- STEP 16: Create founder reflections table
CREATE TABLE IF NOT EXISTS public.founder_reflections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_id uuid REFERENCES public.founders(id) ON DELETE CASCADE,
  reflection_type text CHECK (reflection_type IN ('reflection', 'win', 'challenge')) DEFAULT 'reflection',
  title text NOT NULL,
  content text NOT NULL,
  shared_with_advisors boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- STEP 17: Create advisor resources table
CREATE TABLE IF NOT EXISTS public.advisor_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  advisor_id uuid REFERENCES public.advisors(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  resource_type text CHECK (resource_type IN ('document', 'template', 'video', 'link', 'tool')) DEFAULT 'document',
  file_url text,
  download_url text,
  is_published boolean DEFAULT false,
  target_audience text CHECK (target_audience IN ('all', 'specific_founders', 'sector_specific')) DEFAULT 'all',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- STEP 18: Create session notes table
CREATE TABLE IF NOT EXISTS public.session_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.sessions(id) ON DELETE CASCADE,
  notes_content text,
  ai_summary text,
  action_items jsonb,
  key_insights jsonb,
  created_by text DEFAULT 'ai_notetaker',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- STEP 19: Create a view for current platform totals
CREATE OR REPLACE VIEW public.current_platform_totals AS
SELECT 
  (SELECT COUNT(*) FROM public.founders) as total_active_founders,
  (SELECT COUNT(*) FROM public.advisors) as total_active_advisors,
  (SELECT COUNT(*) FROM public.sessions WHERE DATE_TRUNC('month', session_date) = DATE_TRUNC('month', CURRENT_DATE)) as sessions_this_month,
  (SELECT COUNT(*) FROM public.case_studies WHERE status = 'Ready') as case_studies_ready;

-- STEP 20: Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.founders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisor_founder_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.to_dos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisor_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisor_monthly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.founder_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.founder_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisor_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_notes ENABLE ROW LEVEL SECURITY;

-- STEP 21: Create RLS Policies

-- Users policies
CREATE POLICY "Admins can manage all users" ON public.users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_user_id = auth.uid() 
      AND role IN ('admin', 'coordinator')
    )
  );

CREATE POLICY "Users can read their own data" ON public.users
  FOR SELECT USING (auth_user_id = auth.uid());

-- Founders policies
CREATE POLICY "Admins can manage all founders" ON public.founders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_user_id = auth.uid() 
      AND role IN ('admin', 'coordinator')
    )
  );

CREATE POLICY "Founders can read their own data" ON public.founders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_user_id = auth.uid() 
      AND id = founders.user_id
    )
  );

-- Advisors policies
CREATE POLICY "Admins can manage all advisors" ON public.advisors
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_user_id = auth.uid() 
      AND role IN ('admin', 'coordinator')
    )
  );

CREATE POLICY "Advisors can read their own data" ON public.advisors
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_user_id = auth.uid() 
      AND id = advisors.user_id
    )
  );

-- Sessions policies
CREATE POLICY "Admins can manage all sessions" ON public.sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_user_id = auth.uid() 
      AND role IN ('admin', 'coordinator')
    )
  );

CREATE POLICY "Users can read their own sessions" ON public.sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u
      LEFT JOIN public.founders f ON u.id = f.user_id
      LEFT JOIN public.advisors a ON u.id = a.user_id
      WHERE u.auth_user_id = auth.uid()
      AND (f.id = sessions.founder_id OR a.id = sessions.advisor_id)
    )
  );

-- Assignments policies
CREATE POLICY "Admins can manage all assignments" ON public.advisor_founder_assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_user_id = auth.uid() 
      AND role IN ('admin', 'coordinator')
    )
  );

CREATE POLICY "Founders can view their assignments" ON public.advisor_founder_assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.founders f ON u.id = f.user_id
      WHERE u.auth_user_id = auth.uid()
      AND f.id = advisor_founder_assignments.founder_id
    )
  );

CREATE POLICY "Advisors can view their assignments" ON public.advisor_founder_assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.advisors a ON u.id = a.user_id
      WHERE u.auth_user_id = auth.uid()
      AND a.id = advisor_founder_assignments.advisor_id
    )
  );

-- Admin-only policies for management tables
CREATE POLICY "Admin access only" ON public.metrics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_user_id = auth.uid() 
      AND role IN ('admin', 'coordinator')
    )
  );

CREATE POLICY "Admin access only" ON public.forms
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_user_id = auth.uid() 
      AND role IN ('admin', 'coordinator')
    )
  );

CREATE POLICY "Admin access only" ON public.program_timeline
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_user_id = auth.uid() 
      AND role IN ('admin', 'coordinator')
    )
  );

CREATE POLICY "Admin access only" ON public.calendars
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_user_id = auth.uid() 
      AND role IN ('admin', 'coordinator')
    )
  );

CREATE POLICY "Admin access only" ON public.to_dos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_user_id = auth.uid() 
      AND role IN ('admin', 'coordinator')
    )
  );

CREATE POLICY "Admin access only" ON public.tools
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_user_id = auth.uid() 
      AND role IN ('admin', 'coordinator')
    )
  );

CREATE POLICY "Admin access only" ON public.case_studies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_user_id = auth.uid() 
      AND role IN ('admin', 'coordinator')
    )
  );

-- Testimonials policies
CREATE POLICY "Admins can manage all testimonials" ON public.advisor_testimonials
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_user_id = auth.uid() 
      AND role IN ('admin', 'coordinator')
    )
  );

CREATE POLICY "Advisors can view their own testimonials" ON public.advisor_testimonials
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.advisors a ON u.id = a.user_id
      WHERE u.auth_user_id = auth.uid()
      AND a.id = advisor_testimonials.advisor_id
    )
  );

CREATE POLICY "Founders can create testimonials for their advisors" ON public.advisor_testimonials
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.founders f ON u.id = f.user_id
      WHERE u.auth_user_id = auth.uid()
      AND f.id = advisor_testimonials.founder_id
    )
  );

-- Monthly reports policies
CREATE POLICY "Admins can view all monthly reports" ON public.advisor_monthly_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_user_id = auth.uid() 
      AND role IN ('admin', 'coordinator')
    )
  );

CREATE POLICY "Advisors can manage their own monthly reports" ON public.advisor_monthly_reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.advisors a ON u.id = a.user_id
      WHERE u.auth_user_id = auth.uid()
      AND a.id = advisor_monthly_reports.advisor_id
    )
  );

-- Goals policies
CREATE POLICY "Admins can view all goals" ON public.founder_goals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_user_id = auth.uid() 
      AND role IN ('admin', 'coordinator')
    )
  );

CREATE POLICY "Founders can manage their own goals" ON public.founder_goals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.founders f ON u.id = f.user_id
      WHERE u.auth_user_id = auth.uid()
      AND f.id = founder_goals.founder_id
    )
  );

CREATE POLICY "Advisors can view assigned founders' goals" ON public.founder_goals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.advisors a ON u.id = a.user_id
      JOIN public.advisor_founder_assignments afa ON a.id = afa.advisor_id
      WHERE u.auth_user_id = auth.uid()
      AND afa.founder_id = founder_goals.founder_id
      AND afa.status = 'active'
    )
  );

-- Reflections policies
CREATE POLICY "Admins can view all reflections" ON public.founder_reflections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_user_id = auth.uid() 
      AND role IN ('admin', 'coordinator')
    )
  );

CREATE POLICY "Founders can manage their own reflections" ON public.founder_reflections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.founders f ON u.id = f.user_id
      WHERE u.auth_user_id = auth.uid()
      AND f.id = founder_reflections.founder_id
    )
  );

CREATE POLICY "Advisors can view shared reflections from assigned founders" ON public.founder_reflections
  FOR SELECT USING (
    shared_with_advisors = true AND
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.advisors a ON u.id = a.user_id
      JOIN public.advisor_founder_assignments afa ON a.id = afa.advisor_id
      WHERE u.auth_user_id = auth.uid()
      AND afa.founder_id = founder_reflections.founder_id
      AND afa.status = 'active'
    )
  );

-- Resources policies
CREATE POLICY "Admins can manage all resources" ON public.advisor_resources
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_user_id = auth.uid() 
      AND role IN ('admin', 'coordinator')
    )
  );

CREATE POLICY "Advisors can manage their own resources" ON public.advisor_resources
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.advisors a ON u.id = a.user_id
      WHERE u.auth_user_id = auth.uid()
      AND a.id = advisor_resources.advisor_id
    )
  );

CREATE POLICY "Founders can view published resources" ON public.advisor_resources
  FOR SELECT USING (
    is_published = true AND
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.founders f ON u.id = f.user_id
      WHERE u.auth_user_id = auth.uid()
    )
  );

-- Session notes policies
CREATE POLICY "Admins can manage all session notes" ON public.session_notes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_user_id = auth.uid() 
      AND role IN ('admin', 'coordinator')
    )
  );

CREATE POLICY "Founders can view notes from their sessions" ON public.session_notes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.founders f ON u.id = f.user_id
      JOIN public.sessions s ON f.id = s.founder_id
      WHERE u.auth_user_id = auth.uid()
      AND s.id = session_notes.session_id
    )
  );

CREATE POLICY "Advisors can view notes from their sessions" ON public.session_notes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.advisors a ON u.id = a.user_id
      JOIN public.sessions s ON a.id = s.advisor_id
      WHERE u.auth_user_id = auth.uid()
      AND s.id = session_notes.session_id
    )
  );