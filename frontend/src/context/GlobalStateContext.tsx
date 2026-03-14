import React, { useState } from "react";
import { testIntsAndIfs, testSampleIfs, testSampleInts } from "../tests/data";
import type { BaseBlock, BlockId, Blocks } from "../types/blocks";
import type { IfBlock } from "../types/blocks/if";
import { DragDropProvider, DragOverlay } from "@dnd-kit/react";

export type BlockState = {
	blocks: Blocks;
	rootBlocks: BlockId[];
};

type DragOperationEvent = {
	operation: {
		source?: any;
		target?: any;
	};
};

type GlobalState = {
	blocks: Blocks;
	rootBlocks: BlockId[];
	draggedBlockId: BlockId | null;
	updateBlockData: <T>(blockId: string, newData: Partial<T>) => void;
};

const GlobalStateContext = React.createContext<GlobalState | null>(null);

export const useGlobalStateContext = (): GlobalState => {
	const context = React.useContext(GlobalStateContext);
	if (context == null) {
		console.error(
			"useGlobalStateContext must be used within a GlobalStateProvider",
		);
	}

	return context as GlobalState;
};

export default function GlobalStateProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [draggedBlockId, setDraggedBlockId] = useState<BlockId | null>(null);
	const [blockState, setBlockState] = useState<BlockState>(testIntsAndIfs);

	const onDragStart = (event: any) => {
		const source = event.operation.source;
		if (!source) {
			console.warn("Drag start event missing source:", event);
			return;
		}

		setDraggedBlockId(source.id);
	};

	const updateBlockData = (blockId: string, newData: Partial<Block>) => {
		setBlockState((prev) => {
			// 1. Ensure the block exists
			if (!prev.blocks[blockId]) return prev;

			return {
				...prev,
				blocks: {
					...prev.blocks,
					[blockId]: {
						...prev.blocks[blockId],
						...newData, // Overwrites existing keys with new data
					},
				},
			};
		});
	};

	const onDragEnd = (event: any) => {
		const { operation } = event;
		const { source, target } = operation;
		if (!source || !target) return;

		const sourceId = String(source.id).replace("draggable:", "");
		const rawTargetId = String(target.id).replace("container:", "");
		const targetSlot = target.data?.slot;

		// Logic to extract the actual Block ID
		// If targetId is "if123-cond", targetBlockId becomes "if123"
		// If targetId is "root", it stays "root"
		const targetBlockId =
			targetSlot === "root"
				? "root"
				: rawTargetId.replace(`-${targetSlot}`, "");

		if (sourceId === targetBlockId) {
			console.warn("Cannot drop a block onto itself:", sourceId);
			return;
		}

		setBlockState((prev) => {
			const nextBlocks = { ...prev.blocks };
			let nextRoot = [...prev.rootBlocks];
			// Validation: Ensure the block actually exists in our flat state
			if (!prev.blocks[sourceId]) {
				console.error(`Block ${sourceId} not found in state!`);
				return prev;
			}

			// Now this will work because sourceId is a valid key!
			const movingBlock = { ...nextBlocks[sourceId] };
			const oldParentId = movingBlock.parentId;

			const isMaxElementsReached =
				target.data?.maxElements !== undefined &&
				(target.data?.currentElements ?? 0) >= target.data.maxElements;

			if (isMaxElementsReached) {
				console.warn(
					"Cannot drop block, max elements reached for target:",
					targetBlockId,
				);
				return prev;
			}

			const acceptsDraggedBlock = target.data?.accepts
				? target.data.accepts.includes(movingBlock.type)
				: targetSlot === "root";

			if (!acceptsDraggedBlock) {
				console.warn(
					"Cannot drop block, target does not accept this block type:",
					targetBlockId,
				);
				return prev;
			}

			console.log("Drag End Event:", {
				sourceId,
				targetId: targetBlockId,
				targetSlot,
				sourceData: source.data,
				targetData: target.data,
			});

			// 2. REMOVE from old location
			if (oldParentId === "root") {
				nextRoot = nextRoot.filter((id) => id !== sourceId);
			} else if (nextBlocks[oldParentId]) {
				const oldParent = { ...nextBlocks[oldParentId] } as BaseBlock;
				if (oldParent.type === "If") {
					if (oldParent.cond === sourceId) oldParent.cond = null;
					// Handle arrays if your slots are arrays (ifBlock/elseBlock)
					if (oldParent.ifBlock)
						oldParent.ifBlock = oldParent.ifBlock.filter(
							(id) => id !== sourceId,
						);
					if (oldParent.elseBlock)
						oldParent.elseBlock = oldParent.elseBlock.filter(
							(id) => id !== sourceId,
						);
					nextBlocks[oldParentId] = oldParent;
				} else if (oldParent.type === "IntPlus") {
					if (oldParent.v1 === sourceId) oldParent.v1 = null;
					if (oldParent.v2 === sourceId) oldParent.v2 = null;
					nextBlocks[oldParentId] = oldParent;
				} else if (oldParent.type === "IntMinus") {
					if (oldParent.v1 === sourceId) oldParent.v1 = null;
					if (oldParent.v2 === sourceId) oldParent.v2 = null;
					nextBlocks[oldParentId] = oldParent;
				}
			}

			// 3. ADD to new location
			if (targetSlot === "root") {
				movingBlock.parentId = "root";
				nextRoot.push(sourceId);
			} else {
				movingBlock.parentId = targetBlockId;
				const newParent = { ...nextBlocks[targetBlockId] } as IfBlock;

				if (targetSlot === "cond") {
					// SWAPPING LOGIC: If condition already has a block, send it to root
					if (newParent.cond) {
						const existingId = newParent.cond;
						nextBlocks[existingId] = {
							...nextBlocks[existingId],
							parentId: "root",
						};
						nextRoot.push(existingId);
					}
					newParent.cond = sourceId;
				} else if (targetSlot === "ifBlock") {
					newParent.ifBlock = [...(newParent.ifBlock || []), sourceId];
				} else if (targetSlot === "elseBlock") {
					newParent.elseBlock = [...(newParent.elseBlock || []), sourceId];
				}

				nextBlocks[targetBlockId] = newParent;
			}

			nextBlocks[sourceId] = movingBlock;

			setDraggedBlockId(null);
			return {
				blocks: nextBlocks,
				rootBlocks: nextRoot,
			};
		});
	};

	const activeBlock = draggedBlockId ? blockState.blocks[draggedBlockId] : null;

	return (
		<GlobalStateContext.Provider
			value={{
				blocks: blockState.blocks,
				rootBlocks: blockState.rootBlocks,
				draggedBlockId,
				updateBlockData,
			}}
		>
			<DragDropProvider onDragEnd={onDragEnd} onDragStart={onDragStart}>
				{children}
				<DragOverlay>
					{activeBlock ? (
						<div className="p-3 bg-gray-700 border-2 border-blue-500 rounded-md shadow-2xl opacity-90 cursor-grabbing transform scale-105">
							<span className="text-white font-bold">{activeBlock.type}</span>
						</div>
					) : null}
				</DragOverlay>
			</DragDropProvider>
		</GlobalStateContext.Provider>
	);
}
