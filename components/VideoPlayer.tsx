import React, { useEffect, useRef, useState } from 'react';
import { SubtitleCue, SubtitleSettings, SubtitlePosition, MediaType, Theme } from '../types';
import { parseSRT } from '../utils/srtParser';
import { Music, Disc } from 'lucide-react';

interface VideoPlayerProps {
  mediaFile: File | null;
  mediaType: MediaType;
  subtitleFile: File | undefined;
  translatedContent: string | undefined;
  settings: SubtitleSettings;
  zoomLevel: number;
  theme: Theme;
  metadata?: { artist?: string; album?: string; title?: string };
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  mediaFile,
  mediaType,
  subtitleFile,
  translatedContent,
  settings,
  zoomLevel,
  theme,
  metadata
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [cues, setCues] = useState<SubtitleCue[]>([]);
  const [currentText, setCurrentText] = useState<string>('');

  const isDark = theme === 'dark';

  // Handle Media Source
  useEffect(() => {
    if (mediaFile) {
      const url = URL.createObjectURL(mediaFile);
      setVideoUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setVideoUrl(null);
    }
  }, [mediaFile]);

  // Handle Subtitle Source
  useEffect(() => {
    const loadSubtitles = async () => {
      let content = '';
      
      if (translatedContent) {
        content = translatedContent;
      } else if (subtitleFile) {
        content = await subtitleFile.text();
      }

      if (content) {
        const parsedCues = parseSRT(content);
        setCues(parsedCues);
      } else {
        setCues([]);
      }
    };

    loadSubtitles();
  }, [subtitleFile, translatedContent]);

  // Sync Subtitles with Video Time
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const currentTime = video.currentTime;
      const activeCue = cues.find(
        (cue) => currentTime >= cue.startTime && currentTime <= cue.endTime
      );
      setCurrentText(activeCue ? activeCue.text : '');
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [cues]);

  const getPositionStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'absolute',
      left: '50%',
      transform: 'translateX(-50%)',
      textAlign: 'center',
      width: '90%',
      pointerEvents: 'none',
      textShadow: '0px 2px 4px rgba(0,0,0,0.8)',
      zIndex: 20,
    };

    switch (settings.position) {
      case SubtitlePosition.TOP:
        return { ...base, top: `${settings.verticalOffset}%` };
      case SubtitlePosition.MIDDLE:
        return { ...base, top: '50%', transform: 'translate(-50%, -50%)' };
      case SubtitlePosition.BOTTOM:
        return { ...base, bottom: `${settings.verticalOffset}%` };
      default:
        return { ...base, bottom: '10%' };
    }
  };

  if (!videoUrl) {
    return (
      <div className={`w-full h-full flex items-center justify-center transition-colors duration-300 ${
        isDark ? 'bg-black text-gray-600' : 'bg-gray-100 text-gray-400'
      }`}>
        <p>Select media to play</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`w-full h-full relative overflow-hidden flex items-center justify-center transition-colors duration-300 ${
        isDark ? 'bg-black' : 'bg-gray-50'
      }`}
    >
      {/* Audio Visualization / Placeholder */}
      {mediaType === 'audio' && (
        <div className={`absolute inset-0 flex flex-col items-center justify-center z-0 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>
            <div className={`p-10 rounded-full mb-6 animate-pulse ${
                isDark ? 'bg-gray-800' : 'bg-white shadow-lg border border-gray-100'
            }`}>
                <Disc size={120} className={isDark ? 'text-pink-500' : 'text-pink-600'} />
            </div>
            <h2 className="text-2xl font-bold mb-2">{metadata?.title || mediaFile?.name}</h2>
            <p className={`text-lg ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                {metadata?.artist || 'Unknown Artist'}
            </p>
            {metadata?.album && (
                 <p className={`text-sm mt-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                    {metadata.album}
                 </p>
            )}
        </div>
      )}

      <video
        ref={videoRef}
        src={videoUrl}
        className="max-w-none transition-transform duration-200 ease-out z-10"
        style={{ 
            transform: `scale(${zoomLevel})`,
            maxHeight: '100%',
            maxWidth: '100%',
            // Hide video element visual for audio but keep controls
            height: mediaType === 'audio' ? '50px' : 'auto',
            width: mediaType === 'audio' ? '80%' : 'auto',
            position: mediaType === 'audio' ? 'absolute' : 'relative',
            bottom: mediaType === 'audio' ? '10%' : 'auto',
            opacity: mediaType === 'audio' ? 0.8 : 1,
            borderRadius: mediaType === 'audio' ? '8px' : '0'
        }}
        controls
        autoPlay
      />

      {/* Subtitle Overlay (Visible for Audio too if SRT exists, e.g. Lyrics) */}
      {currentText && mediaType === 'video' && (
        <div style={getPositionStyles()}>
          <span
            style={{
              color: settings.color,
              fontSize: `${settings.fontSize}px`,
              backgroundColor: 'rgba(0,0,0,0.5)',
              padding: '4px 8px',
              borderRadius: '4px',
              whiteSpace: 'pre-wrap', 
            }}
          >
            {currentText}
          </span>
        </div>
      )}
      
       {/* Lyrics/Subtitles for Audio - Rendered differently (centered, static) */}
       {currentText && mediaType === 'audio' && (
        <div className="absolute bottom-32 left-0 right-0 text-center z-20 px-10">
          <span
            style={{
              color: isDark ? settings.color : '#333',
              fontSize: `${settings.fontSize}px`,
              textShadow: isDark ? '0px 2px 4px rgba(0,0,0,0.8)' : 'none',
              fontWeight: 'bold',
              whiteSpace: 'pre-wrap',
            }}
          >
            {currentText}
          </span>
        </div>
      )}
    </div>
  );
};