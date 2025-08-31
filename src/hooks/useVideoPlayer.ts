import { useState, useRef, useCallback, useEffect } from 'react';
import { VideoPlayerState, VideoPlayerControls } from '@/types/video';

export const useVideoPlayer = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [state, setState] = useState<VideoPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    isMuted: false,
    volume: 1,
    isLoaded: false,
  });

  const updateState = useCallback((updates: Partial<VideoPlayerState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const play = useCallback(async () => {
    if (videoRef.current) {
      try {
        await videoRef.current.play();
        updateState({ isPlaying: true });
      } catch (error) {
        console.error('Error playing video:', error);
      }
    }
  }, [updateState]);

  const pause = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      updateState({ isPlaying: false });
    }
  }, [updateState]);

  const togglePlay = useCallback(() => {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [state.isPlaying, play, pause]);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      const newMuted = !state.isMuted;
      videoRef.current.muted = newMuted;
      updateState({ isMuted: newMuted });
    }
  }, [state.isMuted, updateState]);

  const seek = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      updateState({ currentTime: time });
    }
  }, [updateState]);

  const setVolume = useCallback((volume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      updateState({ volume, isMuted: volume === 0 });
    }
  }, [updateState]);

  const toggleFullscreen = useCallback(() => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  }, []);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Event handlers
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      updateState({ currentTime: videoRef.current.currentTime });
    }
  }, [updateState]);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      updateState({ 
        duration: videoRef.current.duration,
        isLoaded: true 
      });
    }
  }, [updateState]);

  const handlePlay = useCallback(() => {
    updateState({ isPlaying: true });
  }, [updateState]);

  const handlePause = useCallback(() => {
    updateState({ isPlaying: false });
  }, [updateState]);

  // Set up event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [handleTimeUpdate, handleLoadedMetadata, handlePlay, handlePause]);

  const controls: VideoPlayerControls = {
    play,
    pause,
    togglePlay,
    toggleMute,
    seek,
    setVolume,
    toggleFullscreen,
  };

  return {
    videoRef,
    state,
    controls,
    formatTime,
  };
};