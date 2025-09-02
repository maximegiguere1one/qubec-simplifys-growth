import { supabase } from "@/integrations/supabase/client";
import { EmailTemplate, emailSequences } from "./emailSequences";

export interface EmailQueueOptions {
  leadId?: string;
  recipientEmail: string;
  subject: string;
  htmlContent: string;
  emailType: string;
  delayMinutes?: number;
  priority?: 'high' | 'normal' | 'low';
  personalization?: Record<string, any>;
}

export interface LeadData {
  id: string;
  name: string;
  email: string;
  segment: 'qualified' | 'hot' | 'warm' | 'cold';
  score?: number;
  industry?: string;
  business_size?: string;
  company?: string;
}

// Queue a single email
export const enqueueEmail = async (options: EmailQueueOptions): Promise<string | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('enqueue-email', {
      body: options
    });

    if (error) {
      console.error('Error enqueueing email:', error);
      throw error;
    }

    if (data?.success) {
      console.log(`Email enqueued: ${data.email_id}`);
      return data.email_id;
    }

    return null;
  } catch (error) {
    console.error('Failed to enqueue email:', error);
    return null;
  }
};

// Queue an entire email sequence for a lead
export const enqueueEmailSequence = async (
  leadData: LeadData,
  triggerType: 'quiz_complete' | 'vsl_complete' | 'booking_complete' = 'quiz_complete'
): Promise<boolean> => {
  try {
    const sequence = emailSequences[leadData.segment];
    if (!sequence) {
      console.error(`No sequence found for segment: ${leadData.segment}`);
      return false;
    }

    console.log(`Enqueueing sequence "${sequence.name}" for lead ${leadData.email}`);

    // Personalization data
    const personalization = {
      name: leadData.name,
      score: leadData.score || 0,
      industry: leadData.industry || 'votre secteur',
      company_type: leadData.business_size || 'votre entreprise',
      business_size: leadData.business_size || 'moyenne',
      company: leadData.company || 'votre entreprise'
    };

    // Queue each email in the sequence
    const emailIds: (string | null)[] = [];
    
    for (const email of sequence.emails) {
      const emailId = await enqueueEmail({
        leadId: leadData.id,
        recipientEmail: leadData.email,
        subject: email.subject,
        htmlContent: generateEmailHTML(email, leadData),
        emailType: `sequence_${sequence.id}_${email.id}`,
        delayMinutes: email.delay * 60, // Convert hours to minutes
        priority: leadData.segment === 'qualified' ? 'high' : 'normal',
        personalization
      });

      emailIds.push(emailId);
    }

    // Log the sequence trigger
    await supabase.from('email_sequence_triggers').insert({
      lead_id: leadData.id,
      sequence_id: sequence.id,
      triggered_at: new Date().toISOString()
    });

    const successCount = emailIds.filter(id => id !== null).length;
    console.log(`Enqueued ${successCount}/${sequence.emails.length} emails for lead ${leadData.email}`);

    return successCount > 0;
  } catch (error) {
    console.error('Failed to enqueue email sequence:', error);
    return false;
  }
};

// Generate HTML for email template
const generateEmailHTML = (template: EmailTemplate, leadData: LeadData): string => {
  const { name, segment, score, industry, business_size, company } = leadData;
  
  // Basic personalization
  let content = template.content
    .replace(/{{name}}/g, name)
    .replace(/{{score}}/g, String(score || 0))
    .replace(/{{industry}}/g, industry || 'votre secteur')
    .replace(/{{company_type}}/g, business_size || 'votre entreprise')
    .replace(/{{business_size}}/g, business_size || 'moyenne')
    .replace(/{{company}}/g, company || 'votre entreprise');

  // Dynamic values based on segment
  const dynamicValues = getDynamicValues(segment, industry, business_size);
  Object.entries(dynamicValues).forEach(([key, value]) => {
    content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
  });

  // Normalize URLs to ensure absolute links
  content = normalizeEmailUrls(content);

  // Wrap in professional HTML template
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${template.subject}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      
      <!-- Header -->
      <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #4F46E5;">
        <h1 style="color: #4F46E5; margin: 0; font-size: 24px;">One Système</h1>
        <p style="color: #6B7280; margin: 5px 0 0 0; font-size: 14px;">Simplifiez. Automatisez. Prospérez.</p>
      </div>

      <!-- Content -->
      <div style="padding: 30px 0;">
        ${content.split('\n').map(line => {
          if (line.trim().startsWith('•') || line.trim().startsWith('✅') || line.trim().startsWith('→')) {
            return `<p style="margin: 10px 0; padding-left: 20px;">${line.trim()}</p>`;
          }
          if (line.trim().match(/^\d+️⃣/)) {
            return `<h3 style="color: #4F46E5; margin: 20px 0 10px 0;">${line.trim()}</h3>`;
          }
          if (line.trim().startsWith('📊') || line.trim().startsWith('🎯') || line.trim().startsWith('🔍')) {
            return `<h3 style="color: #4F46E5; margin: 20px 0 10px 0;">${line.trim()}</h3>`;
          }
          return line.trim() ? `<p style="margin: 15px 0;">${line.trim()}</p>` : '';
        }).join('')}
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${template.cta.url}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
          ${template.cta.text}
        </a>
      </div>

      <!-- Footer -->
      <div style="border-top: 1px solid #E5E7EB; padding: 20px 0; text-align: center; font-size: 12px; color: #6B7280;">
        <p>One Système - Solutions d'automatisation pour entreprises québécoises</p>
        <p>
          <a href="#" style="color: #6B7280;">Se désabonner</a> | 
          <a href="https://agenceone.ca/" style="color: #6B7280;">Politique de confidentialité</a>
        </p>
      </div>

    </body>
    </html>
  `;
};

// Get dynamic values for personalization
const getDynamicValues = (segment: string, industry?: string, businessSize?: string): Record<string, string> => {
  const values: Record<string, string> = {
    time_savings: '15',
    error_reduction: '70',
    roi_estimate: '340%',
    pain_point_1: 'Gestion manuelle des processus',
    pain_point_2: 'Erreurs de saisie répétitives', 
    pain_point_3: 'Rapports chronophages',
    similar_company: 'PME innovante du Québec',
    similar_industry: industry || 'votre secteur'
  };

  // Adjust based on segment
  if (segment === 'qualified') {
    values.time_savings = '20';
    values.error_reduction = '85';
    values.roi_estimate = '450%';
  } else if (segment === 'hot') {
    values.time_savings = '15';
    values.error_reduction = '70';
  } else if (segment === 'warm') {
    values.time_savings = '12';
    values.error_reduction = '60';
  }

  // Industry-specific adjustments
  if (industry?.toLowerCase().includes('construction')) {
    values.similar_company = 'Entrepreneur en construction du Québec';
    values.pain_point_1 = 'Suivi des projets et devis';
    values.pain_point_2 = 'Gestion de la main-d\'œuvre';
    values.pain_point_3 = 'Facturation et conformité';
  } else if (industry?.toLowerCase().includes('retail') || industry?.toLowerCase().includes('commerce')) {
    values.similar_company = 'Commerce de détail québécois';
    values.pain_point_1 = 'Gestion d\'inventaire';
    values.pain_point_2 = 'Suivi des commandes';
    values.pain_point_3 = 'Analyse des ventes';
  }

  return values;
};

// Normalize URLs in email content to ensure absolute links
const normalizeEmailUrls = (content: string): string => {
  return content
    .replace(/href="\/vsl"/g, 'href="https://systeme.agence1.ca/vsl"')
    .replace(/href="\/quiz"/g, 'href="https://systeme.agence1.ca/quiz"')
    .replace(/href="\/"/g, 'href="https://systeme.agence1.ca/"')
    .replace(/src="\/images\//g, 'src="https://systeme.agence1.ca/images/')
    .replace(/href="\/([^"]+)"/g, 'href="https://systeme.agence1.ca/$1"');
};

// Check email queue status
export const getEmailQueueStatus = async () => {
  try {
    const { data, error } = await supabase
      .from('email_queue')
      .select('status')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (error) throw error;

    const stats = {
      pending: 0,
      sent: 0,
      failed: 0,
      cancelled: 0,
      total: data?.length || 0
    };

    data?.forEach(item => {
      stats[item.status as keyof typeof stats]++;
    });

    return stats;
  } catch (error) {
    console.error('Error getting email queue status:', error);
    return null;
  }
};