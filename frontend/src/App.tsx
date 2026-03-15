import { useEffect, useRef, useState } from "react";
import Workbench from "./components/Workbench";
import VisualizationEnhanced from "./components/VisualizationEnhanced";
import GlobalStateProvider from "./context/GlobalStateContext";
import Toolbar from "./Toolbar";
import { AchievementNotification, AchievementPanel } from "./components/AchievementUI";
import { ComboDisplay } from "./components/ComboDisplay";
import { CustomizationPanel } from "./components/CustomizationUI";

function App() {
	const [showAchievements, setShowAchievements] = useState(false);
	const [showCustomization, setShowCustomization] = useState(false);

	return (
		<GlobalStateProvider>
			<div className="relative">
				<AchievementNotification />
				<ComboDisplay />

				<div className="grid grid-cols-[1fr_2fr_1fr] gap-3 p-3 w-screen">
					<Toolbar />
					<Workbench />
					<VisualizationFrame />
				</div>

				{/* Achievement Button */}
				<button
					onClick={() => setShowAchievements(!showAchievements)}
					className="fixed bottom-4 right-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg text-2xl z-50 transition-transform hover:scale-110"
					title="Achievements"
				>
					🏆
				</button>

				{/* Customization Button */}
				<button
					onClick={() => setShowCustomization(!showCustomization)}
					className="fixed bottom-20 right-4 bg-purple-500 hover:bg-purple-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg text-2xl z-50 transition-transform hover:scale-110"
					title="Customize Algo"
				>
					🎨
				</button>

				{/* Achievement Panel Modal */}
				{showAchievements && (
					<div
						className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
						onClick={() => setShowAchievements(false)}
					>
						<div
							className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
							onClick={(e) => e.stopPropagation()}
						>
							<div className="flex justify-between items-center p-4 border-b">
								<h2 className="text-2xl font-bold">Achievements & Stats</h2>
								<button
									onClick={() => setShowAchievements(false)}
									className="text-gray-500 hover:text-gray-700 text-2xl"
								>
									✕
								</button>
							</div>
							<AchievementPanel />
						</div>
					</div>
				)}

				{/* Customization Panel Modal */}
				{showCustomization && (
					<div
						className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
						onClick={() => setShowCustomization(false)}
					>
						<div
							className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden"
							onClick={(e) => e.stopPropagation()}
						>
							<div className="flex justify-between items-center p-4 border-b">
								<h2 className="text-2xl font-bold">Customize Algo</h2>
								<button
									onClick={() => setShowCustomization(false)}
									className="text-gray-500 hover:text-gray-700 text-2xl"
								>
									✕
								</button>
							</div>
							<CustomizationPanel />
						</div>
					</div>
				)}
			</div>
		</GlobalStateProvider>
	);
}

function VisualizationFrame() {
	const frameRef = useRef<HTMLDivElement | null>(null);
	const [width, setWidth] = useState(400);
	const [height, setHeight] = useState(600);

	useEffect(() => {
		if (frameRef.current === null) return;
		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				setWidth(entry.contentRect.width);
				setHeight(entry.contentRect.height);
				console.log(
					`New size: ${entry.contentRect.width}px by ${entry.contentRect.height}px`,
				);
			}
		});
		observer.observe(frameRef.current);
		return () => {
			if (frameRef.current) {
				// eslint-disable-next-line react-hooks/exhaustive-deps
				observer.unobserve(frameRef.current);
			}
		};
	}, []);

	return (
		<div ref={frameRef}>
			<VisualizationEnhanced width={width} height={height} />
		</div>
	);
}

export default App;
