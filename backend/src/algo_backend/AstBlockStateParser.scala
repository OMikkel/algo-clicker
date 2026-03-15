package algo_backend

import Ast.*

import scala.collection.mutable

object AstBlockStateParser {

  private sealed trait ParsedNode
  private final case class ParsedInt(value: IntType) extends ParsedNode
  private final case class ParsedBool(value: BoolType) extends ParsedNode
  private final case class ParsedArray(value: ArrayType) extends ParsedNode
  private final case class ParsedStatement(value: Statement) extends ParsedNode

  def parsePayload(kind: String, payload: Map[String, Any]): Either[String, AstTextParser.ParsedAst] = {
    val normalizedKind = kind.trim.toLowerCase match {
      case "" => "auto"
      case other => other
    }

    println(s"blocks: ${payload.get("blocks").map(_.asInstanceOf[Map[String, Any]].keys.toList).getOrElse("missing")}, rootBlocks: ${payload.get("rootBlocks").getOrElse("missing")}")
    println(s"Normalized kind: '$normalizedKind'")
    println(s"Payload keys: ${payload.keys.toList}")

    for {
      blocks <- readBlocks(payload)
      rootBlocks <- readRootBlocks(payload)
      _ <- if (rootBlocks.nonEmpty) Right(()) else Left("Field 'rootBlocks' must contain at least one root id")
      ctx = new ParseContext(blocks)
      parsed <- parseWithKind(normalizedKind, rootBlocks, ctx)
    } yield parsed
  }

  private def parseWithKind(kind: String, rootBlocks: List[String], ctx: ParseContext): Either[String, AstTextParser.ParsedAst] = {
    println(s"Parsing with kind '$kind' and rootBlocks: $rootBlocks")
    kind match {
      case "int" =>
        singleRoot(rootBlocks).flatMap(root => parseIntById(root, ctx)).map(v => AstTextParser.ParsedAst("int", v))
      case "bool" =>
        singleRoot(rootBlocks).flatMap(root => parseBoolById(root, ctx)).map(v => AstTextParser.ParsedAst("bool", v))
      case "array" =>
        singleRoot(rootBlocks).flatMap(root => parseArrayById(root, ctx)).map(v => AstTextParser.ParsedAst("array", v))
      case "statement" =>
        singleRoot(rootBlocks).flatMap(root => parseStatementById(root, ctx)).map(v => AstTextParser.ParsedAst("statement", v))
      case "scope" =>
        parseScopeFromRoots(rootBlocks, ctx).map(v => AstTextParser.ParsedAst("scope", v))
      case "auto" =>
        if (rootBlocks.lengthCompare(1) == 0) {
          parseNodeById(rootBlocks.head, ctx).map {
            case ParsedInt(v) => AstTextParser.ParsedAst("int", v)
            case ParsedBool(v) => AstTextParser.ParsedAst("bool", v)
            case ParsedArray(v) => AstTextParser.ParsedAst("array", v)
            case ParsedStatement(v) => AstTextParser.ParsedAst("statement", v)
          }
        } else {
          parseScopeFromRoots(rootBlocks, ctx).map(v => AstTextParser.ParsedAst("scope", v))
        }
      case other => Left(s"Unsupported parse kind: $other")
    }
  }

  private def parseScopeFromRoots(rootBlocks: List[String], ctx: ParseContext): Either[String, Scope] = {
    traverse(rootBlocks)(id => parseStatementById(id, ctx)).map(Scope.apply)
  }

  private def parseStatementList(ids: List[String], ctx: ParseContext, ownerType: String, field: String): Either[String, Scope] = {
    traverse(ids)(id => parseStatementById(id, ctx)).left.map(err => s"$ownerType.$field: $err").map(Scope.apply)
  }

  private def parseNodeById(id: String, ctx: ParseContext): Either[String, ParsedNode] = {
    ctx.cache.get(id) match {
      case Some(value) => Right(value)
      case None =>
        if (ctx.visiting.contains(id)) {
          return Left(s"Cycle detected while parsing block '$id'")
        }

        ctx.blocks.get(id) match {
          case None => Left(s"Unknown block id '$id'")
          case Some(block) =>
            block.get("type") match {
              case Some(nodeType: String) =>
                ctx.visiting += id
                val parsed = parseTypedNode(id, nodeType, block, ctx)
                ctx.visiting -= id

                parsed.foreach(value => ctx.cache.update(id, value))
                parsed
              case Some(_) => Left(s"Block '$id' field 'type' must be a string")
              case None => Left(s"Block '$id' is missing field 'type'")
            }
        }
    }
  }

  private def parseTypedNode(id: String, nodeType: String, block: Map[String, Any], ctx: ParseContext): Either[String, ParsedNode] = {
    nodeType match {
      case "IntLit" =>
        intField(block, "v", id).map(v => ParsedInt(IntLit(v)))

      case "IntPlus" =>
        for {
          v1 <- refAsInt(block, "v1", id, ctx)
          v2 <- refAsInt(block, "v2", id, ctx)
        } yield ParsedInt(IntPlus(v1, v2))

      case "IntMinus" =>
        for {
          v1 <- refAsInt(block, "v1", id, ctx)
          v2 <- refAsInt(block, "v2", id, ctx)
        } yield ParsedInt(IntMinus(v1, v2))

      case "IntMult" =>
        for {
          v1 <- refAsInt(block, "v1", id, ctx)
          v2 <- refAsInt(block, "v2", id, ctx)
        } yield ParsedInt(IntMult(v1, v2))

      case "IntDiv" =>
        for {
          v1 <- refAsInt(block, "v1", id, ctx)
          v2 <- refAsInt(block, "v2", id, ctx)
        } yield ParsedInt(IntDiv(v1, v2))

      case "IntMod" =>
        for {
          v1 <- refAsInt(block, "v1", id, ctx)
          v2 <- refAsInt(block, "v2", id, ctx)
        } yield ParsedInt(IntMod(v1, v2))

      case "BoolLit" =>
        boolField(block, "b", id).map(v => ParsedBool(BoolLit(v)))

      case "BoolAnd" =>
        for {
          b1 <- refAsBool(block, "b1", id, ctx)
          b2 <- refAsBool(block, "b2", id, ctx)
        } yield ParsedBool(BoolAnd(b1, b2))

      case "BoolOr" =>
        for {
          b1 <- refAsBool(block, "b1", id, ctx)
          b2 <- refAsBool(block, "b2", id, ctx)
        } yield ParsedBool(BoolOr(b1, b2))

      case "BoolNot" =>
        refAsBool(block, "b", id, ctx).map(v => ParsedBool(BoolNot(v)))

      case "BoolGreater" =>
        for {
          v1 <- refAsInt(block, "v1", id, ctx)
          v2 <- refAsInt(block, "v2", id, ctx)
        } yield ParsedBool(BoolGreater(v1, v2))

      case "BoolGreaterEq" =>
        for {
          v1 <- refAsInt(block, "v1", id, ctx)
          v2 <- refAsInt(block, "v2", id, ctx)
        } yield ParsedBool(BoolGreaterEq(v1, v2))

      case "BoolLess" =>
        for {
          v1 <- refAsInt(block, "v1", id, ctx)
          v2 <- refAsInt(block, "v2", id, ctx)
        } yield ParsedBool(BoolLess(v1, v2))

      case "BoolLessEq" =>
        for {
          v1 <- refAsInt(block, "v1", id, ctx)
          v2 <- refAsInt(block, "v2", id, ctx)
        } yield ParsedBool(BoolLessEq(v1, v2))

      case "BoolEq" =>
        for {
          v1 <- refAsInt(block, "v1", id, ctx)
          v2 <- refAsInt(block, "v2", id, ctx)
        } yield ParsedBool(BoolEq(v1, v2))

      case "BoolNeq" =>
        for {
          v1 <- refAsInt(block, "v1", id, ctx)
          v2 <- refAsInt(block, "v2", id, ctx)
        } yield ParsedBool(BoolNeq(v1, v2))

      case "If" =>
        for {
          cond <- refAsBool(block, "cond", id, ctx)
          ifIds <- stringListField(block, "ifBlock", id)
          elseIds <- stringListField(block, "elseBlock", id)
          ifScope <- parseStatementList(ifIds, ctx, "If", "ifBlock")
          elseScope <- parseStatementList(elseIds, ctx, "If", "elseBlock")
        } yield ParsedStatement(If(cond, ifScope, elseScope))

      case other => Left(s"Unsupported block type '$other' for block '$id'")
    }
  }

  private def parseIntById(id: String, ctx: ParseContext): Either[String, IntType] = {
    parseNodeById(id, ctx).flatMap {
      case ParsedInt(value) => Right(value)
      case other => Left(s"Block '$id' is not an int expression (found ${nodeKind(other)})")
    }
  }

  private def parseBoolById(id: String, ctx: ParseContext): Either[String, BoolType] = {
    parseNodeById(id, ctx).flatMap {
      case ParsedBool(value) => Right(value)
      case other => Left(s"Block '$id' is not a bool expression (found ${nodeKind(other)})")
    }
  }

  private def parseArrayById(id: String, ctx: ParseContext): Either[String, ArrayType] = {
    parseNodeById(id, ctx).flatMap {
      case ParsedArray(value) => Right(value)
      case other => Left(s"Block '$id' is not an array expression (found ${nodeKind(other)})")
    }
  }

  private def parseStatementById(id: String, ctx: ParseContext): Either[String, Statement] = {
    parseNodeById(id, ctx).flatMap {
      case ParsedStatement(value) => Right(value)
      case other =>
        println(s"FAILURE: $other")
        Left(s"Block '$id' is not a statement (found ${nodeKind(other)})")
    }
  }

  private def refAsInt(block: Map[String, Any], field: String, ownerId: String, ctx: ParseContext): Either[String, IntType] = {
    stringField(block, field, ownerId).flatMap(id => parseIntById(id, ctx))
  }

  private def refAsBool(block: Map[String, Any], field: String, ownerId: String, ctx: ParseContext): Either[String, BoolType] = {
    stringField(block, field, ownerId).flatMap(id => parseBoolById(id, ctx))
  }

  private def intField(block: Map[String, Any], field: String, ownerId: String): Either[String, Int] = {
    block.get(field) match {
      case Some(v: Int) => Right(v)
      case Some(v: Long) =>
        if (v >= Int.MinValue && v <= Int.MaxValue) Right(v.toInt)
        else Left(s"Block '$ownerId' field '$field' is outside Int range")
      case Some(v: Double) =>
        if (v.isWhole && v >= Int.MinValue && v <= Int.MaxValue) Right(v.toInt)
        else Left(s"Block '$ownerId' field '$field' must be an integer")
      case Some(_) => Left(s"Block '$ownerId' field '$field' must be a number")
      case None => Left(s"Block '$ownerId' is missing field '$field'")
    }
  }

  private def boolField(block: Map[String, Any], field: String, ownerId: String): Either[String, Boolean] = {
    block.get(field) match {
      case Some(v: Boolean) => Right(v)
      case Some(_) => Left(s"Block '$ownerId' field '$field' must be a boolean")
      case None => Left(s"Block '$ownerId' is missing field '$field'")
    }
  }

  private def stringField(block: Map[String, Any], field: String, ownerId: String): Either[String, String] = {
    block.get(field) match {
      case Some(v: String) => Right(v)
      case Some(_) => Left(s"Block '$ownerId' field '$field' must be a string reference")
      case None => Left(s"Block '$ownerId' is missing field '$field'")
    }
  }

  private def stringListField(block: Map[String, Any], field: String, ownerId: String): Either[String, List[String]] = {
    block.get(field) match {
      case Some(values: List[?]) =>
        traverse(values.zipWithIndex) {
          case (value: String, _) => Right(value)
          case (_, idx) => Left(s"Block '$ownerId' field '$field' item $idx must be a string id")
        }
      case Some(_) => Left(s"Block '$ownerId' field '$field' must be an array of string ids")
      case None => Left(s"Block '$ownerId' is missing field '$field'")
    }
  }

  private def readBlocks(payload: Map[String, Any]): Either[String, Map[String, Map[String, Any]]] = {
    payload.get("blocks") match {
      case Some(blocksMap: Map[?, ?]) =>
        val typed = blocksMap.asInstanceOf[Map[String, Any]]
        traverse(typed.toList) { case (id, rawBlock) =>
          rawBlock match {
            case block: Map[?, ?] => Right(id -> block.asInstanceOf[Map[String, Any]])
            case _ => Left(s"Block '$id' must be a JSON object")
          }
        }.map(_.toMap)
      case Some(_) => Left("Field 'blocks' must be an object")
      case None => Left("Missing payload field 'blocks'")
    }
  }

  private def readRootBlocks(payload: Map[String, Any]): Either[String, List[String]] = {
    payload.get("rootBlocks") match {
      case Some(values: List[?]) =>
        traverse(values.zipWithIndex) {
          case (value: String, _) => Right(value)
          case (_, idx) => Left(s"Field 'rootBlocks' item $idx must be a string")
        }
      case Some(_) => Left("Field 'rootBlocks' must be an array of strings")
      case None => Left("Missing payload field 'rootBlocks'")
    }
  }

  private def singleRoot(rootBlocks: List[String]): Either[String, String] = {
    if (rootBlocks.lengthCompare(1) == 0) Right(rootBlocks.head)
    else Left("This parse kind requires exactly one root block")
  }

  private def nodeKind(value: ParsedNode): String = value match {
    case ParsedInt(_) => "int"
    case ParsedBool(_) => "bool"
    case ParsedArray(_) => "array"
    case ParsedStatement(_) => "statement"
  }

  private def traverse[A, B](items: List[A])(f: A => Either[String, B]): Either[String, List[B]] = {
    items.foldLeft[Either[String, List[B]]](Right(List.empty[B])) { (acc, item) =>
      for {
        xs <- acc
        x <- f(item)
      } yield xs :+ x
    }
  }

  private final class ParseContext(val blocks: Map[String, Map[String, Any]]) {
    val cache: mutable.Map[String, ParsedNode] = mutable.Map.empty
    val visiting: mutable.Set[String] = mutable.Set.empty
  }
}

