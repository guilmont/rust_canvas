// WASM exports registry and management
export async function loadWasm(wasmPath, importObject) {
    return WebAssembly.instantiateStreaming(fetch(wasmPath), {
        Browser: createBrowserImports(),
        Console: createConsoleImports(),
        ...importObject,
    })
        .then(result => {
        WASM_EXPORTS = result.instance.exports;
        return WASM_EXPORTS;
    });
}
export function getWasmExports() {
    if (!WASM_EXPORTS) {
        throw new Error("WASM exports not initialized. Call loadWasm() first.");
    }
    return WASM_EXPORTS;
}
/// Global variable to hold the WASM exports
let WASM_EXPORTS = null;
/// Import into WASM for console logging and browser interactions
function createConsoleImports() {
    return {
        log: (ptr, len) => { console.log("[WASM]", decodeWasmString(ptr, len)); },
        error: (ptr, len) => { console.error("[WASM]", decodeWasmString(ptr, len)); },
    };
}
function createBrowserImports() {
    return {
        alert: (ptr, len) => { window.alert(decodeWasmString(ptr, len)); },
        time_now: () => performance.now(),
        random: () => Math.random(),
    };
}
/// Utility functions for string encoding/decoding in WASM
export function decodeWasmString(ptr, len) {
    const wasmExports = getWasmExports();
    const bytes = new Uint8Array(wasmExports.memory.buffer, ptr, len);
    return new TextDecoder("utf-8").decode(bytes);
}
export function encodeWasmString(str) {
    const wasmExports = getWasmExports();
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    const ptr = wasmExports.memory.grow(Math.ceil(bytes.length / 65536));
    const memoryBuffer = new Uint8Array(wasmExports.memory.buffer);
    memoryBuffer.set(bytes, ptr);
    return { ptr, len: bytes.length };
}
