import { throttle } from 'lodash-es';
import { trackEvent, getABVariant } from '@/lib/analytics';

// Throttled analytics functions to prevent excessive API calls
export const throttledTrackEvent = throttle(trackEvent, 1000, { 
  leading: true, 
  trailing: false 
});

// Meta Pixel tracking will be handled directly in components as needed

// Batched analytics for quiz interactions
interface QuizAnalytics {
  questionViews: Set<number>;
  answers: Map<number, { value: string; timeSpent: number }>;
  abTests: Map<string, string>;
}

class QuizAnalyticsManager {
  private analytics: QuizAnalytics = {
    questionViews: new Set(),
    answers: new Map(),
    abTests: new Map()
  };

  trackQuestionView(questionIndex: number) {
    if (!this.analytics.questionViews.has(questionIndex)) {
      this.analytics.questionViews.add(questionIndex);
      throttledTrackEvent('quiz_start', {
        event_type: 'question_view',
        question_index: questionIndex,
        total_viewed: this.analytics.questionViews.size
      });
    }
  }

  trackAnswer(questionIndex: number, value: string, timeSpent: number) {
    this.analytics.answers.set(questionIndex, { value, timeSpent });
    
    // Only track significant answers (not immediate clicks)
    if (timeSpent >= 3) {
      throttledTrackEvent('quiz_question_answer', {
        question_index: questionIndex,
        answer_value: value,
        time_spent: timeSpent,
        answers_count: this.analytics.answers.size
      });
    }
  }

  trackABTestAssignment(testName: string, variant: string) {
    if (!this.analytics.abTests.has(testName)) {
      this.analytics.abTests.set(testName, variant);
      throttledTrackEvent('quiz_start', {
        event_type: 'ab_test_assignment',
        test_name: testName,
        variant,
        user_segment: this.getUserSegment()
      });
    }
  }

  trackABTestConversion(testName: string, variant: string, action: string) {
    throttledTrackEvent('ab_test_conversion', {
      test_name: testName,
      variant,
      action,
      user_segment: this.getUserSegment()
    });
  }

  private getUserSegment(): string {
    const answersCount = this.analytics.answers.size;
    if (answersCount >= 4) return 'engaged';
    if (answersCount >= 2) return 'interested';
    return 'early';
  }

  flush() {
    // Force flush any pending analytics
    console.log('Flushing quiz analytics');
  }

  reset() {
    this.analytics = {
      questionViews: new Set(),
      answers: new Map(),
      abTests: new Map()
    };
  }
}

export const quizAnalytics = new QuizAnalyticsManager();

// Optimized A/B test hook with caching - export fix
const abTestCache = new Map<string, string>();

export const getCachedABVariant = (testName: string, variants: string[]): string => {
  if (abTestCache.has(testName)) {
    return abTestCache.get(testName)!;
  }
  
  const variant = getABVariant(testName, variants);
  abTestCache.set(testName, variant);
  quizAnalytics.trackABTestAssignment(testName, variant);
  
  return variant;
};

// Clean up cache periodically
setInterval(() => {
  abTestCache.clear();
}, 30 * 60 * 1000); // Clear every 30 minutes