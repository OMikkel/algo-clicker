const IntType = ["IntLit", "IntVarLit", "IntPlus", "IntMinus", "IntMult", "IntDiv", "IntMod", "IntArrayLength"];
const BoolType = ["BoolLit", "BoolVar", "BoolGreater", "BoolGreaterEq", "BoolLess", "BoolLessEq", "BoolEq", "BoolNeq", "BoolAnd", "BoolOr", "BoolNot"];
const ArrayType = ["ArrayLit", "ArrayVar", "ArrayRange", "ArrayConcat"];
const Statement = ["IntAssign", "BoolAssign", "If", "While", "Swap", "ArrayInsert", "ArrayRemove"];

export type AST = { color: string, slots: any[] }

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
    BoolLit: {
        color: "bg-green-500",
        slots: []
    },
    IntAssign: {
        color: "bg-purple-600",
        slots: [
            { id: "variable", label: "Variable", accepts: ["IntVarLit"], max: 1 },
            { id: "value", label: "Value", accepts: IntType, max: 1 },
        ]
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
    IntPlus: {
        color: "bg-blue-500",
        slots: [
            { id: "v1", label: "Left", accepts: IntType, max: 1 },
            { id: "v2", label: "Right", accepts: IntType, max: 1 },
        ]
    },
    // Array Operations
    ArrayRange: {
        color: "bg-green-600",
        slots: [
            { id: "arr", label: "Array", accepts: ArrayType, max: 1 },
            { id: "startIndex", label: "From", accepts: IntType, max: 1 },
            { id: "endIndex", label: "To", accepts: IntType, max: 1 },
        ]
    },
    ArrayAssign: {
        color: "bg-purple-600",
        slots: [
            { id: "variable", label: "Variable", accepts: ["ArrayVar"], max: 1 },
            { id: "value", label: "Value", accepts: ArrayType, max: 1 },
        ]
    },
    ArrayVar: {
        color: "bg-purple-500",
        slots: [
            { id: "ident", label: "Array Id", accepts: ["Id"], max: 1 }
        ]
    },
    ArrayLit: {
        color: "bg-green-500",
        slots: [
            { id: "values", label: "Values (comma-separated)", accepts: ["List[Int]"], max: 1 }
        ]
    }
    // ... add others here ...
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
