import { useGlobalStateContext } from "../context/GlobalStateContext";
import type { Block, BlockId } from "../types/blocks";
import BaseBlock from "./Blocks/BaseBlock";

export default function BlockSelector({
	id,
	block,
}: {
	id?: BlockId;
	block?: Block;
}) {
	const { blocks } = useGlobalStateContext();
	const selectedBlock = block ? block : id ? blocks[id] : null;
	console.log("BlockSelector found block:", selectedBlock);

	return <BaseBlock block={selectedBlock} />;
}
