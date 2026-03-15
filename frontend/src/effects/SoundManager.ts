export class SoundManager {
	private audioContext: AudioContext | null = null;
	private masterGain: GainNode | null = null;
	private enabled = true;
	private musicEnabled = true;
	private volume = 0.3;

	constructor() {
		if (typeof window !== "undefined" && "AudioContext" in window) {
			this.audioContext = new AudioContext();
			this.masterGain = this.audioContext.createGain();
			this.masterGain.connect(this.audioContext.destination);
			this.masterGain.gain.value = this.volume;
		}
	}

	private createOscillator(
		frequency: number,
		type: OscillatorType,
		duration: number,
		volume: number = 0.3,
	) {
		if (!this.audioContext || !this.masterGain || !this.enabled) return;

		const oscillator = this.audioContext.createOscillator();
		const gainNode = this.audioContext.createGain();

		oscillator.type = type;
		oscillator.frequency.value = frequency;

		gainNode.gain.value = volume;
		gainNode.gain.exponentialRampToValueAtTime(
			0.01,
			this.audioContext.currentTime + duration,
		);

		oscillator.connect(gainNode);
		gainNode.connect(this.masterGain);

		oscillator.start();
		oscillator.stop(this.audioContext.currentTime + duration);
	}

	private playFrequencySequence(
		frequencies: number[],
		durations: number[],
		type: OscillatorType = "sine",
		volume: number = 0.3,
	) {
		if (!this.audioContext || !this.enabled) return;

		let time = this.audioContext.currentTime;
		frequencies.forEach((freq, i) => {
			setTimeout(() => {
				this.createOscillator(freq, type, durations[i] || 0.1, volume);
			}, (time - this.audioContext!.currentTime + (i * 0.1)) * 1000);
		});
	}

	playSwap() {
		this.playFrequencySequence([440, 554.37], [0.08, 0.08], "sine", 0.2);
	}

	playStep() {
		this.createOscillator(330, "sine", 0.05, 0.15);
	}

	playSuccess() {
		this.playFrequencySequence(
			[523.25, 659.25, 783.99, 1046.5],
			[0.15, 0.15, 0.15, 0.3],
			"triangle",
			0.25,
		);
	}

	playError() {
		this.playFrequencySequence([220, 185, 147], [0.1, 0.1, 0.2], "sawtooth", 0.2);
	}

	playCombo(comboCount: number) {
		const baseFreq = 440;
		const frequencies = Array.from(
			{ length: Math.min(comboCount, 8) },
			(_, i) => baseFreq * Math.pow(1.2, i),
		);
		this.playFrequencySequence(
			frequencies,
			frequencies.map(() => 0.08),
			"sine",
			0.25,
		);
	}

	playPowerUp() {
		this.playFrequencySequence(
			[261.63, 329.63, 392.0, 523.25, 659.25],
			[0.1, 0.1, 0.1, 0.1, 0.2],
			"square",
			0.2,
		);
	}

	playClick() {
		this.createOscillator(800, "square", 0.03, 0.1);
	}

	playHover() {
		this.createOscillator(600, "sine", 0.03, 0.08);
	}

	playReset() {
		this.playFrequencySequence(
			[783.99, 659.25, 523.25, 392.0],
			[0.1, 0.1, 0.1, 0.15],
			"sine",
			0.2,
		);
	}

	playAchievement() {
		this.playFrequencySequence(
			[523.25, 587.33, 659.25, 783.99, 880.0, 1046.5],
			[0.15, 0.15, 0.15, 0.15, 0.15, 0.4],
			"triangle",
			0.3,
		);
	}

	setVolume(volume: number) {
		this.volume = Math.max(0, Math.min(1, volume));
		if (this.masterGain) {
			this.masterGain.gain.value = this.volume;
		}
	}

	setEnabled(enabled: boolean) {
		this.enabled = enabled;
	}

	setMusicEnabled(enabled: boolean) {
		this.musicEnabled = enabled;
	}

	isEnabled() {
		return this.enabled;
	}
}

export const soundManager = new SoundManager();
