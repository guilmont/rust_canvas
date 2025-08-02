// Example-specific WASM loader
import { loadWasm, WasmExports } from './wasm-utils.js';
import { getCanvasImports } from './canvas-wasm.js';

interface ExampleWasmExports extends WasmExports {
    main_function(): void;
}

document.addEventListener('DOMContentLoaded', async () => {
    const wasmExports = await loadWasm('./canvas_example.wasm', getCanvasImports());
    (wasmExports as ExampleWasmExports).main_function();
});
