package algo_backend

import Interpreter.*
import Ast.{IntType, *}

object TestInterpreter {
  // Use fresh env instances per test reference because Env is mutable.
  def boolEnvOn_a: Env = Env(Map(), Map("a" -> true), Map(), None)
  def boolEnvInEnvOn_a: Env = Env(Map(),Map(),Map(), Some(Env(Map(), Map("a" -> true), Map(), None)))
  def intEnvOn_a: Env = Env(Map("a" -> 5), Map(), Map(), None)
  def intEnvInEnvOn_a: Env = Env(Map(),Map(),Map(), Some(Env(Map("a" -> 5), Map(), Map(), None)))
  def listEnvOn_A: Env = Env(Map(), Map(), Map("A" -> List(5,8,1)), None)
  def listEnvInEnvOn_A: Env = Env(Map(),Map(),Map(), Some(Env(Map(), Map(), Map("A" -> List(5,8,1)), None)))


  def main(args: Array[String]): Unit = {
    // Int tests
    test(IntLit(1), 1)
    test(IntPlus(IntLit(1), IntLit(2)), 3)
    test(IntMinus(IntLit(1), IntLit(2)), -1)
    test(IntMult(IntLit(3), IntLit(2)), 6)
    test(IntDiv(IntLit(3), IntLit(2)), 1)
    test(IntMod(IntLit(3), IntLit(2)), 1)
    test(IntVarLit("a"), 5, intEnvOn_a)
    test(IntVarLit("a"), 5, intEnvInEnvOn_a)
    test(IntVarListLookup("A", IntLit(1)), 8, listEnvOn_A)
    test(IntVarListLookup("A", IntLit(1)), 8, listEnvInEnvOn_A)
    test(IntArrayLength(ArrayLit(List(4,6,9))), 3)

    // Bool tests
    test(BoolLit(true), true)
    test(BoolVar("a"), true, boolEnvOn_a)
    test(BoolVar("a"), true, boolEnvInEnvOn_a)
    test(BoolGreater(IntLit(1), IntLit(2)), false)
    test(BoolAnd(BoolLit(true), BoolLit(false)), false)
    test(BoolOr(BoolLit(false), BoolLit(true)), true)
    test(BoolNot(BoolVar("a")), false, boolEnvOn_a)

    // Array tests
    test(ArrayLit(List(1,2,3)), List(1,2,3))
    test(ArrayVar("A"), List(5,8,1), listEnvOn_A)
    test(ArrayVar("A"), List(5,8,1), listEnvInEnvOn_A)
    test(ArrayRange(ArrayLit(List(0,1,2,3,4,5)), IntLit(1), IntLit(3)), List(1,2,3))
    test(ArrayConcat(ArrayLit(List(0,1,2)), ArrayLit(List(3,4,5))), List(0,1,2,3,4,5))

    // Statement tests

    // Int assign
    var env = intEnvOn_a
    test(IntAssign(IntVarLit("a"), IntLit(4)), env)
    assert(lookupInt("a", env) == 4)
    env = intEnvInEnvOn_a
    test(IntAssign(IntVarLit("a"), IntLit(3)), env)
    assert(lookupInt("a", env) == 3)
    env = Env(Map(), Map(), Map(), None)
    test(IntAssign(IntVarLit("a"), IntLit(2)), env)
    assert(lookupInt("a", env) == 2)

    // Bool assign
    env = boolEnvOn_a
    test(BoolAssign(BoolVar("a"), BoolLit(false)), env)
    assert(lookupBool("a", env) == false)
    env = boolEnvInEnvOn_a
    test(BoolAssign(BoolVar("a"), BoolLit(false)), env)
    assert(lookupBool("a", env) == false)
    env = Env(Map(), Map(), Map(), None)
    test(BoolAssign(BoolVar("a"), BoolLit(false)), env)
    assert(lookupBool("a", env) == false)

    // Array assign
    env = listEnvOn_A
    test(ArrayAssign(ArrayVar("A"), ArrayLit(List(9,8,7))), env)
    assert(lookupArr("A", env) == List(9,8,7))
    env = listEnvInEnvOn_A
    test(ArrayAssign(ArrayVar("A"), ArrayLit(List(6,5,4))), env)
    assert(lookupArr("A", env) == List(6,5,4))
    env = Env(Map(), Map(), Map(), None)
    test(ArrayAssign(ArrayVar("A"), ArrayLit(List(3,2,1))), env)
    assert(lookupArr("A", env) == List(3,2,1))

    // If statement
    env = intEnvOn_a
    test(If(BoolLit(true), Scope(List(IntAssign(IntVarLit("a"), IntLit(1)))), Scope(List(IntAssign(IntVarLit("a"), IntLit(0))))), env)
    assert(lookupInt("a", env) == 1)
    env = intEnvOn_a
    test(If(BoolLit(false), Scope(List(IntAssign(IntVarLit("a"), IntLit(1)))), Scope(List(IntAssign(IntVarLit("a"), IntLit(0))))), env)
    assert(lookupInt("a", env) == 0)

    // While loop
    env = intEnvOn_a // a = 5
    test(While(BoolLess(IntVarLit("a"), IntLit(10)), Scope(List(IntAssign(IntVarLit("a"), IntPlus(IntVarLit("a"), IntLit(1)))))), env)
    assert(lookupInt("a", env) == 10)

    // Swap statement
    env = Env(Map("a" -> 3, "b" -> 7), Map(), Map(), None)
    test(Swap(IntVarLit("a"), IntVarLit("b")), env)
    assert(lookupInt("a", env) == 7)
    assert(lookupInt("b", env) == 3)

    env = Env(Map("a" -> 9), Map(), Map("A" -> List(1,2,3)), None)
    test(Swap(IntVarLit("a"), IntVarListLookup("A", IntLit(1))), env)
    assert(lookupInt("a", env) == 2)
    assert(lookupArr("A", env) == List(1,9,3))

    env = listEnvOn_A // ArrayVar("A"), List(5,8,1)
    test(Swap(IntVarListLookup("A", IntLit(0)), IntVarListLookup("A", IntLit(1))), env)
    assert(lookupArr("A", env) == List(8,5,1))

    // Array Insert
    env = listEnvOn_A // ArrayVar("A"), List(5,8,1)
    test(ArrayInsert(ArrayVar("A"), IntLit(10), IntLit(1)), env)
    assert(lookupArr("A", env) == List(5,10,8,1))

    env = listEnvOn_A // ArrayVar("A"), List(5,8,1)
    test(ArrayInsert(ArrayVar("A"), IntLit(99), IntLit(3)), env)
    assert(lookupArr("A", env) == List(5, 8, 1, 99))

    // Array Remove
    env = listEnvOn_A // ArrayVar("A"), List(5,8,1)
    test(ArrayRemove(ArrayVar("A"), IntLit(1)), env)
    assert(lookupArr("A", env) == List(5,1))


    // Scope/Block tests
    test(Scope(List(IntAssign(IntVarLit("a"), IntLit(2)))))
    // NOTE: Implicitly tested in statement tests <3



    println("😝😎😅😵‍💫🧌😁✅✅✅    ALL TESTS PASSED!!!!!!    ✅✅✅😝😎😅😵‍💫🧌😁")
  }




  def test(prg: IntType, expected: Int, env: Env): Unit =
    assert(eval(prg, env) == expected)

  def test(prg: BoolType, expected: Boolean, env: Env): Unit =
    assert(eval(prg, env) == expected)

  def test(prg: ArrayType, expected: List[Int], env: Env): Unit =
    assert(eval(prg, env) == expected)

  def test(prg: Statement, env: Env): Unit =
    eval(prg, env)

  def test(prg: Scope, env: Env): Unit =
    eval(prg, env)


  // With no env listed
  var emptyEnv = Env(Map(), Map(), Map(), None)

  def test(prg: IntType, expected: Int): Unit =
    test(prg, expected, emptyEnv)

  def test(prg: BoolType, expected: Boolean): Unit =
    test(prg, expected, emptyEnv)

  def test(prg: ArrayType, expected: List[Int]): Unit =
    test(prg, expected, emptyEnv)

  def test(prg: Statement): Unit =
    test(prg, emptyEnv)

  def test(prg: Scope): Unit =
    test(prg, emptyEnv)
}

