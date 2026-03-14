import type { IfBlock as IfBlockType } from "../../context/GlobalStateContext";
import DraggableElement from "../DraggableElement";

type Props = {
	block: IfBlockType;
};

export default function IfBlock({path, block }: Props) {

    console.log("Rendering IfBlock", { path, block });

	return (
        <DraggableElement id={path} className={""}>
            <div>
                adawdwad
            </div>
			{/* <div className="bg-blue-500 min-w-72 p-4 rounded-md flex flex-col gap-4 border">
				<div className="flex items-center gap-4">
					<p>If</p>
					<div className="flex-1">
						<ListDropZone id={`container:${block.id}.cond`}>
							{conditionBlock && block.condId ? (
									<BlockSelector blockId={block.condId} block={conditionBlock} />
							) : null}
						</Lis>
					</div>
				</div>

				<div className="flex flex-col items-start justify-center gap-4">
					<ListDropZone id={`container:${block.id}.ifBody`}>
						<div className="flex flex-1 w-full flex-col gap-2">
							{block.ifBodyIds.map((childId, index) => {
								const childBlock = blockState.blocks[childId];
								if (!childBlock) {
									return null;
								}

								return (
									<Sortable key={childId} id={childId} index={index} group={`${block.id}.ifBody`}>
										<BlockSelector blockId={childId} block={childBlock} />
									</Sortable>
								);
							})}
						</div>
					</ListDropZone>

					<p>Else</p>

					<StatementDropZone id={`container:${block.id}.elseBody`}>
						<div className="flex flex-1 w-full flex-col gap-2">
							{block.elseBodyIds.map((childId, index) => {
								const childBlock = blockState.blocks[childId];
								if (!childBlock) {
									return null;
								}

								return (
									<Sortable key={childId} id={childId} index={index} group={`${block.id}.elseBody`}>
										<BlockSelector blockId={childId} block={childBlock} />
									</Sortable>
								);
							})}
						</div>
					</StatementDropZone>
				</div>
			</div> */}
        </DraggableElement>
    );
}
