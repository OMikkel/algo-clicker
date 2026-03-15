import { BLOCK_REGISTRY } from "../../constants/AstConditions";
import type { BaseBlock } from "../../types/blocks";
import DropZone from "../DropZone";

export default function InitialBlock({ block }: { block: BaseBlock | null }) {
	console.log("Rendering INITIAL block:", block);
	if (!block) return <div className="p-2 bg-red-500">No block found</div>;
	const config = BLOCK_REGISTRY[block.type];

	if (!config)
		return <div className="p-2 bg-red-500">Unknown Type: {block.type}</div>;

	return (
		<div className="flex flex-col gap-3">
			<div className="flex justify-between items-center border-b border-white/20 pb-1">
				<p className="font-bold uppercase text-xs">
					{config.displayTitle || block.type}
				</p>
				<span>
					<p className="text-[10px] opacity-80 text-left">
						{config.helpText || "No help text available."}
					</p>
				</span>
			</div>
			{config.slots[0] && (
				<div key={config.slots[0].id} className="flex flex-col gap-1">
					<label className="text-[10px] font-mono opacity-80 text-left">
						{config.slots[0].label}
					</label>
					<DropZone
						template={false}
						disabled={true}
						editable={false}
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
			{config.slots[1] && (
				<div key={config.slots[1].id} className="flex flex-col gap-1">
					<label className="text-[10px] font-mono opacity-80 text-left">
						{config.slots[1].label}
					</label>
					<DropZone
						template={false}
						disabled={false}
						editable={true}
						id={`${block.id}-${config.slots[1].id}`}
						slot={config.slots[1].id}
						accepts={config.slots[1].accepts}
						maxElements={config.slots[1].max}
						blockIds={
							Array.isArray(block[config.slots[1].id])
								? block[config.slots[1].id]
								: block[config.slots[1].id]
									? [block[config.slots[1].id]]
									: []
						}
					/>
				</div>
			)}
		</div>
	);
}
