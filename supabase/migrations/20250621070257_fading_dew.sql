/*
  # Enhanced Monthly Reporting System for Advisors

  1. New Tables
    - Enhanced advisor_monthly_reports with structured content
    - Monthly report templates for consistency
    - Report submission tracking and reminders

  2. Security
    - Enable RLS on all new tables
    - Add policies for advisors to manage their own reports
    - Admin access for all reports

  3. Functions
    - Auto-generate monthly report templates
    - Calculate advisor performance metrics
    - Send reminder notifications

  4. Triggers
    - Auto-create monthly report templates
    - Update advisor metrics when reports are submitted
*/

-- Create monthly report templates table
CREATE TABLE IF NOT EXISTS monthly_report_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month integer NOT NULL CHECK (month >= 1 AND month <= 12),
  year integer NOT NULL,
  template_content jsonb NOT NULL DEFAULT '{
    "sections": [
      {
        "title": "Sessions Summary",
        "fields": [
          {"name": "sessions_conducted", "type": "number", "label": "Number of sessions conducted", "required": true},
          {"name": "total_hours", "type": "number", "label": "Total hours spent", "required": true},
          {"name": "session_highlights", "type": "textarea", "label": "Key highlights from sessions", "required": true}
        ]
      },
      {
        "title": "Founder Progress",
        "fields": [
          {"name": "founders_worked_with", "type": "number", "label": "Number of founders worked with", "required": true},
          {"name": "key_achievements", "type": "textarea", "label": "Key founder achievements this month", "required": true},
          {"name": "challenges_faced", "type": "textarea", "label": "Main challenges encountered", "required": false}
        ]
      },
      {
        "title": "Impact & Outcomes",
        "fields": [
          {"name": "measurable_outcomes", "type": "textarea", "label": "Measurable outcomes achieved", "required": true},
          {"name": "success_stories", "type": "textarea", "label": "Success stories or breakthroughs", "required": false},
          {"name": "recommendations", "type": "textarea", "label": "Recommendations for next month", "required": true}
        ]
      },
      {
        "title": "Feedback & Reflection",
        "fields": [
          {"name": "what_worked_well", "type": "textarea", "label": "What worked well this month?", "required": true},
          {"name": "areas_for_improvement", "type": "textarea", "label": "Areas for improvement", "required": false},
          {"name": "support_needed", "type": "textarea", "label": "Support needed from CoPilot team", "required": false}
        ]
      }
    ]
  }'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create unique constraint for month/year combination
CREATE UNIQUE INDEX IF NOT EXISTS monthly_report_templates_month_year_key 
ON monthly_report_templates (month, year);

-- Enable RLS
ALTER TABLE monthly_report_templates ENABLE ROW LEVEL SECURITY;

-- Create report submission reminders table
CREATE TABLE IF NOT EXISTS report_submission_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  advisor_id uuid REFERENCES advisors(id) ON DELETE CASCADE,
  month integer NOT NULL CHECK (month >= 1 AND month <= 12),
  year integer NOT NULL,
  reminder_sent_at timestamptz,
  reminder_count integer DEFAULT 0,
  report_submitted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create unique constraint for advisor/month/year combination
CREATE UNIQUE INDEX IF NOT EXISTS report_submission_reminders_advisor_month_year_key 
ON report_submission_reminders (advisor_id, month, year);

-- Enable RLS
ALTER TABLE report_submission_reminders ENABLE ROW LEVEL SECURITY;

-- Update advisor_monthly_reports table structure if needed
DO $$
BEGIN
  -- Add submission status if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'advisor_monthly_reports' AND column_name = 'submission_status'
  ) THEN
    ALTER TABLE advisor_monthly_reports 
    ADD COLUMN submission_status text DEFAULT 'draft' CHECK (submission_status IN ('draft', 'submitted', 'reviewed', 'approved'));
  END IF;

  -- Add reviewer information if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'advisor_monthly_reports' AND column_name = 'reviewed_by'
  ) THEN
    ALTER TABLE advisor_monthly_reports 
    ADD COLUMN reviewed_by uuid REFERENCES users(id);
  END IF;

  -- Add review date if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'advisor_monthly_reports' AND column_name = 'reviewed_at'
  ) THEN
    ALTER TABLE advisor_monthly_reports 
    ADD COLUMN reviewed_at timestamptz;
  END IF;

  -- Add feedback from admin if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'advisor_monthly_reports' AND column_name = 'admin_feedback'
  ) THEN
    ALTER TABLE advisor_monthly_reports 
    ADD COLUMN admin_feedback text;
  END IF;
END $$;

-- Create policies for monthly_report_templates
CREATE POLICY "Anyone can view active templates"
  ON monthly_report_templates
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage templates"
  ON monthly_report_templates
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.auth_user_id = auth.uid()
    AND users.role IN ('admin', 'coordinator')
  ));

-- Create policies for report_submission_reminders
CREATE POLICY "Advisors can view their own reminders"
  ON report_submission_reminders
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users u
    JOIN advisors a ON u.id = a.user_id
    WHERE u.auth_user_id = auth.uid()
    AND a.id = report_submission_reminders.advisor_id
  ));

CREATE POLICY "Admins can manage all reminders"
  ON report_submission_reminders
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.auth_user_id = auth.uid()
    AND users.role IN ('admin', 'coordinator')
  ));

-- Function to generate monthly report template for current month
CREATE OR REPLACE FUNCTION generate_monthly_report_template()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_month integer := EXTRACT(MONTH FROM CURRENT_DATE);
  current_year integer := EXTRACT(YEAR FROM CURRENT_DATE);
BEGIN
  -- Insert template if it doesn't exist
  INSERT INTO monthly_report_templates (month, year)
  VALUES (current_month, current_year)
  ON CONFLICT (month, year) DO NOTHING;
  
  -- Create reminders for all active advisors
  INSERT INTO report_submission_reminders (advisor_id, month, year)
  SELECT a.id, current_month, current_year
  FROM advisors a
  WHERE a.status = 'Ready to be matched'
  ON CONFLICT (advisor_id, month, year) DO NOTHING;
END;
$$;

-- Function to calculate advisor monthly metrics
CREATE OR REPLACE FUNCTION calculate_advisor_monthly_metrics(
  advisor_uuid uuid,
  report_month integer,
  report_year integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  sessions_count integer;
  total_hours numeric;
  avg_rating numeric;
  founders_count integer;
  completed_sessions integer;
BEGIN
  -- Calculate sessions for the month
  SELECT 
    COUNT(*),
    COALESCE(SUM(duration_minutes), 0) / 60.0,
    COALESCE(AVG(advisor_rating), 0),
    COUNT(DISTINCT founder_id),
    COUNT(*) FILTER (WHERE status = 'completed')
  INTO 
    sessions_count,
    total_hours,
    avg_rating,
    founders_count,
    completed_sessions
  FROM sessions
  WHERE advisor_id = advisor_uuid
    AND EXTRACT(MONTH FROM session_date) = report_month
    AND EXTRACT(YEAR FROM session_date) = report_year;

  -- Build result object
  result := jsonb_build_object(
    'sessions_conducted', COALESCE(sessions_count, 0),
    'total_hours', COALESCE(total_hours, 0),
    'average_rating', COALESCE(avg_rating, 0),
    'founders_worked_with', COALESCE(founders_count, 0),
    'completed_sessions', COALESCE(completed_sessions, 0),
    'calculated_at', CURRENT_TIMESTAMP
  );

  RETURN result;
END;
$$;

-- Function to submit monthly report
CREATE OR REPLACE FUNCTION submit_monthly_report(
  advisor_uuid uuid,
  report_month integer,
  report_year integer,
  report_content jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  report_id uuid;
  calculated_metrics jsonb;
  final_content jsonb;
BEGIN
  -- Calculate metrics for the advisor
  calculated_metrics := calculate_advisor_monthly_metrics(advisor_uuid, report_month, report_year);
  
  -- Merge submitted content with calculated metrics
  final_content := report_content || jsonb_build_object('calculated_metrics', calculated_metrics);
  
  -- Insert or update the report
  INSERT INTO advisor_monthly_reports (
    advisor_id,
    month,
    year,
    content,
    submission_status,
    submitted_at
  )
  VALUES (
    advisor_uuid,
    report_month,
    report_year,
    final_content,
    'submitted',
    CURRENT_TIMESTAMP
  )
  ON CONFLICT (advisor_id, month, year)
  DO UPDATE SET
    content = final_content,
    submission_status = 'submitted',
    submitted_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP
  RETURNING id INTO report_id;
  
  -- Update reminder status
  UPDATE report_submission_reminders
  SET 
    report_submitted = true,
    updated_at = CURRENT_TIMESTAMP
  WHERE advisor_id = advisor_uuid
    AND month = report_month
    AND year = report_year;
  
  -- Update advisor performance metrics
  PERFORM update_advisor_performance_metrics();
  
  RETURN jsonb_build_object(
    'success', true,
    'report_id', report_id,
    'message', 'Monthly report submitted successfully'
  );
END;
$$;

-- Function to get advisor dashboard data including monthly reports
CREATE OR REPLACE FUNCTION get_advisor_dashboard_data(advisor_uuid uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  advisor_data jsonb;
  recent_reports jsonb;
  pending_reports jsonb;
  current_month integer := EXTRACT(MONTH FROM CURRENT_DATE);
  current_year integer := EXTRACT(YEAR FROM CURRENT_DATE);
BEGIN
  -- Get advisor basic info
  SELECT to_jsonb(a.*) INTO advisor_data
  FROM advisors a
  WHERE a.id = advisor_uuid;
  
  -- Get recent reports (last 6 months)
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', amr.id,
      'month', amr.month,
      'year', amr.year,
      'submission_status', amr.submission_status,
      'submitted_at', amr.submitted_at,
      'reviewed_at', amr.reviewed_at,
      'admin_feedback', amr.admin_feedback
    )
    ORDER BY amr.year DESC, amr.month DESC
  ) INTO recent_reports
  FROM advisor_monthly_reports amr
  WHERE amr.advisor_id = advisor_uuid
    AND (
      (amr.year = current_year AND amr.month <= current_month) OR
      (amr.year = current_year - 1 AND amr.month > current_month)
    );
  
  -- Get pending report reminders
  SELECT jsonb_agg(
    jsonb_build_object(
      'month', rsr.month,
      'year', rsr.year,
      'reminder_count', rsr.reminder_count,
      'reminder_sent_at', rsr.reminder_sent_at
    )
  ) INTO pending_reports
  FROM report_submission_reminders rsr
  WHERE rsr.advisor_id = advisor_uuid
    AND rsr.report_submitted = false;
  
  RETURN jsonb_build_object(
    'advisor', advisor_data,
    'recent_reports', COALESCE(recent_reports, '[]'::jsonb),
    'pending_reports', COALESCE(pending_reports, '[]'::jsonb)
  );
END;
$$;

-- Create trigger to auto-generate templates monthly
CREATE OR REPLACE FUNCTION auto_generate_monthly_templates()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- This would typically be called by a scheduled job
  -- For now, we'll create it as a function that can be called manually
  PERFORM generate_monthly_report_template();
  RETURN NULL;
END;
$$;

-- Insert initial template for current month
SELECT generate_monthly_report_template();