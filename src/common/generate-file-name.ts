export const generateFileName = (prompt: string, fileExtension: 'png' | 'mp3') =>
  prompt.toLowerCase().replace(/[^a-z0-9]/g, '_') + '.' + fileExtension;
