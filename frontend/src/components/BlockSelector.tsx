import { useGlobalStateContext } from "../context/GlobalStateContext";
import type { BlockId } from "../types/blocks";
import BaseBlock from "./Blocks/BaseBlock";

export default function BlockSelector({ id }: { id: BlockId }) {
	const { blocks } = useGlobalStateContext();
    console.log("BlockSelector received id:", id);
	const block = blocks[id];
    console.log("BlockSelector found block:", block);

    return <BaseBlock block={block} />;
}
