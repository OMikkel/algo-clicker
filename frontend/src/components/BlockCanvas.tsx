import { useMemo } from "react";
import { useGlobalStateContext } from "../context/GlobalStateContext";
import BlockSelector from "./BlockSelector";
import { DragDropProvider, DragOverlay } from "@dnd-kit/react";

export default function BlockCanvas() {
	const { blockState, onDragEnd } = useGlobalStateContext();

	const keys = useMemo(() => {
		return Object.keys(blockState);
	}, [blockState]);

	return (
		<DragDropProvider onDragEnd={onDragEnd} >
			<div className="p-16 flex items-center justitfy-center flex-col gap-4 border-2 border-dashed border-gray-400 rounded-md w-full h-full">
				{keys.map((key) => (
					<BlockSelector key={key} path={key} block={blockState[key]} />
				))}
			</div>
		</DragDropProvider>
	);
}
