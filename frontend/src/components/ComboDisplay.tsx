import { useEffect, useState } from "react";
import { comboSystem } from "../systems/ComboSystem";

export function ComboDisplay() {
	const [combo, setCombo] = useState(0);
	const [visible, setVisible] = useState(false);
	const [scale, setScale] = useState(1);

	useEffect(() => {
		const handleComboChange = (newCombo: number) => {
			setCombo(newCombo);
			setVisible(newCombo >= 3); // Show combo display after 3x
			setScale(1.5);
			setTimeout(() => setScale(1), 200);
		};

		const handleComboReset = () => {
			setVisible(false);
			setTimeout(() => setCombo(0), 300);
		};

		comboSystem.onComboChange(handleComboChange);
		comboSystem.onComboReset(handleComboReset);
	}, []);

	if (!visible) return null;

	const multiplier = comboSystem.getMultiplier();

	const getComboColor = () => {
		if (combo >= 20) return "text-red-500";
		if (combo >= 10) return "text-purple-500";
		if (combo >= 5) return "text-yellow-500";
		return "text-blue-500";
	};

	const getComboGlow = () => {
		if (combo >= 20) return "drop-shadow-[0_0_10px_rgba(255,0,0,0.8)]";
		if (combo >= 10) return "drop-shadow-[0_0_10px_rgba(147,51,234,0.8)]";
		if (combo >= 5) return "drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]";
		return "drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]";
	};

	return (
		<div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40">
			<div
				className={`${getComboColor()} ${getComboGlow()} font-bold text-center transition-all duration-200`}
				style={{ transform: `scale(${scale})` }}
			>
				<div className="text-6xl animate-pulse">{combo}x</div>
				<div className="text-2xl">COMBO!</div>
				{multiplier > 1 && (
					<div className="text-lg">
						{multiplier}x Multiplier
					</div>
				)}
			</div>
		</div>
	);
}
