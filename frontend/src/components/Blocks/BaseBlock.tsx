import { BLOCK_REGISTRY } from "../../constants/AstConditions";
import type { BaseBlock } from "../../types/blocks";
import { cn } from "../../utils/cn";
import DraggableElement from "../DraggableElement";
import DropZone from "../DropZone";
import BlockDataEditor from "./BlockDataEditor";

export default function BaseBlock({
	block,
	template = false,
	disabled = false,
	editable = true,
}: {
	block: BaseBlock | null;
	template?: boolean;
	disabled?: boolean;
	editable?: boolean;
}) {
	if (!block)
		return <div className="p-2 bg-red-500 text-amber-200">No block found</div>;
	const config = BLOCK_REGISTRY[block.type];

	if (!config)
		return <div className="p-2 bg-red-500">Unknown Type: {block.type}</div>;

	return (
		<DraggableElement
			id={block.id}
			type={block.type}
			className={cn(
				"min-w-48 p-2 rounded shadow-lg border-2 border-white/10",
				config.color,
			)}
			template={template}
			disabled={disabled}
			editable={editable}
		>
			<div className="flex flex-col gap-3">
				<div
					className={cn(
						"flex flex-wrap justify-between items-center gap-2 border-white/20 pb-1",
						template ? "border-none" : "border-b",
					)}
				>
					<div className="min-w-0 flex-1 flex flex-wrap items-center gap-x-2 gap-y-1">
						<p className="font-bold uppercase text-xs shrink-0">
							{config.displayTitle || block.type}
						</p>
						<p className="min-w-48 flex-1 text-[10px] opacity-80 text-left wrap-break-word">
							{config.helpText || "No help text available."}
						</p>
					</div>

					{/* Render unique inputs like IntLit values here */}
					{!template && (
						<div className="shrink-0">
							<BlockDataEditor block={block} editable={editable} />
						</div>
					)}
				</div>

				{!template &&
					config.slots.map((slot) => (
						<div key={slot.id} className="flex flex-col gap-1">
							<label className="text-[10px] font-mono opacity-80 text-left">
								{slot.label}
							</label>
							<DropZone
								template={template}
								editable={editable}
								disabled={disabled}
								id={`${block.id}-${slot.id}`}
								slot={slot.id}
								accepts={slot.accepts}
								maxElements={slot.max}
								blockIds={
									Array.isArray(block[slot.id])
										? block[slot.id]
										: block[slot.id]
											? [block[slot.id]]
											: []
								}
							/>
						</div>
					))}
			</div>
		</DraggableElement>
	);
}
