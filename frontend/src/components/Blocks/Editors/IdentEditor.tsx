import { useGlobalStateContext } from "../../../context/GlobalStateContext";

export function IdentEditor({ block }: { block: any }) {
	const { updateBlockData } = useGlobalStateContext();

	return (
		<input
			type="text"
			value={block.v ?? ""}
			onPointerDown={(e) => e.stopPropagation()} // CRUCIAL: allow interaction without dragging
			onChange={(e) => updateBlockData(block.id, { v: e.target.value })}
			className="w-16 bg-black/30 border-none rounded px-1 text-right"
		/>
	);
}
