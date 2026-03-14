import type { BaseBlock, BlockId } from "../blocks";

export interface IfBlock extends BaseBlock {
    type: "If";
    cond: BlockId | null;
    ifBlock: BlockId[] | null;
    elseBlock: BlockId[] | null;
}