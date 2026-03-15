import { BoolLitEditor } from "./Editors/BoolLitEditor";
import { IntLitEditor } from "./Editors/IntLitEditor";
import { IdentEditor } from "./Editors/IdentEditor";
import { ArrayLitEditor } from "./Editors/ArrayLitEditor";

export default function BlockDataEditor({ block }: { block: any }) {
	console.log("BlockDataEditor received block:", block);

	if (block.type === "IntLit") {
		return <IntLitEditor block={block} />;
	}

	if (block.type === "BoolLit") {
		return <BoolLitEditor block={block} />;
	}

	if (block.type === "ArrayLit") {
		return <ArrayLitEditor block={block} />;
	}

	if (
		block.type === "ArrayVar" ||
		block.type === "IntVarLit" ||
		block.type === "BoolVar"
	) {
		return <IdentEditor block={block} />;
	}

	return null;
}
