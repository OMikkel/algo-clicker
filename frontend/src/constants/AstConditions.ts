// 1. Type Definitions for the Registry
export type Slot = {
    id: string;
    label: string;
    accepts: string[];
    max?: number;
};

export type ASTDefinition = {
    color: string;
    displayTitle?: string;
    helpText?: string;
    slots: Slot[];
    editors
};

// 2. Define Category Arrays (for Reusability and Validation)
const IntType = ["IntLit", "IntVarLit", "IntPlus", "IntMinus", "IntMult", "IntDiv", "IntMod", "IntArrayLength", "IntVarListLookup"];
const BoolType = ["BoolLit", "BoolVar", "BoolGreater", "BoolGreaterEq", "BoolLess", "BoolLessEq", "BoolEq", "BoolNeq", "BoolAnd", "BoolOr", "BoolNot"];
const ArrayType = ["ArrayLit", "ArrayVar", "ArrayRange", "ArrayConcat"];
const Statement = ["IntAssign", "BoolAssign", "ArrayAssign", "If", "While", "Swap", "ArrayInsert", "ArrayRemove"];

// 3. Block Groups for Sidebar/UI
export const BLOCK_GROUPS = {
    Statements: ["If", "While", "IntAssign", "BoolAssign", "ArrayAssign", "Swap", "ArrayInsert", "ArrayRemove"],
    IntOperations: ["IntLit", "IntVarLit", "IntVarListLookup", "IntPlus", "IntMinus", "IntMult", "IntDiv", "IntMod", "IntArrayLength"],
    BoolOperations: ["BoolLit", "BoolVar", "BoolGreater", "BoolGreaterEq", "BoolLess", "BoolLessEq", "BoolEq", "BoolNeq", "BoolAnd", "BoolOr", "BoolNot"],
    ArrayOperations: ["ArrayLit", "ArrayVar", "ArrayRange", "ArrayConcat"],
    Fusk: ["InitialProgramWithList_A"],
} as const;

export const BLOCK_GROUP_LABELS: Record<keyof typeof BLOCK_GROUPS, string> = {
    Statements: "Statements",
    IntOperations: "Integer Operations",
    BoolOperations: "Boolean Operations",
    ArrayOperations: "Array Operations",
    Fusk: "DO NOT SHOW - For Fusk Only",
} as const;

// 4. Create a Union Type of all possible Block Keys
type AllBlockKeys = typeof BLOCK_GROUPS[keyof typeof BLOCK_GROUPS][number];

export const BLOCK_REGISTRY: Record<AllBlockKeys, ASTDefinition> = {
    // Statements
    If: {
        color: "bg-blue-600",
        displayTitle: "If Statement",
        helpText: "Execute a block of code if a condition is true.",
        slots: [
            { id: "cond", label: "IF", accepts: BoolType, max: 1 },
            { id: "ifBlock", label: "THEN", accepts: Statement },
            { id: "elseBlock", label: "ELSE", accepts: Statement },
        ]
    },
    While: {
        color: "bg-blue-600",
        displayTitle: "While Loop",
        helpText: "Execute a block of code while a condition is true.",
        slots: [
            { id: "cond", label: "COND", accepts: BoolType, max: 1 },
            { id: "body", label: "BODY", accepts: Statement },
        ],
    },
    IntAssign: {
        color: "bg-purple-600",
        displayTitle: "Integer Assignment",
        helpText: "Assign a value to an integer variable.",
        slots: [
            { id: "variable", label: "Variable", accepts: ["IntVarLit"], max: 1 },
            { id: "value", label: "Value", accepts: IntType, max: 1 },
        ]
    },
    BoolAssign: {
        color: "bg-purple-600",
        displayTitle: "Boolean Assignment",
        helpText: "Assign a value to a boolean variable.",
        slots: [
            { id: "variable", label: "Variable", accepts: ["BoolVar"], max: 1 },
            { id: "value", label: "Value", accepts: BoolType, max: 1 },
        ]
    },
    ArrayAssign: {
        color: "bg-purple-600",
        displayTitle: "Array Assignment",
        helpText: "Assign a value to an array variable.",
        slots: [
            { id: "variable", label: "Variable", accepts: ["ArrayVar"], max: 1 },
            { id: "value", label: "Value", accepts: ArrayType, max: 1 },
        ]
    },
    Swap: {
        color: "bg-blue-600",
        displayTitle: "Swap",
        helpText: "Swap the values of two variables.",
        slots: [
            { id: "a", label: "Variable 1", accepts: ["IntVarLit", "BoolVar", "ArrayVar"], max: 1 },
            { id: "b", label: "Variable 2", accepts: ["IntVarLit", "BoolVar", "ArrayVar"], max: 1 },
        ]
    },
    ArrayInsert: {
        color: "bg-blue-600",
        displayTitle: "Array Insert",
        helpText: "Insert a value into an array at a specific index.",
        slots: [
            { id: "arr", label: "Array", accepts: ArrayType, max: 1 },
            { id: "value", label: "Value", accepts: IntType, max: 1 },
            { id: "index", label: "Index", accepts: IntType, max: 1 },
        ],
    },
    ArrayRemove: {
        color: "bg-blue-600",
        displayTitle: "Array Remove",
        helpText: "Remove a value from an array at a specific index.",
        slots: [
            { id: "arr", label: "Array", accepts: ArrayType, max: 1 },
            { id: "index", label: "Index", accepts: IntType, max: 1 },
        ],
    },

    // Bool Operations
    BoolLit: {
        color: "bg-green-500",
        slots: []
    },
    BoolVar: {
        color: "bg-green-400",
        slots: [
            { id: "ident", label: "Variable Id", accepts: ["Id"], max: 1 },
        ],
    },
    BoolGreater: {
        color: "bg-blue-500",
        slots: [
            { id: "v1", label: "Left", accepts: IntType, max: 1 },
            { id: "v2", label: "Right", accepts: IntType, max: 1 },
        ],
    },
    BoolGreaterEq: {
        color: "bg-blue-500",
        slots: [
            { id: "v1", label: "Left", accepts: IntType, max: 1 },
            { id: "v2", label: "Right", accepts: IntType, max: 1 },
        ],
    },
    BoolLess: {
        color: "bg-blue-500",
        slots: [
            { id: "v1", label: "Left", accepts: IntType, max: 1 },
            { id: "v2", label: "Right", accepts: IntType, max: 1 },
        ],
    },
    BoolLessEq: {
        color: "bg-blue-500",
        slots: [
            { id: "v1", label: "Left", accepts: IntType, max: 1 },
            { id: "v2", label: "Right", accepts: IntType, max: 1 },
        ],
    },
    BoolEq: {
        color: "bg-blue-500",
        slots: [
            { id: "v1", label: "Left", accepts: IntType, max: 1 },
            { id: "v2", label: "Right", accepts: IntType, max: 1 },
        ],
    },
    BoolNeq: {
        color: "bg-blue-500",
        slots: [
            { id: "v1", label: "Left", accepts: IntType, max: 1 },
            { id: "v2", label: "Right", accepts: IntType, max: 1 },
        ],
    },
    BoolAnd: {
        color: "bg-blue-500",
        slots: [
            { id: "b1", label: "Left", accepts: BoolType, max: 1 },
            { id: "b2", label: "Right", accepts: BoolType, max: 1 },
        ],
    },
    BoolOr: {
        color: "bg-blue-500",
        slots: [
            { id: "b1", label: "Left", accepts: BoolType, max: 1 },
            { id: "b2", label: "Right", accepts: BoolType, max: 1 },
        ],
    },
    BoolNot: {
        color: "bg-blue-500",
        slots: [
            { id: "b", label: "Value", accepts: BoolType, max: 1 },
        ],
    },

    // Int Operations
    IntLit: {
        color: "bg-purple-500",
        slots: []
    },
    IntVarLit: {
        color: "bg-purple-400",
        slots: []
    },
    IntVarListLookup: {
        color: "bg-purple-400",
        slots: [
            { id: "index", label: "Index", accepts: IntType, max: 1 },
        ],
    },
    IntPlus: {
        color: "bg-blue-500",
        slots: [
            { id: "v1", label: "Left", accepts: IntType, max: 1 },
            { id: "v2", label: "Right", accepts: IntType, max: 1 },
        ]
    },
    IntMinus: {
        color: "bg-blue-500",
        slots: [
            { id: "v1", label: "Left", accepts: IntType, max: 1 },
            { id: "v2", label: "Right", accepts: IntType, max: 1 },
        ]
    },
    IntMult: {
        color: "bg-blue-500",
        slots: [
            { id: "v1", label: "Left", accepts: IntType, max: 1 },
            { id: "v2", label: "Right", accepts: IntType, max: 1 },
        ]
    },
    IntDiv: {
        color: "bg-blue-500",
        slots: [
            { id: "v1", label: "Left", accepts: IntType, max: 1 },
            { id: "v2", label: "Right", accepts: IntType, max: 1 },
        ]
    },
    IntMod: {
        color: "bg-blue-500",
        slots: [
            { id: "v1", label: "Left", accepts: IntType, max: 1 },
            { id: "v2", label: "Right", accepts: IntType, max: 1 },
        ]
    },
    IntArrayLength: {
        color: "bg-blue-500",
        slots: [
            { id: "arr", label: "Array", accepts: ArrayType, max: 1 },
        ],
    },

    // Array Operations
    ArrayLit: {
        color: "bg-green-500",
        slots: []
    },
    ArrayVar: {
        color: "bg-purple-500",
        slots: []
    },
    ArrayRange: {
        color: "bg-green-600",
        slots: [
            { id: "arr", label: "Array", accepts: ArrayType, max: 1 },
            { id: "startIndex", label: "From", accepts: IntType, max: 1 },
            { id: "endIndex", label: "To", accepts: IntType, max: 1 },
        ]
    },
    ArrayConcat: {
        color: "bg-green-600",
        slots: [
            { id: "a", label: "Left", accepts: ArrayType, max: 1 },
            { id: "b", label: "Right", accepts: ArrayType, max: 1 },
        ],
    },

    // case class InitialProgramWithList_A(decl_A: ArrayAssign, solution: AstNode) extends AstNode
    InitialProgramWithList_A: {
        displayTitle: "Initial Program",
        helpText: "Compose your program by filling in the solutions block.",
        slots: [
            { id: "decl_A", label: "Array Declaration", accepts: ["ArrayAssign"], max: 1 },
            { id: "solution", label: "Solution", accepts: Statement, max: 1 },
        ],
        color: "bg-grey-100",
    },
};
