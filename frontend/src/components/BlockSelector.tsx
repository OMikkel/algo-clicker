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
	const selectedBlock = blocks[id];
	console.log("BlockSelector found block:", selectedBlock);

	if (selectedBlock.type === "InitialProgramWithList_A")
		return <InitialBlock block={selectedBlock} />;
	return (
		<BaseBlock block={selectedBlock} preview={preview} disabled={disabled} />
	);
}
