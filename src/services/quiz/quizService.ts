import { 
  startQuizSession, 
  trackQuizAnswer, 
  completeQuizSession, 
  trackEvent, 
  createLead, 
  sendQuizConfirmationEmail, 
  getLeadId 
} from '@/lib/analytics';
import { quizAnalytics } from '@/lib/analytics/optimized';
import { QUIZ_QUESTIONS } from '@/components/optimized/QuizQuestions';
import { QuizAnswers, ContactInfo, QuizResults } from '@/types/quiz';
import { QUIZ_STORAGE_KEYS, QUIZ_ANALYTICS_EVENTS } from '@/lib/quiz/constants';
import { calculateQuizScore, generateDiagnostic } from '@/lib/quiz/scoring';

export class QuizService {
  static startSession(): void {
    startQuizSession();
  }

  static trackQuestionView(questionIndex: number): void {
    quizAnalytics.trackQuestionView(questionIndex);
  }

  static async trackAnswer(
    questionIndex: number, 
    value: string, 
    timeSpent: number
  ): Promise<void> {
    const question = QUIZ_QUESTIONS[questionIndex];
    const option = question?.options.find(opt => opt.value === value);
    
    if (option) {
      quizAnalytics.trackAnswer(questionIndex, value, timeSpent);
      await trackQuizAnswer(questionIndex + 1, value, option.score, timeSpent);
    }
  }

  static async createLeadFromEmailGate(
    email: string, 
    name: string
  ): Promise<any> {
    return await createLead(email, name, "", 'quiz_mid');
  }

  static async trackEmailGateSubmission(
    name: string, 
    email: string, 
    currentStep: number
  ): Promise<void> {
    await trackEvent(QUIZ_ANALYTICS_EVENTS.EMAIL_GATE_SUBMIT, {
      name,
      email,
      source: 'quiz_mid',
      question_number: currentStep
    });
  }

  static completeSession(
    answers: QuizAnswers, 
    contactInfo: ContactInfo, 
    quizStartTime: number
  ): QuizResults {
    const totalScore = calculateQuizScore(answers);
    const totalTimeSpent = Math.floor((Date.now() - quizStartTime) / 1000);
    const diagnostic = generateDiagnostic(totalScore, answers, contactInfo);

    completeQuizSession(totalScore, totalTimeSpent);

    const results: QuizResults = {
      answers,
      totalScore,
      diagnostic: diagnostic.message,
      contactInfo,
      timeSpent: totalTimeSpent
    };

    // Store results in localStorage
    localStorage.setItem(QUIZ_STORAGE_KEYS.QUIZ_RESULTS, JSON.stringify(results));

    return results;
  }

  static async sendConfirmationEmail(
    results: QuizResults
  ): Promise<boolean> {
    const leadId = getLeadId();
    
    if (!leadId || !results.contactInfo.email) {
      console.warn("Cannot send email: missing leadId or email address");
      return false;
    }

    try {
      await sendQuizConfirmationEmail(
        leadId,
        results.totalScore,
        results.timeSpent,
        results.answers,
        results.diagnostic,
        results.contactInfo
      );
      return true;
    } catch (error) {
      console.error("Failed to send confirmation email:", error);
      return false;
    }
  }

  static trackAbandonment(
    currentStep: number, 
    quizStartTime: number
  ): void {
    if (navigator.sendBeacon) {
      const url = `https://lbwjesrgernvjiorktia.supabase.co/functions/v1/analytics-batch`;
      const payload = JSON.stringify({
        events: [{
          event_type: QUIZ_ANALYTICS_EVENTS.QUIZ_QUESTION_ANSWER,
          event_data: {
            event_type: QUIZ_ANALYTICS_EVENTS.QUIZ_ABANDONED,
            question_number: currentStep,
            time_spent: Date.now() - quizStartTime,
            session_id: localStorage.getItem(QUIZ_STORAGE_KEYS.SESSION_ID),
            page_url: window.location.href,
          },
          lead_id: getLeadId(),
          session_id: localStorage.getItem(QUIZ_STORAGE_KEYS.SESSION_ID),
          created_at: new Date().toISOString(),
        }]
      });
      navigator.sendBeacon(url, payload);
    }
  }
}