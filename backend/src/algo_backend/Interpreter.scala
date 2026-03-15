package algo_backend

import Ast.*

/**
  * Interpreter for Algo-Clicker backend.
  */
object Interpreter {


  def eval(program: InitialProgramWithList_A, env: Env): Unit = {
    eval(program.decl_A, env)
    program.solution match {
      case v: Statement =>
        eval(v, env)
      case other => throw InterpreterError(s"Unsupported InitialProgramWithList_A solution node: ${other.getClass.getSimpleName}")
    }
  }



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
    case BoolAssign(variable, value) => setBool(variable.ident, eval(value, env), env)
    case ArrayAssign(variable, value) =>
      setArr(variable.ident, eval(value, env), env)
      if (variable.ident == "A") trace(TraceArrAssign_A(eval(value, env), variable.ident), None, env)
    case If(cond, thenBlock, elseBlock) => if (eval(cond, env)) eval(thenBlock, env) else eval(elseBlock, env)
    case While(cond, body) => while (eval(cond, env)) eval(body, env)
    case Swap(a, b) =>
      // Capture both references and values before writing, so swap behavior is stable.
      val aRef = resolveIntRef(a, env)
      val bRef = resolveIntRef(b, env)
      val aValue = aRef.read()
      val bValue = bRef.read()
      aRef.write(bValue)
      bRef.write(aValue)
      if (a.isInstanceOf[IntVarListLookup] && b.isInstanceOf[IntVarListLookup]) {
        val aIndex = a.asInstanceOf[IntVarListLookup].index
        val bIndex = b.asInstanceOf[IntVarListLookup].index
        if (a.asInstanceOf[IntVarListLookup].ident == b.asInstanceOf[IntVarListLookup].ident) trace(TraceArrSwap(eval(a.asInstanceOf[IntVarListLookup].index, env), eval(b.asInstanceOf[IntVarListLookup].index, env), a.asInstanceOf[IntVarListLookup].ident), None, env)
      }
    case ArrayInsert(arr, value, index) =>
      arr match {
        case ArrayVar(id) =>
          val arrValue = lookupArr(id, env)
          val indexValue = eval(index, env)
          if (indexValue < 0 || indexValue > arrValue.length) {
            throw InterpreterError(s"ArrayInsert index out of range: $indexValue")
          }
          setArr(id, arrValue.patch(indexValue, Seq(eval(value, env)), 0), env)
          trace(TraceArrayInsert(indexValue, eval(value, env), id), None, env)
        case _ =>
          throw InterpreterError("ArrayInsert target must be an array variable")
      }
    case ArrayRemove(arr, index) =>
      arr match {
        case ArrayVar(id) =>
          val arrValue = lookupArr(id, env)
          val indexValue = eval(index, env)
          if (indexValue < 0 || indexValue >= arrValue.length) {
            throw InterpreterError(s"ArrayRemove index out of range: $indexValue")
          }
          setArr(id, arrValue.patch(indexValue, Seq(), 1), env)
          trace(TraceArrayRemove(indexValue, id), None, env)
        case _ =>
          throw InterpreterError("ArrayRemove target must be an array variable")
      }
  }

  def eval(s: Scope, env: Env): Unit = {
    var env1 = Env(Map(), Map(), Map(), Some(env))
    for (statement <- s.statements) {
      eval(statement, env1)
    }
    // env is automatically the one the program knows about in the end
  }


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
    var running = true
    while (running) {
      env1 match {
        case Some(env2) =>
          env2.intEnv.get(id) match {
            case Some(_) =>
              env2.intEnv = env2.intEnv.updated(id, value)
              running = false
            case None => env1 = env2.parent_env
          }
        case None =>
          // Variable not declared anywhere yet — create it in the immediate env
          env.intEnv = env.intEnv + (id -> value)
          running = false
      }
    }
  }

  def setBool(id: Id, value: Boolean, env: Env): Unit = {
    var env1: Option[Env] = Some(env)
    var running = true
    while (running) {
      env1 match {
        case Some(env2) =>
          env2.boolEnv.get(id) match {
            case Some(_) =>
              env2.boolEnv = env2.boolEnv.updated(id, value)
              running = false
            case None => env1 = env2.parent_env
          }
        case None =>
          env.boolEnv = env.boolEnv + (id -> value)
          running = false
      }
    }
  }

  def setArr(id: Id, value: List[Int], env: Env): Unit = {
    var env1: Option[Env] = Some(env)
    var running = true
    while (running) {
      env1 match {
        case Some(env2) =>
          env2.arrEnv.get(id) match {
            case Some(_) =>
              env2.arrEnv = env2.arrEnv.updated(id, value)
              running = false
            case None => env1 = env2.parent_env
          }
        case None =>
          env.arrEnv = env.arrEnv + (id -> value)
          running = false
      }
    }
  }

  def getId(idExp: IntVar): Id = {
    idExp match {
      case IntVarLit(id) => id
      case IntVarListLookup(id, index) => throw InterpreterError("Wtf are u doing? Assignment side lookup in list? What da helly")
    }
  }

  private def resolveIntRef(v: IntVar, env: Env): IntRef = v match {
    case IntVarLit(id) =>
      IntRef(
        () => lookupInt(id, env),
        value => setInt(id, value, env)
      )
    case IntVarListLookup(id, indexExp) =>
      val index = eval(indexExp, env)
      IntRef(
        () => {
          val arr = lookupArr(id, env)
          arr(index)
        },
        value => {
          val arr = lookupArr(id, env)
          setArr(id, arr.updated(index, value), env)
        }
      )
  }



  // Thread-local trace handler injected by the WebSocket server during a `run` command.
  // When set, trace() calls the handler (which sends JSON to the frontend and blocks for "continue").
  // When not set, trace() falls back to println.
  private val activeTraceHandler: ThreadLocal[Option[(TraceType, Option[String], Env) => Unit]] =
    new ThreadLocal[Option[(TraceType, Option[String], Env) => Unit]] {
      override def initialValue(): Option[(TraceType, Option[String], Env) => Unit] = None
    }

  /** Install a trace handler for the duration of [block], then restore the previous one. */
  def withTraceHandler[A](handler: (TraceType, Option[String], Env) => Unit)(block: => A): A = {
    val prev = activeTraceHandler.get()
    activeTraceHandler.set(Some(handler))
    try block
    finally activeTraceHandler.set(prev)
  }

  /**
    * Sends message to frontend (or prints to stdout when no handler is installed).
    */
  def trace(t: => TraceType, astId: Option[String], env: Env): Unit = {
    activeTraceHandler.get() match {
      case Some(handler) => handler(t, astId, env)
      case None =>
        t match {
          case TraceArrAssign_A(value, id) =>
            println(s"Trace: Assigned array $id to value $value")
          case TraceArrSwap(index1, index2, arrId) =>
            println(s"Trace: Array $arrId swapped indices $index1 and $index2")
          case TraceArrayInsert(index, value, arrId) =>
            println(s"Trace: Array $arrId inserted value $value at index $index")
          case TraceArrayRemove(index, arrId) =>
            println(s"Trace: Array $arrId removed value at index $index")
          case _ =>
            println(s"Trace: Unrecognized trace type")
        }
    }
  }

  /**
    * Exception thrown in case of runtime errors.
    */
  class InterpreterError(msg: String) extends Error
}
