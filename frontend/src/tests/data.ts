import type { BlockState } from "../context/GlobalStateContext";

export const testSampleIfs: BlockState = {
    blocks: {
        "if-block-uuid1": { type: "If", id: "if-block-uuid1", parentId: "root", cond: "bool-lit-uuid1", ifBlock: [], elseBlock: [] },
        "bool-lit-uuid1": { type: "BoolLit", id: "bool-lit-uuid1", parentId: "if-block-uuid1", b: true },
        "if-block-uuid2": { type: "If", id: "if-block-uuid2", parentId: "root", cond: "bool-lit-uuid2", ifBlock: [], elseBlock: [] },
        "bool-lit-uuid2": { type: "BoolLit", id: "bool-lit-uuid2", parentId: "if-block-uuid2", b: false },
    },
    rootBlocks: ["if-block-uuid1", "if-block-uuid2"],
    templates: []
}

export const testSampleInts: BlockState = {
    blocks: {
        "int-block": { type: "IntLit", id: "int-block", parentId: "root", v: 42 },
    },
    rootBlocks: ["int-block"],
    templates: []
}

export const testIntsAndIfs: BlockState = {
    blocks: {
        "intplus-block": { type: "IntPlus", id: "intplus-block", parentId: "root", v1: "int-left", v2: "int-right" },
        "int-left": { type: "IntLit", id: "int-left", parentId: "intplus-block", v: 5 },
        "int-right": { type: "IntLit", id: "int-right", parentId: "intplus-block", v: 10 },
    },
    rootBlocks: ["intplus-block"],
    templates: []
}