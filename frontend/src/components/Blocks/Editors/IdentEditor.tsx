import { useGlobalStateContext } from "../../../context/GlobalStateContext";

export function IdentEditor({ block }: { block: any }) {
	const { updateBlockData } = useGlobalStateContext();

	return (
		<input
			type="text"
			value={block.ident ?? ""}
			onPointerDown={(e) => e.stopPropagation()} // CRUCIAL: allow interaction without dragging
			onChange={(e) => updateBlockData(block.id, { ident: e.target.value })}
			className="w-32 bg-black/30 border-none rounded px-1 text-right"
		/>
	);
}
