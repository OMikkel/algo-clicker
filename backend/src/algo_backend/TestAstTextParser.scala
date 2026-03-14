package algo_backend

object TestAstTextParser {
  def main(args: Array[String]): Unit = {
    val intInput = "IntPlus(IntLit(1), IntLit(2))"
    val boolInput = "BoolAnd(BoolLit(true), BoolNot(BoolLit(false)))"
    val arrInput = "ArrayRange(ArrayLit(List(1,2,3,4)), IntLit(1), IntLit(2))"
    val statementInput = "ArrayInsert(ArrayVar(\"A\"), IntLit(10), IntLit(1))"
    val scopeInput = "Scope(List(IntAssign(IntVarLit(\"a\"), IntLit(2)), ArrayRemove(ArrayVar(\"A\"), IntLit(0))))"

    assert(AstTextParser.parse("int", intInput).isRight)
    assert(AstTextParser.parse("bool", boolInput).isRight)
    assert(AstTextParser.parse("array", arrInput).isRight)
    assert(AstTextParser.parse("statement", statementInput).isRight)
    assert(AstTextParser.parse("scope", scopeInput).isRight)

    val autoParsed = AstTextParser.parse("auto", statementInput)
    assert(autoParsed.exists(_.kind == "statement"))

    val badInput = AstTextParser.parse("statement", "NotARealNode(1)")
    assert(badInput.isLeft)

    println("AstTextParser tests passed")
  }
}

