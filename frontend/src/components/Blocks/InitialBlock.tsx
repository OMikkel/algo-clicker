import { BLOCK_REGISTRY } from "../../constants/AstConditions";
import type { BaseBlock } from "../../types/blocks";
import DropZone from "../DropZone";
import BlockDataEditor from "./BlockDataEditor";

export default function InitialBlock({ block }: { block: BaseBlock | null }) {
	console.log("Rendering INITIAL block:", block);
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
			{config.slots[0] && (
				<div key={config.slots[0].id} className="flex flex-col gap-1">
					<label className="text-[10px] font-mono opacity-80 text-left">
						{config.slots[0].label}
					</label>
					<DropZone
						preview={true}
						id={`${block.id}-${config.slots[0].id}`}
						slot={config.slots[0].id}
						accepts={config.slots[0].accepts}
						maxElements={config.slots[0].max}
						blockIds={
							Array.isArray(block[config.slots[0].id])
								? block[config.slots[0].id]
								: block[config.slots[0].id]
									? [block[config.slots[0].id]]
									: []
						}
					/>
				</div>
			)}
		</div>
	);
}
