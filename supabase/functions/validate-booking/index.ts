import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BookingRequest {
  name: string;
  email: string;
  phone: string;
  company?: string;
  challenge?: string;
  selectedDate: string;
  selectedTime: string;
  timezone: string;
  sessionId: string;
  leadId?: string;
  honeypot?: string;
}

const VALID_TIMEZONES = [
  'America/Toronto',
  'America/Montreal', 
  'America/Vancouver',
  'America/Edmonton'
];

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body: BookingRequest = await req.json();
    const clientIP = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';

    // 1. Honeypot detection
    if (body.honeypot && body.honeypot.trim().length > 0) {
      console.log('Honeypot detected from IP:', clientIP);
      return new Response(
        JSON.stringify({ error: 'Invalid submission' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Rate limiting check for bookings
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const { count: recentBookings } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', oneHourAgo.toISOString())
      .eq('email', body.email);

    if (recentBookings && recentBookings >= 3) {
      console.log('Booking rate limit exceeded for email:', body.email);
      return new Response(
        JSON.stringify({ error: 'Too many booking attempts' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Comprehensive input validation
    const errors: string[] = [];
    
    if (!body.name || body.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters');
    }
    
    if (!body.email || !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(body.email)) {
      errors.push('Valid email is required');
    }
    
    if (!body.phone || body.phone.length < 10) {
      errors.push('Phone number must be at least 10 digits');
    }

    if (!body.sessionId || !/^sess_\d+_[a-zA-Z0-9]{9}$/.test(body.sessionId)) {
      errors.push('Invalid session ID');
    }

    if (!VALID_TIMEZONES.includes(body.timezone)) {
      errors.push('Invalid timezone');
    }

    // 4. Date/time validation
    const bookingDate = new Date(body.selectedDate);
    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 90);

    if (isNaN(bookingDate.getTime()) || bookingDate < today || bookingDate > maxDate) {
      errors.push('Booking date must be between today and 90 days from now');
    }

    if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(body.selectedTime)) {
      errors.push('Invalid time format');
    }

    if (errors.length > 0) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 5. Check for existing booking conflicts
    const { data: existingBookings } = await supabase
      .from('bookings')
      .select('id')
      .eq('selected_date', body.selectedDate)
      .eq('selected_time', body.selectedTime)
      .eq('status', 'scheduled');

    if (existingBookings && existingBookings.length > 0) {
      return new Response(
        JSON.stringify({ error: 'Time slot already booked' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 6. Create booking with enriched data
    const bookingData = {
      session_id: body.sessionId,
      name: body.name.trim(),
      email: body.email.toLowerCase().trim(),
      phone: body.phone.trim(),
      company: body.company?.trim(),
      challenge: body.challenge?.trim(),
      selected_date: body.selectedDate,
      selected_time: body.selectedTime,
      timezone: body.timezone,
      status: 'scheduled' as const,
      lead_id: body.leadId,
    };

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();

    if (bookingError) {
      console.error('Database error creating booking:', bookingError);
      return new Response(
        JSON.stringify({ error: 'Failed to create booking' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 7. Log booking submission event
    await supabase.from('funnel_events').insert({
      session_id: body.sessionId,
      event_type: 'bookcall_submit',
      event_data: {
        booking_id: booking.id,
        lead_id: body.leadId,
        selected_date: body.selectedDate,
        selected_time: body.selectedTime,
        timezone: body.timezone,
        validated: true,
        ip_address: clientIP,
      },
      lead_id: body.leadId,
      ip_address: clientIP,
      page_url: req.headers.get('referer'),
      user_agent: req.headers.get('user-agent'),
    });

    // 8. Send confirmation email if we have the function
    try {
      await supabase.functions.invoke('send-booking-confirmation', {
        body: {
          bookingId: booking.id,
          email: booking.email,
          name: booking.name,
          selectedDate: booking.selected_date,
          selectedTime: booking.selected_time,
          timezone: booking.timezone,
        }
      });
    } catch (emailError) {
      console.warn('Failed to send booking confirmation email:', emailError);
      // Don't fail the booking if email fails
    }

    console.log('Booking created successfully:', { 
      bookingId: booking.id, 
      email: booking.email,
      date: booking.selected_date,
      time: booking.selected_time
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        bookingId: booking.id,
        message: 'Booking created successfully',
        confirmationSent: true
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Error in validate-booking function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
};

serve(handler);