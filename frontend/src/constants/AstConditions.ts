const IntType = ["IntLit", "IntVarLit", "IntPlus", "IntMinus", "IntMult", "IntDiv", "IntMod", "IntArrayLength", "IntVarListLookup"];
const BoolType = ["BoolLit", "BoolVar", "BoolGreater", "BoolGreaterEq", "BoolLess", "BoolLessEq", "BoolEq", "BoolNeq", "BoolAnd", "BoolOr", "BoolNot"];
const ArrayType = ["ArrayLit", "ArrayVar", "ArrayRange", "ArrayConcat"];
const Statement = ["IntAssign", "BoolAssign", "ArrayAssign", "If", "While", "Swap", "ArrayInsert", "ArrayRemove"];

export type AST = { color: string, slots: any[] }

export const BLOCK_GROUPS = {
    Statements: ["If", "IntAssign", "BoolAssign", "ArrayAssign", "While", "Swap", "ArrayInsert", "ArrayRemove"],
    IntOperations: ["IntLit", "IntVarLit", "IntVarListLookup", "IntPlus", "IntMinus", "IntMult", "IntDiv", "IntMod", "IntArrayLength"],
    BoolOperations: ["BoolLit", "BoolVar", "BoolGreater", "BoolGreaterEq", "BoolLess", "BoolLessEq", "BoolEq", "BoolNeq", "BoolAnd", "BoolOr", "BoolNot"],
    ArrayOperations: ["ArrayLit", "ArrayVar", "ArrayRange", "ArrayConcat"]
}

export const BLOCK_REGISTRY: Record<string, AST> = {
    // Statements
    If: {
        color: "bg-blue-600",
        slots: [
            { id: "cond", label: "IF", accepts: BoolType, max: 1 },
            { id: "ifBlock", label: "THEN", accepts: Statement },
            { id: "elseBlock", label: "ELSE", accepts: Statement },
        ]
    },
    While: {
        color: "bg-blue-600",
        slots: [
            { id: "cond", label: "COND", accepts: BoolType, max: 1 },
            { id: "body", label: "BODY", accepts: Statement },
        ],
    },
    IntAssign: {
        color: "bg-purple-600",
        slots: [
            { id: "variable", label: "Variable", accepts: ["IntVarLit"], max: 1 },
            { id: "value", label: "Value", accepts: IntType, max: 1 },
        ]
    },
    BoolAssign: {
        color: "bg-purple-600",
        slots: [
            { id: "variable", label: "Variable", accepts: ["BoolVar"], max: 1 },
            { id: "value", label: "Value", accepts: BoolType, max: 1 },
        ]
    },
    ArrayAssign: {
        color: "bg-purple-600",
        slots: [
            { id: "variable", label: "Variable", accepts: ["ArrayVar"], max: 1 },
            { id: "value", label: "Value", accepts: ArrayType, max: 1 },
        ]
    },
    Swap: {
        color: "bg-blue-600",
        slots: [
            { id: "a", label: "First", accepts: ["IntVarLit"], max: 1 },
            { id: "b", label: "Second", accepts: ["IntVarLit"], max: 1 },
        ],
    },
    ArrayInsert: {
        color: "bg-blue-600",
        slots: [
            { id: "arr", label: "Array", accepts: ArrayType, max: 1 },
            { id: "value", label: "Value", accepts: IntType, max: 1 },
            { id: "index", label: "Index", accepts: IntType, max: 1 },
        ],
    },
    ArrayRemove: {
        color: "bg-blue-600",
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
        slots: [
            { id: "ident", label: "Variable Id", accepts: ["Id"], max: 1 }
        ]
    },
    IntVarListLookup: {
        color: "bg-purple-400",
        slots: [
            { id: "ident", label: "Variable Id", accepts: ["Id"], max: 1 },
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
};

// package algo_backend

// object Ast {

//   type Id = String


//   abstract sealed class IntType

//   case class IntLit(v: Int) extends IntType

//   case class IntPlus(v1: IntType, v2: IntType) extends IntType

//   case class IntMinus(v1: IntType, v2: IntType) extends IntType

//   case class IntMult(v1: IntType, v2: IntType) extends IntType

//   case class IntDiv(v1: IntType, v2: IntType) extends IntType

//   case class IntMod(v1: IntType, v2: IntType) extends IntType

//   case class IntArrayLength(arr: ArrayType) extends IntType


//   abstract sealed class IntVar extends IntType

//   case class IntVarLit(id: Id) extends IntVar

//   case class IntVarListLookup(id: Id, index: Int) extends IntVar


//   abstract sealed class BoolType

//   case class BoolLit(b: Boolean) extends BoolType

//   case class BoolVar(id: Id) extends BoolType

//   case class BoolGreater(v1: IntType, v2: IntType) extends BoolType

//   case class BoolGreaterEq(v1: IntType, v2: IntType) extends BoolType

//   case class BoolLess(v1: IntType, v2: IntType) extends BoolType

//   case class BoolLessEq(v1: IntType, v2: IntType) extends BoolType

//   case class BoolEq(v1: IntType, v2: IntType) extends BoolType

//   case class BoolNeq(v1: IntType, v2: IntType) extends BoolType

//   case class BoolAnd(b1: BoolType, b2: BoolType) extends BoolType

//   case class BoolOr(b1: BoolType, b2: BoolType) extends BoolType

//   case class BoolNot(b: BoolType) extends BoolType


//   abstract sealed class ArrayType

//   case class ArrayLit(values: List[Int]) extends ArrayType

//   case class ArrayVar(id: Id) extends ArrayType

//   case class ArrayRange(arr: ArrayType, startIndex: IntType, endIndex: IntType) extends ArrayType

//   case class ArrayConcat(a: ArrayType, b: ArrayType) extends ArrayType



//   abstract sealed class Statement

//   case class IntAssign(variable: IntVar, value: IntType) extends Statement

//   case class BoolAssign(variable: BoolVar, value: BoolType) extends Statement

//   case class If(cond: BoolType, thenBlock: Scope, elseBlock: Scope) extends Statement

//   case class While(cond: BoolType, body: Scope) extends Statement

//   //case class For(varDecl: IntAssign, cond: Bool, update: IntAssign, body: Block)
//   //case class ForEach(ArrayType)
//   case class Swap(a: IntVar, b: IntVar) extends Statement

//   case class ArrayInsert(arr: ArrayType, value: IntType, index: IntType) extends Statement
//   case class ArrayRemove(arr: ArrayType, index: IntType) extends Statement


//   class Scope(statements: List[Statement], env: Env)


//   class Env(var intEnv: Map[Id, Int], var boolEnv: Map[Id, Boolean], var arrEnv: Map[Id, List[Int]], val parent_env: Option[Env]) {
//   }


// }
