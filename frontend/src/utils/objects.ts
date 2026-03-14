import { BLOCK_REGISTRY } from "../constants/AstConditions";

export const createBlockFromAST = (type: string, prefix: string = "", parentId: string = "root") => {
    const ast = BLOCK_REGISTRY[type];
    if (!ast) {
        throw new Error(`Unknown block type: ${type}`);
    }
    return {
        id: `${prefix}:${crypto.randomUUID()}`,
        type,
        parentId,
        ...ast.slots.reduce((acc, slot) => {
            acc[slot.id] = slot.max === 1 ? null : [];
            return acc;
        }, {} as Record<string, any>)
    }
}