export const startListening = (onResult, onError) => {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    if (onError) onError('Speech recognition is not supported in this browser.');
    return null;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-IN'; // Or whatever local language 'hi-IN'

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    onResult(transcript);
  };

  recognition.onerror = (event) => {
    if (onError) onError(event.error);
  };

  recognition.start();
  return recognition;
};
