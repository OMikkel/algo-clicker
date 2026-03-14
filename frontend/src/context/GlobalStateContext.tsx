import React, { useState } from "react";

export type Blocks = Record<string, Block>;

export type Block = {
	type: string;
    [key: string]: unknown;
};

type JsonObject = Record<string, unknown>;

type DragOperationEvent = {
    operation: {
        source?: { id: string | number };
        target?: { id: string | number };
    };
};

type GlobalState = {
	blockState: Blocks;
    onDragEnd: (event: DragOperationEvent) => void;
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
    const [blockState, setBlockState] = useState<Blocks>({
		"if-block-uuid1": {
			type: "If",
			cond: {
				"id-bool-lit-uuid1": {
					type: "BoolLit",
					b: true,
				},
			},
			ifBlock: {},
			elseBlock: {},
		},
        "if-block-uuid2": {
			type: "If",
			cond: {
				"id-bool-lit-uuid2": {
					type: "BoolLit",
					b: false,
				},
			},
			ifBlock: {},
			elseBlock: {},
		},
	});

	const isRecord = (value: unknown): value is JsonObject => {
		return typeof value === "object" && value !== null && !Array.isArray(value);
	};

	const getObjectByPath = (obj: JsonObject, path: string): unknown | null => {
		if (!path) {
			return null;
		}

		const keys = path.split(".");
		let current: unknown = obj;

		for (const key of keys) {
			if (!isRecord(current) || !(key in current)) {
				return null;
			}
			current = current[key];
		}

		return current;
	};

	const setObjectByPath = (obj: JsonObject, path: string, value: unknown) => {
		const keys = path.split(".");
		let current: JsonObject = obj;

		for (let i = 0; i < keys.length - 1; i++) {
			const key = keys[i];
			const next = current[key];

			if (!isRecord(next)) {
				current[key] = {};
			}

			current = current[key] as JsonObject;
		}

		current[keys[keys.length - 1]] = value;
	};

	const getContainerPathFromItemPath = (itemPath: string) => {
		const segments = itemPath.split(".");
		if (segments.length <= 1) {
			return "";
		}

		segments.pop();
		return segments.join(".");
	};

	const getFirstChildKey = (container: JsonObject) => {
		const keys = Object.keys(container);
		return keys.length > 0 ? keys[0] : null;
	};

	const onDragEnd = (event: DragOperationEvent) => {
        console.log("Drag ended:", event);
		const sourceId = String(event.operation.source?.id ?? "");
		const targetId = String(event.operation.target?.id ?? "");
        const sourceParentId = String(sourceId.split(".").slice(0, -1).join("."));
        const targetParentId = String(targetId.split(".").slice(0, -1).join("."));

        console.log("Source ID:", sourceId);
        console.log("Target ID:", targetId);
        console.log("Source Parent ID:", sourceParentId);
        console.log("Target Parent ID:", targetParentId);



		if (!sourceId || !targetId || targetId.includes(sourceId)) {
			return;
		}

		setBlockState((prev) => {
			const nextState = structuredClone(prev) as Blocks;

			const sourceBlock = getObjectByPath(nextState, sourceId);
			if (sourceBlock == null) {
				return prev;
			}

			const sourceContainerPath = getContainerPathFromItemPath(sourceId);
			const sourceContainerNode =
				sourceContainerPath === ""
					? nextState
					: getObjectByPath(nextState, sourceContainerPath);
			const sourceKey = sourceId.split(".").pop();

			if (!isRecord(sourceContainerNode) || !sourceKey) {
				return prev;
			}

			const targetNode = getObjectByPath(nextState, targetId);

			if (isRecord(targetNode)) {
				const targetContainer = targetNode;
				const targetExistingKey = getFirstChildKey(targetContainer);

				if (targetExistingKey == null) {
					delete sourceContainerNode[sourceKey];
					targetContainer[sourceKey] = sourceBlock;
                        console.log("Updated state:", nextState);
                    
					return nextState;
				}

				const targetExistingBlock = targetContainer[targetExistingKey];
				targetContainer[targetExistingKey] = sourceBlock;
				sourceContainerNode[sourceKey] = targetExistingBlock;
            console.log("Updated state:", nextState);

				return nextState;
			}

			if (targetNode == null) {
            console.log("Updated state:", prev);

				return prev;
			}

			setObjectByPath(nextState, targetId, sourceBlock);
			setObjectByPath(nextState, sourceId, targetNode);

            console.log("Updated state:", nextState);
			return nextState;
		});
	};
    
	return (
		<GlobalStateContext.Provider value={{ blockState, onDragEnd }}>
			{children}
		</GlobalStateContext.Provider>
	);
}
