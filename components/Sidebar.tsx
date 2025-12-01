import React, { useRef } from 'react';
import { FolderOpen, Trash2, FileVideo, FileType2, Globe, Music, FileAudio } from 'lucide-react';
import { MediaItem, Theme } from '../types';

interface SidebarProps {
  playlist: MediaItem[];
  currentMediaId: string | null;
  onSelectMedia: (media: MediaItem) => void;
  onRemoveMedia: (id: string) => void;
  onFilesAdded: (files: FileList) => void;
  onTranslateAll: () => void;
  isTranslating: boolean;
  translationProgress: number;
  theme: Theme;
}

export const Sidebar: React.FC<SidebarProps> = ({
  playlist,
  currentMediaId,
  onSelectMedia,
  onRemoveMedia,
  onFilesAdded,
  onTranslateAll,
  isTranslating,
  translationProgress,
  theme,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDark = theme === 'dark';

  const handleFolderClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesAdded(e.target.files);
    }
  };

  return (
    <div className={`w-80 border-r flex flex-col h-full transition-colors duration-300 ${
      isDark ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-800'
    }`}>
      <div className={`p-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
        <h1 className="text-xl font-bold text-blue-500 mb-4 flex items-center gap-2">
          {playlist.some(i => i.type === 'audio') ? <Music /> : <FileVideo />} 
          Media Library
        </h1>
        
        <div className="flex gap-2 mb-2">
          <button
            onClick={handleFolderClick}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors text-sm font-medium"
          >
            <FolderOpen size={16} />
            Open Folder
          </button>
          
          <button
            onClick={onTranslateAll}
            disabled={isTranslating || playlist.length === 0}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded transition-colors text-sm font-medium border ${
              isTranslating 
                ? 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed' 
                : isDark 
                  ? 'bg-transparent hover:bg-gray-800 text-green-400 border-green-900'
                  : 'bg-transparent hover:bg-gray-100 text-green-600 border-green-200'
            }`}
            title="Translate All Subtitles"
          >
            <Globe size={16} />
            {isTranslating ? `${translationProgress}%` : 'All'}
          </button>
        </div>

        {/* Hidden Input for Folder Selection */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          // @ts-ignore - webkitdirectory is non-standard but supported in most browsers
          webkitdirectory=""
          directory=""
          multiple
        />
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {playlist.length === 0 ? (
          <div className={`text-center mt-10 text-sm p-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            No media found.<br/>Click "Open Folder" to scan a directory.
          </div>
        ) : (
          playlist.map((item, index) => (
            <div
              key={item.id}
              className={`group flex items-center justify-between p-3 rounded cursor-pointer transition-colors ${
                currentMediaId === item.id 
                  ? isDark ? 'bg-blue-900/40 border border-blue-800' : 'bg-blue-50 border border-blue-200'
                  : isDark ? 'hover:bg-gray-800 border border-transparent' : 'hover:bg-gray-100 border border-transparent'
              }`}
              onClick={() => onSelectMedia(item)}
            >
              <div className="flex items-start gap-3 overflow-hidden">
                <span className={`text-xs font-mono mt-1 min-w-[1.2rem] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {index + 1}.
                </span>
                <div className="flex items-center mt-1">
                    {item.type === 'audio' ? (
                        <FileAudio size={16} className={isDark ? 'text-pink-400' : 'text-pink-600'} />
                    ) : (
                        <FileVideo size={16} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
                    )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className={`text-sm font-medium truncate ${
                    currentMediaId === item.id 
                      ? isDark ? 'text-blue-300' : 'text-blue-700'
                      : isDark ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    {item.metadata?.title || item.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs truncate max-w-[150px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {item.type === 'audio' && item.metadata?.artist 
                        ? item.metadata.artist 
                        : item.path}
                    </span>
                    {item.subtitleFile && (
                      <span className={`text-[10px] px-1 rounded flex items-center gap-1 ${
                        isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                      }`} title={item.subtitleFile.name}>
                        <FileType2 size={8} />
                        SRT
                      </span>
                    )}
                    {item.translatedSubtitleContent && (
                      <span className={`text-[10px] px-1 rounded flex items-center gap-1 ${
                        isDark ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700'
                      }`} title="Vietnamese Translation Ready">
                        VI
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveMedia(item.id);
                }}
                className={`opacity-0 group-hover:opacity-100 p-1.5 rounded transition-all ${
                    isDark 
                    ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/30' 
                    : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                }`}
                title="Remove Media"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};