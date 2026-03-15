package algo_backend

import java.io.{BufferedInputStream, BufferedOutputStream}
import java.net.{InetSocketAddress, ServerSocket, Socket}
import java.nio.charset.StandardCharsets
import java.security.MessageDigest
import java.util.Base64
import java.util.UUID

object JSONServer {

  sealed trait ClientMessage

  case class Connect(clientId: String) extends ClientMessage

  case class Ping(timestampMs: Long) extends ClientMessage

  case class Command(action: String, payload: Map[String, Any]) extends ClientMessage

  case class Continue() extends ClientMessage

  sealed trait ServerMessage

  case class Connected(sessionId: String) extends ServerMessage

  case class Pong(timestampMs: Long) extends ServerMessage

  case class Ack(action: String) extends ServerMessage

  case class Parsed(kind: String, value: String) extends ServerMessage

  case class Ran(kind: String, value: String, intEnv: Map[String, Int], boolEnv: Map[String, Boolean], arrEnv: Map[String, List[Int]], env: Map[String, Any]) extends ServerMessage

  case class Trace(event: String, data: Map[String, Any], intEnv: Map[String, Int], boolEnv: Map[String, Boolean], arrEnv: Map[String, List[Int]], env: Map[String, Any]) extends ServerMessage

  case class Error(message: String, id: String, slot: String) extends ServerMessage

  final case class ServerHandle(stop: () => Unit)

  private val WebSocketGuid = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"
  private val OpText = 0x1
  private val OpClose = 0x8
  private val OpPing = 0x9
  private val OpPong = 0xA

  def start(host: String = "0.0.0.0", port: Int = 8080): ServerHandle = {
    val server = new ServerSocket()
    server.bind(new InetSocketAddress(host, port))

    val acceptThread = new Thread(() => acceptLoop(server), "json-ws-accept-loop")
    acceptThread.setDaemon(true)
    acceptThread.start()

    ServerHandle(() => {
      if (!server.isClosed) {
        server.close()
      }
    })
  }

  def main(args: Array[String]): Unit = {
    val host = if (args.length > 0) args(0) else "0.0.0.0"
    val port = if (args.length > 1) args(1).toInt else 8080
    start(host, port)
    println(s"JSON WebSocket server listening on ws://$host:$port")
    // Keep the JVM alive for this tiny server entrypoint.
    while (true) {
      Thread.sleep(60000)
    }
  }

  def decodeClientMessage(json: String): Either[String, ClientMessage] = {
    println("Decoding client message: " + json)
    parseJsonObject(json).flatMap { map =>
      println("Parsed JSON object: " + map)
      map.get("type") match {
        case Some("connect") =>
          stringField(map, "clientId").map(Connect.apply)
        case Some("ping") =>
          longField(map, "timestampMs").map(Ping.apply)
        case Some("continue") =>
          Right(Continue())
        case Some("command") =>
          for {
            action <- stringField(map, "action")
            payload <- map.get("payload") match {
              case Some(p: Map[_, _]) => Right(p.asInstanceOf[Map[String, Any]])
              case Some(_) => Left("'payload' must be a JSON object")
              case None => Right(Map.empty[String, Any])
            }
          } yield Command(action, payload)
        case Some(other) => Left(s"Unsupported message type: $other")
        case None => Left("Missing field 'type'")
      }
    }
  }

  def encodeServerMessage(message: ServerMessage): String = {
    println("Encoding server message: " + message)
    val map: Map[String, Any] = message match {
      case Connected(sessionId) => Map("type" -> "connected", "sessionId" -> sessionId)
      case Pong(timestampMs) => Map("type" -> "pong", "timestampMs" -> timestampMs)
      case Ack(action) => Map("type" -> "ack", "action" -> action)
      case Parsed(kind, value) => Map("type" -> "parsed", "kind" -> kind, "value" -> value)
      case Ran(kind, value, intEnv, boolEnv, arrEnv, env) =>
        Map(
          "type" -> "ran",
          "kind" -> kind,
          "value" -> value,
          "intEnv" -> intEnv,
          "boolEnv" -> boolEnv,
          "arrEnv" -> arrEnv,
          "env" -> env
        )
      case Trace(event, data, intEnv, boolEnv, arrEnv, env) =>
        (Map[String, Any]("type" -> "trace", "event" -> event) ++ data) +
          ("intEnv" -> intEnv) + ("boolEnv" -> boolEnv) + ("arrEnv" -> arrEnv) + ("env" -> env)
      case Error(message, id, slot) =>
        Map("type" -> "error", "message" -> message, "id" -> id, "slot" -> slot)
    }
    stringifyJson(map)
  }

  private def mkError(message: String, id: String = "", slot: String = ""): Error =
    Error(message, id, slot)

  private def acceptLoop(server: ServerSocket): Unit = {
    try {
      while (!server.isClosed) {
        val socket = server.accept()
        val clientThread = new Thread(() => handleClient(socket), s"json-ws-client-${socket.getPort}")
        clientThread.setDaemon(true)
        clientThread.start()
      }
    } catch {
      case _: java.net.SocketException => ()
    }
  }

  private def handleClient(socket: Socket): Unit = {
    val in = new BufferedInputStream(socket.getInputStream)
    val out = new BufferedOutputStream(socket.getOutputStream)
    println(s"Client connected: ${socket.getRemoteSocketAddress}")
    try {
      val headers = readHandshakeHeaders(in)
      val key = headers.getOrElse("sec-websocket-key", throw new IllegalArgumentException("Missing Sec-WebSocket-Key"))
      writeHandshakeResponse(out, key)

      var running = true
      while (running) {
        readFrame(in) match {
          case None => running = false
          case Some((OpClose, _)) =>
            writeFrame(out, OpClose, Array.emptyByteArray)
            running = false
          case Some((OpPing, payload)) =>
            writeFrame(out, OpPong, payload)
          case Some((OpText, payload)) =>
            val incomingJson = new String(payload, StandardCharsets.UTF_8)
            println(incomingJson)
            val response: ServerMessage = {
              val decoded = decodeClientMessage(incomingJson)
              println(s"decoded: $decoded")
              decoded match {
              case Right(Command("run", cmdPayload)) => executeWithTracing(cmdPayload, in, out)
              case Right(msg) => route(msg)
              case Left(err) => mkError(err)
            }
            }
            writeFrame(out, OpText, encodeServerMessage(response).getBytes(StandardCharsets.UTF_8))
          case Some((_, _)) =>
            writeFrame(out, OpText, encodeServerMessage(mkError("Unsupported websocket opcode")).getBytes(StandardCharsets.UTF_8))
        }
      }
    } catch {
      case _: Exception => ()
    } finally {
      socket.close()
    }
  }

  private def route(message: ClientMessage): ServerMessage = message match {
    case Connect(_) => Connected(UUID.randomUUID().toString)
    case Ping(timestampMs) => Pong(timestampMs)
    case Continue() => Ack("continue")
    case Command(action, payload) =>
      action match {
        case "parseAst" =>
          parseAstPayload(payload).fold(err => mkError(err), parsed => Parsed(parsed.kind, parsed.value.toString))
        case _ => Ack(action)
      }
  }

  // Runs the interpreter with a trace handler that sends Trace frames over the socket
  // and blocks on each trace until the frontend replies {"type":"continue"}.
  private def executeWithTracing(payload: Map[String, Any], in: BufferedInputStream, out: BufferedOutputStream): ServerMessage = {
    val traceHandler: (Ast.TraceType, Option[String], Ast.Env) => Unit = { (traceEvent, _astId, env) =>
      val traceMsg = buildTraceMessage(traceEvent, env)
      writeFrame(out, OpText, encodeServerMessage(traceMsg).getBytes(StandardCharsets.UTF_8))

      // Block this interpreter thread until the frontend sends {"type":"continue"}
      var waiting = true
      while (waiting) {
        readFrame(in) match {
          case None => waiting = false
          case Some((OpClose, _)) => waiting = false
          case Some((OpText, bytes)) =>
            val raw = new String(bytes, StandardCharsets.UTF_8)
            parseJsonObject(raw).toOption.flatMap(_.get("type")) match {
              case Some("continue") => waiting = false
              case _ => () // ignore other messages while paused
            }
          case _ => ()
        }
      }
    }

    val env = parseInitialEnv(payload)
    parseAstPayload(payload)
      .flatMap { parsed =>
        Interpreter.withTraceHandler(traceHandler)(executeParsedAst(parsed, env))
      }
      .fold(err => mkError(err), identity)
  }

  private def buildTraceMessage(t: Ast.TraceType, env: Ast.Env): Trace = {
    import Ast.*
    val (event, data) = t match {
      case TraceArrAssign_A(value, arr) =>
        ("ArrayAssign", Map[String, Any]("arr" -> arr, "value" -> value))
      case TraceArrSwap(index1, index2, arr) =>
        ("ArraySwap", Map[String, Any]("arr" -> arr, "index1" -> index1, "index2" -> index2))
      case TraceArrayInsert(index, value, arr) =>
        ("ArrayInsert", Map[String, Any]("arr" -> arr, "index" -> index, "value" -> value))
      case TraceArrayRemove(index, arr) =>
        ("ArrayRemove", Map[String, Any]("arr" -> arr, "index" -> index))
      case _ =>
        ("Unknown", Map.empty[String, Any])
    }
    Trace(event, data, flattenIntEnv(env), flattenBoolEnv(env), flattenArrEnv(env), envToJson(env))
  }

  private def envToJson(env: Ast.Env): Map[String, Any] = {
    val parentJson: Any = env.parent_env match {
      case Some(parent) => envToJson(parent)
      case None => null
    }

    Map(
      "intEnv" -> env.intEnv,
      "boolEnv" -> env.boolEnv,
      "arrEnv" -> env.arrEnv,
      "parentEnv" -> parentJson
    )
  }

  // Trace callbacks can run inside nested scope envs. Flatten the env chain so
  // frontend snapshots include variables from parent scopes (e.g., initial array A).
  private def flattenIntEnv(env: Ast.Env): Map[String, Int] =
    env.parent_env match {
      case Some(parent) => flattenIntEnv(parent) ++ env.intEnv
      case None => env.intEnv
    }

  private def flattenBoolEnv(env: Ast.Env): Map[String, Boolean] =
    env.parent_env match {
      case Some(parent) => flattenBoolEnv(parent) ++ env.boolEnv
      case None => env.boolEnv
    }

  private def flattenArrEnv(env: Ast.Env): Map[String, List[Int]] =
    env.parent_env match {
      case Some(parent) => flattenArrEnv(parent) ++ env.arrEnv
      case None => env.arrEnv
    }

  // Reads optional initialState from the run payload and seeds the Env accordingly.
  private def parseInitialEnv(payload: Map[String, Any]): Ast.Env = {
    val stateOpt: Option[Map[String, Any]] = payload.get("initialState") match {
      case Some(m: Map[_, _]) => Some(m.asInstanceOf[Map[String, Any]])
      case _ => None
    }

    def toInt(v: Any): Option[Int] = v match {
      case n: Long => Some(n.toInt)
      case n: Int => Some(n)
      case n: Double if n.isWhole => Some(n.toInt)
      case _ => None
    }

    def parseEnv(state: Map[String, Any]): Ast.Env = {
      val intEnv: Map[String, Int] = state.get("intEnv") match {
        case Some(m: Map[_, _]) =>
          m.asInstanceOf[Map[String, Any]].flatMap { case (k, v) => toInt(v).map(k -> _) }
        case _ => Map.empty
      }

      val boolEnv: Map[String, Boolean] = state.get("boolEnv") match {
        case Some(m: Map[_, _]) =>
          m.asInstanceOf[Map[String, Any]].collect { case (k, v: Boolean) => k -> v }
        case _ => Map.empty
      }

      val arrEnv: Map[String, List[Int]] = state.get("arrEnv") match {
        case Some(m: Map[_, _]) =>
          m.asInstanceOf[Map[String, Any]].flatMap {
            case (k, vs: List[_]) =>
              val ints = vs.flatMap(toInt)
              if (ints.length == vs.length) Some(k -> ints) else None
            case _ => None
          }
        case _ => Map.empty
      }

      val parentEnv: Option[Ast.Env] = state.get("parentEnv") match {
        case Some(m: Map[_, _]) => Some(parseEnv(m.asInstanceOf[Map[String, Any]]))
        case Some(null) => None
        case _ => None
      }

      Ast.Env(intEnv, boolEnv, arrEnv, parentEnv)
    }

    stateOpt match {
      case Some(state) => parseEnv(state)
      case None => Ast.Env(Map.empty, Map.empty, Map.empty, None)
    }
  }

  private def parseAstPayload(payload: Map[String, Any]): Either[String, AstTextParser.ParsedAst] = {
    val kind = payloadStringOptional(payload, "kind").getOrElse("auto")
    if (payload.contains("blocks") || payload.contains("rootBlocks")) {
      AstBlockStateParser.parsePayload(kind, payload)
    } else {
      payloadString(payload, "astText").flatMap(astText => AstTextParser.parse(kind, astText))
    }
  }

  private def executeParsedAst(parsed: AstTextParser.ParsedAst, env: Ast.Env): Either[String, ServerMessage] = {
    try {
      val valueText = parsed.value match {
        case v: Ast.IntType => Interpreter.eval(v, env).toString
        case v: Ast.BoolType => Interpreter.eval(v, env).toString
        case v: Ast.ArrayType => Interpreter.eval(v, env).toString
        case v: Ast.InitialProgramWithList_A =>
          Interpreter.eval(v, env)
          "unit"
        case v: Ast.Statement =>
          Interpreter.eval(v, env)
          "unit"
        case v: Ast.Scope =>
          Interpreter.eval(v, env)
          "unit"
        case _ => return Left(s"Unsupported parsed value for run: ${parsed.kind}")
      }

        Right(Ran(parsed.kind, valueText, flattenIntEnv(env), flattenBoolEnv(env), flattenArrEnv(env), envToJson(env)))
    } catch {
      case t: Throwable => Left(Option(t.getMessage).getOrElse(t.toString))
    }
  }

  private def payloadString(payload: Map[String, Any], field: String): Either[String, String] = {
    payload.get(field) match {
      case Some(v: String) => Right(v)
      case Some(_) => Left(s"Payload field '$field' must be a string")
      case None => Left(s"Missing payload field '$field'")
    }
  }

  private def payloadStringOptional(payload: Map[String, Any], field: String): Option[String] = {
    payload.get(field) match {
      case Some(v: String) => Some(v)
      case _ => None
    }
  }

  private def writeHandshakeResponse(out: BufferedOutputStream, clientKey: String): Unit = {
    val accept = Base64.getEncoder.encodeToString(
      MessageDigest.getInstance("SHA-1").digest((clientKey + WebSocketGuid).getBytes(StandardCharsets.UTF_8))
    )
    val response =
      "HTTP/1.1 101 Switching Protocols\r\n" +
        "Upgrade: websocket\r\n" +
        "Connection: Upgrade\r\n" +
        s"Sec-WebSocket-Accept: $accept\r\n\r\n"
    out.write(response.getBytes(StandardCharsets.US_ASCII))
    out.flush()
  }

  private def readHandshakeHeaders(in: BufferedInputStream): Map[String, String] = {
    val request = readHttpHeaderBlock(in)
    val lines = request.split("\\r\\n").toList
    lines.tail.flatMap { line =>
      line.split(":", 2) match {
        case Array(k, v) => Some(k.trim.toLowerCase -> v.trim)
        case _ => None
      }
    }.toMap
  }

  private def readHttpHeaderBlock(in: BufferedInputStream): String = {
    val buf = new StringBuilder
    var last4 = ""
    while (last4 != "\r\n\r\n") {
      val b = in.read()
      if (b < 0) {
        throw new IllegalArgumentException("Unexpected EOF during handshake")
      }
      buf.append(b.toChar)
      last4 = if (buf.length >= 4) buf.substring(buf.length - 4) else buf.toString()
    }
    buf.toString()
  }

  private def readFrame(in: BufferedInputStream): Option[(Int, Array[Byte])] = {
    val b1 = in.read()
    if (b1 < 0) return None
    val b2 = in.read()
    if (b2 < 0) return None

    val opcode = b1 & 0x0F
    val masked = (b2 & 0x80) != 0
    var length = b2 & 0x7F

    if (length == 126) {
      length = ((in.read() & 0xFF) << 8) | (in.read() & 0xFF)
    } else if (length == 127) {
      throw new IllegalArgumentException("Large websocket frames are not supported in this simple server")
    }

    if (!masked) {
      throw new IllegalArgumentException("Client frames must be masked")
    }

    val mask = readFully(in, 4)
    val payload = readFully(in, length)
    var i = 0
    while (i < payload.length) {
      payload(i) = (payload(i) ^ mask(i % 4)).toByte
      i += 1
    }
    Some((opcode, payload))
  }

  private def writeFrame(out: BufferedOutputStream, opcode: Int, payload: Array[Byte]): Unit = {
    out.write(0x80 | (opcode & 0x0F))
    if (payload.length < 126) {
      out.write(payload.length)
    } else if (payload.length <= 65535) {
      out.write(126)
      out.write((payload.length >> 8) & 0xFF)
      out.write(payload.length & 0xFF)
    } else {
      throw new IllegalArgumentException("Payload too large")
    }
    out.write(payload)
    out.flush()
  }

  private def readFully(in: BufferedInputStream, len: Int): Array[Byte] = {
    val data = Array.ofDim[Byte](len)
    var offset = 0
    while (offset < len) {
      val read = in.read(data, offset, len - offset)
      if (read < 0) throw new IllegalArgumentException("Unexpected EOF in websocket frame")
      offset += read
    }
    data
  }

  private def stringField(map: Map[String, Any], name: String): Either[String, String] = {
    map.get(name) match {
      case Some(v: String) => Right(v)
      case Some(_) => Left(s"Field '$name' must be a string")
      case None => Left(s"Missing field '$name'")
    }
  }

  private def longField(map: Map[String, Any], name: String): Either[String, Long] = {
    map.get(name) match {
      case Some(v: Double) => Right(v.toLong)
      case Some(v: Int) => Right(v.toLong)
      case Some(v: Long) => Right(v)
      case Some(_) => Left(s"Field '$name' must be a number")
      case None => Left(s"Missing field '$name'")
    }
  }

  private def parseJsonObject(input: String): Either[String, Map[String, Any]] = {
    val parser = new MiniJsonParser(input)
    parser.parseObjectAtRoot()
  }

  private def stringifyJson(value: Any): String = value match {
    case null => "null"
    case s: String => s"\"${escapeJson(s)}\""
    case b: Boolean => b.toString
    case n: Byte => n.toString
    case n: Short => n.toString
    case n: Int => n.toString
    case n: Long => n.toString
    case n: Float => if (n.isWhole) n.toLong.toString else n.toString
    case n: Double => if (n.isWhole) n.toLong.toString else n.toString
    case m: Map[_, _] =>
      m.iterator.map { case (k, v) => s"\"${escapeJson(k.toString)}\":${stringifyJson(v)}" }.mkString("{", ",", "}")
    case xs: Iterable[?] => xs.iterator.map(stringifyJson).mkString("[", ",", "]")
    case other => s"\"${escapeJson(other.toString)}\""
  }

  private def escapeJson(s: String): String = {
    val out = new StringBuilder
    var i = 0
    while (i < s.length) {
      s.charAt(i) match {
        case '"' => out.append("\\\"")
        case '\\' => out.append("\\\\")
        case '\b' => out.append("\\b")
        case '\f' => out.append("\\f")
        case '\n' => out.append("\\n")
        case '\r' => out.append("\\r")
        case '\t' => out.append("\\t")
        case c if c < ' ' => out.append(f"\\u${c.toInt}%04x")
        case c => out.append(c)
      }
      i += 1
    }
    out.toString()
  }

  private final class MiniJsonParser(input: String) {
    private var index = 0

    def parseObjectAtRoot(): Either[String, Map[String, Any]] = {
      for {
        value <- parseValue()
        _ <- ensureFullyConsumed()
        obj <- value match {
          case m: Map[_, _] => Right(m.asInstanceOf[Map[String, Any]])
          case _ => Left("Invalid JSON object")
        }
      } yield obj
    }

    private def ensureFullyConsumed(): Either[String, Unit] = {
      skipWhitespace()
      if (index == input.length) Right(()) else Left("Unexpected trailing characters in JSON")
    }

    private def parseValue(): Either[String, Any] = {
      skipWhitespace()
      if (index >= input.length) return Left("Unexpected end of JSON")
      input.charAt(index) match {
        case '{' => parseObject()
        case '[' => parseArray()
        case '"' => parseString()
        case 't' => parseLiteral("true", true)
        case 'f' => parseLiteral("false", false)
        case 'n' => parseLiteral("null", null)
        case '-' => parseNumber()
        case d if d >= '0' && d <= '9' => parseNumber()
        case c => Left(s"Unexpected character '$c' at position $index")
      }
    }

    private def parseObject(): Either[String, Map[String, Any]] = {
      consume('{')
      skipWhitespace()
      var result = Map.empty[String, Any]
      if (peekChar('}')) {
        index += 1
        return Right(result)
      }

      var done = false
      while (!done) {
        val keyEither = parseString()
        keyEither match {
          case Left(err) => return Left(err)
          case Right(key) =>
            skipWhitespace()
            if (!consume(':')) return Left(s"Expected ':' at position $index")
            parseValue() match {
              case Left(err) => return Left(err)
              case Right(value) => result = result.updated(key, value)
            }
            skipWhitespace()
            if (peekChar(',')) {
              index += 1
              skipWhitespace()
            } else if (peekChar('}')) {
              index += 1
              done = true
            } else {
              return Left(s"Expected ',' or '}' at position $index")
            }
        }
      }
      Right(result)
    }

    private def parseArray(): Either[String, List[Any]] = {
      consume('[')
      skipWhitespace()
      var result = List.empty[Any]
      if (peekChar(']')) {
        index += 1
        return Right(result)
      }

      var done = false
      while (!done) {
        parseValue() match {
          case Left(err) => return Left(err)
          case Right(value) => result = result :+ value
        }
        skipWhitespace()
        if (peekChar(',')) {
          index += 1
          skipWhitespace()
        } else if (peekChar(']')) {
          index += 1
          done = true
        } else {
          return Left(s"Expected ',' or ']' at position $index")
        }
      }
      Right(result)
    }

    private def parseString(): Either[String, String] = {
      if (!consume('"')) return Left(s"Expected '" + '"' + s"' at position $index")
      val out = new StringBuilder
      while (index < input.length) {
        val ch = input.charAt(index)
        index += 1
        if (ch == '"') {
          return Right(out.toString())
        }
        if (ch == '\\') {
          if (index >= input.length) return Left("Invalid escape sequence")
          val esc = input.charAt(index)
          index += 1
          esc match {
            case '"' => out.append('"')
            case '\\' => out.append('\\')
            case '/' => out.append('/')
            case 'b' => out.append('\b')
            case 'f' => out.append('\f')
            case 'n' => out.append('\n')
            case 'r' => out.append('\r')
            case 't' => out.append('\t')
            case 'u' =>
              if (index + 4 > input.length) return Left("Invalid unicode escape")
              val hex = input.substring(index, index + 4)
              val codePoint = try {
                Integer.parseInt(hex, 16)
              } catch {
                case _: NumberFormatException => return Left("Invalid unicode escape")
              }
              out.append(codePoint.toChar)
              index += 4
            case _ => return Left(s"Invalid escape sequence \\$esc")
          }
        } else {
          out.append(ch)
        }
      }
      Left("Unterminated string literal")
    }

    private def parseNumber(): Either[String, Any] = {
      val start = index
      if (peekChar('-')) index += 1
      if (index >= input.length || !input.charAt(index).isDigit) {
        return Left(s"Invalid number at position $start")
      }
      if (input.charAt(index) == '0') {
        index += 1
      } else {
        while (index < input.length && input.charAt(index).isDigit) index += 1
      }
      if (peekChar('.')) {
        index += 1
        if (index >= input.length || !input.charAt(index).isDigit) {
          return Left(s"Invalid number at position $start")
        }
        while (index < input.length && input.charAt(index).isDigit) index += 1
      }
      if (index < input.length && (input.charAt(index) == 'e' || input.charAt(index) == 'E')) {
        index += 1
        if (index < input.length && (input.charAt(index) == '+' || input.charAt(index) == '-')) index += 1
        if (index >= input.length || !input.charAt(index).isDigit) {
          return Left(s"Invalid exponent in number at position $start")
        }
        while (index < input.length && input.charAt(index).isDigit) index += 1
      }
      val token = input.substring(start, index)
      if (token.contains('.') || token.contains('e') || token.contains('E')) {
        try Right(token.toDouble)
        catch {
          case _: NumberFormatException => Left(s"Invalid number token '$token'")
        }
      } else {
        try {
          Right(token.toLong)
        } catch {
          case _: NumberFormatException => Left(s"Invalid number token '$token'")
        }
      }
    }

    private def parseLiteral(token: String, value: Any): Either[String, Any] = {
      if (index + token.length <= input.length && input.substring(index, index + token.length) == token) {
        index += token.length
        Right(value)
      } else {
        Left(s"Invalid token at position $index")
      }
    }

    private def skipWhitespace(): Unit = {
      while (index < input.length && input.charAt(index).isWhitespace) {
        index += 1
      }
    }

    private def consume(ch: Char): Boolean = {
      if (peekChar(ch)) {
        index += 1
        true
      } else {
        false
      }
    }

    private def peekChar(ch: Char): Boolean = index < input.length && input.charAt(index) == ch
  }

}
