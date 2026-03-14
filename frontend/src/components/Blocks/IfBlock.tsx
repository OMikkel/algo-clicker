import type { Block } from "../../context/GlobalStateContext";
import { getKeysFromObject } from "../../utils/objects";
import BlockSelector from "../BlockSelector";
import DraggableElement from "../DraggableElement";
import DropZone from "../DropZone";

type Props = {
	path: string;
	block: Block;
};

export default function IfBlock({ path, block }: Props) {
	console.log("Rendering IfBlock", { path, block });

    const conditionKeys = getKeysFromObject(block.cond, "")
    const trueKeys = getKeysFromObject(block.ifBlock, "")
    const falseKeys = getKeysFromObject(block.elseBlock, "")


	return (
		<DraggableElement
			id={path}
			className="bg-blue-500 min-w-72 p-4 rounded-md flex flex-col gap-4 border"
		>
			<div className="flex items-center gap-4">
				<p>If</p>
				<DropZone id={`${path}.cond`} keys={conditionKeys} blocks={block.cond} className="flex-1">
				</DropZone>
			</div>

			<div className="flex flex-col items-start justify-center gap-4">
				<DropZone
					id={`${path}.ifBlock`}
                    keys={trueKeys}
                    blocks={block.ifBlock}
					className="flex flex-1 w-full flex-col gap-2"
				>
                   
				</DropZone>

				<p>Else</p>

				<DropZone
					id={`${path}.elseBlock`}
                    keys={falseKeys}
                    blocks={block.elseBlock}
					className="flex flex-1 w-full flex-col gap-2"
				>
				</DropZone>
			</div>
		</DraggableElement>
	);
}
