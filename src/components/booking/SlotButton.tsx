import { Clock } from 'lucide-react';
import { SlotButtonProps } from '@/types/booking';

export const SlotButton = ({ 
  slot, 
  index, 
  isSelected, 
  onClick, 
  className = "" 
}: SlotButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`w-full p-3 border rounded-lg text-left transition-all hover:border-primary hover:bg-primary/5 btn-touch ${
        isSelected
          ? 'border-primary bg-primary/10'
          : 'border-border'
      } ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="font-medium">{slot.date}</p>
            <p className="text-sm text-muted-foreground">{slot.time}</p>
          </div>
        </div>
        {index === 0 && (
          <span className="text-xs bg-success text-success-foreground px-2 py-1 rounded-full">
            Prochain
          </span>
        )}
      </div>
    </button>
  );
};