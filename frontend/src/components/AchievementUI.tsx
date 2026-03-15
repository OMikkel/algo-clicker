import { useEffect, useState } from "react";
import { achievementSystem, type Achievement } from "../systems/AchievementSystem";
import { soundManager } from "../effects/SoundManager";

export function AchievementNotification() {
	const [achievement, setAchievement] = useState<Achievement | null>(null);
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const handleUnlock = (unlockedAchievement: Achievement) => {
			setAchievement(unlockedAchievement);
			setVisible(true);
			soundManager.playAchievement();

			setTimeout(() => {
				setVisible(false);
				setTimeout(() => setAchievement(null), 500);
			}, 5000);
		};

		achievementSystem.onAchievementUnlocked(handleUnlock);
	}, []);

	if (!achievement) return null;

	const rarityColors = {
		common: "bg-gray-500",
		rare: "bg-blue-500",
		epic: "bg-purple-500",
		legendary: "bg-yellow-500",
	};

	return (
		<div
			className={`fixed top-4 right-4 z-50 transition-all duration-500 ${
				visible
					? "translate-x-0 opacity-100"
					: "translate-x-full opacity-0"
			}`}
		>
			<div
				className={`${rarityColors[achievement.rarity]} text-white rounded-lg shadow-2xl p-4 min-w-72 border-4 border-white`}
			>
				<div className="flex items-center gap-3">
					<div className="text-4xl">{achievement.icon}</div>
					<div className="flex-1">
						<div className="font-bold text-sm uppercase tracking-wide">
							Achievement Unlocked!
						</div>
						<div className="font-bold text-lg">{achievement.name}</div>
						<div className="text-sm opacity-90">{achievement.description}</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export function AchievementPanel() {
	const [achievements, setAchievements] = useState<Achievement[]>([]);
	const [stats, setStats] = useState(achievementSystem.getStats());
	const [filter, setFilter] = useState<"all" | "unlocked" | "locked">("all");

	useEffect(() => {
		const updateAchievements = () => {
			setAchievements(achievementSystem.getAchievements());
			setStats(achievementSystem.getStats());
		};

		updateAchievements();
		achievementSystem.onAchievementUnlocked(updateAchievements);
	}, []);

	const filteredAchievements = achievements.filter((a) => {
		if (filter === "unlocked") return a.unlocked;
		if (filter === "locked") return !a.unlocked;
		return true;
	});

	const rarityColors = {
		common: "border-gray-400 bg-gray-50",
		rare: "border-blue-400 bg-blue-50",
		epic: "border-purple-400 bg-purple-50",
		legendary: "border-yellow-400 bg-yellow-50",
	};

	return (
		<div className="p-4 max-h-[600px] overflow-y-auto">
			<h2 className="text-2xl font-bold mb-4">Achievements</h2>

			{/* Stats Summary */}
			<div className="grid grid-cols-2 gap-2 mb-4 text-sm">
				<div className="bg-gray-100 p-2 rounded">
					<div className="font-bold">Total Swaps</div>
					<div className="text-xl">{stats.totalSwaps}</div>
				</div>
				<div className="bg-gray-100 p-2 rounded">
					<div className="font-bold">Total Steps</div>
					<div className="text-xl">{stats.totalSteps}</div>
				</div>
				<div className="bg-gray-100 p-2 rounded">
					<div className="font-bold">Perfect Sorts</div>
					<div className="text-xl">{stats.perfectSorts}</div>
				</div>
				<div className="bg-gray-100 p-2 rounded">
					<div className="font-bold">Max Combo</div>
					<div className="text-xl">{stats.comboMax}x</div>
				</div>
			</div>

			{/* Filter Buttons */}
			<div className="flex gap-2 mb-4">
				<button
					onClick={() => setFilter("all")}
					className={`px-3 py-1 rounded ${
						filter === "all"
							? "bg-blue-500 text-white"
							: "bg-gray-200"
					}`}
				>
					All ({achievements.length})
				</button>
				<button
					onClick={() => setFilter("unlocked")}
					className={`px-3 py-1 rounded ${
						filter === "unlocked"
							? "bg-blue-500 text-white"
							: "bg-gray-200"
					}`}
				>
					Unlocked ({achievements.filter((a) => a.unlocked).length})
				</button>
				<button
					onClick={() => setFilter("locked")}
					className={`px-3 py-1 rounded ${
						filter === "locked"
							? "bg-blue-500 text-white"
							: "bg-gray-200"
					}`}
				>
					Locked ({achievements.filter((a) => !a.unlocked).length})
				</button>
			</div>

			{/* Achievement List */}
			<div className="space-y-2">
				{filteredAchievements.map((achievement) => (
					<div
						key={achievement.id}
						className={`border-2 rounded-lg p-3 ${
							achievement.unlocked
								? rarityColors[achievement.rarity]
								: "border-gray-300 bg-gray-100 opacity-60"
						}`}
					>
						<div className="flex items-center gap-3">
							<div
								className={`text-3xl ${
									achievement.unlocked ? "" : "grayscale"
								}`}
							>
								{achievement.icon}
							</div>
							<div className="flex-1">
								<div className="font-bold">{achievement.name}</div>
								<div className="text-sm text-gray-700">
									{achievement.description}
								</div>
								{achievement.target && (
									<div className="mt-1">
										<div className="text-xs text-gray-600">
											Progress: {achievement.progress || 0} /{" "}
											{achievement.target}
										</div>
										<div className="w-full bg-gray-300 rounded-full h-2 mt-1">
											<div
												className="bg-blue-500 h-2 rounded-full transition-all"
												style={{
													width: `${Math.min(
														((achievement.progress || 0) /
															achievement.target) *
															100,
														100,
													)}%`,
												}}
											></div>
										</div>
									</div>
								)}
								{achievement.unlocked && achievement.unlockedAt && (
									<div className="text-xs text-gray-500 mt-1">
										Unlocked:{" "}
										{new Date(achievement.unlockedAt).toLocaleDateString()}
									</div>
								)}
							</div>
							<div className="text-xs font-bold uppercase opacity-50">
								{achievement.rarity}
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
