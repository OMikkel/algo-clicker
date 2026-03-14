import { DragDropProvider, DragOverlay } from "@dnd-kit/react";
import { useGlobalStateContext } from "../context/GlobalStateContext";
import DropZone from "./DropZone";

export default function BlockCanvas() {
    const { rootBlocks, onDragEnd, onDragStart, blocks, draggedBlockId } = useGlobalStateContext();
    
    const activeBlock = draggedBlockId ? blocks[draggedBlockId] : null;

    return (
        <DragDropProvider onDragEnd={onDragEnd} onDragStart={onDragStart} >
            <DropZone
                id="root"
                slot="root"
                blockIds={rootBlocks}
                className="p-16 w-full h-full"
            />

            <DragOverlay>
                {activeBlock ? (
                    <div className="p-3 bg-gray-700 border-2 border-blue-500 rounded-md shadow-2xl opacity-90 cursor-grabbing transform scale-105">
                        <span className="text-white font-bold">{activeBlock.type}</span>
                    </div>
                ) : null}
            </DragOverlay>
        </DragDropProvider>
    );
}