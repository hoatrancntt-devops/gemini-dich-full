export interface SubtitleCue {
  id: string;
  startTime: number; // in seconds
  endTime: number;   // in seconds
  text: string;
}

export type MediaType = 'video' | 'audio';

export interface MediaItem {
  id: string;
  name: string;
  type: MediaType;
  path: string; // Relative path for display/grouping
  mediaFile: File; // Renamed from videoFile to mediaFile to support audio
  subtitleFile?: File;
  translatedSubtitleContent?: string; // Content of the translated SRT
  metadata?: {
    artist?: string;
    album?: string;
    title?: string;
  };
}

export enum SubtitlePosition {
  TOP = 'top',
  MIDDLE = 'middle',
  BOTTOM = 'bottom',
}

export interface SubtitleSettings {
  color: string;
  fontSize: number; // in px
  position: SubtitlePosition;
  verticalOffset: number; // percentage
}

export interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  zoomLevel: number; // 1.0 is 100%
}

export type Theme = 'dark' | 'light';
