import type { BoolLitBlock } from "../../types/blocks";
import DraggableElement from "../DraggableElement";

type Props = {
    block: BoolLitBlock;
}

export default function BoolLitBlock({block}: Props) {
    return (
        <DraggableElement id={block.id} type="BoolLit" className="bg-green-500 text-white px-2 py-1 rounded-md">
            {block.b.toString()}
        </DraggableElement>
    )
}