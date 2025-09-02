import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface StickyMobileCTAProps {
  onAction: () => void;
  isVisible: boolean;
  text: string;
  isDisabled?: boolean;
}

export const StickyMobileCTA = ({ onAction, isVisible, text, isDisabled = false }: StickyMobileCTAProps) => {
  if (!isVisible) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/95 backdrop-blur-sm border-t border-border md:hidden">
      <Button
        variant="cta"
        onClick={onAction}
        disabled={isDisabled}
        className="w-full h-14 text-lg font-semibold shadow-lg"
      >
        {text}
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  );
};