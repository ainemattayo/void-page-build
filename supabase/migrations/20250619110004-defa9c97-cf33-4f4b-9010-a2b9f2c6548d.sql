
-- Add rating and testimonial fields to sessions table
ALTER TABLE sessions 
ADD COLUMN IF NOT EXISTS advisor_rating INTEGER CHECK (advisor_rating >= 1 AND advisor_rating <= 5),
ADD COLUMN IF NOT EXISTS likelihood_to_recommend INTEGER CHECK (likelihood_to_recommend >= 1 AND likelihood_to_recommend <= 10),
ADD COLUMN IF NOT EXISTS founder_testimonial TEXT;

-- Create advisor monthly reports table
CREATE TABLE IF NOT EXISTS advisor_monthly_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    advisor_id UUID REFERENCES advisors(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL,
    content JSONB,
    submitted_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(advisor_id, month, year)
);

-- Create advisor testimonials table for quote wall
CREATE TABLE IF NOT EXISTS advisor_testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    advisor_id UUID REFERENCES advisors(id) ON DELETE CASCADE,
    founder_id UUID REFERENCES founders(id) ON DELETE CASCADE,
    testimonial_text TEXT NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Add computed columns to advisors table for badge calculation
ALTER TABLE advisors 
ADD COLUMN IF NOT EXISTS average_session_rating DECIMAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_likelihood_to_recommend DECIMAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS overall_score DECIMAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS badge_level TEXT DEFAULT 'Blue Ribbon';

-- Create function to calculate advisor performance metrics
CREATE OR REPLACE FUNCTION calculate_advisor_performance(advisor_uuid UUID)
RETURNS TABLE (
    avg_rating DECIMAL,
    avg_likelihood DECIMAL,
    overall_score DECIMAL,
    badge_level TEXT
) AS $$
DECLARE
    rating_avg DECIMAL;
    likelihood_avg DECIMAL;
    combined_score DECIMAL;
    badge TEXT;
BEGIN
    -- Calculate average rating (out of 5)
    SELECT COALESCE(AVG(advisor_rating), 0) INTO rating_avg
    FROM sessions 
    WHERE advisor_id = advisor_uuid AND advisor_rating IS NOT NULL;
    
    -- Calculate average likelihood to recommend (out of 10)
    SELECT COALESCE(AVG(likelihood_to_recommend), 0) INTO likelihood_avg
    FROM sessions 
    WHERE advisor_id = advisor_uuid AND likelihood_to_recommend IS NOT NULL;
    
    -- Calculate overall score as percentage
    combined_score := ((rating_avg / 5.0) + (likelihood_avg / 10.0)) / 2.0 * 100;
    
    -- Determine badge level
    IF combined_score > 97.5 THEN
        badge := 'Platinum Ribbon';
    ELSIF combined_score > 85.1 THEN
        badge := 'Gold Ribbon';
    ELSIF combined_score > 80.1 THEN
        badge := 'Silver Ribbon';
    ELSIF combined_score > 75.1 THEN
        badge := 'Bronze Ribbon';
    ELSIF combined_score > 50.1 THEN
        badge := 'White Ribbon';
    ELSE
        badge := 'Blue Ribbon';
    END IF;
    
    RETURN QUERY SELECT rating_avg, likelihood_avg, combined_score, badge;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update advisor performance metrics
CREATE OR REPLACE FUNCTION update_advisor_performance_metrics()
RETURNS TRIGGER AS $$
DECLARE
    perf_data RECORD;
BEGIN
    -- Get performance data for the advisor
    SELECT * INTO perf_data FROM calculate_advisor_performance(NEW.advisor_id);
    
    -- Update advisor table with new metrics
    UPDATE advisors 
    SET 
        average_session_rating = perf_data.avg_rating,
        average_likelihood_to_recommend = perf_data.avg_likelihood,
        overall_score = perf_data.overall_score,
        badge_level = perf_data.badge_level,
        updated_at = now()
    WHERE id = NEW.advisor_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update advisor metrics when sessions are rated
CREATE OR REPLACE TRIGGER update_advisor_metrics_on_rating
    AFTER INSERT OR UPDATE OF advisor_rating, likelihood_to_recommend
    ON sessions
    FOR EACH ROW
    WHEN (NEW.advisor_rating IS NOT NULL OR NEW.likelihood_to_recommend IS NOT NULL)
    EXECUTE FUNCTION update_advisor_performance_metrics();

-- Enable RLS on new tables
ALTER TABLE advisor_monthly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE advisor_testimonials ENABLE ROW LEVEL SECURITY;

-- RLS policies for advisor monthly reports
CREATE POLICY "Advisors can manage their own monthly reports" ON advisor_monthly_reports
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users u
            JOIN advisors a ON u.id = a.user_id
            WHERE u.auth_user_id = auth.uid() 
            AND a.id = advisor_monthly_reports.advisor_id
        )
    );

CREATE POLICY "Admins can view all monthly reports" ON advisor_monthly_reports
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_user_id = auth.uid() 
            AND role IN ('admin', 'coordinator')
        )
    );

-- RLS policies for advisor testimonials
CREATE POLICY "Advisors can view their own testimonials" ON advisor_testimonials
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users u
            JOIN advisors a ON u.id = a.user_id
            WHERE u.auth_user_id = auth.uid() 
            AND a.id = advisor_testimonials.advisor_id
        )
    );

CREATE POLICY "Founders can create testimonials for their advisors" ON advisor_testimonials
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users u
            JOIN founders f ON u.id = f.user_id
            WHERE u.auth_user_id = auth.uid() 
            AND f.id = advisor_testimonials.founder_id
        )
    );

CREATE POLICY "Admins can manage all testimonials" ON advisor_testimonials
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_user_id = auth.uid() 
            AND role IN ('admin', 'coordinator')
        )
    );
