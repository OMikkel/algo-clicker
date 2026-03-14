import "./App.css";
import BlockCanvas from "./components/BlockCanvas";
import Visualization from "./components/Visualization";
import GlobalStateProvider from "./context/GlobalStateContext";

function App() {
	return (
		<GlobalStateProvider>
			<div className="flex flex-row">
			<BlockCanvas />
			<Visualization />
			</div>
		</GlobalStateProvider>
	);
}

export default App;
