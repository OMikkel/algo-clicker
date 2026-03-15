export class ComboSystem {
	private currentCombo = 0;
	private comboTimer: NodeJS.Timeout | null = null;
	private comboTimeout = 3000; // 3 seconds between actions to maintain combo
	private listeners: Array<(combo: number) => void> = [];
	private resetListeners: Array<() => void> = [];

	increment() {
		this.currentCombo++;
		this.resetTimer();
		this.notifyListeners();
	}

	private resetTimer() {
		if (this.comboTimer) {
			clearTimeout(this.comboTimer);
		}

		this.comboTimer = setTimeout(() => {
			this.reset();
		}, this.comboTimeout);
	}

	reset() {
		if (this.comboTimer) {
			clearTimeout(this.comboTimer);
			this.comboTimer = null;
		}
		this.currentCombo = 0;
		this.notifyResetListeners();
	}

	getCurrent(): number {
		return this.currentCombo;
	}

	getMultiplier(): number {
		if (this.currentCombo < 5) return 1;
		if (this.currentCombo < 10) return 1.5;
		if (this.currentCombo < 20) return 2;
		if (this.currentCombo < 50) return 3;
		return 5;
	}

	onComboChange(callback: (combo: number) => void) {
		this.listeners.push(callback);
	}

	onComboReset(callback: () => void) {
		this.resetListeners.push(callback);
	}

	private notifyListeners() {
		this.listeners.forEach((listener) => listener(this.currentCombo));
	}

	private notifyResetListeners() {
		this.resetListeners.forEach((listener) => listener());
	}
}

export const comboSystem = new ComboSystem();
