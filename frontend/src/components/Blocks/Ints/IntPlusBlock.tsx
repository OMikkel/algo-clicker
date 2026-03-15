import { BLOCK_REGISTRY } from "../../../constants/AstConditions";
import type { IntPlusBlock } from "../../../types/blocks/intType";
import DraggableElement from "../../DraggableElement";
import DropZone from "../../DropZone";

type Props = {
    block: IntPlusBlock;
}

export default function IntPlusBlock({block}: Props) {
    return (
        <DraggableElement id={block.id} type="IntPlus" className="bg-purple-500 text-white px-2 py-1 rounded-md">
            <DropZone id={`${block.id}-v1`} blockIds={block.v1 ? [block.v1] : []} slot="v1" accepts={BLOCK_REGISTRY.IntPlus.slots.find(s => s.id === "v1")?.accepts || []}></DropZone>
            +
            <DropZone id={`${block.id}-v2`} blockIds={block.v2 ? [block.v2] : []} slot="v2" accepts={BLOCK_REGISTRY.IntPlus.slots.find(s => s.id === "v2")?.accepts || []}></DropZone>
        </DraggableElement>
    )
}