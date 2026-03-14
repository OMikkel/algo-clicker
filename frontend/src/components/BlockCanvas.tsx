import { useGlobalStateContext } from "../context/GlobalStateContext";
import DropZone from "./DropZone";

export default function BlockCanvas() {
	const { rootBlocks } = useGlobalStateContext();

	return (
		<DropZone
			id="root"
			slot="root"
			blockIds={rootBlocks}
			className="w-full h-full bg-gray-800 p-4 rounded-md border-none"
		/>
	);
}
