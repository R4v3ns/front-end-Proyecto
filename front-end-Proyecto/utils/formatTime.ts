/**
 * Formatea un tiempo en segundos a una cadena de texto en formato "mm:ss"
 * formatTime(0)    // → "0:00"
 * formatTime(45)   // → "0:45"
 * formatTime(90)   // → "1:30"
 * formatTime(245)  // → "4:05"
 */
export const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) {
    return '0:00';
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

