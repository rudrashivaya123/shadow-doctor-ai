
-- Create patients table
CREATE TABLE public.patients (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  age integer,
  gender text,
  phone text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- RLS policies for patients
CREATE POLICY "Doctors can view own patients" ON public.patients FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Doctors can insert own patients" ON public.patients FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Doctors can update own patients" ON public.patients FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Doctors can delete own patients" ON public.patients FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Add patient_id to consultations (nullable for backward compat)
ALTER TABLE public.consultations ADD COLUMN patient_id uuid REFERENCES public.patients(id) ON DELETE SET NULL;

-- Add consultation_mode column
ALTER TABLE public.consultations ADD COLUMN mode text NOT NULL DEFAULT 'text';
