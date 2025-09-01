import { useState, useEffect, useRef, useCallback } from 'react';

interface UseOptimizedTimerOptions {
  autoStart?: boolean;
  pauseOnHidden?: boolean;
}

export const useOptimizedTimer = (options: UseOptimizedTimerOptions = {}) => {
  const { autoStart = true, pauseOnHidden = true } = options;
  const [timeSpent, setTimeSpent] = useState(0);
  const [isRunning, setIsRunning] = useState(autoStart);
  const startTimeRef = useRef<number>(Date.now());
  const pausedTimeRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const updateTimer = useCallback(() => {
    if (isRunning) {
      const now = Date.now();
      const elapsed = Math.floor((now - startTimeRef.current - pausedTimeRef.current) / 1000);
      setTimeSpent(elapsed);
    }
  }, [isRunning]);

  const start = useCallback(() => {
    if (!isRunning) {
      startTimeRef.current = Date.now();
      pausedTimeRef.current = 0;
      setIsRunning(true);
    }
  }, [isRunning]);

  const pause = useCallback(() => {
    if (isRunning) {
      pausedTimeRef.current += Date.now() - startTimeRef.current;
      setIsRunning(false);
    }
  }, [isRunning]);

  const reset = useCallback(() => {
    setTimeSpent(0);
    startTimeRef.current = Date.now();
    pausedTimeRef.current = 0;
    setIsRunning(autoStart);
  }, [autoStart]);

  // Handle visibility change
  useEffect(() => {
    if (!pauseOnHidden) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        pause();
      } else if (!isRunning && timeSpent > 0) {
        start();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [pauseOnHidden, pause, start, isRunning, timeSpent]);

  // Timer interval
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(updateTimer, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, updateTimer]);

  return {
    timeSpent,
    isRunning,
    start,
    pause,
    reset
  };
};