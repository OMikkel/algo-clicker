import type { IfBlock as IfBlockType } from "../../context/GlobalStateContext";
import { useGlobalStateContext } from "../../context/GlobalStateContext";
import BlockSelector from "../BlockSelector";
import ConditionDropZone from "../Containers/ConditionContainer";
import StatementDropZone from "../Containers/StatementContainer";
import Sortable from "../Sortable";
import StatementBlock from "./StatementBlock";

type Props = {
	block: IfBlockType;
};

export default function IfBlock({ block }: Props) {
	const { blockState } = useGlobalStateContext();
	const conditionBlock = block.condId ? blockState.blocks[block.condId] : null;

	return (
		<StatementBlock id={block.id}>
			<div className="bg-blue-500 min-w-72 p-4 rounded-md flex flex-col gap-4 border">
				<div className="flex items-center gap-4">
					<p>If</p>
					<div className="flex-1">
						<ConditionDropZone id={`container:${block.id}.cond`}>
							{conditionBlock && block.condId ? (
								<Sortable id={block.condId} index={0} group={`${block.id}.cond`}>
									<BlockSelector blockId={block.condId} block={conditionBlock} />
								</Sortable>
							) : null}
						</ConditionDropZone>
					</div>
				</div>

				<div className="flex flex-col items-start justify-center gap-4">
					<StatementDropZone id={`container:${block.id}.ifBody`}>
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
					</StatementDropZone>

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
			</div>
		</StatementBlock>
	);
}
