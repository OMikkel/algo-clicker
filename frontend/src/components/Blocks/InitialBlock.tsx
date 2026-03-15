import { BLOCK_REGISTRY } from "../../constants/AstConditions";
import type { BaseBlock } from "../../types/blocks";
import DropZone from "../DropZone";
import BlockDataEditor from "./BlockDataEditor";

export default function InitialBlock({ block }: { block: BaseBlock | null }) {
	console.log("Rendering block:", block);
	if (!block) return <div className="p-2 bg-red-500">No block found</div>;
	const config = BLOCK_REGISTRY[block.type];

	if (!config)
		return <div className="p-2 bg-red-500">Unknown Type: {block.type}</div>;

	return (
		<div className="flex flex-col gap-3">
			<div className="flex justify-between items-center border-b border-white/20 pb-1">
				<span className="font-bold uppercase text-xs">{block.type}</span>
				{/* Render unique inputs like IntLit values here */}
				<BlockDataEditor block={block} />
			</div>
            {config.slots[0] && {
                const slot = config.slots[0];
                return(
                    
                )
            }}
		</div>
	);
}
