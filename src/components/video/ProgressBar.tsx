import { ProgressBarProps } from '@/types/video';

export const ProgressBar = ({ 
  currentTime, 
  duration, 
  onSeek, 
  className = "" 
}: ProgressBarProps) => {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    onSeek(newTime);
  };

  return (
    <div 
      className={`w-full h-3 sm:h-2 bg-white/20 rounded-full cursor-pointer group ${className}`}
      onClick={handleSeek}
    >
      <div 
        className="h-full bg-primary rounded-full transition-all duration-150 relative group-hover:bg-primary-glow"
        style={{ width: `${progress}%` }}
      >
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-3 sm:h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
};