import type { IfBlock } from "./blocks/if";
import type { IntLitBlock, IntMinusBlock, IntPlusBlock } from "./blocks/intType";
import type { ArrayLitBlock } from "./blocks/arrayType";



export type BlockId = string;

export interface BaseBlock {
    id: BlockId;
    type: string;
    parentId: BlockId | "root"
    parentSlot?: string; // New field to track which slot of the parent this block occupies
}

export interface BoolLitBlock extends BaseBlock {
    type: "BoolLit";
    b: boolean;
}



export type Blocks = Record<BlockId, Block>;

export type Block = IfBlock | BoolLitBlock | IntLitBlock | IntPlusBlock | IntMinusBlock | ArrayLitBlock;