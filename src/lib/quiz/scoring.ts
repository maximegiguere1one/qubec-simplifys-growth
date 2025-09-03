import { QuizAnswers, DiagnosticResult, ContactInfo } from '@/types/quiz';
import { QUIZ_QUESTIONS } from '@/components/optimized/QuizQuestions';

export const calculateQuizScore = (answers: QuizAnswers): number => {
  return Object.entries(answers).reduce((sum, [questionId, answerValue]) => {
    const question = QUIZ_QUESTIONS[parseInt(questionId)];
    const option = question.options.find(opt => opt.value === answerValue);
    return sum + (option?.score || 0);
  }, 0);
};

export const generateDiagnostic = (
  score: number, 
  answers: QuizAnswers, 
  contactInfo: ContactInfo
): DiagnosticResult => {
  // Get the main priority from first question
  const firstAnswer = QUIZ_QUESTIONS[0].options.find(opt => opt.value === answers[0]);
  const mainPriority = (firstAnswer as any)?.priority || "Système sur mesure adapté";
  const firstName = contactInfo.name.split(' ')[0];
  
  let message: string;
  let category: DiagnosticResult['category'];
  
  if (score >= 16) {
    category = 'high';
    message = `🎯 PARFAIT ${firstName} ! Votre profil indique que vous avez besoin d'un système vraiment sur mesure. Nous pourrions créer pour vous : ${mainPriority}. Avec votre niveau de complexité actuel, un système personnalisé vous libérerait facilement 15-20 heures par semaine tout en éliminant ces frustrations quotidiennes !`;
  } else if (score >= 12) {
    category = 'excellent';
    message = `✨ EXCELLENT ${firstName} ! Vous êtes un candidat idéal pour du développement sur mesure. Priorité détectée : ${mainPriority}. Un système conçu spécialement pour vos processus vous ferait gagner 10-15 heures par semaine et transformerait votre façon de travailler.`;
  } else if (score >= 8) {
    category = 'good';
    message = `💡 INTÉRESSANT ${firstName} ! Vous pourriez grandement bénéficier d'un système personnalisé. Focus suggéré : ${mainPriority}. Même avec une bonne organisation actuelle, un outil créé exactement pour vos besoins vous donnerait 6-10 heures supplémentaires par semaine.`;
  } else {
    category = 'organized';
    message = `👌 Vous êtes bien organisé ${firstName} ! Mais imaginez un système conçu à 100% pour VOUS. Domaine ciblé : ${mainPriority}. Même les entreprises efficaces gagnent 3-5 heures par semaine avec du sur mesure - et surtout, zéro frustration avec des logiciels qui "ne font pas exactement ce qu'on veut".`;
  }
  
  return { message, score, category };
};