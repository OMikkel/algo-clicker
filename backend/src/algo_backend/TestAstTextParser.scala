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

    val initialProgramBlockState: Map[String, Any] = Map(
      "blocks" -> Map(
        "program-root" -> Map(
          "type" -> "InitialProgramWithList_A",
          "id" -> "program-root",
          "parentId" -> "root",
          "decl_A" -> "decl-a",
          "solution" -> "if-sort"
        ),
        "decl-a" -> Map(
          "type" -> "ArrayAssign",
          "id" -> "decl-a",
          "parentId" -> "program-root",
          "variable" -> "array-a",
          "value" -> "array-value"
        ),
        "array-a" -> Map(
          "type" -> "ArrayVar",
          "id" -> "array-a",
          "parentId" -> "decl-a",
          "ident" -> "A"
        ),
        "array-value" -> Map(
          "type" -> "ArrayLit",
          "id" -> "array-value",
          "parentId" -> "decl-a",
          "values" -> List(3, 1)
        ),
        "if-sort" -> Map(
          "type" -> "If",
          "id" -> "if-sort",
          "parentId" -> "program-root",
          "cond" -> "gt-0-1",
          "ifBlock" -> List("swap-0-1"),
          "elseBlock" -> List.empty[Any]
        ),
        "gt-0-1" -> Map(
          "type" -> "BoolGreater",
          "id" -> "gt-0-1",
          "parentId" -> "if-sort",
          "v1" -> "a-idx-0",
          "v2" -> "a-idx-1"
        ),
        "a-idx-0" -> Map(
          "type" -> "IntVarListLookup",
          "id" -> "a-idx-0",
          "parentId" -> "gt-0-1",
          "ident" -> "A",
          "index" -> "lit-0"
        ),
        "a-idx-1" -> Map(
          "type" -> "IntVarListLookup",
          "id" -> "a-idx-1",
          "parentId" -> "gt-0-1",
          "ident" -> "A",
          "index" -> "lit-1"
        ),
        "lit-0" -> Map("type" -> "IntLit", "id" -> "lit-0", "parentId" -> "a-idx-0", "v" -> 0),
        "lit-1" -> Map("type" -> "IntLit", "id" -> "lit-1", "parentId" -> "a-idx-1", "v" -> 1),
        "swap-0-1" -> Map(
          "type" -> "Swap",
          "id" -> "swap-0-1",
          "parentId" -> "if-sort",
          "a" -> "swap-a",
          "b" -> "swap-b"
        ),
        "swap-a" -> Map("type" -> "IntVarListLookup", "id" -> "swap-a", "parentId" -> "swap-0-1", "ident" -> "A", "index" -> "lit-0"),
        "swap-b" -> Map("type" -> "IntVarListLookup", "id" -> "swap-b", "parentId" -> "swap-0-1", "ident" -> "A", "index" -> "lit-1")
      ),
      "rootBlocks" -> List("program-root")
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

    val explicitScopeBlockState: Map[String, Any] = Map(
      "blocks" -> Map(
        "scope-root" -> Map(
          "type" -> "Scope",
          "id" -> "scope-root",
          "parentId" -> "root",
          "statements" -> List("assign-a")
        ),
        "assign-a" -> Map(
          "type" -> "IntAssign",
          "id" -> "assign-a",
          "parentId" -> "scope-root",
          "variable" -> "var-a",
          "value" -> "lit-2"
        ),
        "var-a" -> Map(
          "type" -> "IntVarLit",
          "id" -> "var-a",
          "parentId" -> "assign-a",
          "ident" -> "a"
        ),
        "lit-2" -> Map(
          "type" -> "IntLit",
          "id" -> "lit-2",
          "parentId" -> "assign-a",
          "v" -> 2
        )
      ),
      "rootBlocks" -> List("scope-root")
    )

    val parsedExplicitScope = AstBlockStateParser.parsePayload("auto", explicitScopeBlockState)
    assert(parsedExplicitScope.exists(_.kind == "scope"))
    assert(parsedExplicitScope.exists(_.value == Scope(List(IntAssign(IntVarLit("a"), IntLit(2))))))

    val ifWithScopeBlockState: Map[String, Any] = Map(
      "blocks" -> Map(
        "if-root" -> Map(
          "type" -> "If",
          "id" -> "if-root",
          "parentId" -> "root",
          "cond" -> "bool-true",
          "ifBlock" -> List("scope-then"),
          "elseBlock" -> List.empty[Any]
        ),
        "bool-true" -> Map(
          "type" -> "BoolLit",
          "id" -> "bool-true",
          "parentId" -> "if-root",
          "b" -> true
        ),
        "scope-then" -> Map(
          "type" -> "Scope",
          "id" -> "scope-then",
          "parentId" -> "if-root",
          "statements" -> List("assign-b")
        ),
        "assign-b" -> Map(
          "type" -> "IntAssign",
          "id" -> "assign-b",
          "parentId" -> "scope-then",
          "variable" -> "var-b",
          "value" -> "lit-3"
        ),
        "var-b" -> Map(
          "type" -> "IntVarLit",
          "id" -> "var-b",
          "parentId" -> "assign-b",
          "ident" -> "b"
        ),
        "lit-3" -> Map(
          "type" -> "IntLit",
          "id" -> "lit-3",
          "parentId" -> "assign-b",
          "v" -> 3
        )
      ),
      "rootBlocks" -> List("if-root")
    )

    val parsedIfWithScope = AstBlockStateParser.parsePayload("auto", ifWithScopeBlockState)
    assert(parsedIfWithScope.exists(_.kind == "statement"))
    assert(parsedIfWithScope.exists(_.value == If(BoolLit(true), Scope(List(IntAssign(IntVarLit("b"), IntLit(3)))), Scope(List.empty))))

    val parsedProgramAuto = AstBlockStateParser.parsePayload("auto", initialProgramBlockState)
    assert(parsedProgramAuto.exists(_.kind == "program"))
    assert(parsedProgramAuto.exists(_.value == InitialProgramWithList_A(
      ArrayAssign(ArrayVar("A"), ArrayLit(List(3, 1))),
      If(
        BoolGreater(IntVarListLookup("A", IntLit(0)), IntVarListLookup("A", IntLit(1))),
        Scope(List(Swap(IntVarListLookup("A", IntLit(0)), IntVarListLookup("A", IntLit(1))))),
        Scope(List.empty)
      )
    )))

    val parsedProgramExplicit = AstBlockStateParser.parsePayload("program", initialProgramBlockState)
    assert(parsedProgramExplicit.exists(_.kind == "program"))

    println("AstTextParser tests passed")
  }
}

