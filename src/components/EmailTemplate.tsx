import React from 'react';
import { 
  useEmailTemplate, 
  generateTrackedEmailLink, 
  generateEmailOpenPixel 
} from '@/hooks/useEmailTemplate';

interface EmailTemplateProps {
  leadName: string;
  leadId: string;
  leadSegment: 'qualified' | 'hot' | 'warm' | 'cold';
  quizScore?: number;
  industry?: string;
  businessSize?: string;
  challenge?: string;
  completedQuiz?: boolean;
  bookedCall?: boolean;
  emailId?: string;
}

export const EmailTemplate: React.FC<EmailTemplateProps> = ({
  leadName,
  leadId,
  leadSegment,
  quizScore,
  industry,
  businessSize,
  challenge,
  completedQuiz = false,
  bookedCall = false,
  emailId = `email_${Date.now()}`
}) => {
  
  // Utiliser le hook pour générer le contenu personnalisé
  const content = useEmailTemplate({
    leadId,
    leadName,
    leadSegment,
    quizScore,
    industry,
    businessSize,
    challenge,
    completedQuiz,
    bookedCall
  });
  
  // Génère le tracking pixel
  const trackingPixel = generateEmailOpenPixel(leadId, emailId);

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      maxWidth: '600px',
      margin: '0 auto',
      backgroundColor: '#ffffff',
      color: '#1a1a1a'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'hsl(220, 70%, 50%)',
        padding: '24px',
        textAlign: 'center' as const
      }}>
        <h1 style={{
          color: '#ffffff',
          fontSize: '18px',
          fontWeight: '600',
          margin: '0'
        }}>
          One Système
        </h1>
        <p style={{
          color: 'hsl(220, 70%, 85%)',
          fontSize: '14px',
          margin: '8px 0 0 0'
        }}>
          Simplifiez. Automatisez. Prospérez.
        </p>
      </div>

      {/* Contenu principal */}
      <div style={{ padding: '32px 24px' }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '700',
          margin: '0 0 16px 0',
          color: 'hsl(220, 70%, 20%)'
        }}>
          {content.headline}
        </h2>

        <p style={{
          fontSize: '16px',
          lineHeight: '1.6',
          margin: '0 0 24px 0',
          color: 'hsl(220, 10%, 30%)'
        }}>
          {content.value}
        </p>

        {/* Section de valeur ajoutée */}
        <div style={{
          backgroundColor: 'hsl(220, 70%, 98%)',
          border: '1px solid hsl(220, 70%, 90%)',
          borderRadius: '8px',
          padding: '20px',
          margin: '24px 0'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            margin: '0 0 12px 0',
            color: 'hsl(220, 70%, 30%)'
          }}>
            💡 Insight exclusif cette semaine
          </h3>
          <p style={{
            fontSize: '15px',
            lineHeight: '1.5',
            margin: '0',
            color: 'hsl(220, 10%, 40%)'
          }}>
            Les entreprises québécoises qui automatisent leurs processus administratifs voient une amélioration moyenne de 340% de leur ROI en 18 mois. La clé ? Commencer par les bonnes automatisations.
          </p>
        </div>

        {/* Call to Action Principal */}
        <div style={{ textAlign: 'center' as const, margin: '32px 0' }}>
          <a
            href={generateTrackedEmailLink(
              leadId, 
              content.cta.url, 
              `email_cta_primary_${leadSegment}`,
              emailId
            )}
            style={{
              backgroundColor: 'hsl(220, 70%, 50%)',
              color: '#ffffff',
              textDecoration: 'none',
              padding: '16px 32px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              display: 'inline-block',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px hsl(220, 70%, 50% / 0.3)'
            }}
          >
            {content.cta.text}
          </a>
        </div>

        {/* CTA secondaire */}
        {content.secondaryCta && (
          <div style={{
            textAlign: 'center' as const,
            margin: '16px 0',
            paddingTop: '16px',
            borderTop: '1px solid hsl(220, 70%, 90%)'
          }}>
            <p style={{
              fontSize: '14px',
              color: 'hsl(220, 10%, 50%)',
              margin: '0 0 12px 0'
            }}>
              Vous préférez une autre option ?
            </p>
            <a
              href={generateTrackedEmailLink(
                leadId, 
                content.secondaryCta.url, 
                `email_cta_secondary_${leadSegment}`,
                emailId
              )}
              style={{
                color: 'hsl(220, 70%, 50%)',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500',
                borderBottom: '1px solid hsl(220, 70%, 50%)'
              }}
            >
              {content.secondaryCta.text}
            </a>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        backgroundColor: 'hsl(220, 10%, 95%)',
        padding: '24px',
        textAlign: 'center' as const,
        borderTop: '1px solid hsl(220, 10%, 85%)'
      }}>
        <p style={{
          fontSize: '12px',
          color: 'hsl(220, 10%, 50%)',
          margin: '0 0 8px 0'
        }}>
          One Système - Solutions d'automatisation pour entreprises québécoises
        </p>
        <p style={{
          fontSize: '12px',
          color: 'hsl(220, 10%, 60%)',
          margin: '0'
        }}>
          <a
            href={generateTrackedEmailLink(
              leadId, 
              `/functions/v1/email-unsubscribe?leadId=${leadId}`, 
              `unsubscribe_${leadId}`,
              emailId
            )}
            style={{ color: 'hsl(220, 10%, 60%)', textDecoration: 'underline' }}
          >
            Se désabonner
          </a>
          {' | '}
          <a
            href={generateTrackedEmailLink(
              leadId, 
              '/privacy', 
              `privacy_${leadSegment}`,
              emailId
            )}
            style={{ color: 'hsl(220, 10%, 60%)', textDecoration: 'underline' }}
          >
            Politique de confidentialité
          </a>
        </p>
      </div>

      {/* Tracking pixel */}
      <img 
        src={trackingPixel} 
        alt="" 
        style={{ width: '1px', height: '1px', display: 'none' }}
      />
    </div>
  );
};

export default EmailTemplate;