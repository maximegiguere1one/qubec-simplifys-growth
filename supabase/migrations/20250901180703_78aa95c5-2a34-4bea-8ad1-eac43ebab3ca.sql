-- Enhanced Lead Management Schema
-- 1) Add new columns to leads table
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS lifecycle_stage text DEFAULT 'new' CHECK (lifecycle_stage IN ('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost')),
ADD COLUMN IF NOT EXISTS owner_user_id uuid REFERENCES public.profiles(user_id),
ADD COLUMN IF NOT EXISTS last_activity_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS next_follow_up_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS lead_value numeric(10,2),
ADD COLUMN IF NOT EXISTS conversion_probability integer DEFAULT 0 CHECK (conversion_probability >= 0 AND conversion_probability <= 100),
ADD COLUMN IF NOT EXISTS priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
ADD COLUMN IF NOT EXISTS lead_quality text DEFAULT 'unqualified' CHECK (lead_quality IN ('unqualified', 'marketing_qualified', 'sales_qualified', 'opportunity'));

-- 2) Create lead_notes table
CREATE TABLE IF NOT EXISTS public.lead_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  author_user_id uuid NOT NULL REFERENCES public.profiles(user_id),
  content text NOT NULL,
  note_type text DEFAULT 'general' CHECK (note_type IN ('general', 'call', 'email', 'meeting', 'follow_up')),
  is_pinned boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 3) Create lead_tasks table  
CREATE TABLE IF NOT EXISTS public.lead_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  assigned_to_user_id uuid NOT NULL REFERENCES public.profiles(user_id),
  created_by_user_id uuid NOT NULL REFERENCES public.profiles(user_id),
  title text NOT NULL,
  description text,
  task_type text DEFAULT 'follow_up' CHECK (task_type IN ('follow_up', 'call', 'email', 'meeting', 'demo', 'proposal')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  due_date timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 4) Create lead_tags table
CREATE TABLE IF NOT EXISTS public.lead_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  color text DEFAULT '#3b82f6',
  description text,
  created_at timestamp with time zone DEFAULT now()
);

-- 5) Create lead_tag_assignments table (many-to-many)
CREATE TABLE IF NOT EXISTS public.lead_tag_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.lead_tags(id) ON DELETE CASCADE,
  assigned_at timestamp with time zone DEFAULT now(),
  UNIQUE(lead_id, tag_id)
);

-- 6) Create saved_lead_views table
CREATE TABLE IF NOT EXISTS public.saved_lead_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(user_id),
  name text NOT NULL,
  filters jsonb DEFAULT '{}',
  is_default boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 7) Enable RLS on all new tables
ALTER TABLE public.lead_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_tag_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_lead_views ENABLE ROW LEVEL SECURITY;

-- 8) Create RLS policies for lead_notes
CREATE POLICY "Service role can manage lead notes" ON public.lead_notes
FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Users can view notes for accessible leads" ON public.lead_notes
FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- 9) Create RLS policies for lead_tasks
CREATE POLICY "Service role can manage lead tasks" ON public.lead_tasks
FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Users can view tasks for accessible leads" ON public.lead_tasks
FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- 10) Create RLS policies for lead_tags
CREATE POLICY "Service role can manage lead tags" ON public.lead_tags
FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view lead tags" ON public.lead_tags
FOR SELECT TO authenticated USING (true);

-- 11) Create RLS policies for lead_tag_assignments
CREATE POLICY "Service role can manage lead tag assignments" ON public.lead_tag_assignments
FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Users can view tag assignments for accessible leads" ON public.lead_tag_assignments
FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- 12) Create RLS policies for saved_lead_views
CREATE POLICY "Service role can manage saved views" ON public.saved_lead_views
FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Users can manage their own saved views" ON public.saved_lead_views
FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 13) Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_lifecycle_stage ON public.leads(lifecycle_stage);
CREATE INDEX IF NOT EXISTS idx_leads_owner_user_id ON public.leads(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_leads_priority ON public.leads(priority);
CREATE INDEX IF NOT EXISTS idx_leads_last_activity_at ON public.leads(last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_next_follow_up_at ON public.leads(next_follow_up_at);

CREATE INDEX IF NOT EXISTS idx_lead_notes_lead_id ON public.lead_notes(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_notes_created_at ON public.lead_notes(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_lead_tasks_lead_id ON public.lead_tasks(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_tasks_assigned_to ON public.lead_tasks(assigned_to_user_id);
CREATE INDEX IF NOT EXISTS idx_lead_tasks_due_date ON public.lead_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_lead_tasks_status ON public.lead_tasks(status);

CREATE INDEX IF NOT EXISTS idx_lead_tag_assignments_lead_id ON public.lead_tag_assignments(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_tag_assignments_tag_id ON public.lead_tag_assignments(tag_id);

-- 14) Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_lead_notes_updated_at BEFORE UPDATE ON public.lead_notes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lead_tasks_updated_at BEFORE UPDATE ON public.lead_tasks
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_saved_lead_views_updated_at BEFORE UPDATE ON public.saved_lead_views
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 15) Insert some default tags
INSERT INTO public.lead_tags (name, color, description) VALUES
('Hot Prospect', '#ef4444', 'High-priority leads ready to convert'),
('Cold Lead', '#6b7280', 'Leads requiring nurturing'),
('Enterprise', '#8b5cf6', 'Large business prospects'),
('SMB', '#06b6d4', 'Small to medium business leads'),
('Quebec', '#10b981', 'Leads from Quebec region'),
('Follow-up Required', '#f59e0b', 'Needs immediate follow-up')
ON CONFLICT (name) DO NOTHING;