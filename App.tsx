import React, { useState, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { VideoPlayer } from './components/VideoPlayer';
import { Controls } from './components/Controls';
import { MediaItem, SubtitleSettings, SubtitlePosition, Theme } from './types';
import { translateSubtitle } from './services/geminiService';
import { createSRTBlob } from './utils/srtParser';

function App() {
  const [playlist, setPlaylist] = useState<MediaItem[]>([]);
  const [currentMediaId, setCurrentMediaId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationProgress, setTranslationProgress] = useState(0);
  const [theme, setTheme] = useState<Theme>('dark');
  
  const [subtitleSettings, setSubtitleSettings] = useState<SubtitleSettings>({
    color: '#ffffff',
    fontSize: 24,
    position: SubtitlePosition.BOTTOM,
    verticalOffset: 10,
  });

  const activeMedia = playlist.find(item => item.id === currentMediaId);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  // File Handling
  const handleFilesAdded = useCallback((fileList: FileList) => {
    const files = Array.from(fileList);
    const mediaMap = new Map<string, Partial<MediaItem>>();
    const audioExtensions = ['mp3', 'wav', 'aac', 'ogg', 'm4a', 'flac'];
    const videoExtensions = ['mp4', 'mkv', 'webm', 'mov'];

    // Group files by base name (e.g., "Movie" for "Movie.mp4" and "Movie.srt")
    files.forEach(file => {
      const nameParts = file.name.split('.');
      const ext = nameParts.pop()?.toLowerCase() || '';
      const baseName = nameParts.join('.');
      
      const path = file.webkitRelativePath || file.name;
      const pathParts = path.split('/');
      pathParts.pop(); 
      const folderPath = pathParts.join('/') || 'Root';
      
      const key = `${folderPath}/${baseName}`;

      if (!mediaMap.has(key)) {
        mediaMap.set(key, { 
          id: key, 
          name: baseName, 
          path: folderPath 
        });
      }

      const item = mediaMap.get(key)!;

      if (videoExtensions.includes(ext)) {
        item.mediaFile = file;
        item.type = 'video';
      } else if (audioExtensions.includes(ext)) {
        item.mediaFile = file;
        item.type = 'audio';
        // Basic metadata guess from filename
        // Format assumption: "Artist - Title.mp3" or just "Title.mp3"
        const parts = baseName.split(' - ');
        if (parts.length >= 2) {
            item.metadata = {
                artist: parts[0].trim(),
                title: parts.slice(1).join(' - ').trim(),
                album: 'Unknown Album'
            };
        } else {
            item.metadata = {
                title: baseName,
                artist: 'Unknown Artist',
                album: 'Unknown Album'
            };
        }
      } else if (ext === 'srt' || ext === 'vtt') {
        item.subtitleFile = file;
      }
    });

    const newMediaItems: MediaItem[] = [];
    mediaMap.forEach((item) => {
      if (item.mediaFile) {
        // Default type if missed somehow, though ext checks cover it
        if (!item.type) item.type = 'video';
        newMediaItems.push(item as MediaItem);
      }
    });

    // Sort alphabetically
    newMediaItems.sort((a, b) => {
        const pathCompare = a.path.localeCompare(b.path);
        return pathCompare !== 0 ? pathCompare : a.name.localeCompare(b.name);
    });

    setPlaylist(prev => [...prev, ...newMediaItems]);
  }, []);

  const handleRemoveMedia = (id: string) => {
    setPlaylist(prev => prev.filter(item => item.id !== id));
    if (currentMediaId === id) setCurrentMediaId(null);
  };

  const handleNext = () => {
    if (!currentMediaId || playlist.length === 0) return;
    const idx = playlist.findIndex(p => p.id === currentMediaId);
    if (idx !== -1 && idx < playlist.length - 1) {
        setCurrentMediaId(playlist[idx + 1].id);
    }
  };

  const handlePrev = () => {
    if (!currentMediaId || playlist.length === 0) return;
    const idx = playlist.findIndex(p => p.id === currentMediaId);
    if (idx > 0) {
        setCurrentMediaId(playlist[idx - 1].id);
    }
  };

  // Translation Logic
  const handleTranslateCurrent = async () => {
    if (!activeMedia || !activeMedia.subtitleFile) {
      alert("No subtitle file available to translate.");
      return;
    }

    setIsTranslating(true);
    setTranslationProgress(0);

    // Simulate progress for single file translation (since we can't track real API progress easily)
    const progressInterval = setInterval(() => {
        setTranslationProgress(prev => {
            if (prev >= 90) return prev; // Stall at 90% until done
            return prev + Math.floor(Math.random() * 10) + 5; 
        });
    }, 300);

    try {
      const content = await activeMedia.subtitleFile.text();
      const translated = await translateSubtitle(content);
      
      setPlaylist(prev => prev.map(item => 
        item.id === activeMedia.id 
          ? { ...item, translatedSubtitleContent: translated }
          : item
      ));
      setTranslationProgress(100);
    } catch (error) {
      alert("Translation failed. Check console for details.");
    } finally {
      clearInterval(progressInterval);
      setIsTranslating(false);
      // Brief delay before resetting progress to 0 so user sees 100%
      setTimeout(() => setTranslationProgress(0), 1000);
    }
  };

  const handleTranslateAll = async () => {
    // Identify items that need translation (have subtitle but no translation yet)
    // To allow re-translating, we could just check for subtitleFile, but standard behavior usually skips existing.
    // However, the request implies a batch process. Let's process everything that has a subtitle file.
    // If you only want to process untranslated ones, use: !item.translatedSubtitleContent
    const itemsToTranslateIndices = playlist
        .map((item, index) => ({ item, index }))
        .filter(({ item }) => item.subtitleFile && !item.translatedSubtitleContent);

    const total = itemsToTranslateIndices.length;

    if (total === 0) {
        // Check if there are ANY subtitles at all, maybe they are all translated?
        const anySubtitles = playlist.some(i => i.subtitleFile);
        if (anySubtitles) {
            alert("All subtitles are already translated.");
        } else {
            alert("No subtitles found to translate.");
        }
        return;
    }
    
    setIsTranslating(true);
    setTranslationProgress(0);

    let updatedPlaylist = [...playlist];
    let completed = 0;

    for (const { item, index } of itemsToTranslateIndices) {
         try {
             const content = await item.subtitleFile!.text();
             const translated = await translateSubtitle(content);
             
             updatedPlaylist[index] = { 
                 ...updatedPlaylist[index], 
                 translatedSubtitleContent: translated 
             };
             
             // Update playlist state incrementally so user sees progress in list
             setPlaylist([...updatedPlaylist]);
         } catch (e) {
             console.error(`Failed to translate ${item.name}`, e);
         } finally {
             completed++;
             setTranslationProgress(Math.round((completed / total) * 100));
         }
    }

    setIsTranslating(false);
    // Leave 100% visible for a moment? Or reset. 
    // Resetting immediately is cleaner for next state.
    setTimeout(() => setTranslationProgress(0), 1000);
  };

  const handleDownloadTranslation = () => {
    if (!activeMedia || !activeMedia.translatedSubtitleContent) return;

    const blob = createSRTBlob(activeMedia.translatedSubtitleContent);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeMedia.name}.vi.srt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`flex h-screen w-screen overflow-hidden font-sans transition-colors duration-300 ${
        theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-gray-100 text-gray-800'
    }`}>
      <Sidebar
        playlist={playlist}
        currentMediaId={currentMediaId}
        onSelectMedia={(media) => setCurrentMediaId(media.id)}
        onRemoveMedia={handleRemoveMedia}
        onFilesAdded={handleFilesAdded}
        onTranslateAll={handleTranslateAll}
        isTranslating={isTranslating}
        translationProgress={translationProgress}
        theme={theme}
      />
      
      <div className="flex-1 flex flex-col h-full relative">
        <div className={`flex-1 relative ${theme === 'dark' ? 'bg-black' : 'bg-gray-200'}`}>
          <VideoPlayer
            mediaFile={activeMedia?.mediaFile || null}
            mediaType={activeMedia?.type || 'video'}
            subtitleFile={activeMedia?.subtitleFile}
            translatedContent={activeMedia?.translatedSubtitleContent}
            settings={subtitleSettings}
            zoomLevel={zoomLevel}
            theme={theme}
            metadata={activeMedia?.metadata}
          />
        </div>
        
        {activeMedia && (
            <Controls
                settings={subtitleSettings}
                onSettingsChange={setSubtitleSettings}
                zoomLevel={zoomLevel}
                onZoomChange={setZoomLevel}
                onTranslate={handleTranslateCurrent}
                onDownloadTranslation={handleDownloadTranslation}
                hasTranslation={!!activeMedia.translatedSubtitleContent}
                isTranslating={isTranslating}
                translationProgress={translationProgress}
                theme={theme}
                onToggleTheme={toggleTheme}
                onNext={handleNext}
                onPrev={handlePrev}
            />
        )}
      </div>
    </div>
  );
}

export default App;