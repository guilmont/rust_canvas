// WASM exports registry and management

export interface WasmExports extends WebAssembly.Exports {
    memory: WebAssembly.Memory;
}

export async function loadWasm(wasmPath: string, importObject?: WebAssembly.Imports): Promise<WasmExports> {
    return WebAssembly.instantiateStreaming(
        fetch(wasmPath),
        {
            Browser: createBrowserImports(),
            Console: createConsoleImports(),
            ...importObject,
        })
        .then(result => {
            WASM_EXPORTS = result.instance.exports as WasmExports;
            return WASM_EXPORTS;
        });
}

export function getWasmExports(): WasmExports {
    if (!WASM_EXPORTS) {
        throw new Error("WASM exports not initialized. Call loadWasm() first.");
    }
    return WASM_EXPORTS;
}


/// Global variable to hold the WASM exports
let WASM_EXPORTS: WasmExports | null = null;


/// Import into WASM for console logging and browser interactions
function createConsoleImports() {
    return {
        log:   (ptr: number, len: number) => { console.log("[WASM]", decodeWasmString(ptr, len));   },
        error: (ptr: number, len: number) => { console.error("[WASM]", decodeWasmString(ptr, len)); },
    };
}

function createBrowserImports() {
    return {
        alert:    (ptr: number, len: number) => { window.alert(decodeWasmString(ptr, len)); },
        time_now: (): number => performance.now(),
        random:   (): number => Math.random(),
    };
}

/// Utility functions for string encoding/decoding in WASM
export function decodeWasmString(ptr: number, len: number): string {
    const wasmExports = getWasmExports();
    const bytes = new Uint8Array(wasmExports.memory.buffer, ptr, len);
    return new TextDecoder("utf-8").decode(bytes);
}

export function encodeWasmString(str: string): { ptr: number, len: number } {
    const wasmExports = getWasmExports();
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    const ptr = wasmExports.memory.grow(Math.ceil(bytes.length / 65536));
    const memoryBuffer = new Uint8Array(wasmExports.memory.buffer);
    memoryBuffer.set(bytes, ptr);
    return { ptr, len: bytes.length };
}
