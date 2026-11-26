let context = null;

function getContext() {
  if (context) return context;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  context = new AudioContextClass();
  return context;
}

// Called from the Start click, so the browser lets the later end-of-session beep play.
export function unlock() {
  try {
    const ctx = getContext();
    if (ctx && ctx.state === "suspended") {
      Promise.resolve(ctx.resume()).catch(() => {});
    }
  } catch {
    // Web Audio missing or blocked: the in-page message still appears.
  }
}

// A short beep: about 0.4 s at 880 Hz.
export function play() {
  try {
    const ctx = getContext();
    if (!ctx) return;
    const start = ctx.currentTime;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 880;
    gain.gain.setValueAtTime(0.25, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(start);
    oscillator.stop(start + 0.4);
  } catch {
    // Web Audio missing or blocked: the in-page message still appears.
  }
}
