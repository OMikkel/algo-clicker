# Algo Clicker WebSocket AST Demo

This project now includes:

- a WebSocket backend server in `src/algo_backend/JSONServer.scala`
- an AST text parser in `src/algo_backend/AstTextParser.scala`
- a block-state JSON parser in `src/algo_backend/AstBlockStateParser.scala`
- a tiny browser test client in `backend_frontend_test_client.html`

## Protocol quickstart

1. Start the Scala server (`algo_backend.JSONServer`).
2. Open `backend_frontend_test_client.html` in a browser.
3. Click **Connect**.
4. Load one of the block-state JSON examples and click **Send parseAst**.
5. Click **Run in Interpreter** to execute the AST and receive runtime state.

## JSON message types

Client -> Server (`type` field):

- `connect` - starts a session (`clientId`)
- `ping` - heartbeat (`timestampMs`)
- `command` - action request (`action`, `payload`)
  - `action: "parseAst"` - parse AST payload (`blocks/rootBlocks` or `astText`)
  - `action: "run"` - parse + execute AST in interpreter (supports optional `initialState`)
- `continue` - resume interpreter after a `trace` pause

Server -> Client (`type` field):

- `connected` - confirms connect (`sessionId`)
- `pong` - ping response (`timestampMs`)
- `ack` - generic acknowledgement (`action`)
- `parsed` - parse success (`kind`, `value`)
- `ran` - run success (`kind`, `value`, flattened env maps, and nested `env`)
- `trace` - interpreter step event during run (`event`, event-specific fields, flattened env maps, and nested `env`)
- `error` - validation/parse/runtime error (`message`)

Trace flow: during `run`, server may send one or more `trace` messages and pause execution until the client sends `{"type":"continue"}` for each step.

## Nested Environment JSON Shape

`run` supports nested interpreter environments in `payload.initialState`, and `trace`/`ran` include the same shape in `env`.

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

Notes:
- `parentEnv` is recursive and can be nested to any depth.
- Use `null` to terminate the parent chain.
- Top-level `intEnv`/`boolEnv`/`arrEnv` in `trace` and `ran` are flattened snapshots for convenience.

Example request sent by the web client:

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

Example success response:

```json
{
  "type": "parsed",
  "kind": "int",
  "value": "IntPlus(IntLit(5),IntLit(10))"
}
```

If parsing fails, server responds with:

```json
{
  "type": "error",
  "message": "..."
}
```

Example run response:

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

## Parser harness

A tiny parser test harness is available at:

- `src/algo_backend/TestAstTextParser.scala`

It validates a few successful parse paths and one failure path.

