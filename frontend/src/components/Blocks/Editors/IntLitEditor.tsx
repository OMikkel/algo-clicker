import { useGlobalStateContext } from "../../../context/GlobalStateContext";
import type { IntLitBlock } from "../../../types/blocks/intType";

export function IntLitEditor({
	block,
	editable,
}: {
	block: IntLitBlock;
	editable?: boolean;
}) {
	const { updateBlockData } = useGlobalStateContext();

	return (
		<input
			type="number"
			value={block.v}
			onPointerDown={(e) => e.stopPropagation()} // CRUCIAL: allow interaction without dragging
			onChange={(e) =>
				updateBlockData(block.id, { v: parseInt(e.target.value) || 0 })
			}
			className="w-16 bg-black/30 border-none rounded px-1 text-right"
			disabled={!editable}
		/>
	);
}
