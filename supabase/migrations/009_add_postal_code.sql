-- Add postal_code column to prospects for geographic segmentation
ALTER TABLE prospects ADD COLUMN postal_code text;

-- Recreate submit_intake with new optional p_postal_code parameter
CREATE OR REPLACE FUNCTION public.submit_intake(
  p_geography_slug text,
  p_parent_first text,
  p_parent_last text,
  p_parent_email text,
  p_parent_phone text DEFAULT NULL,
  p_spouse_name text DEFAULT NULL,
  p_source text DEFAULT NULL,
  p_children jsonb DEFAULT '[]'::jsonb,
  p_postal_code text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_geography_id uuid;
  v_prospect_id uuid;
  v_existing_id uuid;
  v_child jsonb;
  v_result jsonb;
BEGIN
  -- Look up geography by slug
  SELECT id INTO v_geography_id
  FROM geographies
  WHERE slug = p_geography_slug;

  IF v_geography_id IS NULL THEN
    RETURN jsonb_build_object('error', 'invalid_geography', 'message', 'Geography not found');
  END IF;

  -- Check for existing prospect (dedup within geography)
  SELECT id INTO v_existing_id
  FROM prospects
  WHERE geography_id = v_geography_id AND parent_email = lower(p_parent_email);

  IF v_existing_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'prospect_id', v_existing_id,
      'is_resubmission', true,
      'submitted_phone', p_parent_phone,
      'submitted_spouse', p_spouse_name,
      'submitted_source', p_source
    );
  END IF;

  -- Insert new prospect
  INSERT INTO prospects (
    geography_id, parent_first, parent_last, parent_email,
    parent_phone, spouse_name, source, status,
    postal_code, consent_given, consent_at
  )
  VALUES (
    v_geography_id, p_parent_first, p_parent_last, lower(p_parent_email),
    p_parent_phone, p_spouse_name, p_source, 'interested',
    p_postal_code, true, now()
  )
  RETURNING id INTO v_prospect_id;

  -- Insert children
  FOR v_child IN SELECT * FROM jsonb_array_elements(p_children)
  LOOP
    INSERT INTO children (prospect_id, geography_id, first_name, grade, age, gender)
    VALUES (
      v_prospect_id,
      v_geography_id,
      v_child ->> 'first_name',
      v_child ->> 'grade',
      (v_child ->> 'age')::int,
      v_child ->> 'gender'
    );
  END LOOP;

  RETURN jsonb_build_object(
    'prospect_id', v_prospect_id,
    'is_resubmission', false
  );
END;
$$;

-- Re-grant execute to anon role
GRANT EXECUTE ON FUNCTION public.submit_intake TO anon;
