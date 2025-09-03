import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QuizEventRequest {
  action: 'start' | 'answer' | 'complete';
  data: Record<string, any>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, data }: QuizEventRequest = await req.json();

    let result;

    switch (action) {
      case 'start':
        result = await supabaseClient
          .from('quiz_sessions')
          .insert({
            id: data.session_id,
            started_at: new Date().toISOString(),
            lead_id: data.lead_id,
            utm_source: data.utm_source,
            utm_medium: data.utm_medium,
            utm_campaign: data.utm_campaign,
          });
        break;

      case 'answer':
        result = await supabaseClient
          .from('quiz_answers')
          .insert({
            session_id: data.session_id,
            question_id: data.question_id,
            answer: data.answer,
            answered_at: new Date().toISOString(),
            time_spent: data.time_spent,
          });
        break;

      case 'complete':
        // Update session with completion data
        const sessionResult = await supabaseClient
          .from('quiz_sessions')
          .update({
            completed_at: new Date().toISOString(),
            total_score: data.total_score,
            time_spent: data.time_spent,
          })
          .eq('id', data.session_id);

        // Insert quiz results
        result = await supabaseClient
          .from('quiz_results')
          .insert({
            lead_id: data.lead_id,
            session_id: data.session_id,
            answers: data.answers,
            total_score: data.total_score,
            created_at: new Date().toISOString(),
          });
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    if (result.error) {
      console.error('Database error:', result.error);
      return new Response(
        JSON.stringify({ error: result.error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data: result.data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});