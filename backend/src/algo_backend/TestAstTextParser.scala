package algo_backend

import Ast.*

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

    val ifBlockState: Map[String, Any] = Map(
      "blocks" -> Map(
        "if-block-uuid1" -> Map(
          "type" -> "If",
          "id" -> "if-block-uuid1",
          "parentId" -> "root",
          "cond" -> "bool-lit-uuid1",
          "ifBlock" -> List.empty[Any],
          "elseBlock" -> List.empty[Any]
        ),
        "bool-lit-uuid1" -> Map(
          "type" -> "BoolLit",
          "id" -> "bool-lit-uuid1",
          "parentId" -> "if-block-uuid1",
          "b" -> true
        )
      ),
      "rootBlocks" -> List("if-block-uuid1")
    )

    val intPlusBlockState: Map[String, Any] = Map(
      "blocks" -> Map(
        "intplus-block" -> Map(
          "type" -> "IntPlus",
          "id" -> "intplus-block",
          "parentId" -> "root",
          "v1" -> "int-left",
          "v2" -> "int-right"
        ),
        "int-left" -> Map(
          "type" -> "IntLit",
          "id" -> "int-left",
          "parentId" -> "intplus-block",
          "v" -> 5
        ),
        "int-right" -> Map(
          "type" -> "IntLit",
          "id" -> "int-right",
          "parentId" -> "intplus-block",
          "v" -> 10
        )
      ),
      "rootBlocks" -> List("intplus-block")
    )

    val parsedIf = AstBlockStateParser.parsePayload("auto", ifBlockState)
    assert(parsedIf.exists(_.kind == "statement"))
    assert(parsedIf.exists(_.value == If(BoolLit(true), Scope(List.empty), Scope(List.empty))))

    val parsedInt = AstBlockStateParser.parsePayload("auto", intPlusBlockState)
    assert(parsedInt.exists(_.kind == "int"))
    assert(parsedInt.exists(_.value == IntPlus(IntLit(5), IntLit(10))))

    val parsedScope = AstBlockStateParser.parsePayload(
      "scope",
      ifBlockState.updated("rootBlocks", List("if-block-uuid1", "if-block-uuid1"))
    )
    assert(parsedScope.exists(_.kind == "scope"))

    println("AstTextParser tests passed")
  }
}

