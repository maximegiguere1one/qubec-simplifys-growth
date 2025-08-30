-- Create enum types for better data integrity
CREATE TYPE public.quiz_session_status AS ENUM ('started', 'completed', 'abandoned');
CREATE TYPE public.booking_status AS ENUM ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show');
CREATE TYPE public.funnel_event_type AS ENUM ('lp_view', 'lp_submit_optin', 'quiz_start', 'quiz_question_answer', 'quiz_complete', 'vsl_view', 'vsl_play', 'vsl_cta_click', 'bookcall_view', 'bookcall_submit', 'bookcall_confirm');

-- Leads table for capturing initial user data
CREATE TABLE public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    source TEXT DEFAULT 'landing_page',
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Quiz sessions for tracking quiz completion
CREATE TABLE public.quiz_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL, -- browser session identifier
    status quiz_session_status NOT NULL DEFAULT 'started',
    total_score INTEGER,
    time_spent_seconds INTEGER,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    abandoned_at TIMESTAMP WITH TIME ZONE
);

-- Individual quiz answers for detailed analysis
CREATE TABLE public.quiz_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_session_id UUID REFERENCES public.quiz_sessions(id) ON DELETE CASCADE NOT NULL,
    question_id INTEGER NOT NULL,
    answer_value TEXT NOT NULL,
    answer_score INTEGER NOT NULL,
    time_spent_seconds INTEGER,
    answered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Bookings table for consultation requests
CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    company TEXT,
    challenge TEXT,
    selected_date DATE NOT NULL,
    selected_time TIME NOT NULL,
    timezone TEXT DEFAULT 'America/Toronto',
    status booking_status NOT NULL DEFAULT 'scheduled',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Funnel events for detailed user journey tracking
CREATE TABLE public.funnel_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    event_type funnel_event_type NOT NULL,
    event_data JSONB DEFAULT '{}',
    page_url TEXT,
    referrer TEXT,
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funnel_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public access (since this is lead gen, not user-specific)
CREATE POLICY "Allow all operations on leads" ON public.leads FOR ALL USING (true);
CREATE POLICY "Allow all operations on quiz_sessions" ON public.quiz_sessions FOR ALL USING (true);
CREATE POLICY "Allow all operations on quiz_answers" ON public.quiz_answers FOR ALL USING (true);
CREATE POLICY "Allow all operations on bookings" ON public.bookings FOR ALL USING (true);
CREATE POLICY "Allow all operations on funnel_events" ON public.funnel_events FOR ALL USING (true);

-- Indexes for performance
CREATE INDEX idx_leads_email ON public.leads(email);
CREATE INDEX idx_leads_created_at ON public.leads(created_at);
CREATE INDEX idx_quiz_sessions_lead_id ON public.quiz_sessions(lead_id);
CREATE INDEX idx_quiz_sessions_session_id ON public.quiz_sessions(session_id);
CREATE INDEX idx_quiz_answers_quiz_session_id ON public.quiz_answers(quiz_session_id);
CREATE INDEX idx_bookings_lead_id ON public.bookings(lead_id);
CREATE INDEX idx_bookings_selected_date ON public.bookings(selected_date);
CREATE INDEX idx_funnel_events_session_id ON public.funnel_events(session_id);
CREATE INDEX idx_funnel_events_event_type ON public.funnel_events(event_type);
CREATE INDEX idx_funnel_events_created_at ON public.funnel_events(created_at);

-- Trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update trigger to leads table
CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON public.leads
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();