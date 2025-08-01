# Copilot Instructions for web_canvas

## Project Overview
This project is a Rust + WebAssembly (WASM) web app with a TypeScript/JavaScript frontend. It provides a browser-based canvas drawing API inspired by Matplotlib, with Rust code compiled to WASM and integrated into the frontend via JS/TS glue code.

## Architecture
- **Rust Core (src/)**: Implements drawing primitives and event handling (see `canvas.rs`). Rust functions are exposed to JS via WASM imports/exports. Key modules:
  - `canvas.rs`: Main drawing API, color palette, mouse event handling
  - `console.rs`, `browser.rs`: Bindings for browser/console interop
- **Frontend (frontend/)**: Loads WASM, sets up canvas, and wires browser events to WASM callbacks.
- **TypeScript (ts/)**: Type definitions and alternate frontend logic(see `app.ts`).
- **Build Artifacts**: WASM output is copied to `frontend/` for serving.

## Key Patterns & Conventions
- **Canvas Registration**: Rust `Canvas::new(name)` hashes the name to create a unique ID, registers with JS via WASM import, and stores in a thread-local table. JS/TS expects a `<canvas id="...">` in HTML.
- **Event Handling**: Mouse events are handled by JS/TS, which calls back into WASM (`on_mouse_move`). Rust code can set a callback via `Canvas::set_on_mouse_move`.
- **Interop**: All browser/console/canvas operations are performed via WASM imports (see `mod js` blocks in Rust files).
- **Color Palette**: Use the predefined color constants in `canvas.rs` for consistent visuals.
- **No Global State**: All canvas state is managed per-canvas via the WASM_CANVAS_TABLE.

## Build & Run Workflow
- **Build All**: `make build` (compiles Rust to WASM and TypeScript to JS)
- **Rust Only**: `make wasm`
- **TypeScript Only**: `make typescript`
- **Clean**: `make clean`
- **Test Rust**: `make test`
- **Serve Locally**: `make serve` (serves `frontend/` at http://localhost:8000)

## Integration Points
- **WASM Imports/Exports**: See `app.js`/`app.ts` for how WASM functions are mapped to JS/TS.
- **Frontend Entry**: `frontend/app.js` loads WASM and calls `my_function` (see `src/lib.rs`).
- **HTML Canvas**: The main canvas must be present in `frontend/index.html` with the correct ID.

## Example: Mouse Move Event
```rust
cv.set_on_mouse_move(|x, y| {
    console::log(&format!("Mouse moved to: ({}, {})", x, y));
});
```

## File References
- `src/canvas.rs`: Drawing API, color palette, event registration
- `ts/app.ts`: WASM glue, event wiring
- `Makefile`: Build/test/serve commands
- `frontend/index.html`: Canvas element

## Tips for AI Agents
- Always use the provided Makefile targets for builds/tests/serving
- Use color constants from `canvas.rs` for drawing
- Register canvas and events via Rust API, not directly in JS/TS
- For new drawing features, extend `Canvas` methods and update JS/TS imports if needed
- For new events, add Rust callback registration and JS/TS event wiring

---
If any section is unclear or missing, please provide feedback for further refinement.
