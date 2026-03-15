import { useGlobalStateContext } from "../../../context/GlobalStateContext";
import type { BoolLitBlock } from "../../../types/blocks";

export function BoolLitEditor({
	block,
	editable,
}: {
	block: BoolLitBlock;
	editable?: boolean;
}) {
	const { updateBlockData } = useGlobalStateContext();

	return (
		<button
			onClick={(e) => {
				e.stopPropagation(); // Prevents triggering a drag
				updateBlockData(block.id, { b: !block.b });
			}}
			className="px-2 py-1 bg-green-700 rounded text-white font-bold"
			disabled={!editable}
		>
			{block.b ? "TRUE" : "FALSE"}
		</button>
	);
}
