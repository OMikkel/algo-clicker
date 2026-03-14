package algo_backend

import Ast.*

/**
  * Interpreter for Algo-Clicker backend.
  */
object Interpreter {

  def eval(v: IntType, env: Env): Int = v match {
    case IntLit(v: Int) => v
    case IntVarLit(id: Id) => lookupInt(id, env)
    case IntVarListLookup(id: Id, index: IntType) =>
      val array: List[Int] = lookupArr(id, env)
      array(eval(index, env))
    case IntPlus(v1: IntType, v2: IntType) => eval(v1, env) + eval(v2, env)
    case IntMinus(v1: IntType, v2: IntType) => eval(v1, env) - eval(v2, env)
    case IntMult(v1: IntType, v2: IntType) => eval(v1, env) * eval(v2, env)
    case IntDiv(v1: IntType, v2: IntType) => eval(v1, env) / eval(v2, env)
    case IntMod(v1: IntType, v2: IntType) => eval(v1, env) % eval(v2, env)
    case IntArrayLength(arr: ArrayType) => eval(arr, env).length
  }

  def eval(b: BoolType, env: Env): Boolean = b match {
    case BoolLit(b: Boolean) => b
    case BoolVar(id: Id) => lookupBool(id, env)
    case BoolGreater(v1: IntType, v2: IntType) => eval(v1, env) > eval(v2, env)
    case BoolGreaterEq(v1: IntType, v2: IntType) => eval(v1, env) >= eval(v2, env)
    case BoolLess(v1: IntType, v2: IntType) => eval(v1, env) < eval(v2, env)
    case BoolLessEq(v1: IntType, v2: IntType) => eval(v1, env) <= eval(v2, env)
    case BoolEq(v1: IntType, v2: IntType) => eval(v1, env) == eval(v2, env)
    case BoolNeq(v1: IntType, v2: IntType) => eval(v1, env) != eval(v2, env)
    case BoolAnd(b1: BoolType, b2: BoolType) => eval(b1, env) && eval(b2, env)
    case BoolOr(b1: BoolType, b2: BoolType) => eval(b1, env) || eval(b2, env)
    case BoolNot(b: BoolType) => !eval(b, env)
  }

  def eval(a: ArrayType, env: Env): List[Int] = a match {
    case ArrayLit(values: List[Int]) => values
    case ArrayVar(id: Id) => lookupArr(id, env)
    case ArrayRange(arr: ArrayType, startIndex: IntType, endIndex: IntType) =>
      val startIndexInt: Int = eval(startIndex, env)
      val endIndexInt: Int = eval(endIndex, env)
      val arrAsList: List[Int] = eval(arr, env)
      arrAsList.slice(startIndexInt, endIndexInt+1)
    case ArrayConcat(a: ArrayType, b: ArrayType) => eval(a, env).concat(eval(b, env))
  }

  def eval(s: Statement, env: Env): Unit = s match {
    case IntAssign(variable, value) => setInt(getId(variable), eval(value, env), env)
    case BoolAssign(variable, value) => setBool(variable.id, eval(value, env), env)
    case If(cond, thenBlock, elseBlock) => ???
    case While(cond, body) => ???
    case Swap(a, b) => ???
    case ArrayInsert(arr, value, index) => ???
    case ArrayRemove(arr, index) => ???
  }

  def eval(s: Scope, env: Env): Unit = ???


  def lookupInt(id: Id, env: Env): Int = {
    var env1: Option[Env] = Some(env)
    var res: Option[Int] = None
    while (true) {
      env1 match {
        case Some(env2) =>
          res = env2.intEnv.get(id)
          res match {
            case Some(value) => return value
            case None => env1 = env2.parent_env
          }
        case None => throw InterpreterError(s"Lookup failed of $id")
      }
    }
    // Should never get to this point
    throw InterpreterError("Unknown error?!!?!?!?!?!")
  }

  def lookupBool(id: Id, env: Env): Boolean = {
    var env1: Option[Env] = Some(env)
    var res: Option[Boolean] = None
    while (true) {
      env1 match {
        case Some(env2) =>
          res = env2.boolEnv.get(id)
          res match {
            case Some(value) => return value
            case None => env1 = env2.parent_env
          }
        case None => throw InterpreterError(s"Lookup failed of $id")
      }
    }
    // Should never get to this point
    throw InterpreterError("Unknown error?!!?!?!?!?!")
  }

  def lookupArr(id: Id, env: Env): List[Int] = {
    var env1: Option[Env] = Some(env)
    var res: Option[List[Int]] = None
    while (true) {
      env1 match {
        case Some(env2) =>
          res = env2.arrEnv.get(id)
          res match {
            case Some(value) => return value
            case None => env1 = env2.parent_env
          }
        case None => throw InterpreterError(s"Lookup failed of $id")
      }
    }
    // Should never get to this point
    throw InterpreterError("Unknown error?!!?!?!?!?!")
  }


  def setInt(id: Id, value: Int, env: Env): Unit = {
    var env1: Option[Env] = Some(env)
    var existing: Option[Int] = None
    var running = true
    while (running) {
      env1 match {
        case Some(env2) =>
          existing = env2.intEnv.get(id)
          existing match {
            case Some(n) =>
              env2.intEnv = env2.intEnv.updated(id, value)
              running = false
            case None => env1 = env2.parent_env
          }
        case None => running = false
      }
    }
    env.intEnv = env.intEnv + (id -> value)
  }

  def setBool(id: Id, value: Boolean, env: Env): Unit = {
    var env1: Option[Env] = Some(env)
    var existing: Option[Boolean] = None
    var running = true
    while (running) {
      env1 match {
        case Some(env2) =>
          existing = env2.boolEnv.get(id)
          existing match {
            case Some(n) =>
              env2.boolEnv = env2.boolEnv.updated(id, value)
              running = false
            case None => env1 = env2.parent_env
          }
        case None => running = false
      }
    }
    env.boolEnv = env.boolEnv + (id -> value)
  }

  def setArr(id: Id, value: List[Int], env: Env): Unit = {
    var env1: Option[Env] = Some(env)
    var existing: Option[List[Int]] = None
    var running = true
    while (running) {
      env1 match {
        case Some(env2) =>
          existing = env2.arrEnv.get(id)
          existing match {
            case Some(n) =>
              env2.arrEnv = env2.arrEnv.updated(id, value)
              running = false
            case None => env1 = env2.parent_env
          }
        case None => running = false
      }
    }
    env.arrEnv = env.arrEnv + (id -> value)
  }

  def getId(idExp: IntVar): Id = {
    idExp match {
      case IntVarLit(id) => id
      case IntVarListLookup(id, index) => throw InterpreterError("Wtf are u doing? Assignment side lookup in list? What da helly")
    }
  }




  /**
    * Sends message to frontend.
    */
  def trace(msg: => String): Unit =
      println(msg)

  /**
    * Exception thrown in case of runtime errors.
    */
  class InterpreterError(msg: String) extends Error
}
