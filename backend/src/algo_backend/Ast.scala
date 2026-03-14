package algo_backend

object Ast {

  type Id = String


  abstract sealed class IntType

  case class IntLit(v: Int) extends IntType

  case class IntPlus(v1: IntType, v2: IntType) extends IntType

  case class IntMinus(v1: IntType, v2: IntType) extends IntType

  case class IntMult(v1: IntType, v2: IntType) extends IntType

  case class IntDiv(v1: IntType, v2: IntType) extends IntType

  case class IntMod(v1: IntType, v2: IntType) extends IntType

  case class IntArrayLength(arr: ArrayType) extends IntType


  abstract sealed class IntVar extends IntType

  case class IntVarLit(id: Id) extends IntVar

  case class IntVarListLookup(id: Id, index: Int) extends IntVar


  abstract sealed class BoolType

  case class BoolLit(b: Boolean) extends BoolType

  case class BoolVar(id: Id) extends BoolType

  case class BoolGreater(v1: IntType, v2: IntType) extends BoolType

  case class BoolGreaterEq(v1: IntType, v2: IntType) extends BoolType

  case class BoolLess(v1: IntType, v2: IntType) extends BoolType

  case class BoolLessEq(v1: IntType, v2: IntType) extends BoolType

  case class BoolEq(v1: IntType, v2: IntType) extends BoolType

  case class BoolNeq(v1: IntType, v2: IntType) extends BoolType

  case class BoolAnd(b1: BoolType, b2: BoolType) extends BoolType

  case class BoolOr(b1: BoolType, b2: BoolType) extends BoolType

  case class BoolNot(b: BoolType) extends BoolType


  abstract sealed class ArrayType

  case class ArrayLit(values: List[Int]) extends ArrayType

  case class ArrayVar(id: Id) extends ArrayType

  case class ArrayRange(arr: ArrayType, startIndex: IntType, endIndex: IntType) extends ArrayType

  case class ArrayConcat(a: ArrayType, b: ArrayType) extends ArrayType



  abstract sealed class Statement

  case class IntAssign(variable: IntVar, value: IntType) extends Statement

  case class BoolAssign(variable: BoolVar, value: BoolType) extends Statement

  case class If(cond: BoolType, thenBlock: Scope, elseBlock: Scope) extends Statement

  case class While(cond: BoolType, body: Scope) extends Statement

  //case class For(varDecl: IntAssign, cond: Bool, update: IntAssign, body: Block)
  //case class ForEach(ArrayType)
  case class Swap(a: IntVar, b: IntVar) extends Statement

  case class ArrayInsert(arr: ArrayType, value: IntType, index: IntType) extends Statement
  case class ArrayRemove(arr: ArrayType, index: IntType) extends Statement


  class Scope(statements: List[Statement], env: Env)


  class Env(var intEnv: Map[Id, Int], var boolEnv: Map[Id, Boolean], var arrEnv: Map[Id, List[Int]], val parent_env: Option[Env]) {
  }


}
