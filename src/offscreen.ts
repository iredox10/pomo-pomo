let currentAudio: HTMLAudioElement | null = null;
let stopTimeout: ReturnType<typeof setTimeout> | null = null;

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'PLAY_SOUND') {
    playSound(msg.payload.sound);
  } else if (msg.type === 'STOP_SOUND') {
    stopSound();
  }
});

function stopSound() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  if (stopTimeout) {
    clearTimeout(stopTimeout);
    stopTimeout = null;
  }
}

function playSound(source: string) {
  // Optional: Stop previous sound if you don't want overlap
  stopSound(); 

  let audioUrl = '';
  let loop = false;
  let duration = 0;

  switch (source) {
    case 'alarm':
      audioUrl = chrome.runtime.getURL('assets/alarm.mp3'); 
      loop = true;
      duration = 50000; // 50 seconds
      break;
    case 'white-noise':
      audioUrl = chrome.runtime.getURL('assets/white-noise.mp3');
      break;
    default:
      return;
  }

  const audio = new Audio(audioUrl);
  audio.volume = 1.0;
  audio.loop = loop;
  
  audio.play().catch(err => console.error("Audio play failed:", err));
  
  currentAudio = audio;

  if (duration > 0) {
    stopTimeout = setTimeout(() => {
      stopSound();
    }, duration);
  }
}
