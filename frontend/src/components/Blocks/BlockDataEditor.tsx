import { BoolLitEditor } from "./Editors/BoolLitEditor";
import { IntLitEditor } from "./Editors/IntLitEditor";
import { IdentEditor } from "./Editors/IdentEditor";
import { ArrayLitEditor } from "./Editors/ArrayLitEditor";
import type { Block } from "../../types/blocks";

export default function BlockDataEditor({
	block,
	editable,
}: {
	block: Block;
	editable?: boolean;
}) {
	console.log("BlockDataEditor received block:", block);

	if (block.type === "IntLit") {
		return <IntLitEditor block={block} editable={editable} />;
	}

	if (block.type === "BoolLit") {
		return <BoolLitEditor block={block} editable={editable} />;
	}

	if (block.type === "ArrayLit") {
		return <ArrayLitEditor block={block} editable={editable} />;
	}

	if (
		block.type === "ArrayVar" ||
		block.type === "IntVarLit" ||
		block.type === "BoolVar"
	) {
		return <IdentEditor block={block} editable={editable} />;
	}

	return null;
}
