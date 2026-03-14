# Algo Clicker WebSocket AST Demo

This project now includes:

- a WebSocket backend server in `src/algo_backend/JSONServer.scala`
- an AST text parser in `src/algo_backend/AstTextParser.scala`
- a tiny browser test client in `backend_frontend_test_client.html`

## Protocol quickstart

1. Start the Scala server (`algo_backend.JSONServer`).
2. Open `backend_frontend_test_client.html` in a browser.
3. Click **Connect**.
4. Paste Ast.scala constructor text and click **Send parseAst**.

Example request sent by the web client:

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

Example success response:

```json
{
  "type": "parsed",
  "kind": "statement",
  "value": "ArrayInsert(ArrayVar(A),IntLit(10),IntLit(1))"
}
```

If parsing fails, server responds with:

```json
{
  "type": "error",
  "message": "..."
}
```

## Parser harness

A tiny parser test harness is available at:

- `src/algo_backend/TestAstTextParser.scala`

It validates a few successful parse paths and one failure path.

