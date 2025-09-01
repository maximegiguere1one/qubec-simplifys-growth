import { Button } from "@/components/ui/button";
import { trackCTAClick } from "@/lib/analytics";
import { useMobileOptimized } from "@/hooks/useMobileOptimized";
import { cn } from "@/lib/utils";
interface CTAButtonProps {
  children: React.ReactNode;
  location: string;
  variant?: string;
  destination?: string;
  onClick?: () => void;
  className?: string;
  size?: "default" | "cta" | "cta-large" | "outline" | "secondary";
  disabled?: boolean;
}
export const CTAButton = ({
  children,
  location,
  variant,
  destination,
  onClick,
  className,
  size = "cta",
  disabled
}: CTAButtonProps) => {
  const {
    mobileButtonClass,
    animationClass
  } = useMobileOptimized();
  const handleClick = async () => {
    await trackCTAClick(location, variant, destination);
    onClick?.();
  };
  return (
    <Button
      variant={size}
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        mobileButtonClass,
        animationClass,
        className
      )}
    >
      {children}
    </Button>
  );
};