import { BLOCK_REGISTRY } from "../../constants/AstConditions";
import type { IfBlock } from "../../types/blocks/if";
import DraggableElement from "../DraggableElement";
import DropZone from "../DropZone";

type Props = {
	block: IfBlock;
};

export default function IfBlock({ block }: Props) {
	return (
		<DraggableElement
			id={block.id}
			type="If"
            className="bg-blue-500 text-white p-3 rounded-md"
		>
            <div className="min-w-72 rounded-md flex flex-col gap-4">
			<div className="flex items-center gap-4">
				<p>If</p>
				<DropZone
					id={`${block.id}-cond`}
					slot="cond"
					maxElements={1}
					accepts={BLOCK_REGISTRY.If.slots.find(s => s.id === "cond")?.accepts || []}
					blockIds={block.cond ? [block.cond] : null}
					className="flex-1 bg-red-500"
				/>
			</div>

			<div className="flex flex-col items-start justify-center gap-4">
				<DropZone
					id={`${block.id}-ifBlock`}
					slot="ifBlock"
					accepts={BLOCK_REGISTRY.If.slots.find(s => s.id === "ifBlock")?.accepts || []}
					blockIds={block.ifBlock}
					className="flex flex-1 w-full flex-col gap-2"
				/>

				<p>Else</p>

				<DropZone
					id={`${block.id}-elseBlock`}
					slot="elseBlock"
					accepts={BLOCK_REGISTRY.If.slots.find(s => s.id === "elseBlock")?.accepts || []}
					blockIds={block.elseBlock}
					className="flex flex-1 w-full flex-col gap-2"
				></DropZone>
			</div>
            </div>
		</DraggableElement>
	);
}
