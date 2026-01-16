chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'PLAY_SOUND') {
    playSound(msg.payload.sound);
  }
});

function playSound(source: string) {
  // Use a CDN or local file. For a real extension, these should be local assets.
  // I'll use placeholders or online URLs for the prototype if local assets aren't there yet.
  // But the plan says "Assets" is task 19. I'll assume local paths and just log errors if missing.
  // Ideally, I should place some dummy mp3 files in public/ later.
  
  let audioUrl = '';
  switch (source) {
    case 'alarm':
      audioUrl = chrome.runtime.getURL('assets/alarm.mp3'); 
      // Fallback to a simple beep data URI if file missing (for testing)
      // audioUrl = 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg';
      break;
    case 'white-noise':
      audioUrl = chrome.runtime.getURL('assets/white-noise.mp3');
      break;
    default:
      return;
  }

  const audio = new Audio(audioUrl);
  audio.volume = 1.0;
  audio.play().catch(err => console.error("Audio play failed:", err));
}
