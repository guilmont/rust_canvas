// Example-specific WASM loader
// @ts-ignore
import { WasmExports, createCanvasWasmImports, setCanvasWasmExports } from './canvas-wasm.js';

interface ExampleWasmExports extends WasmExports {
    my_function(): void;
}

export async function loadExampleWasm(wasmPath: string): Promise<ExampleWasmExports> {
    const wasmModule = await WebAssembly.instantiateStreaming(
        fetch(wasmPath),
        {
            ...createCanvasWasmImports()
        }
    );

    const exports = wasmModule.instance.exports as unknown as ExampleWasmExports;
    setCanvasWasmExports(exports);
    return exports;
}


document.addEventListener('DOMContentLoaded', async () => {
    const wasmExports = await loadExampleWasm('./canvas_example.wasm');
    wasmExports.my_function();
});
