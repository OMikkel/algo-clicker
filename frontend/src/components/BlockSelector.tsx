import type { Block } from "../context/GlobalStateContext";
import BoolLitBlock from "./Blocks/BoolLitBlock";
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
		case "BoolLit":
			return (
                <BoolLitBlock path={path} block={block} />
			);
		default:
			return <div>Unknown Block Type</div>;
	}
}
