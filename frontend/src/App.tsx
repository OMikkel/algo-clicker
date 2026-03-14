import "./App.css";
import BlockCanvas from "./components/BlockCanvas";
import GlobalStateProvider from "./context/GlobalStateContext";

function App() {
	return (
		<GlobalStateProvider>
			<BlockCanvas />
		</GlobalStateProvider>
	);
}

export default App;
