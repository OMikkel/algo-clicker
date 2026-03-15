export interface Achievement {
	id: string;
	name: string;
	description: string;
	icon: string;
	unlocked: boolean;
	unlockedAt?: number;
	progress?: number;
	target?: number;
	rarity: "common" | "rare" | "epic" | "legendary";
}

export interface Stats {
	totalSwaps: number;
	totalSteps: number;
	totalPrograms: number;
	perfectSorts: number;
	comboMax: number;
	speedrunBest: number;
	errorsEncountered: number;
	achievementsUnlocked: number;
	totalPlayTime: number;
	lastPlayed: number;
}

export class AchievementSystem {
	private achievements: Map<string, Achievement> = new Map();
	private stats: Stats;
	private listeners: Array<(achievement: Achievement) => void> = [];

	constructor() {
		this.stats = this.loadStats();
		this.initializeAchievements();
		this.checkProgressAchievements();
	}

	private initializeAchievements() {
		const achievementList: Achievement[] = [
			// Beginner achievements
			{
				id: "first_swap",
				name: "First Steps",
				description: "Perform your first array swap",
				icon: "🎯",
				unlocked: false,
				rarity: "common",
			},
			{
				id: "ten_swaps",
				name: "Getting the Hang of It",
				description: "Perform 10 swaps",
				icon: "🔄",
				unlocked: false,
				progress: 0,
				target: 10,
				rarity: "common",
			},
			{
				id: "hundred_swaps",
				name: "Swap Master",
				description: "Perform 100 swaps",
				icon: "⚡",
				unlocked: false,
				progress: 0,
				target: 100,
				rarity: "rare",
			},

			// Perfect execution
			{
				id: "perfect_sort",
				name: "Perfection",
				description: "Complete a sort without errors",
				icon: "✨",
				unlocked: false,
				rarity: "common",
			},
			{
				id: "ten_perfects",
				name: "Consistently Perfect",
				description: "Complete 10 perfect sorts",
				icon: "💎",
				unlocked: false,
				progress: 0,
				target: 10,
				rarity: "rare",
			},

			// Combos
			{
				id: "combo_5",
				name: "Combo Starter",
				description: "Achieve a 5x combo",
				icon: "🔥",
				unlocked: false,
				rarity: "common",
			},
			{
				id: "combo_10",
				name: "Combo Expert",
				description: "Achieve a 10x combo",
				icon: "💥",
				unlocked: false,
				rarity: "rare",
			},
			{
				id: "combo_20",
				name: "Unstoppable",
				description: "Achieve a 20x combo",
				icon: "🌟",
				unlocked: false,
				rarity: "epic",
			},

			// Speed achievements
			{
				id: "speedrun_30",
				name: "Speed Demon",
				description: "Complete a sort in under 30 seconds",
				icon: "⚡",
				unlocked: false,
				rarity: "rare",
			},
			{
				id: "speedrun_10",
				name: "Lightning Fast",
				description: "Complete a sort in under 10 seconds",
				icon: "⚡⚡",
				unlocked: false,
				rarity: "epic",
			},

			// Dedication
			{
				id: "programs_10",
				name: "Dedicated Learner",
				description: "Run 10 different programs",
				icon: "📚",
				unlocked: false,
				progress: 0,
				target: 10,
				rarity: "common",
			},
			{
				id: "programs_50",
				name: "Algorithm Enthusiast",
				description: "Run 50 different programs",
				icon: "🎓",
				unlocked: false,
				progress: 0,
				target: 50,
				rarity: "rare",
			},
			{
				id: "programs_100",
				name: "Sorting Virtuoso",
				description: "Run 100 programs",
				icon: "👑",
				unlocked: false,
				progress: 0,
				target: 100,
				rarity: "epic",
			},

			// Special achievements
			{
				id: "error_free_day",
				name: "Flawless Victory",
				description: "Complete 10 programs without a single error",
				icon: "🏆",
				unlocked: false,
				progress: 0,
				target: 10,
				rarity: "epic",
			},
			{
				id: "night_owl",
				name: "Night Owl",
				description: "Run a program after midnight",
				icon: "🦉",
				unlocked: false,
				rarity: "rare",
			},
			{
				id: "early_bird",
				name: "Early Bird",
				description: "Run a program before 6 AM",
				icon: "🐦",
				unlocked: false,
				rarity: "rare",
			},
			{
				id: "marathon",
				name: "Marathon Runner",
				description: "Spend 1 hour total using Algo Clicker",
				icon: "🏃",
				unlocked: false,
				progress: 0,
				target: 3600,
				rarity: "rare",
			},

			// Easter eggs
			{
				id: "secret_wave",
				name: "Hello There!",
				description: "Make Algo wave at you",
				icon: "👋",
				unlocked: false,
				rarity: "legendary",
			},
			{
				id: "konami_code",
				name: "Classic Gamer",
				description: "Enter the Konami Code",
				icon: "🎮",
				unlocked: false,
				rarity: "legendary",
			},
			{
				id: "click_algo",
				name: "Making Friends",
				description: "Click on Algo 10 times",
				icon: "🤝",
				unlocked: false,
				progress: 0,
				target: 10,
				rarity: "common",
			},
		];

		achievementList.forEach((achievement) => {
			this.achievements.set(achievement.id, achievement);
		});

		this.loadAchievements();
	}

	private loadStats(): Stats {
		const saved = localStorage.getItem("algoClickerStats");
		if (saved) {
			return JSON.parse(saved);
		}
		return {
			totalSwaps: 0,
			totalSteps: 0,
			totalPrograms: 0,
			perfectSorts: 0,
			comboMax: 0,
			speedrunBest: 0,
			errorsEncountered: 0,
			achievementsUnlocked: 0,
			totalPlayTime: 0,
			lastPlayed: Date.now(),
		};
	}

	private saveStats() {
		localStorage.setItem("algoClickerStats", JSON.stringify(this.stats));
	}

	private loadAchievements() {
		const saved = localStorage.getItem("algoClickerAchievements");
		if (saved) {
			const savedAchievements: Achievement[] = JSON.parse(saved);
			savedAchievements.forEach((saved) => {
				const achievement = this.achievements.get(saved.id);
				if (achievement) {
					achievement.unlocked = saved.unlocked;
					achievement.unlockedAt = saved.unlockedAt;
					achievement.progress = saved.progress;
				}
			});
		}
	}

	private saveAchievements() {
		const achievementArray = Array.from(this.achievements.values());
		localStorage.setItem(
			"algoClickerAchievements",
			JSON.stringify(achievementArray),
		);
	}

	unlock(achievementId: string) {
		const achievement = this.achievements.get(achievementId);
		if (achievement && !achievement.unlocked) {
			achievement.unlocked = true;
			achievement.unlockedAt = Date.now();
			this.stats.achievementsUnlocked++;
			this.saveAchievements();
			this.saveStats();
			this.notifyListeners(achievement);
		}
	}

	updateProgress(achievementId: string, progress: number) {
		const achievement = this.achievements.get(achievementId);
		if (achievement && !achievement.unlocked && achievement.target) {
			achievement.progress = progress;
			if (progress >= achievement.target) {
				this.unlock(achievementId);
			} else {
				this.saveAchievements();
			}
		}
	}

	incrementProgress(achievementId: string, amount: number = 1) {
		const achievement = this.achievements.get(achievementId);
		if (achievement && !achievement.unlocked && achievement.target) {
			const newProgress = (achievement.progress || 0) + amount;
			this.updateProgress(achievementId, newProgress);
		}
	}

	recordSwap() {
		this.stats.totalSwaps++;
		this.saveStats();

		if (this.stats.totalSwaps === 1) this.unlock("first_swap");
		this.updateProgress("ten_swaps", this.stats.totalSwaps);
		this.updateProgress("hundred_swaps", this.stats.totalSwaps);
	}

	recordStep() {
		this.stats.totalSteps++;
		this.saveStats();
	}

	recordProgramRun() {
		this.stats.totalPrograms++;
		this.saveStats();

		this.updateProgress("programs_10", this.stats.totalPrograms);
		this.updateProgress("programs_50", this.stats.totalPrograms);
		this.updateProgress("programs_100", this.stats.totalPrograms);

		// Time-based achievements
		const hour = new Date().getHours();
		if (hour >= 0 && hour < 6) this.unlock("early_bird");
		if (hour >= 0 && hour < 1) this.unlock("night_owl");
	}

	recordPerfectSort() {
		this.stats.perfectSorts++;
		this.saveStats();

		if (this.stats.perfectSorts === 1) this.unlock("perfect_sort");
		this.updateProgress("ten_perfects", this.stats.perfectSorts);
	}

	recordCombo(count: number) {
		if (count > this.stats.comboMax) {
			this.stats.comboMax = count;
			this.saveStats();
		}

		if (count >= 5) this.unlock("combo_5");
		if (count >= 10) this.unlock("combo_10");
		if (count >= 20) this.unlock("combo_20");
	}

	recordSpeedrun(seconds: number) {
		if (this.stats.speedrunBest === 0 || seconds < this.stats.speedrunBest) {
			this.stats.speedrunBest = seconds;
			this.saveStats();
		}

		if (seconds < 30) this.unlock("speedrun_30");
		if (seconds < 10) this.unlock("speedrun_10");
	}

	recordError() {
		this.stats.errorsEncountered++;
		this.saveStats();
	}

	recordPlayTime(seconds: number) {
		this.stats.totalPlayTime += seconds;
		this.saveStats();

		this.updateProgress("marathon", this.stats.totalPlayTime);
	}

	checkKonamiCode() {
		this.unlock("konami_code");
	}

	checkAlgoClick(count: number) {
		this.updateProgress("click_algo", count);
	}

	checkSecretWave() {
		this.unlock("secret_wave");
	}

	private checkProgressAchievements() {
		this.updateProgress("ten_swaps", this.stats.totalSwaps);
		this.updateProgress("hundred_swaps", this.stats.totalSwaps);
		this.updateProgress("ten_perfects", this.stats.perfectSorts);
		this.updateProgress("programs_10", this.stats.totalPrograms);
		this.updateProgress("programs_50", this.stats.totalPrograms);
		this.updateProgress("programs_100", this.stats.totalPrograms);
		this.updateProgress("marathon", this.stats.totalPlayTime);
	}

	getAchievements(): Achievement[] {
		return Array.from(this.achievements.values());
	}

	getUnlockedAchievements(): Achievement[] {
		return this.getAchievements().filter((a) => a.unlocked);
	}

	getLockedAchievements(): Achievement[] {
		return this.getAchievements().filter((a) => !a.unlocked);
	}

	getStats(): Stats {
		return { ...this.stats };
	}

	onAchievementUnlocked(callback: (achievement: Achievement) => void) {
		this.listeners.push(callback);
	}

	private notifyListeners(achievement: Achievement) {
		this.listeners.forEach((listener) => listener(achievement));
	}

	reset() {
		this.achievements.forEach((achievement) => {
			achievement.unlocked = false;
			achievement.progress = 0;
			achievement.unlockedAt = undefined;
		});
		this.stats = {
			totalSwaps: 0,
			totalSteps: 0,
			totalPrograms: 0,
			perfectSorts: 0,
			comboMax: 0,
			speedrunBest: 0,
			errorsEncountered: 0,
			achievementsUnlocked: 0,
			totalPlayTime: 0,
			lastPlayed: Date.now(),
		};
		this.saveAchievements();
		this.saveStats();
	}
}

export const achievementSystem = new AchievementSystem();
