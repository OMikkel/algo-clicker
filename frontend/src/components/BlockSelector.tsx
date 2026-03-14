import type { Block } from "../context/GlobalStateContext";
import ConditionBlock from "./Blocks/ConditionBlock";
import IfBlock from "./Blocks/IfBlock";

export default function BlockSelector({
	path,
	block,
}: {
	path: string;
	block: Block;
}) {
	switch (block.type) {
		case "If":
			return (
				<IfBlock path={path} block={block} />
			);
		// case "BoolLit":
		// 	return (
		// 		<ConditionBlock id={path}>
		// 			<div className="bg-green-500 text-white px-2 py-1 rounded-md">
		// 				{block.b.toString()}
		// 			</div>
		// 		</ConditionBlock>
		// 	);
		default:
			return <div>Unknown Block Type</div>;
	}
}
