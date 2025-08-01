// Example-specific WASM loader
// @ts-ignore
import { createCanvasWasmImports, setCanvasWasmExports } from './canvas-wasm.js';
export async function loadExampleWasm(wasmPath) {
    const wasmModule = await WebAssembly.instantiateStreaming(fetch(wasmPath), {
        ...createCanvasWasmImports()
    });
    const exports = wasmModule.instance.exports;
    setCanvasWasmExports(exports);
    return exports;
}
document.addEventListener('DOMContentLoaded', async () => {
    const wasmExports = await loadExampleWasm('./canvas_example.wasm');
    wasmExports.my_function();
});
