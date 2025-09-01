export interface VideoSource {
  type: 'mp4' | 'youtube' | 'vimeo';
  src: string;
  embedUrl?: string;
}

export function parseVideoSource(url: string): VideoSource {
  if (!url) {
    throw new Error('URL vidéo requise');
  }

  // YouTube detection
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const youtubeMatch = url.match(youtubeRegex);
  if (youtubeMatch) {
    const videoId = youtubeMatch[1];
    return {
      type: 'youtube',
      src: url,
      embedUrl: `https://www.youtube.com/embed/${videoId}?enablejsapi=1&controls=0&modestbranding=1&rel=0&autoplay=1&mute=1&playsinline=1`
    };
  }

  // Vimeo detection
  const vimeoRegex = /(?:vimeo\.com\/)([0-9]+)/;
  const vimeoMatch = url.match(vimeoRegex);
  if (vimeoMatch) {
    const videoId = vimeoMatch[1];
    return {
      type: 'vimeo',
      src: url,
      embedUrl: `https://player.vimeo.com/video/${videoId}?background=1&autoplay=1&muted=1&controls=0`
    };
  }

  // MP4 or other direct video files
  return {
    type: 'mp4',
    src: url
  };
}

export function isValidVideoUrl(url: string): boolean {
  try {
    parseVideoSource(url);
    return true;
  } catch {
    return false;
  }
}