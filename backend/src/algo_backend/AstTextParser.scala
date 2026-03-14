package algo_backend

import Ast.*

object AstTextParser {

  final case class ParsedAst(kind: String, value: Any)

  def parse(kind: String, input: String): Either[String, ParsedAst] = {
    val normalizedKind = kind.trim.toLowerCase match {
      case "" => "auto"
      case k => k
    }

    normalizedKind match {
      case "int" => parseInt(input).map(v => ParsedAst("int", v))
      case "bool" => parseBool(input).map(v => ParsedAst("bool", v))
      case "array" => parseArray(input).map(v => ParsedAst("array", v))
      case "statement" => parseStatement(input).map(v => ParsedAst("statement", v))
      case "scope" => parseScope(input).map(v => ParsedAst("scope", v))
      case "auto" => parseAuto(input)
      case other => Left(s"Unsupported parse kind: $other")
    }
  }

  def parseAuto(input: String): Either[String, ParsedAst] = {
    parseStatement(input)
      .map(v => ParsedAst("statement", v))
      .orElse(parseScope(input).map(v => ParsedAst("scope", v)))
      .orElse(parseInt(input).map(v => ParsedAst("int", v)))
      .orElse(parseBool(input).map(v => ParsedAst("bool", v)))
      .orElse(parseArray(input).map(v => ParsedAst("array", v)))
  }

  private def parseInt(input: String): Either[String, IntType] = {
    val p = new Parser(input)
    p.parseIntType().flatMap(v => p.ensureEnd().map(_ => v))
  }

  private def parseBool(input: String): Either[String, BoolType] = {
    val p = new Parser(input)
    p.parseBoolType().flatMap(v => p.ensureEnd().map(_ => v))
  }

  private def parseArray(input: String): Either[String, ArrayType] = {
    val p = new Parser(input)
    p.parseArrayType().flatMap(v => p.ensureEnd().map(_ => v))
  }

  private def parseStatement(input: String): Either[String, Statement] = {
    val p = new Parser(input)
    p.parseStatement().flatMap(v => p.ensureEnd().map(_ => v))
  }

  private def parseScope(input: String): Either[String, Scope] = {
    val p = new Parser(input)
    p.parseScope().flatMap(v => p.ensureEnd().map(_ => v))
  }

  private final class Parser(input: String) {
    private var index: Int = 0

    def ensureEnd(): Either[String, Unit] = {
      skipWhitespace()
      if (index == input.length) Right(()) else Left(s"Unexpected trailing input at position $index")
    }

    def parseIntType(): Either[String, IntType] = {
      parseIdentifier().flatMap {
        case "IntLit" =>
          parseParen1(parseIntValue).map(IntLit.apply)
        case "IntVarLit" =>
          parseParen1(parseStringLiteral).map(IntVarLit.apply)
        case "IntVarListLookup" =>
          parseParen2(parseStringLiteral, () => parseIntType()).map { case (id, idx) => IntVarListLookup(id, idx) }
        case "IntPlus" =>
          parseParen2(() => parseIntType(), () => parseIntType()).map { case (a, b) => IntPlus(a, b) }
        case "IntMinus" =>
          parseParen2(() => parseIntType(), () => parseIntType()).map { case (a, b) => IntMinus(a, b) }
        case "IntMult" =>
          parseParen2(() => parseIntType(), () => parseIntType()).map { case (a, b) => IntMult(a, b) }
        case "IntDiv" =>
          parseParen2(() => parseIntType(), () => parseIntType()).map { case (a, b) => IntDiv(a, b) }
        case "IntMod" =>
          parseParen2(() => parseIntType(), () => parseIntType()).map { case (a, b) => IntMod(a, b) }
        case "IntArrayLength" =>
          parseParen1(() => parseArrayType()).map(IntArrayLength.apply)
        case other => Left(s"Unknown IntType constructor '$other' at position $index")
      }
    }

    def parseBoolType(): Either[String, BoolType] = {
      parseIdentifier().flatMap {
        case "BoolLit" =>
          parseParen1(parseBooleanValue).map(BoolLit.apply)
        case "BoolVar" =>
          parseParen1(parseStringLiteral).map(BoolVar.apply)
        case "BoolGreater" =>
          parseParen2(() => parseIntType(), () => parseIntType()).map { case (a, b) => BoolGreater(a, b) }
        case "BoolGreaterEq" =>
          parseParen2(() => parseIntType(), () => parseIntType()).map { case (a, b) => BoolGreaterEq(a, b) }
        case "BoolLess" =>
          parseParen2(() => parseIntType(), () => parseIntType()).map { case (a, b) => BoolLess(a, b) }
        case "BoolLessEq" =>
          parseParen2(() => parseIntType(), () => parseIntType()).map { case (a, b) => BoolLessEq(a, b) }
        case "BoolEq" =>
          parseParen2(() => parseIntType(), () => parseIntType()).map { case (a, b) => BoolEq(a, b) }
        case "BoolNeq" =>
          parseParen2(() => parseIntType(), () => parseIntType()).map { case (a, b) => BoolNeq(a, b) }
        case "BoolAnd" =>
          parseParen2(() => parseBoolType(), () => parseBoolType()).map { case (a, b) => BoolAnd(a, b) }
        case "BoolOr" =>
          parseParen2(() => parseBoolType(), () => parseBoolType()).map { case (a, b) => BoolOr(a, b) }
        case "BoolNot" =>
          parseParen1(() => parseBoolType()).map(BoolNot.apply)
        case other => Left(s"Unknown BoolType constructor '$other' at position $index")
      }
    }

    def parseArrayType(): Either[String, ArrayType] = {
      parseIdentifier().flatMap {
        case "ArrayLit" =>
          parseParen1(() => parseIntListLiteral()).map(ArrayLit.apply)
        case "ArrayVar" =>
          parseParen1(parseStringLiteral).map(ArrayVar.apply)
        case "ArrayRange" =>
          parseParen3(() => parseArrayType(), () => parseIntType(), () => parseIntType()).map {
            case (arr, a, b) => ArrayRange(arr, a, b)
          }
        case "ArrayConcat" =>
          parseParen2(() => parseArrayType(), () => parseArrayType()).map { case (a, b) => ArrayConcat(a, b) }
        case other => Left(s"Unknown ArrayType constructor '$other' at position $index")
      }
    }

    def parseStatement(): Either[String, Statement] = {
      parseIdentifier().flatMap {
        case "IntAssign" =>
          parseParen2(() => parseIntVar(), () => parseIntType()).map { case (v, value) => IntAssign(v, value) }
        case "BoolAssign" =>
          parseParen2(() => parseBoolVar(), () => parseBoolType()).map { case (v, value) => BoolAssign(v, value) }
        case "If" =>
          parseParen3(() => parseBoolType(), () => parseScope(), () => parseScope()).map { case (c, t, e) => If(c, t, e) }
        case "While" =>
          parseParen2(() => parseBoolType(), () => parseScope()).map { case (c, b) => While(c, b) }
        case "Swap" =>
          parseParen2(() => parseIntVar(), () => parseIntVar()).map { case (a, b) => Swap(a, b) }
        case "ArrayInsert" =>
          parseParen3(() => parseArrayType(), () => parseIntType(), () => parseIntType()).map {
            case (arr, value, idx) => ArrayInsert(arr, value, idx)
          }
        case "ArrayRemove" =>
          parseParen2(() => parseArrayType(), () => parseIntType()).map { case (arr, idx) => ArrayRemove(arr, idx) }
        case other => Left(s"Unknown Statement constructor '$other' at position $index")
      }
    }

    def parseScope(): Either[String, Scope] = {
      parseIdentifier().flatMap {
        case "Scope" =>
          parseParen1(() => parseStatementListLiteral()).map(Scope.apply)
        case other => Left(s"Unknown Scope constructor '$other' at position $index")
      }
    }

    private def parseIntVar(): Either[String, IntVar] = {
      val before = index
      parseIntType().flatMap {
        case v: IntVar => Right(v)
        case _ =>
          index = before
          Left(s"Expected IntVar at position $index")
      }
    }

    private def parseBoolVar(): Either[String, BoolVar] = {
      val before = index
      parseBoolType().flatMap {
        case v: BoolVar => Right(v)
        case _ =>
          index = before
          Left(s"Expected BoolVar at position $index")
      }
    }

    private def parseIntListLiteral(): Either[String, List[Int]] = {
      parseIdentifier().flatMap {
        case "List" =>
          parseParenList(parseIntValue)
        case other => Left(s"Expected List(...) but found '$other'")
      }
    }

    private def parseStatementListLiteral(): Either[String, List[Statement]] = {
      parseIdentifier().flatMap {
        case "List" =>
          parseParenList(() => parseStatement())
        case other => Left(s"Expected List(...) but found '$other'")
      }
    }

    private def parseParen1[A](a: () => Either[String, A]): Either[String, A] = {
      expectChar('(')
        .flatMap(_ => a())
        .flatMap { value =>
          expectChar(')').map(_ => value)
        }
    }

    private def parseParen2[A, B](a: () => Either[String, A], b: () => Either[String, B]): Either[String, (A, B)] = {
      expectChar('(')
        .flatMap(_ => a())
        .flatMap { av =>
          expectChar(',').flatMap(_ => b()).flatMap { bv =>
            expectChar(')').map(_ => (av, bv))
          }
        }
    }

    private def parseParen3[A, B, C](a: () => Either[String, A], b: () => Either[String, B], c: () => Either[String, C]): Either[String, (A, B, C)] = {
      expectChar('(')
        .flatMap(_ => a())
        .flatMap { av =>
          expectChar(',').flatMap(_ => b()).flatMap { bv =>
            expectChar(',').flatMap(_ => c()).flatMap { cv =>
              expectChar(')').map(_ => (av, bv, cv))
            }
          }
        }
    }

    private def parseParenList[A](item: () => Either[String, A]): Either[String, List[A]] = {
      expectChar('(')
      skipWhitespace()
      var items = List.empty[A]
      if (peekChar(')')) {
        index += 1
        return Right(items)
      }

      var done = false
      while (!done) {
        item() match {
          case Left(err) => return Left(err)
          case Right(v) => items = items :+ v
        }
        skipWhitespace()
        if (peekChar(',')) {
          index += 1
        } else if (peekChar(')')) {
          index += 1
          done = true
        } else {
          return Left(s"Expected ',' or ')' at position $index")
        }
      }
      Right(items)
    }

    private def parseIntValue(): Either[String, Int] = {
      skipWhitespace()
      if (index >= input.length) return Left("Expected integer but reached end")
      val start = index
      if (input.charAt(index) == '-') {
        index += 1
      }
      if (index >= input.length || !input.charAt(index).isDigit) {
        index = start
        return Left(s"Expected integer at position $start")
      }
      while (index < input.length && input.charAt(index).isDigit) {
        index += 1
      }
      val token = input.substring(start, index)
      try Right(token.toInt)
      catch {
        case _: NumberFormatException => Left(s"Invalid integer '$token'")
      }
    }

    private def parseBooleanValue(): Either[String, Boolean] = {
      parseIdentifier().flatMap {
        case "true" => Right(true)
        case "false" => Right(false)
        case other => Left(s"Expected boolean but found '$other'")
      }
    }

    private def parseStringLiteral(): Either[String, String] = {
      skipWhitespace()
      if (!consumeChar('"')) {
        return Left(s"Expected string literal at position $index")
      }
      val out = new StringBuilder
      var done = false
      while (!done && index < input.length) {
        val ch = input.charAt(index)
        index += 1
        if (ch == '"') {
          done = true
        } else if (ch == '\\') {
          if (index >= input.length) return Left("Invalid escape sequence in string")
          val esc = input.charAt(index)
          index += 1
          esc match {
            case '"' => out.append('"')
            case '\\' => out.append('\\')
            case 'n' => out.append('\n')
            case 't' => out.append('\t')
            case 'r' => out.append('\r')
            case other => out.append(other)
          }
        } else {
          out.append(ch)
        }
      }
      if (!done) Left("Unterminated string literal") else Right(out.toString())
    }

    private def parseIdentifier(): Either[String, String] = {
      skipWhitespace()
      if (index >= input.length) return Left("Expected identifier but reached end")
      val start = index
      val first = input.charAt(index)
      if (!isIdentifierStart(first)) {
        return Left(s"Expected identifier at position $index")
      }
      index += 1
      while (index < input.length && isIdentifierPart(input.charAt(index))) {
        index += 1
      }
      Right(input.substring(start, index))
    }

    private def expectChar(ch: Char): Either[String, Unit] = {
      skipWhitespace()
      if (consumeChar(ch)) Right(()) else Left(s"Expected '$ch' at position $index")
    }

    private def consumeChar(ch: Char): Boolean = {
      if (peekChar(ch)) {
        index += 1
        true
      } else {
        false
      }
    }

    private def peekChar(ch: Char): Boolean = index < input.length && input.charAt(index) == ch

    private def skipWhitespace(): Unit = {
      while (index < input.length && input.charAt(index).isWhitespace) {
        index += 1
      }
    }

    private def isIdentifierStart(ch: Char): Boolean = ch.isLetter || ch == '_'

    private def isIdentifierPart(ch: Char): Boolean = ch.isLetterOrDigit || ch == '_'
  }
}

