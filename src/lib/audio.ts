let audioCtx: AudioContext | null = null;

export function initAudio() {
  if (typeof window === 'undefined') return;
  if (!audioCtx) {
    audioCtx = new window.AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

export function playSelectSound() {
  // Sound removed at user request
}
