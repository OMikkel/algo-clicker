import { BoolLitEditor } from "./Editors/BoolLitEditor";
import { IntLitEditor } from "./Editors/IntLitEditor";

export default function BlockDataEditor({ block }: { block: any }) {

    console.log("BlockDataEditor received block:", block);

    if (block.type === "IntLit") {
        return <IntLitEditor block={block} />
    }

    if (block.type === "BoolLit") {
        return <BoolLitEditor block={block} />
    }

    return null;
}