import type { BlockState } from "../context/GlobalStateContext";

export const testSampleIfs: BlockState = {
    blocks: {
        "if-block-uuid1": { type: "If", id: "if-block-uuid1", parentId: "root", cond: "bool-lit-uuid1", ifBlock: [], elseBlock: [] },
        "bool-lit-uuid1": { type: "BoolLit", id: "bool-lit-uuid1", parentId: "if-block-uuid1", b: true },
        "if-block-uuid2": { type: "If", id: "if-block-uuid2", parentId: "root", cond: "bool-lit-uuid2", ifBlock: [], elseBlock: [] },
        "bool-lit-uuid2": { type: "BoolLit", id: "bool-lit-uuid2", parentId: "if-block-uuid2", b: false },
    },
    rootBlocks: ["if-block-uuid1", "if-block-uuid2"],
}

export const testSampleInts: BlockState = {
    blocks: {
        "int-block": { type: "IntLit", id: "int-block", parentId: "root", v: 42 },
    },
    rootBlocks: ["int-block"],
}

export const testIntsAndIfs: BlockState = {
    blocks: {
        "intplus-block": { type: "IntPlus", id: "intplus-block", parentId: "root", v1: "int-left", v2: "int-right" },
        "int-left": { type: "IntLit", id: "int-left", parentId: "intplus-block", v: 5 },
        "int-right": { type: "IntLit", id: "int-right", parentId: "intplus-block", v: 10 },
    },
    rootBlocks: ["intplus-block"],
}

export const testInitialProgramWithListA: BlockState = {
    blocks: {
        "program-root": { type: "InitialProgramWithList_A", id: "program-root", parentId: "root", decl_A: "decl-a", solution: "if-sort" },
        "decl-a": { type: "ArrayAssign", id: "decl-a", parentId: "program-root", variable: "array-a", value: "array-value" },
        "array-a": { type: "ArrayVar", id: "array-a", parentId: "decl-a", ident: "A" },
        "array-value": { type: "ArrayLit", id: "array-value", parentId: "decl-a", values: [3, 1] },
        "if-sort": { type: "If", id: "if-sort", parentId: "program-root", cond: "gt-0-1", ifBlock: ["swap-0-1"], elseBlock: [] },
        "gt-0-1": { type: "BoolGreater", id: "gt-0-1", parentId: "if-sort", v1: "a-idx-0", v2: "a-idx-1" },
        "a-idx-0": { type: "IntVarListLookup", id: "a-idx-0", parentId: "gt-0-1", ident: "A", index: "lit-0" },
        "a-idx-1": { type: "IntVarListLookup", id: "a-idx-1", parentId: "gt-0-1", ident: "A", index: "lit-1" },
        "lit-0": { type: "IntLit", id: "lit-0", parentId: "a-idx-0", v: 0 },
        "lit-1": { type: "IntLit", id: "lit-1", parentId: "a-idx-1", v: 1 },
        "swap-0-1": { type: "Swap", id: "swap-0-1", parentId: "if-sort", a: "swap-a", b: "swap-b" },
        "swap-a": { type: "IntVarListLookup", id: "swap-a", parentId: "swap-0-1", ident: "A", index: "lit-0" },
        "swap-b": { type: "IntVarListLookup", id: "swap-b", parentId: "swap-0-1", ident: "A", index: "lit-1" },
    },
    rootBlocks: ["program-root"],
}

