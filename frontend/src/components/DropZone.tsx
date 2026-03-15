import { useDroppable } from "@dnd-kit/react";
import { useGlobalStateContext } from "../context/GlobalStateContext";
import type { BlockId } from "../types/blocks";
import { cn } from "../utils/cn";
import BlockSelector from "./BlockSelector";

type Props = {
	id: string;
	maxElements?: number;
	slot: string;
	accepts?: string[];
	blockIds: BlockId[] | null;
	children?: React.ReactNode;
	className?: string;
	template?: boolean;
	disabled?: boolean;
	editable?: boolean;
};

export default function DropZone({
	id,
	maxElements,
	slot,
	accepts,
	blockIds,
	className,
	template = false,
	disabled = false,
	editable = true,
}: Props) {
	const { blocks, draggedBlockId } = useGlobalStateContext();
	const { ref, isDropTarget } = useDroppable({
		id: id,
		data: { slot, accepts, maxElements },
		disabled: disabled, // Disable dropping when in preview mode
	});

	const normalizedDraggedBlockId = draggedBlockId
		? String(draggedBlockId).replace("draggable:", "")
		: null;
	const draggedBlock = normalizedDraggedBlockId
		? blocks[normalizedDraggedBlockId]
		: null;
	const existingBlockIds = (blockIds ?? []).filter(
		(blockId) => !!blocks[blockId],
	);

	// 1. Check if max elements reached
	const isMaxElementsReached =
		maxElements !== undefined && existingBlockIds.length >= maxElements;

	// 2. Check if the type is accepted
	const acceptsDraggedBlock = !!(
		draggedBlock &&
		(!accepts ||
			accepts.includes("Block") ||
			accepts.includes(draggedBlock.type))
	);

	const targetSlot = slot;

	const targetBlockId =
		targetSlot === "root" ? "root" : id.replace(`-${targetSlot}`, "");

	const isSelf = normalizedDraggedBlockId === targetBlockId;

	// 3. Final canDrop
	const canDrop =
		isDropTarget && !isMaxElementsReached && !isSelf && acceptsDraggedBlock;

	return (
		<div
			ref={ref}
			className={cn(
				"relative flex flex-1 border border-dashed p-1 flex-col gap-2 rounded-md bg-gray-200",
				canDrop
					? "border-blue-500 bg-blue-50/10"
					: "border-gray-500 bg-gray-200",
				className,
			)}
		>
			{/* 1. Existing Blocks */}
			{existingBlockIds.map((blockId) => (
				<BlockSelector
					key={blockId}
					id={blockId}
					template={template}
					disabled={disabled}
					editable={editable}
				/>
			))}

			{/* 2. The Insertion Shadow */}
			{canDrop && (
				<div className="h-12 border-2 border-dashed border-blue-400 bg-blue-100/20 rounded-md flex items-center justify-center animate-pulse">
					<span className="text-blue-400 text-xs font-bold uppercase">
						Insert {draggedBlock?.type}
					</span>
				</div>
			)}

			{/* 3. Empty State */}
			{existingBlockIds.length === 0 && !canDrop && (
				<p className="text-gray-500 italic text-sm flex p-3 items-center justify-center">
					Drop blocks here
				</p>
			)}
		</div>
	);
}
