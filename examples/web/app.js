// Example-specific WASM loader
import { loadWasm } from './wasm-utils.js';
import { createCanvasImports } from './canvas-wasm.js';
document.addEventListener('DOMContentLoaded', async () => {
    const wasmExports = await loadWasm('./canvas_example.wasm', { Canvas: createCanvasImports() });
    wasmExports.my_function();
});
