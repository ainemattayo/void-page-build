
-- Create application_submissions table to store form data before approval
CREATE TABLE public.application_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  application_type TEXT NOT NULL CHECK (application_type IN ('founder', 'advisor')),
  form_data JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on application_submissions
ALTER TABLE public.application_submissions ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to view all applications
CREATE POLICY "Admins can view all applications" 
  ON public.application_submissions 
  FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_user_id = auth.uid() 
      AND role IN ('admin', 'coordinator')
    )
  );

-- Create policy for admins to update applications
CREATE POLICY "Admins can update applications" 
  ON public.application_submissions 
  FOR UPDATE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_user_id = auth.uid() 
      AND role IN ('admin', 'coordinator')
    )
  );

-- Create policy to allow public insert for new applications
CREATE POLICY "Anyone can submit applications" 
  ON public.application_submissions 
  FOR INSERT 
  TO anon 
  WITH CHECK (true);

-- Update founders table to reference application_submissions
ALTER TABLE public.founders ADD COLUMN application_id UUID REFERENCES public.application_submissions(id);

-- Update advisors table to reference application_submissions  
ALTER TABLE public.advisors ADD COLUMN application_id UUID REFERENCES public.application_submissions(id);

-- Create function to handle application approval
CREATE OR REPLACE FUNCTION public.approve_application(
  application_id UUID,
  reviewer_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  app_record RECORD;
  new_user_id UUID;
  result JSONB;
BEGIN
  -- Get the application
  SELECT * INTO app_record 
  FROM public.application_submissions 
  WHERE id = application_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Application not found or already processed');
  END IF;
  
  -- Create user record
  INSERT INTO public.users (email, full_name, role, status)
  VALUES (
    app_record.email,
    app_record.full_name,
    app_record.application_type,
    'pending_activation'
  )
  RETURNING id INTO new_user_id;
  
  -- Create founder or advisor record based on type
  IF app_record.application_type = 'founder' THEN
    INSERT INTO public.founders (
      user_id,
      application_id,
      full_name,
      email,
      startup_name,
      website,
      stage,
      location_city,
      location_country,
      sector,
      team_size,
      revenue_last_12_months,
      top_bottleneck
    ) VALUES (
      new_user_id,
      application_id,
      app_record.full_name,
      app_record.email,
      app_record.form_data->>'startupName',
      app_record.form_data->>'website',
      app_record.form_data->>'stage',
      SPLIT_PART(app_record.form_data->>'location', ',', 1),
      TRIM(SPLIT_PART(app_record.form_data->>'location', ',', 2)),
      'Technology', -- Default sector
      COALESCE((app_record.form_data->>'teamSize')::INTEGER, 1),
      COALESCE((app_record.form_data->>'revenue')::NUMERIC, 0),
      app_record.form_data->>'challenge'
    );
  ELSIF app_record.application_type = 'advisor' THEN
    INSERT INTO public.advisors (
      user_id,
      application_id,
      full_name,
      email,
      linkedin_url,
      location_city,
      location_country,
      timezone,
      expertise_areas,
      notes
    ) VALUES (
      new_user_id,
      application_id,
      app_record.full_name,
      app_record.email,
      app_record.form_data->>'linkedin',
      SPLIT_PART(app_record.form_data->>'location', ',', 1),
      TRIM(SPLIT_PART(app_record.form_data->>'location', ',', 2)),
      app_record.form_data->>'timezone',
      CASE 
        WHEN app_record.form_data ? 'expertise' THEN 
          ARRAY(SELECT jsonb_array_elements_text(app_record.form_data->'expertise'))
        ELSE ARRAY[]::TEXT[]
      END,
      app_record.form_data->>'experience'
    );
  END IF;
  
  -- Update application status
  UPDATE public.application_submissions 
  SET 
    status = 'approved',
    reviewed_by = reviewer_id,
    reviewed_at = now(),
    updated_at = now()
  WHERE id = application_id;
  
  RETURN jsonb_build_object(
    'success', true, 
    'user_id', new_user_id,
    'message', 'Application approved successfully'
  );
END;
$$;

-- Create function to reject application
CREATE OR REPLACE FUNCTION public.reject_application(
  application_id UUID,
  reviewer_id UUID,
  reason TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.application_submissions 
  SET 
    status = 'rejected',
    reviewed_by = reviewer_id,
    reviewed_at = now(),
    rejection_reason = reason,
    updated_at = now()
  WHERE id = application_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Application not found or already processed');
  END IF;
  
  RETURN jsonb_build_object('success', true, 'message', 'Application rejected');
END;
$$;
