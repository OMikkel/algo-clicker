import { useGlobalStateContext } from "../context/GlobalStateContext";
import DropZone from "./DropZone";

export default function BlockCanvas() {
	const { rootBlocks } = useGlobalStateContext();

	return (
		<div className="w-full bg-gray-800 p-4 rounded-md">
			<div>
				<h2 className="text-white text-lg font-bold mb-4">Canvas</h2>
				<button>Play</button>
				<button>Refresh</button>
				<button>Reset</button>
			</div>
			<DropZone
				id="root"
				slot="root"
				blockIds={rootBlocks}
				className="w-full h-full bg-gray-800 p-4 rounded-md border-none"
			/>
		</div>
	);
}
