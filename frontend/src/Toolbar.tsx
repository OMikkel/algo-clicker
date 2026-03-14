import BlockSelector from "./components/BlockSelector";
import { useGlobalStateContext } from "./context/GlobalStateContext";

type Props = {};

export default function Toolbar({}: Props) {
	const { templates } = useGlobalStateContext();

	return (
		<div className="w-64 bg-gray-800 p-4 rounded-md">
			<h2 className="text-white text-lg font-bold mb-4">Toolbar</h2>
			{templates.map((templateId) => (
				<BlockSelector key={templateId} id={templateId} />
			))}
		</div>
	);
}
