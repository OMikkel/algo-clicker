import { useState } from "react";
import { customizationSystem, type AlgoCustomization } from "../systems/CustomizationSystem";
import { soundManager } from "../effects/SoundManager";

export function CustomizationPanel() {
	const [customization, setCustomization] = useState<AlgoCustomization>(
		customizationSystem.getCustomization(),
	);
	const [soundEnabled, setSoundEnabled] = useState(soundManager.isEnabled());

	const handleColorChange = (key: keyof AlgoCustomization, value: string) => {
		const updates = { [key]: value };
		customizationSystem.updateCustomization(updates);
		setCustomization(customizationSystem.getCustomization());
	};

	const handleToggle = (key: keyof AlgoCustomization) => {
		const currentValue = customization[key];
		const updates = { [key]: !currentValue };
		customizationSystem.updateCustomization(updates);
		setCustomization(customizationSystem.getCustomization());
	};

	const applyTheme = (theme: "default" | "neon" | "sunset" | "forest" | "ocean" | "rainbow") => {
		customizationSystem.applyTheme(theme);
		setCustomization(customizationSystem.getCustomization());
		soundManager.playPowerUp();
	};

	const toggleSound = () => {
		const newState = !soundEnabled;
		soundManager.setEnabled(newState);
		setSoundEnabled(newState);
		if (newState) {
			soundManager.playClick();
		}
	};

	return (
		<div className="p-4 max-h-[600px] overflow-y-auto">
			<h2 className="text-2xl font-bold mb-4">Customize Algo</h2>

			{/* Quick Themes */}
			<div className="mb-6">
				<h3 className="font-bold mb-2">Quick Themes</h3>
				<div className="grid grid-cols-3 gap-2">
					<button
						onClick={() => applyTheme("default")}
						className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
					>
						Default
					</button>
					<button
						onClick={() => applyTheme("neon")}
						className="px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
					>
						Neon 🌟
					</button>
					<button
						onClick={() => applyTheme("sunset")}
						className="px-3 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
					>
						Sunset 🌅
					</button>
					<button
						onClick={() => applyTheme("forest")}
						className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
					>
						Forest 🌲
					</button>
					<button
						onClick={() => applyTheme("ocean")}
						className="px-3 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600"
					>
						Ocean 🌊
					</button>
					<button
						onClick={() => applyTheme("rainbow")}
						className="px-3 py-2 bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 text-white rounded hover:opacity-80"
					>
						Rainbow 🌈
					</button>
				</div>
			</div>

			{/* Color Customization */}
			<div className="mb-6">
				<h3 className="font-bold mb-2">Colors</h3>
				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<label className="text-sm">Head Color</label>
						<input
							type="color"
							value={customization.headColor}
							onChange={(e) => handleColorChange("headColor", e.target.value)}
							className="w-16 h-8 rounded cursor-pointer"
						/>
					</div>
					<div className="flex items-center justify-between">
						<label className="text-sm">Body Color</label>
						<input
							type="color"
							value={customization.bodyColor}
							onChange={(e) => handleColorChange("bodyColor", e.target.value)}
							className="w-16 h-8 rounded cursor-pointer"
						/>
					</div>
					<div className="flex items-center justify-between">
						<label className="text-sm">Antenna Color</label>
						<input
							type="color"
							value={customization.antennaColor}
							onChange={(e) =>
								handleColorChange("antennaColor", e.target.value)
							}
							className="w-16 h-8 rounded cursor-pointer"
						/>
					</div>
					<div className="flex items-center justify-between">
						<label className="text-sm">Hand Color</label>
						<input
							type="color"
							value={customization.handColor}
							onChange={(e) => handleColorChange("handColor", e.target.value)}
							className="w-16 h-8 rounded cursor-pointer"
						/>
					</div>
				</div>
			</div>

			{/* Effects */}
			<div className="mb-6">
				<h3 className="font-bold mb-2">Effects</h3>
				<div className="space-y-2">
					<label className="flex items-center justify-between">
						<span className="text-sm">Glow Effect</span>
						<input
							type="checkbox"
							checked={customization.glowEnabled}
							onChange={() => handleToggle("glowEnabled")}
							className="w-6 h-6 cursor-pointer"
						/>
					</label>
					<label className="flex items-center justify-between">
						<span className="text-sm">Motion Trail</span>
						<input
							type="checkbox"
							checked={customization.trailEnabled}
							onChange={() => handleToggle("trailEnabled")}
							className="w-6 h-6 cursor-pointer"
						/>
					</label>
					<label className="flex items-center justify-between">
						<span className="text-sm">Party Hat</span>
						<input
							type="checkbox"
							checked={customization.hatEnabled}
							onChange={() => handleToggle("hatEnabled")}
							className="w-6 h-6 cursor-pointer"
						/>
					</label>
				</div>
			</div>

			{/* Sound Settings */}
			<div className="mb-6">
				<h3 className="font-bold mb-2">Sound</h3>
				<label className="flex items-center justify-between">
					<span className="text-sm">Sound Effects</span>
					<input
						type="checkbox"
						checked={soundEnabled}
						onChange={toggleSound}
						className="w-6 h-6 cursor-pointer"
					/>
				</label>
			</div>

			{/* Reset Button */}
			<button
				onClick={() => {
					customizationSystem.reset();
					setCustomization(customizationSystem.getCustomization());
					soundManager.playReset();
				}}
				className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
			>
				Reset to Default
			</button>
		</div>
	);
}
