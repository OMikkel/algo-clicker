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
  "arrEnv": {}
}
```

## Parser harness

A tiny parser test harness is available at:

- `src/algo_backend/TestAstTextParser.scala`

It validates a few successful parse paths and one failure path.

