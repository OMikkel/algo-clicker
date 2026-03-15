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

## InitialProgramWithList_A JSON Example

The server now supports block-state JSON for `InitialProgramWithList_A`.

```json
{
  "kind": "auto",
  "blocks": {
    "program-root": { "type": "InitialProgramWithList_A", "id": "program-root", "parentId": "root", "decl_A": "decl-a", "solution": "if-sort" },
    "decl-a": { "type": "ArrayAssign", "id": "decl-a", "parentId": "program-root", "variable": "array-a", "value": "array-value" },
    "array-a": { "type": "ArrayVar", "id": "array-a", "parentId": "decl-a", "ident": "A" },
    "array-value": { "type": "ArrayLit", "id": "array-value", "parentId": "decl-a", "values": [3, 1] },
    "if-sort": { "type": "If", "id": "if-sort", "parentId": "program-root", "cond": "gt-0-1", "ifBlock": ["swap-0-1"], "elseBlock": [] },
    "gt-0-1": { "type": "BoolGreater", "id": "gt-0-1", "parentId": "if-sort", "v1": "a-idx-0", "v2": "a-idx-1" },
    "a-idx-0": { "type": "IntVarListLookup", "id": "a-idx-0", "parentId": "gt-0-1", "ident": "A", "index": "lit-0" },
    "a-idx-1": { "type": "IntVarListLookup", "id": "a-idx-1", "parentId": "gt-0-1", "ident": "A", "index": "lit-1" },
    "lit-0": { "type": "IntLit", "id": "lit-0", "parentId": "a-idx-0", "v": 0 },
    "lit-1": { "type": "IntLit", "id": "lit-1", "parentId": "a-idx-1", "v": 1 },
    "swap-0-1": { "type": "Swap", "id": "swap-0-1", "parentId": "if-sort", "a": "swap-a", "b": "swap-b" },
    "swap-a": { "type": "IntVarListLookup", "id": "swap-a", "parentId": "swap-0-1", "ident": "A", "index": "lit-0" },
    "swap-b": { "type": "IntVarListLookup", "id": "swap-b", "parentId": "swap-0-1", "ident": "A", "index": "lit-1" }
  },
  "rootBlocks": ["program-root"]
}
```

For this payload, parse returns kind `program`, and `run` executes `decl_A` first and then the sorting solution statement (result `value` is `"unit"`). The final `arrEnv.A` is `[1, 3]`.

## Parser harness

A tiny parser test harness is available at:

- `src/algo_backend/TestAstTextParser.scala`

It validates a few successful parse paths and one failure path.

