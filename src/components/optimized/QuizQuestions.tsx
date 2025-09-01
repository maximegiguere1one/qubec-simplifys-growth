import React, { memo } from 'react';

// Extracted static questions data to prevent re-creation on every render
export const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "En ce moment, qu'est-ce qui vous fait perdre le plus de temps dans votre quotidien d'entrepreneur ?",
    subtitle: "Question 1 sur 5 - Identifions votre plus gros défi",
    options: [
      { value: "inventory", label: "Compter mon inventaire et suivre mes stocks", score: 25, priority: "Gestion d'inventaire" },
      { value: "billing", label: "Faire mes factures et tenir mes livres à jour", score: 20, priority: "Facturation" },
      { value: "hr", label: "Gérer les horaires et calculer la paie", score: 15, priority: "Gestion des employés" },
      { value: "projects", label: "Suivre mes projets et respecter mes échéances", score: 20, priority: "Suivi de projets" },
      { value: "crm", label: "Tenir à jour mes contacts et suivre mes clients", score: 25, priority: "Gestion clients" }
    ]
  },
  {
    id: 2,
    question: "Quand vous pensez aux heures que vous passez dans la paperasse chaque semaine, que ressentez-vous ?",
    subtitle: "Question 2 sur 5 - Quantifions le temps perdu",
    options: [
      { value: "low", label: "Moins de 5 heures - c'est gérable", score: 5 },
      { value: "medium", label: "5 à 15 heures - ça commence à peser", score: 15 },
      { value: "high", label: "15 à 25 heures - c'est vraiment trop", score: 25 },
      { value: "very_high", label: "Plus de 25 heures - j'en ai assez !", score: 35 }
    ]
  },
  {
    id: 3,
    question: "Avez-vous déjà pensé : 'Si seulement il existait un outil qui faisait exactement ce dont j'ai besoin' ?",
    subtitle: "Question 3 sur 5 - Évaluons votre besoin de solution personnalisée",
    options: [
      { value: "never", label: "Non, mes outils actuels me conviennent", score: 1 },
      { value: "sometimes", label: "Oui, de temps en temps", score: 2 },
      { value: "often", label: "Oui, assez souvent même !", score: 3 },
      { value: "constantly", label: "Tout le temps ! C'est frustrant", score: 4 }
    ]
  },
  {
    id: 4,
    question: "Si quelqu'un pouvait créer pour vous l'outil parfait adapté à votre entreprise, comment réagiriez-vous ?",
    subtitle: "Question 4 sur 5 - Mesurons votre intérêt pour une solution personnalisée",
    options: [
      { value: "skeptical", label: "Je serais prudent, ça semble trop beau", score: 1 },
      { value: "interested", label: "Ça m'intéresserait vraiment", score: 2 },
      { value: "excited", label: "Je serais très enthousiaste !", score: 3 },
      { value: "dream", label: "Ce serait un rêve qui se réalise !", score: 4 }
    ]
  },
  {
    id: 5,
    question: "Quel type de solution transformerait le plus votre façon de travailler ?",
    subtitle: "Question 5 sur 5 - Définissons votre solution idéale",
    options: [
      { value: "automation", label: "Que tout se fasse automatiquement", score: 2, type: "Système d'automatisation" },
      { value: "integration", label: "Avoir tous mes outils dans un seul endroit", score: 3, type: "Plateforme intégrée" },
      { value: "custom", label: "Quelque chose conçu spécifiquement pour moi", score: 4, type: "Solution sur mesure complète" },
      { value: "mobile", label: "Pouvoir tout gérer depuis mon téléphone", score: 3, type: "Application mobile personnalisée" }
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
        className="text-base sm:text-lg cursor-pointer flex-1 leading-relaxed"
      >
        {option.label}
      </label>
      {isCurrentSelection && showFeedback && (
        <div className="w-5 h-5 text-green-600 animate-scale-in">✓</div>
      )}
    </div>
  );
});

QuestionOption.displayName = 'QuestionOption';