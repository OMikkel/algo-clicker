package algo_backend

object Ast {

  type Id = String

  abstract class AstNode




  abstract sealed class IntType extends AstNode

  case class IntLit(v: Int) extends IntType

  case class IntPlus(v1: IntType, v2: IntType) extends IntType

  case class IntMinus(v1: IntType, v2: IntType) extends IntType

  case class IntMult(v1: IntType, v2: IntType) extends IntType

  case class IntDiv(v1: IntType, v2: IntType) extends IntType

  case class IntMod(v1: IntType, v2: IntType) extends IntType

  case class IntArrayLength(arr: ArrayType) extends IntType


  abstract sealed class IntVar extends IntType

  case class IntVarLit(ident: Id) extends IntVar

  case class IntVarListLookup(ident: Id, index: IntType) extends IntVar


  abstract sealed class BoolType

  case class BoolLit(b: Boolean) extends BoolType

  case class BoolVar(ident: Id) extends BoolType

  case class BoolGreater(v1: IntType, v2: IntType) extends BoolType

  case class BoolGreaterEq(v1: IntType, v2: IntType) extends BoolType

  case class BoolLess(v1: IntType, v2: IntType) extends BoolType

  case class BoolLessEq(v1: IntType, v2: IntType) extends BoolType

  case class BoolEq(v1: IntType, v2: IntType) extends BoolType

  case class BoolNeq(v1: IntType, v2: IntType) extends BoolType

  case class BoolAnd(b1: BoolType, b2: BoolType) extends BoolType

  case class BoolOr(b1: BoolType, b2: BoolType) extends BoolType

  case class BoolNot(b: BoolType) extends BoolType


  abstract sealed class ArrayType extends AstNode

  case class ArrayLit(values: List[Int]) extends ArrayType

  case class ArrayVar(ident: Id) extends ArrayType

  case class ArrayRange(arr: ArrayType, startIndex: IntType, endIndex: IntType) extends ArrayType

  case class ArrayConcat(a: ArrayType, b: ArrayType) extends ArrayType



  abstract sealed class Statement extends AstNode

  case class IntAssign(variable: IntVar, value: IntType) extends Statement

  case class BoolAssign(variable: BoolVar, value: BoolType) extends Statement

  case class ArrayAssign(variable: ArrayVar, value: ArrayType) extends Statement

  case class If(cond: BoolType, thenBlock: Scope, elseBlock: Scope) extends Statement

  case class While(cond: BoolType, body: Scope) extends Statement

  //case class For(varDecl: IntAssign, cond: Bool, update: IntAssign, body: Block)
  //case class ForEach(ArrayType)
  case class Swap(var a: IntVar, var b: IntVar) extends Statement

  case class ArrayInsert(arr: ArrayType, value: IntType, index: IntType) extends Statement
  case class ArrayRemove(arr: ArrayType, index: IntType) extends Statement

  case class Scope(statements: List[Statement])

  case class IntRef(read: () => Int, write: Int => Unit)


  class Env(var intEnv: Map[Id, Int], var boolEnv: Map[Id, Boolean], var arrEnv: Map[Id, List[Int]], val parent_env: Option[Env]) {
  }


  abstract class TraceType
  case class TraceArrAssign_A(value: List[Int], arr: Id) extends TraceType
  case class TraceArrSwap(index1: Int, index2: Int, arr: Id) extends TraceType
  case class TraceArrayInsert(index: Int, value: Int, arr: Id) extends TraceType
  case class TraceArrayRemove(index: Int, arr: Id) extends TraceType
  case class TraceArrayConcat(arr1: Id, arr2: Id) extends TraceType
  case class NoTrace() extends TraceType
}
