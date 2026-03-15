import { DragDropProvider, DragOverlay } from "@dnd-kit/react";
import React, { useEffect, useRef, useState } from "react";
import { BLOCK_REGISTRY } from "../constants/AstConditions";
import { testSampleInts } from "../tests/data";
import type { Block, BlockId, Blocks } from "../types/blocks";
import { createBlockFromAST } from "../utils/objects";

export type BlockState = {
	blocks: Blocks;
	rootBlocks: BlockId[];
	templates: BlockId[];
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
	templates: BlockId[];
	isConnected: string;
	draggedBlockId: BlockId | null;
	updateBlockData: <T>(blockId: string, newData: Partial<T>) => void;
	runApplication: () => void;
	rerunApplication: () => void;
	resetApplication: () => void;
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
	const [isConnected, setIsConnected] = useState(false);
	const socketRef = useRef<WebSocket | null>(null);
	const [draggedBlockId, setDraggedBlockId] = useState<BlockId | null>(null);

	console.log("Creating ASTs from BLOCK_REGISTRY:", BLOCK_REGISTRY);
	const ASTs: Block[] = Object.keys(BLOCK_REGISTRY).map((key) =>
		createBlockFromAST(key, "template", ""),
	);
	console.log("ASTs:", ASTs);
	const [blockState, setBlockState] = useState<BlockState>({
		...testSampleInts,
		blocks: {
			...testSampleInts.blocks,
			...ASTs.reduce(
				(acc, ast) => {
					acc[ast.id] = ast;
					return acc;
				},
				{} as Record<string, Block>,
			),
		},
		templates: ASTs.map((ast) => ast.id),
	});

	useEffect(() => {
		// Initialize connection
		const ws = new WebSocket("ws://10.192.84.70:8080");

		ws.onopen = () => {
			console.log("Connected to Scala Backend");
			setIsConnected(true);
		};

		ws.onmessage = (event) => {
			console.log("Message from server:", event.data);
			const payload = JSON.parse(event.data);
			// Handle server responses here (e.g., visualization updates)
			switch (payload.type) {
				// case "parsed":
				// 	ws.send(
				// 		JSON.stringify({
				// 			type: "command",
				// 			kind: "auto",
				// 			action: "run",
				// 			payload: {
				// 				astText: payload.value,
				// 			},
				// 		}),
				// 	);
				default:
					console.warn("Unhandled message type:", payload.type);
			}
		};

		ws.onclose = () => {
			console.log("Disconnected");
			setIsConnected(false);
		};

		ws.onerror = (error) => {
			console.error("WebSocket Error:", error);
		};

		socketRef.current = ws;

		// Cleanup on unmount
		return () => {
			ws.close();
		};
	}, []);

	// const connectionStatus = {
	// 	[ReadyState.CONNECTING]: "Connecting",
	// 	[ReadyState.OPEN]: "Open",
	// 	[ReadyState.CLOSING]: "Closing",
	// 	[ReadyState.CLOSED]: "Closed",
	// 	[ReadyState.UNINSTANTIATED]: "Uninstantiated",
	// }[readyState];

	useEffect(() => {
		const storedData = window.localStorage.getItem("algo-playground-storage");
		if (storedData) {
			setBlockState(JSON.parse(storedData));
		}
	}, []);

	const runApplication = () => {
		const ws = socketRef.current;

		if (!ws || ws.readyState !== WebSocket.OPEN) {
			console.error("Cannot run: WebSocket is not connected.");
			return;
		}

		const payload = {
			type: "command",
			kind: "auto",
			action: "run",
			payload: blockState, // The flat blocks dictionary + rootBlocks
		};

		console.log("Sending to Scala:", payload);
		ws.send(JSON.stringify(payload));
	};

	const rerunApplication = () => {
		console.log("Re-running application with blocks:", blockState);
		// sendMessage(
		// 	JSON.stringify({
		// 		type: "command",
		// 		action: "parseAst",
		// 		payload: blockState,
		// 	}),
		// );
	};

	const resetApplication = () => {
		if (
			confirm(
				"Are you sure you want to reset the application? This cannot be undone.",
			)
		) {
			updateBlockState(() => ({
				blocks: ASTs.reduce(
					(acc, ast) => {
						acc[ast.id] = ast;
						return acc;
					},
					{} as Record<string, Block>,
				),
				rootBlocks: [],
				templates: ASTs.map((ast) => ast.id),
			}));
		}
	};

	const onDragStart = (event: any) => {
		const source = event.operation.source;
		if (!source) {
			console.warn("Drag start event missing source:", event);
			return;
		}

		setDraggedBlockId(source.id);
	};

	const updateBlockData = (blockId: string, newData: Partial<Block>) => {
		updateBlockState((prev) => {
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

	const updateBlockState = (callback: (prev: BlockState) => BlockState) => {
		setBlockState((prev) => {
			const newState = callback(prev);
			// Save the NEW state immediately
			window.localStorage.setItem(
				"algo-playground-storage",
				JSON.stringify(newState),
			);
			return newState;
		});
	};

	const onDragEnd = (event: any) => {
		const { operation } = event;
		const { source, target } = operation;

		if (!source || !target) return;

		const sourceId = String(source.id).replace("draggable:", "");
		const rawTargetId = String(target.id).replace("container:", "");
		const targetSlot = target.data?.slot; // "cond", "v1", "ifBlock", etc.

		// 1. Determine if we are dropping into the root or a block slot
		const targetBlockId =
			targetSlot === "root"
				? "root"
				: rawTargetId.replace(`-${targetSlot}`, "");

		updateBlockState((prev) => {
			const nextBlocks = { ...prev.blocks };
			let nextRoot = [...prev.rootBlocks];
			const movingBlock = { ...nextBlocks[sourceId] };
			const oldParentId = movingBlock.parentId;

			const isTemplate = sourceId.startsWith("template:");
			if (isTemplate) {
				// If dragging from template, create a new block instance instead of moving the template itself
				const templateType = movingBlock.type;
				const newBlock = createBlockFromAST(templateType, "", targetBlockId);
				console.log("newBlock:", newBlock);

				if (targetSlot && targetSlot == "root") {
					nextRoot.push(newBlock.id);
				} else {
					const newParent = { ...nextBlocks[targetBlockId] };
					const isArraySlot = Array.isArray(newParent[targetSlot]);

					if (isArraySlot) {
						newParent[targetSlot] = [
							...(newParent[targetSlot] || []),
							newBlock.id,
						];
					} else {
						// SWAPPING LOGIC: If a single-item slot (like 'cond') is full, kick the old block to root
						if (newParent[targetSlot]) {
							const displacedId = newParent[targetSlot];
							nextBlocks[displacedId] = {
								...nextBlocks[displacedId],
								parentId: "root",
							};
							nextRoot.push(displacedId);
						}
						newParent[targetSlot] = newBlock.id;
					}
					nextBlocks[targetBlockId] = newParent;
				}

				nextBlocks[newBlock.id] = newBlock;

				console.log(
					"Created new block from template:",
					newBlock,
					"and updated state:",
					{
						blocks: nextBlocks,
						rootBlocks: nextRoot,
						templates: prev.templates,
					},
				);
				return {
					blocks: nextBlocks,
					rootBlocks: nextRoot,
					templates: prev.templates,
				};
			}

			// --- STEP 1: REMOVE FROM OLD LOCATION ---
			if (!isTemplate) {
				if (oldParentId === "root") {
					nextRoot = nextRoot.filter((id) => id !== sourceId);
				} else if (nextBlocks[oldParentId]) {
					const oldParent = { ...nextBlocks[oldParentId] };
					const slotValue = oldParent[movingBlock.parentSlot];

					if (Array.isArray(slotValue)) {
						oldParent[movingBlock.parentSlot] = slotValue.filter(
							(id) => id !== sourceId,
						);
					} else {
						oldParent[movingBlock.parentSlot] = null;
					}
					nextBlocks[oldParentId] = oldParent;
				}
			}

			// --- STEP 2: ADD TO NEW LOCATION ---
			movingBlock.parentId = targetBlockId;
			movingBlock.parentSlot = targetSlot; // Track which slot it's in for easier removal later

			if (targetSlot === "root") {
				nextRoot.push(sourceId);
			} else {
				const newParent = { ...nextBlocks[targetBlockId] };
				const isArraySlot = Array.isArray(newParent[targetSlot]);

				if (isArraySlot) {
					newParent[targetSlot] = [...(newParent[targetSlot] || []), sourceId];
				} else {
					// SWAPPING LOGIC: If a single-item slot (like 'cond') is full, kick the old block to root
					if (newParent[targetSlot]) {
						const displacedId = newParent[targetSlot];
						nextBlocks[displacedId] = {
							...nextBlocks[displacedId],
							parentId: "root",
							parentSlot: "root",
						};
						nextRoot.push(displacedId);
					}
					newParent[targetSlot] = sourceId;
				}
				nextBlocks[targetBlockId] = newParent;
			}

			nextBlocks[sourceId] = movingBlock;

			return {
				blocks: nextBlocks,
				rootBlocks: nextRoot,
				templates: prev.templates,
			};
		});
	};

	const activeBlock = draggedBlockId ? blockState.blocks[draggedBlockId] : null;

	return (
		<GlobalStateContext.Provider
			value={{
				blocks: blockState.blocks,
				rootBlocks: blockState.rootBlocks,
				templates: blockState.templates,
				draggedBlockId,
				isConnected,
				updateBlockData,
				runApplication,
				rerunApplication,
				resetApplication,
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
