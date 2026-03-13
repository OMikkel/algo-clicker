package algo_backend

object Ast {

  type Id = String


  abstract class IntType

  case class IntLit(v: Int) extends IntType

  case class IntPlus(v1: IntType, v2: IntType) extends IntType

  case class IntMinus(v1: IntType, v2: IntType) extends IntType

  case class IntMult(v1: IntType, v2: IntType) extends IntType

  case class IntDiv(v1: IntType, v2: IntType) extends IntType

  case class IntMod(v1: IntType, v2: IntType) extends IntType


  abstract class IntVar extends IntType

  case class IntVarLit(id: Id) extends IntVar

  case class IntVarListLookup(id: Id) extends IntVar


  abstract class BoolType

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

  abstract class ArrayType

  case class ArrayLit(values: List[IntType]) extends ArrayType

  case class ArrayVar(id: Id) extends ArrayType

  case class ArraySplit(a: ArrayType, atIndex: IntType) extends ArrayType

  case class ArrayConcat(a: ArrayType, b: ArrayType) extends ArrayType


  abstract class Statement

  case class IntAssign(variable: IntVar, value: IntType) extends Statement

  case class BoolAssign(variable: BoolVar, value: BoolType) extends Statement

  case class If(cond: BoolType, ifBlock: Block, elseBlock: Block) extends Statement

  case class While(cond: BoolType, body: Block) extends Statement

  //case class For(varDecl: IntAssign, cond: Bool, update: IntAssign, body: Block)
  //case class ForEach(ArrayType)
  case class Swap(a: IntVar, b: IntVar) extends Statement


  class Block(statements: List[Statement], env: Env)


  class Env(var intEnv: Map[Id, IntType], var boolEnv: Map[Id, BoolType], var arrEnv: Map[Id, ArrayType])


}
