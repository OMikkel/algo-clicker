import { useGlobalStateContext } from "../context/GlobalStateContext";
import type { BlockId } from "../types/blocks";
import BaseBlock from "./Blocks/BaseBlock";
import InitialBlock from "./Blocks/InitialBlock";

export default function BlockSelector({
	id,
	template = false,
	disabled = false,
	editable = true,
}: {
	id: BlockId;
	template?: boolean;
	disabled?: boolean;
	editable?: boolean;
}) {
	const { blocks } = useGlobalStateContext();
	const block = blocks[id];
	if (!block) return null; // Safety first!
	console.log("BlockSelector found block:", block);

	if (block.type === "InitialProgramWithList_A")
		return <InitialBlock block={block} />;
	return (
		<BaseBlock
			block={block}
			template={template}
			disabled={disabled}
			editable={editable}
		/>
	);
}
