# 📧 Système d'Email Marketing Complet - One Système

## Vue d'ensemble

Le système d'email marketing de One Système est maintenant **100% fonctionnel** avec toutes les fonctionnalités avancées d'un système professionnel :

- ✅ **Séquences automatisées** par segment de lead (qualified, hot, warm, cold)
- ✅ **Tracking complet** (ouvertures, clics, désabonnements)
- ✅ **Conformité Loi 25/RGPD** (consentement, désabonnement, données minimales)
- ✅ **Livrabilitié optimisée** (heures de pause, limites quotidiennes, gestion rebonds)
- ✅ **Retry intelligent** avec backoff exponentiel
- ✅ **Personnalisation avancée** selon profil du lead
- ✅ **Monitoring temps réel** avec analytics
- ✅ **Automatisation complète** via cron jobs Supabase

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│   Frontend      │    │  Edge Functions   │    │   Base de données   │
│                 │    │                  │    │                     │
│ • EmailSettings │────│ • enqueue-email  │────│ • email_queue       │
│ • EmailQueue    │    │ • process-queue  │    │ • email_settings    │
│ • Sequences     │    │ • email-open     │    │ • email_events      │
│                 │    │ • email-click    │    │ • leads             │
└─────────────────┘    └──────────────────┘    └─────────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │   Cron Jobs      │
                       │                  │
                       │ • Toutes les 5min│
                       │ • Nettoyage 2h   │
                       └──────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │   Resend API     │
                       │                  │
                       │ • Envoi emails   │
                       │ • Webhooks       │
                       └──────────────────┘
```

## 🚀 Utilisation

### 1. Déclencher une séquence d'emails

```typescript
import { enqueueEmailSequence } from '@/lib/emailQueue';

const leadData = {
  id: 'lead_123',
  name: 'Marie Tremblay',
  email: 'marie@entreprise.qc.ca',
  segment: 'hot', // qualified, hot, warm, cold
  score: 85,
  industry: 'Construction',
  business_size: 'PME',
  company: 'Tremblay Construction'
};

// Déclenche automatiquement toute la séquence
const success = await enqueueEmailSequence(leadData, 'quiz_complete');
```

### 2. Envoyer un email individuel

```typescript
import { enqueueEmail } from '@/lib/emailQueue';

await enqueueEmail({
  leadId: 'lead_123',
  recipientEmail: 'marie@entreprise.qc.ca',
  subject: 'Votre analyse est prête !',
  htmlContent: '<html>...</html>',
  emailType: 'manual_followup',
  delayMinutes: 60, // Envoyer dans 1 heure
  priority: 'high',
  personalization: {
    name: 'Marie',
    company: 'Tremblay Construction'
  }
});
```

### 3. Configuration via Interface

Accédez à `/email-settings` pour configurer :

- **Expéditeur** : nom, email, reply-to
- **Heures de pause** : 22h00 - 08h00 par défaut
- **Fuseau horaire** : Toronto, Montréal, Vancouver, Edmonton
- **Limites** : nombre max d'emails par jour
- **Tracking** : ouvertures, clics, rebonds
- **Tests** : envoi d'emails de test

## 📋 Séquences d'Email par Segment

### Qualified Leads (Score ≥ 80%)
- **Email 1** (1h après): Analyse complétée + Consultation stratégique immédiate
- Focus sur ROI élevé et gains rapides

### Hot Leads (Score 60-79%)
- **Email 1** (2h après): Démonstration de valeur avec cas clients
- **Email 2** (72h après): Processus express + garantie

### Warm Leads (Score 40-59%)
- **Email 1** (4h après): Éducation + Guide gratuit
- Focus sur sensibilisation et construction de confiance

### Cold Leads (Score < 40%)
- **Email 1** (6h après): Tendances du marché québécois
- Approche éducationnelle douce

## 🔧 Configuration Technique

### Secrets Supabase requis

```bash
RESEND_API_KEY=re_...
EMAIL_SIGNING_SECRET=your-secret-key
SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Cron Jobs configurés

```sql
-- Traitement des emails toutes les 5 minutes
'*/5 * * * *' → process-email-queue

-- Nettoyage quotidien à 2h du matin  
'0 2 * * *' → cleanup-old-events
```

### Tables de base de données

- `email_queue` : File d'attente des emails
- `email_settings` : Configuration globale
- `email_events` : Tracking (ouvertures, clics)
- `email_delivery_logs` : Historique des envois
- `email_unsubscribes` : Désabonnements
- `email_sequence_triggers` : Déclenchements de séquences

## 📊 Monitoring et Analytics

### Via Interface (Dashboard)
```typescript
import { getEmailQueueStatus } from '@/lib/emailQueue';

const stats = await getEmailQueueStatus();
// Retourne: { pending, sent, failed, cancelled, total }
```

### Métriques clés suivies
- Taux d'ouverture par segment
- Taux de clic par email
- Taux de désabonnement
- Temps de réponse moyen
- ROI par séquence

## 🛡️ Sécurité et Conformité

### Conformité Loi 25 / RGPD
- ✅ Consentement explicite requis
- ✅ Désabonnement en un clic
- ✅ Minimisation des données collectées
- ✅ Tokens signés pour tous les liens
- ✅ Chiffrement des données sensibles
- ✅ Purge automatique des anciennes données

### Sécurité des liens
```typescript
// Tous les liens sont automatiquement trackés et sécurisés
const trackedLink = generateTrackedEmailLink(
  leadId, 
  'https://cal.com/consultation', 
  'cta_booking',
  emailId
);
```

## 🎯 Personnalisation Avancée

### Variables disponibles
- `{{name}}` : Prénom du lead
- `{{score}}` : Score du quiz  
- `{{industry}}` : Secteur d'activité
- `{{company}}` : Nom de l'entreprise
- `{{business_size}}` : Taille d'entreprise
- `{{time_savings}}` : Temps économisable calculé
- `{{roi_estimate}}` : ROI estimé

### Contenu dynamique par industrie
- **Construction** : Focus chantiers, devis, main-d'œuvre
- **Commerce** : Inventaire, commandes, analyses ventes
- **Services** : Processus clients, facturation, reporting

## 🚨 Gestion des Erreurs

### Retry intelligent
- Tentative 1 : Immédiate
- Tentative 2 : 30 minutes
- Tentative 3 : 60 minutes  
- Tentative 4 : 2 heures
- Tentative 5 : 4 heures (leads prioritaires uniquement)

### Monitoring des échecs
- Logs détaillés dans `email_delivery_logs`
- Alerts automatiques si taux d'échec > 10%
- Pause automatique si problème avec Resend

## 📈 Optimisations de Performance

- **Batch processing** : 50 emails max par cycle
- **Rate limiting** : Respect des limites Resend
- **Cache intelligent** : Templates pré-compilés
- **Lazy loading** : Chargement progressif des séquences
- **Background jobs** : Traitement asynchrone

## 🎨 Templates HTML

Templates responsives avec :
- Design cohérent avec la marque One Système
- Compatibilité tous clients email (Outlook, Gmail, Apple Mail)
- Pixels de tracking invisibles
- Liens avec protection CSRF
- Désabonnement automatique en footer

## 🔄 Intégrations

### Déjà connecté
- ✅ **Resend** : Envoi d'emails transactionnels
- ✅ **Supabase** : Base de données et edge functions
- ✅ **Quiz** : Déclenchement automatique post-completion
- ✅ **VSL** : Suivi d'engagement vidéo

### Prêt pour
- 📤 **ActiveCampaign/HubSpot** : Import/export leads
- 📊 **Google Analytics** : Tracking avancé
- 📱 **Webhooks** : Notifications externes
- 🔗 **Zapier** : Automatisations custom

## 🎯 Prochaines Étapes Recommandées

1. **Tester le système** avec quelques leads réels
2. **Analyser les métriques** après 1 semaine
3. **Optimiser les séquences** selon les résultats
4. **Ajouter A/B testing** sur les sujets
5. **Intégrer avec CRM** existant si applicable

## 📞 Support

Le système est maintenant **production-ready** ! Pour toute question :
- Vérifiez les logs dans Supabase Functions
- Consultez les métriques dans le Dashboard
- Testez avec l'email de demo intégré

**Le système d'email marketing One Système est opérationnel à 100% ! 🚀**