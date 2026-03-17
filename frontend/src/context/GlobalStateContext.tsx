import { DragDropProvider, DragOverlay } from "@dnd-kit/react";
import React, { useEffect, useRef, useState } from "react";
import { BLOCK_REGISTRY } from "../constants/AstConditions";
import { emptyEnvironment, type Environment } from "../data-model";
import type { Block, BlockId, Blocks } from "../types/blocks";
import { createBlockFromAST } from "../utils/objects";
import {
	loadLegacySolutionFromLocalStorage,
	PLAYGROUND_STORAGE_KEY,
} from "../utils/solutionStorage";
import { FlameKindling } from "lucide-react";

export type BlockState = {
	blocks: Blocks;
	rootBlocks: BlockId[];
	templates: BlockId[];
	env: Environment;
};

type GlobalState = {
	blocks: Blocks;
	env: Environment;
	rootBlocks: BlockId[];
	templates: BlockId[];
	draggedBlockId: BlockId | null;
	errorMessage: string | null;
	runState: "done" | "idle" | "running" | "error";
	deleteBlock: (blockId: string) => void;
	updateBlockData: <T>(blockId: string, newData: Partial<T>) => void;
	runApplication: () => void;
	rerunApplication: () => void;
	resetApplication: () => void;
	stepForward: () => void;
	replaceBlockState: (nextState: BlockState) => void;
};

const ASTs: Block[] = Object.keys(BLOCK_REGISTRY).map((key) =>
	createBlockFromAST(key, "template", ""),
);
const initialBlockState = (
	InitialProgramWithList_A_ID: BlockId,
	ArrayAssign_Initial_ID: BlockId,
	ArrayVar_Initial_ID: BlockId,
	ArrayLit_Initial_ID: BlockId,
): BlockState => ({
	blocks: {
		// Initialize template blocks
		...ASTs.reduce(
			(acc, ast) => {
				acc[ast.id] = ast;
				return acc;
			},
			{} as Record<string, Block>,
		),
		//case class InitialProgramWithList_A(decl_A: ArrayAssign, solution: AstNode) extends AstNode
		[InitialProgramWithList_A_ID]: {
			type: "InitialProgramWithList_A",
			id: InitialProgramWithList_A_ID,
			parentId: "root",
			decl_A: ArrayAssign_Initial_ID,
			solution: [],
		},
		[ArrayAssign_Initial_ID]: {
			type: "ArrayAssign",
			id: ArrayAssign_Initial_ID,
			parentId: InitialProgramWithList_A_ID,
			parentSlot: "decl_A",
			variable: ArrayVar_Initial_ID,
			value: ArrayLit_Initial_ID,
		},
		[ArrayVar_Initial_ID]: {
			type: "ArrayVar",
			id: ArrayVar_Initial_ID,
			parentId: ArrayAssign_Initial_ID,
			parentSlot: "variable",
			ident: "A",
		},
		[ArrayLit_Initial_ID]: {
			type: "ArrayLit",
			id: ArrayLit_Initial_ID,
			parentId: ArrayAssign_Initial_ID,
			parentSlot: "value",
			values: Array.from({ length: 10 }, () => Math.ceil(Math.random() * 100)),
		},
	},
	rootBlocks: [InitialProgramWithList_A_ID],
	env: emptyEnvironment(),
	templates: ASTs.map((ast) => ast.id),
});

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
	const socketRef = useRef<WebSocket | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [runState, setRunState] = useState<
		"done" | "idle" | "running" | "error"
	>("done");
	const [draggedBlockId, setDraggedBlockId] = useState<BlockId | null>(null);

	const InitialProgramWithList_A_ID = useRef<BlockId>(
		crypto.randomUUID(),
	).current;
	const ArrayAssign_Initial_ID = useRef<BlockId>(crypto.randomUUID()).current;
	const ArrayVar_Initial_ID = useRef<BlockId>(crypto.randomUUID()).current;
	const ArrayLit_Initial_ID = useRef<BlockId>(crypto.randomUUID()).current;

	const [blockState, setBlockState] = useState<BlockState>(
		initialBlockState(
			InitialProgramWithList_A_ID,
			ArrayAssign_Initial_ID,
			ArrayVar_Initial_ID,
			ArrayLit_Initial_ID,
		),
	);

	useEffect(() => {
		// Initialize connection
		const ws = new WebSocket(import.meta.env.VITE_SCALA_BACKEND_URL);

		ws.onopen = () => {
			console.log("Connected to Scala Backend");
		};

		ws.onmessage = (event) => {
			console.log("Message from server:", event.data);
			const payload = JSON.parse(event.data);
			// Handle server responses here (e.g., visualization updates)
			switch (payload.type) {
				case "trace":
					setRunState("idle");
					updateBlockState((p) => ({ ...p, env: payload }));
					document.dispatchEvent(
						new CustomEvent("algoclickertrace", {
							detail: payload,
						}),
					);
					break;
				case "error":
					console.warn("Error from server:", payload.message);
					setErrorMessage(payload.message);
					setRunState("done");

					// const causingBlockIdMatch = payload.message.match(/Block '(\w+)'/);
					// console.log("Regex match result:", causingBlockIdMatch);
					// if (showAlert) {
					// 	alert(`Technical details:\n${payload.message}`);
					// }

					break;
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
					setRunState("done");
			}
		};

		ws.onclose = () => {
			console.log("Disconnected");
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
		const fallbackState = initialBlockState(
			InitialProgramWithList_A_ID,
			ArrayAssign_Initial_ID,
			ArrayVar_Initial_ID,
			ArrayLit_Initial_ID,
		);
		const restoredState = loadLegacySolutionFromLocalStorage(fallbackState);
		if (restoredState) {
			setBlockState(restoredState);
		}
	}, [
		ArrayAssign_Initial_ID,
		ArrayLit_Initial_ID,
		ArrayVar_Initial_ID,
		InitialProgramWithList_A_ID,
	]);

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
		setRunState("running");
	};

	const stepForward = () => {
		const ws = socketRef.current;

		if (!ws || ws.readyState !== WebSocket.OPEN) {
			console.error("Cannot step forward: WebSocket is not connected.");
			return;
		}

		const payload = {
			type: "continue",
			kind: "auto",
			action: "continue",
		};

		ws.send(JSON.stringify(payload));
		setRunState("running");
	};

	const rerunApplication = () => {
		console.log("Re-running application with blocks:", blockState);
		runApplication();
	};

	const resetApplication = () => {
		if (
			confirm(
				"Are you sure you want to reset the application? This cannot be undone.",
			)
		) {
			localStorage.removeItem(PLAYGROUND_STORAGE_KEY);
			setBlockState(
				initialBlockState(
					InitialProgramWithList_A_ID,
					ArrayAssign_Initial_ID,
					ArrayVar_Initial_ID,
					ArrayLit_Initial_ID,
				),
			);
		}
	};

	const deleteBlock = (blockId: string) => {
		updateBlockState((prev) => {
			const nextBlocks = { ...prev.blocks };
			const blockToDelete = nextBlocks[blockId];

			if (!blockToDelete) return prev;

			// --- STEP 1: Identify all descendants to delete ---
			const idsToDelete = new Set<string>();

			const collectChildIds = (id: string) => {
				idsToDelete.add(id);
				const block = nextBlocks[id];
				if (!block) return;

				// Iterate through all properties of the block to find child IDs
				// We exclude metadata like 'id', 'type', 'parentId', 'parentSlot'
				Object.entries(block).forEach(([key, value]) => {
					if (["id", "type", "parentId", "parentSlot", "color"].includes(key))
						return;

					if (typeof value === "string" && nextBlocks[value]) {
						// Single slot (e.g., cond: "uuid")
						collectChildIds(value);
					} else if (Array.isArray(value)) {
						// List slot (e.g., statements: ["uuid1", "uuid2"])
						value.forEach((childId) => {
							if (typeof childId === "string" && nextBlocks[childId]) {
								collectChildIds(childId);
							}
						});
					}
				});
			};

			collectChildIds(blockId);

			// --- STEP 2: Clean up the Parent's reference ---
			const parentId = blockToDelete.parentId;
			const parentSlot = blockToDelete.parentSlot;

			if (parentId && parentId !== "root" && nextBlocks[parentId]) {
				const parent = { ...nextBlocks[parentId] };
				const currentSlotValue = parent[parentSlot];

				if (Array.isArray(currentSlotValue)) {
					parent[parentSlot] = currentSlotValue.filter((id) => id !== blockId);
				} else {
					parent[parentSlot] = null;
				}
				nextBlocks[parentId] = parent;
			}

			// --- STEP 3: Perform the wipe ---
			// Remove from rootBlocks
			const nextRoot = prev.rootBlocks.filter((id) => !idsToDelete.has(id));

			// Delete all identified blocks from the dictionary
			idsToDelete.forEach((id) => {
				delete nextBlocks[id];
			});

			console.log(`Recursively deleted ${idsToDelete.size} blocks.`);

			return {
				...prev,
				blocks: nextBlocks,
				rootBlocks: nextRoot,
			};
		});
	};

	const onDragStart = (event: any) => {
		const source = event.operation.source;
		if (!source) {
			console.warn("Drag start event missing source:", event);
			return;
		}

		setDraggedBlockId(String(source.id).replace("draggable:", ""));
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
				PLAYGROUND_STORAGE_KEY,
				JSON.stringify(newState),
			);
			return newState;
		});
	};

	const replaceBlockState = (nextState: BlockState) => {
		setBlockState(nextState);
		window.localStorage.setItem(
			PLAYGROUND_STORAGE_KEY,
			JSON.stringify(nextState),
		);
	};

	const onDragEnd = (event: any) => {
		const { operation } = event;
		const { source, target } = operation;

		if (!source || !target) return;

		const sourceId = String(source.id).replace("draggable:", "");
		const rawTargetId = String(target.id).replace("container:", "");
		const rawTargetSlot = target.data?.slot; // "cond", "v1", "ifBlock", etc.

		if (!rawTargetSlot) {
			console.warn("Drag end event missing target slot:", event);
			return;
		}

		updateBlockState((prev) => {
			const nextBlocks = { ...prev.blocks };
			let nextRoot = [...prev.rootBlocks];
			const initialProgramBlockId = nextRoot.find(
				(id) => nextBlocks[id]?.type === "InitialProgramWithList_A",
			);

			if (!initialProgramBlockId) {
				console.warn("InitialProgramWithList_A root block is missing.");
				return prev;
			}

			// Root drops are interpreted as drops into InitialProgramWithList_A.solution
			const targetSlot =
				rawTargetSlot === "root" ? "solution" : String(rawTargetSlot);
			const targetBlockId =
				rawTargetSlot === "root"
					? initialProgramBlockId
					: rawTargetId.endsWith(`-${targetSlot}`)
						? rawTargetId.slice(0, -`-${targetSlot}`.length)
						: rawTargetId;

			if (!nextBlocks[sourceId]) {
				console.warn("Source block not found during drag end:", sourceId);
				return prev;
			}

			const addToRoot = (id: BlockId) => {
				if (!nextRoot.includes(id)) {
					nextRoot.push(id);
				}
			};

			const getSlotDefinition = (parentId: BlockId, slot: string) => {
				const parent = nextBlocks[parentId];
				if (!parent) return null;

				const parentConfig =
					BLOCK_REGISTRY[parent.type as keyof typeof BLOCK_REGISTRY];
				if (!parentConfig) return null;

				return parentConfig.slots.find((s) => s.id === slot) ?? null;
			};

			const removeFromRoot = (id: BlockId) => {
				nextRoot = nextRoot.filter((rootId) => rootId !== id);
			};

			const removeChildReferenceFromParent = (
				parentId: BlockId | "root" | undefined,
				childId: BlockId,
				preferredSlot?: string,
			) => {
				if (!parentId || parentId === "root" || !nextBlocks[parentId]) return;

				const parent = { ...nextBlocks[parentId] };
				let wasRemoved = false;

				if (preferredSlot) {
					const slotValue = parent[preferredSlot];
					if (Array.isArray(slotValue)) {
						const filtered = slotValue.filter((id) => id !== childId);
						if (filtered.length !== slotValue.length) {
							parent[preferredSlot] = filtered;
							wasRemoved = true;
						}
					} else if (slotValue === childId) {
						parent[preferredSlot] = null;
						wasRemoved = true;
					}
				}

				if (!wasRemoved) {
					Object.entries(parent).forEach(([key, value]) => {
						if (
							["id", "type", "parentId", "parentSlot", "color"].includes(key)
						) {
							return;
						}

						if (Array.isArray(value)) {
							const filtered = value.filter((id) => id !== childId);
							if (filtered.length !== value.length) {
								parent[key] = filtered;
								wasRemoved = true;
							}
						} else if (value === childId) {
							parent[key] = null;
							wasRemoved = true;
						}
					});
				}

				if (wasRemoved) {
					nextBlocks[parentId] = parent;
				}
			};

			const attachChildToTarget = (
				childId: BlockId,
				parentId: BlockId | "root",
				slot: string,
			) => {
				if (!nextBlocks[childId]) return false;

				if (slot === "root" || parentId === "root") {
					nextBlocks[childId] = {
						...nextBlocks[childId],
						parentId: "root",
						parentSlot: "root",
					};
					addToRoot(childId);
					return true;
				}

				if (!nextBlocks[parentId]) {
					console.warn("Target parent not found during drag end:", parentId);
					return false;
				}

				const parent = { ...nextBlocks[parentId] };
				const currentSlotValue = parent[slot];
				const slotDefinition = getSlotDefinition(parentId, slot);
				const isListSlot = slotDefinition
					? slotDefinition.max !== 1
					: Array.isArray(currentSlotValue);
				const maxElements = slotDefinition?.max;

				if (isListSlot) {
					let nextSlotValues: BlockId[] = [];

					if (Array.isArray(currentSlotValue)) {
						nextSlotValues = currentSlotValue.filter(
							(existingChildId) => !!nextBlocks[existingChildId],
						);
					} else if (
						typeof currentSlotValue === "string" &&
						nextBlocks[currentSlotValue]
					) {
						nextSlotValues = [currentSlotValue];
					}

					if (nextSlotValues.includes(childId)) {
						parent[slot] = nextSlotValues;
					} else {
						if (
							typeof maxElements === "number" &&
							nextSlotValues.length >= maxElements
						) {
							return false;
						}
						parent[slot] = [...nextSlotValues, childId];
					}
				} else {
					if (currentSlotValue && currentSlotValue !== childId) {
						// Keep single-slot invariants strict when occupied by a live block,
						// but allow replacing stale dangling references.
						if (nextBlocks[currentSlotValue]) {
							return false;
						}
					}
					parent[slot] = childId;
				}

				nextBlocks[parentId] = parent;
				nextBlocks[childId] = {
					...nextBlocks[childId],
					parentId,
					parentSlot: slot,
				};
				removeFromRoot(childId);

				return true;
			};

			const isTemplate = sourceId.startsWith("template:");
			if (isTemplate) {
				// If dragging from template, create a new block instance instead of moving the template itself
				const templateType = nextBlocks[sourceId].type;
				const newBlock = createBlockFromAST(templateType, "", "root") as Block;
				nextBlocks[newBlock.id] = newBlock;

				const didAttach = attachChildToTarget(
					newBlock.id,
					targetBlockId,
					targetSlot,
				);
				if (!didAttach) {
					delete nextBlocks[newBlock.id];
					return prev;
				}

				console.log(
					"Created new block from template:",
					newBlock,
					"and updated state:",
					{
						templates: prev.templates,
						blocks: nextBlocks,
						rootBlocks: nextRoot,
					},
				);
				return {
					...prev,
					blocks: nextBlocks,
					rootBlocks: nextRoot,
				};
			}

			const movingBlock = nextBlocks[sourceId];

			// STEP 1: Detach from old location
			if (movingBlock.parentId === "root") {
				removeFromRoot(sourceId);
			} else {
				removeChildReferenceFromParent(
					movingBlock.parentId,
					sourceId,
					movingBlock.parentSlot,
				);
			}

			// STEP 2: Attach to new location (with swap-to-root for single slots)
			const didAttach = attachChildToTarget(
				sourceId,
				targetBlockId,
				targetSlot,
			);
			if (!didAttach) {
				return prev;
			}

			return {
				...prev,
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
				templates: blockState.templates,
				draggedBlockId,
				errorMessage,
				runState,
				deleteBlock,
				updateBlockData,
				runApplication,
				rerunApplication,
				resetApplication,
				stepForward,
				replaceBlockState,
				env: blockState.env,
			}}
		>
			<DragDropProvider onDragEnd={onDragEnd} onDragStart={onDragStart}>
				{children}
				<DragOverlay dropAnimation={null}>
					{activeBlock ? (
						<div className="p-3 bg-gray-700 border-2 border-blue-500 rounded-md shadow-2xl opacity-90 cursor-grabbing transform scale-105">
							<span className="text-white font-bold">
								{BLOCK_REGISTRY[activeBlock.type]?.displayTitle ||
									activeBlock.type}
							</span>
						</div>
					) : null}
				</DragOverlay>
			</DragDropProvider>
		</GlobalStateContext.Provider>
	);
}
