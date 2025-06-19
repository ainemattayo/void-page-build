
-- Create a function to calculate monthly metrics comparison
CREATE OR REPLACE FUNCTION public.calculate_monthly_metrics_comparison()
RETURNS TABLE (
  current_month_founders INTEGER,
  previous_month_founders INTEGER,
  current_month_advisors INTEGER,
  previous_month_advisors INTEGER,
  current_month_sessions INTEGER,
  previous_month_sessions INTEGER,
  current_month_case_studies INTEGER,
  previous_month_case_studies INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH current_month AS (
    SELECT 
      COUNT(DISTINCT f.id)::INTEGER as founders_count,
      COUNT(DISTINCT a.id)::INTEGER as advisors_count,
      COUNT(DISTINCT s.id)::INTEGER as sessions_count,
      COUNT(DISTINCT cs.id)::INTEGER as case_studies_count
    FROM 
      (SELECT id FROM founders WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)) f
    FULL OUTER JOIN 
      (SELECT id FROM advisors WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)) a ON FALSE
    FULL OUTER JOIN 
      (SELECT id FROM sessions WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)) s ON FALSE
    FULL OUTER JOIN 
      (SELECT id FROM case_studies WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)) cs ON FALSE
  ),
  previous_month AS (
    SELECT 
      COUNT(DISTINCT f.id)::INTEGER as founders_count,
      COUNT(DISTINCT a.id)::INTEGER as advisors_count,
      COUNT(DISTINCT s.id)::INTEGER as sessions_count,
      COUNT(DISTINCT cs.id)::INTEGER as case_studies_count
    FROM 
      (SELECT id FROM founders WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')) f
    FULL OUTER JOIN 
      (SELECT id FROM advisors WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')) a ON FALSE
    FULL OUTER JOIN 
      (SELECT id FROM sessions WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')) s ON FALSE
    FULL OUTER JOIN 
      (SELECT id FROM case_studies WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')) cs ON FALSE
  )
  SELECT 
    cm.founders_count,
    pm.founders_count,
    cm.advisors_count,
    pm.advisors_count,
    cm.sessions_count,
    pm.sessions_count,
    cm.case_studies_count,
    pm.case_studies_count
  FROM current_month cm, previous_month pm;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view for easy access to current totals
CREATE OR REPLACE VIEW public.current_platform_totals AS
SELECT 
  COUNT(DISTINCT f.id) as total_active_founders,
  COUNT(DISTINCT a.id) as total_active_advisors,
  COUNT(DISTINCT s.id) FILTER (WHERE DATE_TRUNC('month', s.created_at) = DATE_TRUNC('month', CURRENT_DATE)) as sessions_this_month,
  COUNT(DISTINCT cs.id) FILTER (WHERE cs.status = 'Ready') as case_studies_ready
FROM founders f
FULL OUTER JOIN advisors a ON FALSE
FULL OUTER JOIN sessions s ON FALSE
FULL OUTER JOIN case_studies cs ON FALSE;

-- Update the existing metrics table to store historical data
INSERT INTO metrics (date, active_founders_count, active_advisors_count, sessions_this_month, case_studies_ready)
SELECT 
  CURRENT_DATE,
  (SELECT COUNT(*) FROM founders)::INTEGER,
  (SELECT COUNT(*) FROM advisors)::INTEGER,
  (SELECT COUNT(*) FROM sessions WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE))::INTEGER,
  (SELECT COUNT(*) FROM case_studies WHERE status = 'Ready')::INTEGER
ON CONFLICT (date) DO UPDATE SET
  active_founders_count = EXCLUDED.active_founders_count,
  active_advisors_count = EXCLUDED.active_advisors_count,
  sessions_this_month = EXCLUDED.sessions_this_month,
  case_studies_ready = EXCLUDED.case_studies_ready;
