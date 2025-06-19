/*
  # CoPilot Platform Database Schema

  1. New Tables
    - `users` - Authentication and role management
    - `founders` - African SME founders in the program
    - `advisors` - Diaspora experts providing guidance
    - `advisor_founder_assignments` - Many-to-many relationships
    - `sessions` - Advisory sessions and masterclasses
    - `case_studies` - Success stories and documentation
    - `metrics` - Platform KPIs and analytics
    - `forms` - Active forms and tools
    - `program_timeline` - 6-month program phases
    - `calendars` - Scheduling systems
    - `to_dos` - Admin task management
    - `session_tracker` - Session scheduling and tracking
    - `tools` - External tools and integrations

  2. Security
    - Enable RLS on all tables
    - Role-based access policies
    - Admin-only access for sensitive data
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table (for internal/admin access control)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT CHECK (role IN ('admin', 'coordinator', 'advisor', 'founder')) NOT NULL,
    status TEXT CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Founders Table
CREATE TABLE IF NOT EXISTS founders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT,
    startup_name TEXT,
    website TEXT,
    location_country TEXT,
    location_city TEXT,
    sector TEXT CHECK (sector IN ('FinTech', 'AgriTech', 'HealthTech', 'EdTech', 'ClimaTech', 'Other')),
    stage TEXT CHECK (stage IN ('Pre-Seed', 'Seed', 'Series A', 'Other')),
    top_bottleneck TEXT,
    bottleneck_status TEXT CHECK (bottleneck_status IN ('Solved', 'In Progress')) DEFAULT 'In Progress',
    has_story BOOLEAN DEFAULT FALSE,
    has_testimonial BOOLEAN DEFAULT FALSE,
    revenue_last_12_months DECIMAL,
    team_size INTEGER,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Advisors Table
CREATE TABLE IF NOT EXISTS advisors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT,
    linkedin_url TEXT,
    location_city TEXT,
    location_country TEXT,
    timezone TEXT,
    expertise_areas TEXT[],
    status TEXT CHECK (status IN ('Already matched', 'Ready to be matched')) DEFAULT 'Ready to be matched',
    notes TEXT,
    satisfaction_score DECIMAL DEFAULT 0,
    sessions_completed INTEGER DEFAULT 0,
    founders_mentored INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Advisor-Founder Assignments (many-to-many)
CREATE TABLE IF NOT EXISTS advisor_founder_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    founder_id UUID REFERENCES founders(id) ON DELETE CASCADE,
    advisor_id UUID REFERENCES advisors(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT now(),
    status TEXT CHECK (status IN ('active', 'completed', 'paused')) DEFAULT 'active',
    UNIQUE(founder_id, advisor_id)
);

-- 5. Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    founder_id UUID REFERENCES founders(id) ON DELETE SET NULL,
    advisor_id UUID REFERENCES advisors(id) ON DELETE SET NULL,
    session_type TEXT CHECK (session_type IN ('advisory', 'masterclass', 'group')) DEFAULT 'advisory',
    title TEXT,
    session_date TIMESTAMPTZ,
    duration_minutes INTEGER DEFAULT 60,
    status TEXT CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')) DEFAULT 'scheduled',
    notes TEXT,
    outcome TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    zoom_link TEXT,
    calendar_event_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Case Studies Table
CREATE TABLE IF NOT EXISTS case_studies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    founder_id UUID REFERENCES founders(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content JSONB,
    status TEXT CHECK (status IN ('Ready', 'In Progress', 'Draft')) DEFAULT 'Draft',
    featured BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Metrics Table (for dashboard KPIs)
CREATE TABLE IF NOT EXISTS metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    active_founders_count INTEGER DEFAULT 0,
    active_advisors_count INTEGER DEFAULT 0,
    sessions_this_month INTEGER DEFAULT 0,
    case_studies_ready INTEGER DEFAULT 0,
    total_sessions_completed INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(date)
);

-- 8. Forms Table
CREATE TABLE IF NOT EXISTS forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    form_type TEXT CHECK (form_type IN ('Post-Session Reflection', 'Advisor Feedback', 'Founder Application', 'Advisor Application')),
    url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    icon TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Program Timeline Table
CREATE TABLE IF NOT EXISTS program_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT CHECK (status IN ('completed', 'active', 'upcoming', 'planned')) DEFAULT 'planned',
    founders_involved INTEGER DEFAULT 0,
    advisors_involved INTEGER DEFAULT 0,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(month_number)
);

-- 10. Calendars Table
CREATE TABLE IF NOT EXISTS calendars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    calendar_type TEXT CHECK (calendar_type IN ('Master Session Calendar', 'Masterclass Schedule')),
    url TEXT,
    icon TEXT,
    last_synced_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 11. To-Do Tasks Table
CREATE TABLE IF NOT EXISTS to_dos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    due_date DATE,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    status TEXT CHECK (status IN ('pending', 'completed')) DEFAULT 'pending',
    linked_entity_type TEXT CHECK (linked_entity_type IN ('founder', 'advisor', 'session')),
    linked_entity_id UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 12. Tools Table
CREATE TABLE IF NOT EXISTS tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    tool_type TEXT CHECK (tool_type IN ('Database', 'Video Conferencing', 'Analytics', 'Communication')),
    url TEXT,
    icon TEXT,
    status TEXT CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE founders ENABLE ROW LEVEL SECURITY;
ALTER TABLE advisors ENABLE ROW LEVEL SECURITY;
ALTER TABLE advisor_founder_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE to_dos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Admin Access
CREATE POLICY "Admins can manage all users" ON users
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_user_id = auth.uid() 
      AND role IN ('admin', 'coordinator')
    )
  );

CREATE POLICY "Users can read their own data" ON users
  FOR SELECT TO authenticated
  USING (auth_user_id = auth.uid());

-- Founders policies
CREATE POLICY "Admins can manage all founders" ON founders
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_user_id = auth.uid() 
      AND role IN ('admin', 'coordinator')
    )
  );

CREATE POLICY "Founders can read their own data" ON founders
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_user_id = auth.uid() 
      AND id = founders.user_id
    )
  );

-- Advisors policies
CREATE POLICY "Admins can manage all advisors" ON advisors
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_user_id = auth.uid() 
      AND role IN ('admin', 'coordinator')
    )
  );

CREATE POLICY "Advisors can read their own data" ON advisors
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_user_id = auth.uid() 
      AND id = advisors.user_id
    )
  );

-- Sessions policies
CREATE POLICY "Admins can manage all sessions" ON sessions
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_user_id = auth.uid() 
      AND role IN ('admin', 'coordinator')
    )
  );

CREATE POLICY "Users can read their own sessions" ON sessions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      LEFT JOIN founders f ON u.id = f.user_id
      LEFT JOIN advisors a ON u.id = a.user_id
      WHERE u.auth_user_id = auth.uid() 
      AND (f.id = sessions.founder_id OR a.id = sessions.advisor_id)
    )
  );

-- Other tables - Admin only for now
CREATE POLICY "Admin access only" ON advisor_founder_assignments FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE auth_user_id = auth.uid() AND role IN ('admin', 'coordinator'))
);

CREATE POLICY "Admin access only" ON case_studies FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE auth_user_id = auth.uid() AND role IN ('admin', 'coordinator'))
);

CREATE POLICY "Admin access only" ON metrics FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE auth_user_id = auth.uid() AND role IN ('admin', 'coordinator'))
);

CREATE POLICY "Admin access only" ON forms FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE auth_user_id = auth.uid() AND role IN ('admin', 'coordinator'))
);

CREATE POLICY "Admin access only" ON program_timeline FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE auth_user_id = auth.uid() AND role IN ('admin', 'coordinator'))
);

CREATE POLICY "Admin access only" ON calendars FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE auth_user_id = auth.uid() AND role IN ('admin', 'coordinator'))
);

CREATE POLICY "Admin access only" ON to_dos FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE auth_user_id = auth.uid() AND role IN ('admin', 'coordinator'))
);

CREATE POLICY "Admin access only" ON tools FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE auth_user_id = auth.uid() AND role IN ('admin', 'coordinator'))
);