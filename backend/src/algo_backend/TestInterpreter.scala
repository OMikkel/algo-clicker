package algo_backend

import Interpreter.*
import Ast.{IntType, *}

object TestInterpreter {
  def main(args: Array[String]): Unit = {
    // Int tests
    test(IntLit(1), 1)

    // Bool tests
    test(BoolLit(true), true)

    // Array tests


    // Statement tests

    // Block tests
  }


  def test(prg: IntType, expected: Int): Unit = {
    assert(eval(prg) == expected)
  }

  def test(prg: BoolType, expected: Boolean): Unit = {
    assert(eval(prg) == expected)
  }

  def test(prg: ArrayType, expected: List[IntType]) = {
    assert(eval(prg) == expected)
  }


}

