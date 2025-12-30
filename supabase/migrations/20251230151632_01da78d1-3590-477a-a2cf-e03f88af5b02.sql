-- Create profiles table for admin users
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (new.id, new.raw_user_meta_data ->> 'full_name', new.email);
  RETURN new;
END;
$$;

-- Trigger for auto creating profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create enum for greeting types
CREATE TYPE public.greeting_type AS ENUM ('formal', 'muslim', 'nasrani', 'hindu', 'ultah');

-- Create enum for salutation types
CREATE TYPE public.salutation_type AS ENUM ('to', 'dear', 'kepada');

-- Create invitations table
CREATE TABLE public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  theme_id INTEGER NOT NULL,
  theme_name TEXT NOT NULL,
  salutation salutation_type DEFAULT 'kepada',
  greeting_type greeting_type DEFAULT 'formal',
  custom_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own invitations"
ON public.invitations FOR ALL
USING (auth.uid() = user_id);

-- Create guests table
CREATE TABLE public.guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID REFERENCES public.invitations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  shared_via TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own guests"
ON public.guests FOR ALL
USING (auth.uid() = user_id);

-- Create greeting templates table with preset messages
CREATE TABLE public.greeting_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type greeting_type NOT NULL,
  template TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.greeting_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view greeting templates"
ON public.greeting_templates FOR SELECT
USING (true);

-- Insert default greeting templates
INSERT INTO public.greeting_templates (type, template) VALUES
('formal', 'Dengan hormat, kami mengundang Bapak/Ibu/Saudara/i {nama} untuk menghadiri acara pernikahan kami.'),
('muslim', 'Assalamualaikum Wr. Wb. Dengan memohon Rahmat dan Ridho Allah SWT, kami mengundang {nama} untuk menghadiri pernikahan kami.'),
('nasrani', 'Salam sejahtera dalam Kasih Kristus. Dengan penuh sukacita, kami mengundang {nama} untuk menghadiri pemberkatan pernikahan kami.'),
('hindu', 'Om Swastiastu. Dengan Anugerah Ida Sang Hyang Widhi Wasa, kami mengundang {nama} untuk menghadiri upacara pernikahan kami.'),
('ultah', 'Hai {nama}! Kamu diundang untuk merayakan hari ulang tahun bersama kami!');

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updating timestamps
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invitations_updated_at
  BEFORE UPDATE ON public.invitations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();