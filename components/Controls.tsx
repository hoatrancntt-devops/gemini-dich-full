import React from 'react';
import { 
  Minus, Plus, Type, Languages, Download, 
  ArrowUp, ArrowDown, AlignVerticalJustifyCenter,
  Moon, Sun, SkipBack, SkipForward
} from 'lucide-react';
import { SubtitlePosition, SubtitleSettings, Theme } from '../types';

interface ControlsProps {
  settings: SubtitleSettings;
  onSettingsChange: (newSettings: SubtitleSettings) => void;
  zoomLevel: number;
  onZoomChange: (level: number) => void;
  onTranslate: () => void;
  onDownloadTranslation: () => void;
  hasTranslation: boolean;
  isTranslating: boolean;
  translationProgress: number;
  theme: Theme;
  onToggleTheme: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  settings,
  onSettingsChange,
  zoomLevel,
  onZoomChange,
  onTranslate,
  onDownloadTranslation,
  hasTranslation,
  isTranslating,
  translationProgress,
  theme,
  onToggleTheme,
  onNext,
  onPrev
}) => {
  const isDark = theme === 'dark';

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSettingsChange({ ...settings, color: e.target.value });
  };

  const updateFontSize = (delta: number) => {
    onSettingsChange({ ...settings, fontSize: Math.max(12, settings.fontSize + delta) });
  };

  const updateZoom = (delta: number) => {
    onZoomChange(Math.max(0.5, Math.min(3.0, zoomLevel + delta)));
  };

  const setPosition = (pos: SubtitlePosition) => {
    onSettingsChange({ ...settings, position: pos });
  };

  const updateOffset = (delta: number) => {
      onSettingsChange({ ...settings, verticalOffset: Math.max(0, Math.min(50, settings.verticalOffset + delta))})
  }

  // Styles helpers
  const bgClass = isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-md';
  const groupBgClass = isDark ? 'bg-gray-900' : 'bg-gray-100';
  const textClass = isDark ? 'text-gray-300' : 'text-gray-600';
  const labelClass = isDark ? 'text-gray-400' : 'text-gray-500';
  const btnHover = isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200';

  return (
    <div className={`${bgClass} p-4 border-t flex flex-wrap gap-6 items-center justify-between text-sm transition-colors duration-300`}>
      
      {/* Playback Navigation */}
      <div className="flex items-center gap-2">
         <button onClick={onPrev} className={`p-2 rounded-full ${btnHover} ${textClass}`} title="Previous">
            <SkipBack size={20} />
         </button>
         <button onClick={onNext} className={`p-2 rounded-full ${btnHover} ${textClass}`} title="Next">
            <SkipForward size={20} />
         </button>
      </div>

      {/* Zoom Controls */}
      <div className="flex items-center gap-2">
        <span className={`${labelClass} uppercase text-xs font-bold tracking-wider`}>Zoom</span>
        <div className={`flex ${groupBgClass} rounded-lg p-1`}>
          <button onClick={() => updateZoom(-0.1)} className={`p-2 ${btnHover} rounded ${textClass}`}>
            <Minus size={16} />
          </button>
          <span className={`min-w-[50px] text-center flex items-center justify-center font-mono ${textClass}`}>
            {Math.round(zoomLevel * 100)}%
          </span>
          <button onClick={() => updateZoom(0.1)} className={`p-2 ${btnHover} rounded ${textClass}`}>
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Subtitle Appearance */}
      <div className="flex items-center gap-4">
        <span className={`${labelClass} uppercase text-xs font-bold tracking-wider`}>Subtitles</span>
        
        {/* Font Size */}
        <div className={`flex items-center gap-1 ${groupBgClass} rounded-lg p-1`}>
          <button onClick={() => updateFontSize(-2)} className={`p-2 ${btnHover} rounded ${textClass}`}>
            <Type size={12} />
          </button>
          <span className={`w-8 text-center ${textClass}`}>{settings.fontSize}</span>
          <button onClick={() => updateFontSize(2)} className={`p-2 ${btnHover} rounded ${textClass}`}>
            <Type size={18} />
          </button>
        </div>

        {/* Color Picker */}
        <div className={`flex items-center gap-2 ${groupBgClass} rounded-lg p-1 px-2`}>
          <label htmlFor="subColor" className={`text-xs ${labelClass}`}>Color</label>
          <input
            id="subColor"
            type="color"
            value={settings.color}
            onChange={handleColorChange}
            className="w-6 h-6 rounded bg-transparent cursor-pointer border-none"
          />
        </div>

        {/* Position */}
        <div className={`flex items-center gap-1 ${groupBgClass} rounded-lg p-1`}>
          <button 
            onClick={() => setPosition(SubtitlePosition.TOP)} 
            className={`p-2 rounded ${settings.position === SubtitlePosition.TOP ? 'bg-blue-600 text-white' : `${textClass} ${btnHover}`}`}
            title="Top"
          >
            <ArrowUp size={16} />
          </button>
          <button 
            onClick={() => setPosition(SubtitlePosition.MIDDLE)} 
            className={`p-2 rounded ${settings.position === SubtitlePosition.MIDDLE ? 'bg-blue-600 text-white' : `${textClass} ${btnHover}`}`}
            title="Middle"
          >
            <AlignVerticalJustifyCenter size={16} />
          </button>
          <button 
            onClick={() => setPosition(SubtitlePosition.BOTTOM)} 
            className={`p-2 rounded ${settings.position === SubtitlePosition.BOTTOM ? 'bg-blue-600 text-white' : `${textClass} ${btnHover}`}`}
            title="Bottom"
          >
            <ArrowDown size={16} />
          </button>
        </div>

        {/* Vertical Offset Fine-tuning */}
        {settings.position !== SubtitlePosition.MIDDLE && (
             <div className={`flex items-center gap-1 ${groupBgClass} rounded-lg p-1`}>
                <span className={`text-[10px] ${labelClass} px-1`}>Margin</span>
                 <input 
                    type="range" 
                    min="0" 
                    max="40" 
                    value={settings.verticalOffset} 
                    onChange={(e) => updateOffset(Number(e.target.value) - settings.verticalOffset)}
                    className="w-16 h-1 bg-gray-500 rounded-lg appearance-none cursor-pointer"
                 />
             </div>
        )}
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-3 ml-auto">
        <button
            onClick={onToggleTheme}
            className={`p-2 rounded-full ${btnHover} ${isDark ? 'text-yellow-400' : 'text-slate-700'}`}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="h-6 w-px bg-gray-600 mx-1"></div>

        <button
          onClick={onTranslate}
          disabled={isTranslating}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 text-white py-2 px-4 rounded transition-colors text-sm font-medium shadow-lg min-w-[140px] justify-center"
        >
          {isTranslating ? (
            <span className="animate-pulse flex items-center gap-2">
               Translating... {translationProgress > 0 && `${translationProgress}%`}
            </span>
          ) : (
            <>
              <Languages size={16} />
              Translate (VI)
            </>
          )}
        </button>

        {hasTranslation && (
          <button
            onClick={onDownloadTranslation}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors text-sm font-medium shadow-lg"
            title="Save Translated Subtitle"
          >
            <Download size={16} />
            Save .SRT
          </button>
        )}
      </div>
    </div>
  );
};