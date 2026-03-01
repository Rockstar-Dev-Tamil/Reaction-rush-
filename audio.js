class AudioController {
    constructor() {
        this.audioCtx = null;
        this.enabled = localStorage.getItem('audio_enabled') !== 'false';
    }

    initCtx() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('audio_enabled', this.enabled);
        return this.enabled;
    }

    playTone(frequency, type, duration, vol = 0.1) {
        if (!this.enabled) return;
        this.initCtx();

        const oscillator = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);

        gainNode.gain.setValueAtTime(vol, this.audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);

        oscillator.start();
        oscillator.stop(this.audioCtx.currentTime + duration);
    }

    playActive() {
        // Crisp high beep
        this.playTone(880, 'sine', 0.08, 0.2);
        setTimeout(() => this.playTone(1100, 'sine', 0.06, 0.08), 40);
    }

    playPenalty() {
        // Low buzz with dissonance
        this.playTone(150, 'sawtooth', 0.4, 0.2);
        this.playTone(160, 'sawtooth', 0.3, 0.1);
    }

    playBonus() {
        // Rising arpeggio chord
        this.playTone(600, 'square', 0.1, 0.08);
        setTimeout(() => this.playTone(800, 'square', 0.12, 0.08), 50);
        setTimeout(() => this.playTone(1000, 'sine', 0.15, 0.1), 100);
    }

    playSuccess() {
        // Satisfying blip
        this.playTone(440, 'sine', 0.15, 0.1);
        setTimeout(() => this.playTone(660, 'sine', 0.1, 0.06), 60);
    }
}

const audioController = new AudioController();
