-- ENUM
CREATE TYPE public.video_status AS ENUM ('pending','processing','completed','failed');

-- PROFILES (mirrors auth.users)
CREATE TABLE public.profiles (
  id                        uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                     text,
  full_name                 text,
  avatar_url                text,
  credits                   integer NOT NULL DEFAULT 5,
  lemon_squeezy_customer_id text,
  referrer_id               uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_admin                  BOOLEAN NOT NULL DEFAULT false,
  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz NOT NULL DEFAULT now()
);

-- VIDEOS
CREATE TABLE public.videos (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  prompt       text NOT NULL,
  video_url    text,
  status       public.video_status NOT NULL DEFAULT 'pending',
  duration     integer NOT NULL DEFAULT 15,
  fal_job_id   text,
  script       text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- AUTO-CREATE PROFILE ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own videos"
  ON public.videos FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own videos"
  ON public.videos FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Service role bypass (for webhooks writing video_url etc.)
CREATE POLICY "Service role full access to videos"
  ON public.videos FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to profiles"
  ON public.profiles FOR ALL USING (auth.role() = 'service_role');
