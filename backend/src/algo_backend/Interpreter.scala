package algo_backend

import Ast.*

/**
  * Interpreter for Algo-Clicker backend.
  */
object Interpreter {

  def eval(v: IntType): Int = v match {
    case IntLit(v: Int) => v
  }

  def eval(b: BoolType): Boolean = b match {
    case BoolLit(b: Boolean) => b
  }
  
  def eval(a: ArrayType): List[Int] = a match {
    case ArrayConcat(a, b) => ???
    case ArrayLit(values) => ???
    case ArraySplit(a, atIndex) => ???
    case ArrayVar(id) => ???
    case _ => ???
  }

  /**
    * Sends message to frontend.
    */
  def trace(msg: => String): Unit =
      println(msg)

  /**
    * Exception thrown in case of runtime errors.
    */
  class InterpreterError(msg: String)
}
