import type { IntLitBlock } from "../../../types/blocks/intType";
import DraggableElement from "../../DraggableElement";

type Props = {
    block: IntLitBlock;
}

export default function IntLitBlock({block}: Props) {
    return (
        <DraggableElement id={block.id} type="IntLit" className="bg-blue-500 text-white px-2 py-1 rounded-md">
            {block.v}
        </DraggableElement>
    )
}