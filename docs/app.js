import { loadWasm } from './wasm-utils.js';
import { getCanvasImports } from './canvas-wasm.js';

document.addEventListener('DOMContentLoaded', async () => {
    const wasmExports = await loadWasm('./pong.wasm', getCanvasImports());
    wasmExports.main_function();
});
