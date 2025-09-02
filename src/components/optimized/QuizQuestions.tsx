import React, { memo } from 'react';

// Extracted static questions data to prevent re-creation on every render
export const QUIZ_QUESTIONS = [
  {
    id: 1,
    emoji: "😤",
    question: "En ce moment, qu'est-ce qui te fait perdre le plus de temps dans ton quotidien d'entrepreneur ?",
    subtitle: "Question 1 sur 5 - Identifions ton plus gros défi",
    options: [
      { value: "inventory", emoji: "📦", label: "Compter mon inventaire et suivre mes stocks", score: 25, priority: "Gestion d'inventaire" },
      { value: "billing", emoji: "💰", label: "Faire mes factures et tenir mes livres à jour", score: 20, priority: "Facturation" },
      { value: "hr", emoji: "👥", label: "Gérer les horaires et calculer la paie", score: 15, priority: "Gestion des employés" },
      { value: "projects", emoji: "📋", label: "Suivre mes projets et respecter mes échéances", score: 20, priority: "Suivi de projets" },
      { value: "crm", emoji: "📞", label: "Tenir à jour mes contacts et suivre mes clients", score: 25, priority: "Gestion clients" }
    ]
  },
  {
    id: 2,
    emoji: "⏰",
    question: "Quand tu penses aux heures que tu passes dans la paperasse chaque semaine, que ressens-tu ?",
    subtitle: "Question 2 sur 5 - Quantifions le temps perdu",
    options: [
      { value: "low", emoji: "😊", label: "Moins de 5 heures - c'est gérable", score: 5 },
      { value: "medium", emoji: "😐", label: "5 à 15 heures - ça commence à peser", score: 15 },
      { value: "high", emoji: "😩", label: "15 à 25 heures - c'est vraiment trop", score: 25 },
      { value: "very_high", emoji: "🤬", label: "Plus de 25 heures - j'en ai assez !", score: 35 }
    ]
  },
  {
    id: 3,
    emoji: "💭",
    question: "As-tu déjà pensé : 'Si seulement il existait un outil qui faisait exactement ce dont j'ai besoin' ?",
    subtitle: "Question 3 sur 5 - Évaluons ton besoin de solution personnalisée",
    options: [
      { value: "never", emoji: "👌", label: "Non, mes outils actuels me conviennent", score: 1 },
      { value: "sometimes", emoji: "🤔", label: "Oui, de temps en temps", score: 2 },
      { value: "often", emoji: "😤", label: "Oui, assez souvent même !", score: 3 },
      { value: "constantly", emoji: "😡", label: "Tout le temps ! C'est frustrant", score: 4 }
    ]
  },
  {
    id: 4,
    emoji: "🎯",
    question: "Si quelqu'un pouvait créer pour toi l'outil parfait adapté à ton entreprise, comment réagirais-tu ?",
    subtitle: "Question 4 sur 5 - Mesurons ton intérêt pour une solution personnalisée",
    options: [
      { value: "skeptical", emoji: "🤨", label: "Je serais prudent, ça semble trop beau", score: 1 },
      { value: "interested", emoji: "🙂", label: "Ça m'intéresserait vraiment", score: 2 },
      { value: "excited", emoji: "🤩", label: "Je serais très enthousiaste !", score: 3 },
      { value: "dream", emoji: "🚀", label: "Ce serait un rêve qui se réalise !", score: 4 }
    ]
  },
  {
    id: 5,
    emoji: "✨",
    question: "Quel type de solution transformerait le plus ta façon de travailler ?",
    subtitle: "Question 5 sur 5 - Définissons ta solution idéale",
    options: [
      { value: "automation", emoji: "🤖", label: "Que tout se fasse automatiquement", score: 2, type: "Système d'automatisation" },
      { value: "integration", emoji: "🔗", label: "Avoir tous mes outils dans un seul endroit", score: 3, type: "Plateforme intégrée" },
      { value: "custom", emoji: "🎨", label: "Quelque chose conçu spécifiquement pour moi", score: 4, type: "Solution sur mesure complète" },
      { value: "mobile", emoji: "📱", label: "Pouvoir tout gérer depuis mon téléphone", score: 3, type: "Application mobile personnalisée" }
    ]
  }
] as const;

// Memoized question option component to prevent unnecessary re-renders
interface QuestionOptionProps {
  option: any;
  isSelected: boolean;
  isCurrentSelection: boolean;
  showFeedback: boolean;
  touchTargetClass: string;
  animationClass: string;
  onSelect: (value: string) => void;
}

export const QuestionOption = memo<QuestionOptionProps>(({ 
  option, 
  isSelected, 
  isCurrentSelection, 
  showFeedback, 
  touchTargetClass, 
  animationClass,
  onSelect 
}) => {
  return (
    <div 
      className={`flex items-center space-x-3 p-3 sm:p-4 rounded-lg border transition-all duration-300 cursor-pointer ${touchTargetClass}
        ${isSelected ? 'bg-primary/10 border-primary' : 'hover:bg-accent/50'}
        ${isCurrentSelection && showFeedback ? 'bg-green-50 border-green-400 scale-[1.02]' : ''}
        ${animationClass}`}
      onClick={() => onSelect(option.value)}
    >
      <input 
        type="radio" 
        value={option.value} 
        id={option.value}
        checked={isSelected}
        onChange={() => onSelect(option.value)}
        className="sr-only"
      />
      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
        isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'
      }`}>
        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
      </div>
      <label 
        htmlFor={option.value} 
        className="text-base sm:text-lg cursor-pointer flex-1 leading-relaxed flex items-center gap-2"
      >
        {option.emoji && <span className="text-xl">{option.emoji}</span>}
        {option.label}
      </label>
      {isCurrentSelection && showFeedback && (
        <div className="w-5 h-5 text-green-600 animate-scale-in">✓</div>
      )}
    </div>
  );
});

QuestionOption.displayName = 'QuestionOption';