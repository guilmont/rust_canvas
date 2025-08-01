// Example-specific WASM loader
import { loadWasm, WasmExports } from './wasm-utils.js';
import { createCanvasImports } from './canvas-wasm.js';

interface ExampleWasmExports extends WasmExports {
    my_function(): void;
}

document.addEventListener('DOMContentLoaded', async () => {
    const wasmExports = await loadWasm('./canvas_example.wasm', { Canvas: createCanvasImports() });
    (wasmExports as ExampleWasmExports).my_function();
});
