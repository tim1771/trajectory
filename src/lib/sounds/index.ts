// Sound effects for UI interactions
// Using simple audio frequencies for haptic-like feedback

class SoundEffects {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        console.warn('Audio context not supported');
      }
    }
  }

  private playTone(frequency: number, duration: number, volume: number = 0.3) {
    if (!this.audioContext || !this.enabled) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        this.audioContext.currentTime + duration
      );

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (e) {
      console.warn('Failed to play sound:', e);
    }
  }

  // Button click sound - subtle tap
  click() {
    this.playTone(800, 0.05, 0.2);
  }

  // Success action - ascending tone
  success() {
    this.playTone(523, 0.08, 0.25);
    setTimeout(() => this.playTone(659, 0.08, 0.25), 80);
  }

  // Achievement unlocked - celebratory
  achievement() {
    this.playTone(523, 0.1, 0.3);
    setTimeout(() => this.playTone(659, 0.1, 0.3), 100);
    setTimeout(() => this.playTone(784, 0.15, 0.3), 200);
  }

  // Error/warning - descending tone
  error() {
    this.playTone(400, 0.1, 0.25);
    setTimeout(() => this.playTone(300, 0.15, 0.25), 100);
  }

  // Hover/focus - very subtle
  hover() {
    this.playTone(1000, 0.03, 0.15);
  }

  // Toggle switch
  toggle() {
    this.playTone(600, 0.04, 0.2);
  }

  // Navigation
  navigate() {
    this.playTone(700, 0.06, 0.2);
  }

  // XP/level up sound
  levelUp() {
    this.playTone(523, 0.12, 0.3);
    setTimeout(() => this.playTone(659, 0.12, 0.3), 120);
    setTimeout(() => this.playTone(784, 0.12, 0.3), 240);
    setTimeout(() => this.playTone(1047, 0.2, 0.3), 360);
  }

  // Enable/disable sounds
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  isEnabled() {
    return this.enabled;
  }
}

// Singleton instance
let soundEffects: SoundEffects | null = null;

export const useSoundEffects = () => {
  if (typeof window === 'undefined') {
    return {
      click: () => {},
      success: () => {},
      achievement: () => {},
      error: () => {},
      hover: () => {},
      toggle: () => {},
      navigate: () => {},
      levelUp: () => {},
      setEnabled: () => {},
      isEnabled: () => false,
    };
  }

  if (!soundEffects) {
    soundEffects = new SoundEffects();
  }

  return soundEffects;
};
