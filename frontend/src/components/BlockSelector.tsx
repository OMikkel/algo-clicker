import { useGlobalStateContext } from "../context/GlobalStateContext";
import type { BlockId } from "../types/blocks";
import BaseBlock from "./Blocks/BaseBlock";
import InitialBlock from "./Blocks/InitialBlock";

export default function BlockSelector({
	id,
	preview = false,
	disabled = false,
}: {
	id: BlockId;
	preview?: boolean;
	disabled?: boolean;
}) {
	const { blocks } = useGlobalStateContext();
	const block = blocks[id];
	if (!block) return null; // Safety first!
	console.log("BlockSelector found block:", block);

	if (block.type === "InitialProgramWithList_A")
		return <InitialBlock block={block} />;
	return <BaseBlock block={block} preview={preview} disabled={disabled} />;
}
