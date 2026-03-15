# JSONServer Protocol

This document describes the WebSocket JSON protocol implemented in `src/algo_backend/JSONServer.scala`.

## Connection

- Transport: WebSocket (RFC6455)
- Endpoint: `ws://<host>:<port>`
- Default bind in server code: `127.0.0.1:8080`
- Client frames must be masked (standard WebSocket client behavior).

## Message Model

All application messages are JSON **objects** sent in WebSocket **text frames**.

- Client -> Server message discriminator: `type`
- Server -> Client message discriminator: `type`

## Client -> Server Messages

### 1) Connect

```json
{
  "type": "connect",
  "clientId": "my-client"
}
```

Rules:
- `clientId` is required and must be a string.

### 2) Ping

```json
{
  "type": "ping",
  "timestampMs": 1710000000000
}
```

Rules:
- `timestampMs` is required and must be numeric.

### 3) Command

```json
{
  "type": "command",
  "action": "run",
  "payload": { "x": 1 }
}
```

Rules:
- `action` is required and must be a string.
- `payload` is optional.
- If present, `payload` must be a JSON object.
- If omitted, server treats payload as `{}`.

#### `command` action: `parseAst`

Preferred payload (frontend block graph format):

```json
{
  "type": "command",
  "action": "parseAst",
  "payload": {
    "kind": "auto",
    "blocks": {
      "intplus-block": { "type": "IntPlus", "id": "intplus-block", "parentId": "root", "v1": "int-left", "v2": "int-right" },
      "int-left": { "type": "IntLit", "id": "int-left", "parentId": "intplus-block", "v": 5 },
      "int-right": { "type": "IntLit", "id": "int-right", "parentId": "intplus-block", "v": 10 }
    },
    "rootBlocks": ["intplus-block"]
  }
}
```

Legacy payload (constructor text) is still supported:

```json
{
  "type": "command",
  "action": "parseAst",
  "payload": {
    "kind": "statement",
    "astText": "ArrayInsert(ArrayVar(\"A\"), IntLit(10), IntLit(1))"
  }
}
```

Rules:
- `payload.kind` is optional (`auto` by default).
- `kind` supports: `auto`, `int`, `bool`, `array`, `statement`, `scope`.
- Preferred mode: `payload.blocks` object + `payload.rootBlocks` string array.
- Legacy mode: `payload.astText` string.

#### `command` action: `run`

Runs the parsed AST in `Interpreter` and returns the runtime value plus resulting environment maps.
Trace events are sent mid-execution; execution is paused until the client replies `{"type":"continue"}`.

```json
{
  "type": "command",
  "action": "run",
  "payload": {
    "kind": "auto",
    "blocks": { ... },
    "rootBlocks": ["intplus-block"],
    "initialState": {
      "intEnv": {},
      "boolEnv": {},
      "arrEnv": { "A": [10, 20, 30] }
    }
  }
}
```

Rules:
- `payload.initialState` is optional. When provided, pre-seeds the interpreter `Env`.
- `initialState.intEnv`, `boolEnv`, `arrEnv` are all optional sub-objects.
- `initialState.parentEnv` is optional and recursive.

Nested environment shape (same as backend `Env`):

```json
{
  "intEnv": {"x": 5, "y": 71},
  "boolEnv": {"maybe": false},
  "arrEnv": {},
  "parentEnv": {
    "intEnv": {},
    "boolEnv": {},
    "arrEnv": {"A": [1, 2, 3, 4, 5]},
    "parentEnv": null
  }
}
```

## Server -> Client Messages

### 1) Connected

```json
{
  "type": "connected",
  "sessionId": "uuid-string"
}
```

Sent after a valid `connect` request.

### 2) Pong

```json
{
  "type": "pong",
  "timestampMs": 1710000000000
}
```

Sent after a valid `ping` request.

### 3) Ack

```json
{
  "type": "ack",
  "action": "run"
}
```

Sent after a valid `command` request.

### 4) Parsed

```json
{
  "type": "parsed",
  "kind": "statement",
  "value": "ArrayInsert(ArrayVar(A),IntLit(10),IntLit(1))"
}
```

Sent after a successful `command` with `action = "parseAst"`.

### 5) Error

```json
{
  "type": "error",
  "message": "..."
}
```

Sent when parsing or validation fails, including:
- invalid JSON object
- missing required fields
- wrong field types
- unknown `type`
- unsupported WebSocket opcode at app layer

### 6) Ran

```json
{
  "type": "ran",
  "kind": "int",
  "value": "15",
  "intEnv": {},
  "boolEnv": {},
  "arrEnv": {"A": [1, 2, 3, 4, 5]},
  "env": {
    "intEnv": {"x": 5},
    "boolEnv": {},
    "arrEnv": {},
    "parentEnv": {
      "intEnv": {},
      "boolEnv": {},
      "arrEnv": {"A": [1, 2, 3, 4, 5]},
      "parentEnv": null
    }
  }
}
```

Sent after a successful `command` with `action = "run"`.

Notes:
- `intEnv`, `boolEnv`, `arrEnv` are flattened snapshots across the env chain.
- `env` preserves scope structure exactly (`parentEnv` recursion).

### 7) Trace

```json
{
  "type": "trace",
  "event": "ArrayInsert",
  "arr": "A",
  "index": 1,
  "value": 42,
  "intEnv": {},
  "boolEnv": {},
  "arrEnv": { "A": [10, 42, 20, 30] },
  "env": {
    "intEnv": {},
    "boolEnv": {},
    "arrEnv": {},
    "parentEnv": {
      "intEnv": {},
      "boolEnv": {},
      "arrEnv": { "A": [10, 42, 20, 30] },
      "parentEnv": null
    }
  }
}
```

Sent mid-execution whenever a traced array mutation occurs.
The interpreter is **paused** after sending this; execution resumes only after the client replies with `{"type":"continue"}`.

Possible `event` values:
- `ArrayInsert` — fields: `arr`, `index`, `value`
- `ArrayRemove` — fields: `arr`, `index`
- `ArraySwap`   — fields: `arr`, `index1`, `index2`
- `ArrayAssign` — fields: `arr`, `value`

## Client → Server (additional)

### 4) Continue

```json
{ "type": "continue" }
```

Sent by the client to resume interpreter execution after receiving a `trace` message.
Must only be sent while paused (after a `trace`, before the corresponding `ran` arrives).

## WebSocket Control Behavior

- Incoming WebSocket `ping` control frame -> server replies with `pong` control frame.
- Incoming `close` control frame -> server responds with `close` and terminates that connection.

## Notes / Limits

- This is a simple server implementation.
- Very large frames are not supported (server rejects 64-bit length frames).
- Protocol currently defines only `connect`, `ping`, and `command` request types.

