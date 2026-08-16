CREATE TABLE public.celestial_objects (
  id text PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL,
  parent_id text REFERENCES public.celestial_objects(id),
  route_category text NOT NULL,
  route_order int NOT NULL,
  branch_order int NOT NULL DEFAULT 0,
  real_distance_from_sun numeric NOT NULL,
  distance_unit text NOT NULL DEFAULT 'AU',
  diameter text,
  orbital_period text,
  temperature text,
  description text,
  facts jsonb NOT NULL DEFAULT '[]'::jsonb,
  journey_index int NOT NULL,
  image_url text,
  image_source text,
  source_url text,
  attribution text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.celestial_objects TO anon, authenticated;
GRANT ALL ON public.celestial_objects TO service_role;
ALTER TABLE public.celestial_objects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Celestial objects are public" ON public.celestial_objects FOR SELECT USING (true);

CREATE TABLE public.journey_segments (
  id text PRIMARY KEY,
  start_object_id text NOT NULL REFERENCES public.celestial_objects(id),
  destination_object_id text NOT NULL REFERENCES public.celestial_objects(id),
  required_focus_minutes int NOT NULL,
  visual_start_position numeric NOT NULL,
  visual_end_position numeric NOT NULL,
  segment_order int NOT NULL,
  active boolean NOT NULL DEFAULT true
);
GRANT SELECT ON public.journey_segments TO anon, authenticated;
GRANT ALL ON public.journey_segments TO service_role;
ALTER TABLE public.journey_segments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Journey segments are public" ON public.journey_segments FOR SELECT USING (true);

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT 'Astronaut',
  gender text NOT NULL DEFAULT 'unspecified',
  avatar text NOT NULL DEFAULT 'astronaut_male',
  onboarded boolean NOT NULL DEFAULT false,
  xp int NOT NULL DEFAULT 0,
  level int NOT NULL DEFAULT 1,
  rank text NOT NULL DEFAULT 'Cadet',
  total_focus_minutes numeric NOT NULL DEFAULT 0,
  completed_sessions int NOT NULL DEFAULT 0,
  current_streak int NOT NULL DEFAULT 0,
  longest_streak int NOT NULL DEFAULT 0,
  last_focus_date date,
  leaderboard_visible boolean NOT NULL DEFAULT true,
  sound_enabled boolean NOT NULL DEFAULT true,
  break_beep_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Leaderboard profiles readable" ON public.profiles FOR SELECT TO authenticated USING (leaderboard_visible = true);
CREATE POLICY "Own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.user_journey (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_object_id text NOT NULL REFERENCES public.celestial_objects(id) DEFAULT 'sun',
  current_segment_id text REFERENCES public.journey_segments(id) DEFAULT 'seg_sun__mercury',
  segment_progress numeric NOT NULL DEFAULT 0,
  segment_focus_minutes numeric NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.user_journey TO authenticated;
GRANT ALL ON public.user_journey TO service_role;
ALTER TABLE public.user_journey ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own journey read" ON public.user_journey FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own journey insert" ON public.user_journey FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own journey update" ON public.user_journey FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.discoveries (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  object_id text NOT NULL REFERENCES public.celestial_objects(id),
  discovered_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, object_id)
);
GRANT SELECT, INSERT ON public.discoveries TO authenticated;
GRANT ALL ON public.discoveries TO service_role;
ALTER TABLE public.discoveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own discoveries read" ON public.discoveries FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own discoveries insert" ON public.discoveries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.focus_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  method text NOT NULL,
  planned_duration int,
  actual_duration numeric NOT NULL DEFAULT 0,
  start_time timestamptz NOT NULL DEFAULT now(),
  end_time timestamptz,
  status text NOT NULL DEFAULT 'running',
  paused_duration numeric NOT NULL DEFAULT 0,
  paused_at timestamptz,
  segment_id text REFERENCES public.journey_segments(id),
  starting_progress numeric NOT NULL DEFAULT 0,
  ending_progress numeric NOT NULL DEFAULT 0,
  xp_earned int NOT NULL DEFAULT 0,
  destination_reached boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX focus_sessions_user_idx ON public.focus_sessions(user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE ON public.focus_sessions TO authenticated;
GRANT ALL ON public.focus_sessions TO service_role;
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own sessions read" ON public.focus_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own sessions insert" ON public.focus_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own sessions update" ON public.focus_sessions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1), 'Astronaut'))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_journey (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.discoveries (user_id, object_id) VALUES (NEW.id, 'sun') ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.weekly_leaderboard()
RETURNS TABLE (user_id uuid, display_name text, avatar text, level int, rank text, weekly_minutes numeric, weekly_xp bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.id, p.display_name, p.avatar, p.level, p.rank,
         COALESCE(SUM(s.actual_duration), 0) AS weekly_minutes,
         COALESCE(SUM(s.xp_earned), 0)::bigint AS weekly_xp
  FROM public.profiles p
  JOIN public.focus_sessions s ON s.user_id = p.id
   AND s.created_at >= date_trunc('week', now())
   AND s.status IN ('completed','ended_early')
  WHERE p.leaderboard_visible = true
  GROUP BY p.id
  HAVING COALESCE(SUM(s.actual_duration),0) > 0
  ORDER BY weekly_xp DESC
  LIMIT 100;
$$;
GRANT EXECUTE ON FUNCTION public.weekly_leaderboard() TO authenticated;