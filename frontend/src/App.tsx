import { useEffect, useRef, useState } from "react";
import Workbench from "./components/Workbench";
import Visualization from "./components/Visualization";
import GlobalStateProvider from "./context/GlobalStateContext";
import Toolbar from "./Toolbar";

function App() {
	return (
		<GlobalStateProvider>
			<div className="grid grid-cols-[1fr_2fr_1fr] gap-3 p-3 w-screen">
				<Toolbar />
				<Workbench />
				<VisualizationFrame />
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
				// entry.target is the observed element
				// entry.contentRect contains the size information
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
			<Visualization width={width} height={height} />
		</div>
	);
}

export default App;
