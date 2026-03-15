import { useGlobalStateContext } from "../context/GlobalStateContext";
import type { BlockId } from "../types/blocks";
import BaseBlock from "./Blocks/BaseBlock";

export default function BlockSelector({
	id,
	preview = false,
}: {
	id: BlockId;
	preview?: boolean;
}) {
	const { blocks } = useGlobalStateContext();
	const selectedBlock = blocks[id];
	console.log("BlockSelector found block:", selectedBlock);

	return <BaseBlock block={selectedBlock} preview={preview} />;
}
