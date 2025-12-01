import { SubtitleCue } from '../types';

// Helper to convert SRT timestamp (00:00:00,000) to seconds
const timeToSeconds = (timeString: string): number => {
  const [time, milliseconds] = timeString.split(',');
  const [hours, minutes, seconds] = time.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds + Number(milliseconds) / 1000;
};

// Helper to strip HTML tags (like <font>, <b>, <i>) from text
const stripHtmlTags = (text: string): string => {
  return text.replace(/<[^>]*>/g, '');
};

export const parseSRT = (content: string): SubtitleCue[] => {
  const cues: SubtitleCue[] = [];
  // Normalize line endings
  const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const blocks = normalizedContent.split('\n\n');

  blocks.forEach((block) => {
    const lines = block.split('\n');
    if (lines.length >= 3) {
      // Line 1: ID
      const id = lines[0].trim();
      // Line 2: Timecode
      const timecodeLine = lines[1];
      if (timecodeLine.includes('-->')) {
        const [startStr, endStr] = timecodeLine.split('-->').map((s) => s.trim());
        // Line 3+: Text
        const rawText = lines.slice(2).join('\n').trim();
        const text = stripHtmlTags(rawText);

        if (startStr && endStr && text) {
          cues.push({
            id,
            startTime: timeToSeconds(startStr),
            endTime: timeToSeconds(endStr),
            text,
          });
        }
      }
    }
  });

  return cues;
};

export const createSRTBlob = (content: string): Blob => {
  return new Blob([content], { type: 'text/plain;charset=utf-8' });
};