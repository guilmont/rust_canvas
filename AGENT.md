# AGENT.md - Web Canvas Project

## Build/Test Commands
- **Build all**: `make build` (builds WASM + TypeScript)
- **Build WASM only**: `make wasm`
- **Build TypeScript only**: `make typescript`
- **Check Rust**: `make check`
- **Test Rust**: `make test` (no specific test runner - uses cargo test)
- **Clean artifacts**: `make clean`
- **Serve locally**: `make serve` (builds and serves at http://localhost:8000)

## Architecture
- **Rust Core (src/)**: WASM-compiled drawing API with canvas operations, event handling
- **Frontend (frontend/)**: HTML/JS files that load WASM and wire browser events
- **TypeScript (ts/)**: Type definitions and alternate frontend logic
- **Key files**: `src/canvas.rs` (main API), `src/lib.rs` (entry point), `ts/app.ts` (WASM glue)

## Code Style & Conventions
- **Rust**: Use predefined color constants from `canvas.rs` (TAB_BLUE, RED, etc.)
- **Canvas Registration**: Use `Canvas::new(name)` which hashes name to unique ID
- **Event Handling**: Set callbacks via `canvas.set_on_mouse_*_callback(fn)`
- **No global state**: All canvas state managed per-canvas via WASM_CANVAS_TABLE
- **WASM Interop**: Browser operations via WASM imports (see `mod js` blocks)
- **TypeScript**: Target ES2022, strict mode, output to `frontend/`

## From Copilot Instructions
- Always use Makefile targets for builds/tests/serving
- Register canvas and events via Rust API, not directly in JS/TS
- For new drawing features, extend Canvas methods and update JS/TS imports if needed
