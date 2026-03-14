import type { Block } from "../../context/GlobalStateContext";
import DraggableElement from "../DraggableElement";

export default function BoolLitBlock({path, block}: {path: string, block: Block}) {
    return (
        <DraggableElement id={path} className="bg-green-500 text-white px-2 py-1 rounded-md">

            {block.b.toString()}

        </DraggableElement>
    )
}