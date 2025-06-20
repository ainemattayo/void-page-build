
-- Add goals tracking for founders
CREATE TABLE IF NOT EXISTS founder_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    founder_id UUID REFERENCES founders(id) ON DELETE CASCADE,
    goal_title TEXT NOT NULL,
    goal_description TEXT,
    target_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add founder reflections/wins table
CREATE TABLE IF NOT EXISTS founder_reflections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    founder_id UUID REFERENCES founders(id) ON DELETE CASCADE,
    reflection_type TEXT DEFAULT 'reflection' CHECK (reflection_type IN ('reflection', 'win', 'challenge')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    shared_with_advisors BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add advisor-created resources/toolkit table
CREATE TABLE IF NOT EXISTS advisor_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    advisor_id UUID REFERENCES advisors(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    resource_type TEXT DEFAULT 'document' CHECK (resource_type IN ('document', 'template', 'video', 'link', 'tool')),
    file_url TEXT,
    download_url TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    target_audience TEXT DEFAULT 'all' CHECK (target_audience IN ('all', 'specific_founders', 'sector_specific')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add session notes table for AI note taker
CREATE TABLE IF NOT EXISTS session_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    notes_content TEXT,
    ai_summary TEXT,
    action_items JSONB,
    key_insights JSONB,
    created_by TEXT DEFAULT 'ai_notetaker',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add advisor assignments table (if not exists)
CREATE TABLE IF NOT EXISTS advisor_founder_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    advisor_id UUID REFERENCES advisors(id) ON DELETE CASCADE,
    founder_id UUID REFERENCES founders(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT now(),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
    UNIQUE(advisor_id, founder_id)
);

-- Enable RLS on new tables
ALTER TABLE founder_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE founder_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE advisor_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE advisor_founder_assignments ENABLE ROW LEVEL SECURITY;

-- RLS policies for founder goals
CREATE POLICY "Founders can manage their own goals" ON founder_goals
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users u
            JOIN founders f ON u.id = f.user_id
            WHERE u.auth_user_id = auth.uid() 
            AND f.id = founder_goals.founder_id
        )
    );

CREATE POLICY "Advisors can view assigned founders' goals" ON founder_goals
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users u
            JOIN advisors a ON u.id = a.user_id
            JOIN advisor_founder_assignments afa ON a.id = afa.advisor_id
            WHERE u.auth_user_id = auth.uid() 
            AND afa.founder_id = founder_goals.founder_id
            AND afa.status = 'active'
        )
    );

CREATE POLICY "Admins can view all goals" ON founder_goals
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_user_id = auth.uid() 
            AND role IN ('admin', 'coordinator')
        )
    );

-- RLS policies for founder reflections
CREATE POLICY "Founders can manage their own reflections" ON founder_reflections
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users u
            JOIN founders f ON u.id = f.user_id
            WHERE u.auth_user_id = auth.uid() 
            AND f.id = founder_reflections.founder_id
        )
    );

CREATE POLICY "Advisors can view shared reflections from assigned founders" ON founder_reflections
    FOR SELECT TO authenticated
    USING (
        shared_with_advisors = TRUE AND
        EXISTS (
            SELECT 1 FROM users u
            JOIN advisors a ON u.id = a.user_id
            JOIN advisor_founder_assignments afa ON a.id = afa.advisor_id
            WHERE u.auth_user_id = auth.uid() 
            AND afa.founder_id = founder_reflections.founder_id
            AND afa.status = 'active'
        )
    );

CREATE POLICY "Admins can view all reflections" ON founder_reflections
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_user_id = auth.uid() 
            AND role IN ('admin', 'coordinator')
        )
    );

-- RLS policies for advisor resources
CREATE POLICY "Advisors can manage their own resources" ON advisor_resources
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users u
            JOIN advisors a ON u.id = a.user_id
            WHERE u.auth_user_id = auth.uid() 
            AND a.id = advisor_resources.advisor_id
        )
    );

CREATE POLICY "Founders can view published resources" ON advisor_resources
    FOR SELECT TO authenticated
    USING (
        is_published = TRUE AND
        EXISTS (
            SELECT 1 FROM users u
            JOIN founders f ON u.id = f.user_id
            WHERE u.auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all resources" ON advisor_resources
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_user_id = auth.uid() 
            AND role IN ('admin', 'coordinator')
        )
    );

-- RLS policies for session notes
CREATE POLICY "Founders can view notes from their sessions" ON session_notes
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users u
            JOIN founders f ON u.id = f.user_id
            JOIN sessions s ON f.id = s.founder_id
            WHERE u.auth_user_id = auth.uid() 
            AND s.id = session_notes.session_id
        )
    );

CREATE POLICY "Advisors can view notes from their sessions" ON session_notes
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users u
            JOIN advisors a ON u.id = a.user_id
            JOIN sessions s ON a.id = s.advisor_id
            WHERE u.auth_user_id = auth.uid() 
            AND s.id = session_notes.session_id
        )
    );

CREATE POLICY "Admins can manage all session notes" ON session_notes
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_user_id = auth.uid() 
            AND role IN ('admin', 'coordinator')
        )
    );

-- RLS policies for advisor founder assignments
CREATE POLICY "Advisors can view their assignments" ON advisor_founder_assignments
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users u
            JOIN advisors a ON u.id = a.user_id
            WHERE u.auth_user_id = auth.uid() 
            AND a.id = advisor_founder_assignments.advisor_id
        )
    );

CREATE POLICY "Founders can view their assignments" ON advisor_founder_assignments
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users u
            JOIN founders f ON u.id = f.user_id
            WHERE u.auth_user_id = auth.uid() 
            AND f.id = advisor_founder_assignments.founder_id
        )
    );

CREATE POLICY "Admins can manage all assignments" ON advisor_founder_assignments
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_user_id = auth.uid() 
            AND role IN ('admin', 'coordinator')
        )
    );
