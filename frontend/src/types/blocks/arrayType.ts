import type { BaseBlock } from "../blocks";

export interface ArrayLitBlock extends BaseBlock {
    type: "ArrayLit";
    values: number[] | null;
}
