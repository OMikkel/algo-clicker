import type { IfBlock } from "./blocks/if";
import type { IntLitBlock, IntMinusBlock, IntPlusBlock } from "./blocks/intType";



export type BlockId = string;

export interface BaseBlock {
    id: BlockId;
    type: string;
    parentId: BlockId | "root"
}

export interface BoolLitBlock extends BaseBlock {
    type: "BoolLit";
    b: boolean;
}



export type Blocks = Record<BlockId, Block>;

export type Block = IfBlock | BoolLitBlock | IntLitBlock | IntPlusBlock | IntMinusBlock;