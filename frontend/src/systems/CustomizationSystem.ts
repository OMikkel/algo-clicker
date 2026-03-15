export interface AlgoCustomization {
	headColor: string;
	bodyColor: string;
	eyeColor: string;
	handColor: string;
	antennaColor: string;
	neckColor: string;
	hatEnabled: boolean;
	glowEnabled: boolean;
	trailEnabled: boolean;
}

export class CustomizationSystem {
	private customization: AlgoCustomization;
	private listeners: Array<(customization: AlgoCustomization) => void> = [];

	constructor() {
		this.customization = this.loadCustomization();
	}

	private loadCustomization(): AlgoCustomization {
		const saved = localStorage.getItem("algoCustomization");
		if (saved) {
			return JSON.parse(saved);
		}
		return this.getDefaultCustomization();
	}

	private getDefaultCustomization(): AlgoCustomization {
		return {
			headColor: "rgb(65, 179, 255)",
			bodyColor: "rgb(65, 179, 255)",
			eyeColor: "white",
			handColor: "red",
			antennaColor: "rgb(0, 153, 255)",
			neckColor: "rgb(0, 153, 255)",
			hatEnabled: false,
			glowEnabled: false,
			trailEnabled: false,
		};
	}

	private saveCustomization() {
		localStorage.setItem(
			"algoCustomization",
			JSON.stringify(this.customization),
		);
		this.notifyListeners();
	}

	getCustomization(): AlgoCustomization {
		return { ...this.customization };
	}

	updateCustomization(updates: Partial<AlgoCustomization>) {
		this.customization = { ...this.customization, ...updates };
		this.saveCustomization();
	}

	reset() {
		this.customization = this.getDefaultCustomization();
		this.saveCustomization();
	}

	// Preset themes
	applyTheme(theme: "default" | "neon" | "sunset" | "forest" | "ocean" | "rainbow") {
		switch (theme) {
			case "default":
				this.customization = this.getDefaultCustomization();
				break;
			case "neon":
				this.customization = {
					headColor: "#FF00FF",
					bodyColor: "#FF00FF",
					eyeColor: "#00FFFF",
					handColor: "#FFFF00",
					antennaColor: "#00FF00",
					neckColor: "#FF00FF",
					hatEnabled: false,
					glowEnabled: true,
					trailEnabled: true,
				};
				break;
			case "sunset":
				this.customization = {
					headColor: "#FF6B6B",
					bodyColor: "#FFA500",
					eyeColor: "white",
					handColor: "#FFD700",
					antennaColor: "#FF4500",
					neckColor: "#FF8C00",
					hatEnabled: false,
					glowEnabled: false,
					trailEnabled: false,
				};
				break;
			case "forest":
				this.customization = {
					headColor: "#228B22",
					bodyColor: "#32CD32",
					eyeColor: "white",
					handColor: "#8B4513",
					antennaColor: "#006400",
					neckColor: "#228B22",
					hatEnabled: true,
					glowEnabled: false,
					trailEnabled: false,
				};
				break;
			case "ocean":
				this.customization = {
					headColor: "#1E90FF",
					bodyColor: "#4169E1",
					eyeColor: "white",
					handColor: "#00CED1",
					antennaColor: "#0000CD",
					neckColor: "#4682B4",
					hatEnabled: false,
					glowEnabled: true,
					trailEnabled: false,
				};
				break;
			case "rainbow":
				this.customization = {
					headColor: "#FF0000",
					bodyColor: "#FFA500",
					eyeColor: "white",
					handColor: "#FFFF00",
					antennaColor: "#00FF00",
					neckColor: "#0000FF",
					hatEnabled: true,
					glowEnabled: true,
					trailEnabled: true,
				};
				break;
		}
		this.saveCustomization();
	}

	onCustomizationChange(callback: (customization: AlgoCustomization) => void) {
		this.listeners.push(callback);
	}

	private notifyListeners() {
		this.listeners.forEach((listener) => listener(this.customization));
	}
}

export const customizationSystem = new CustomizationSystem();
