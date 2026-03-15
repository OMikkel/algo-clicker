import BlockSelector from "./components/BlockSelector";
import { useGlobalStateContext } from "./context/GlobalStateContext";

export default function Toolbar() {
	const { templates } = useGlobalStateContext();

	return (
		<div className="bg-gray-800 p-4 rounded-md">
			<h2 className="text-white text-lg font-bold mb-4">Toolbar</h2>
			<div>
				{templates.map((templateId) => (
					<BlockSelector key={templateId} id={templateId} />
				))}
			</div>
		</div>
	);
}
