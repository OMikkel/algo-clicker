import type { BaseBlock, BlockId } from "../blocks";

export interface IntLitBlock extends BaseBlock {
    type: "IntLit";
    v: number;
}

export interface IntPlusBlock extends BaseBlock {
    type: "IntPlus";
    v1: BlockId | null;
    v2: BlockId | null;
}

export interface IntMinusBlock extends BaseBlock {
    type: "IntMinus";
    v1: BlockId | null;
    v2: BlockId | null;
}