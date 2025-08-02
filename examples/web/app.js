// Example-specific WASM loader
import { loadWasm } from './wasm-utils.js';
import { getCanvasImports } from './canvas-wasm.js';
document.addEventListener('DOMContentLoaded', async () => {
    const wasmExports = await loadWasm('./canvas_example.wasm', getCanvasImports());
    wasmExports.main_function();
});
