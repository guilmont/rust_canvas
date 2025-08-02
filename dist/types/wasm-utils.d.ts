export interface WasmExports extends WebAssembly.Exports {
    memory: WebAssembly.Memory;
}
export declare function loadWasm(wasmPath: string, importObject?: WebAssembly.Imports): Promise<WasmExports>;
export declare function getWasmExports(): WasmExports;
export declare function decodeWasmString(ptr: number, len: number): string;
export declare function encodeWasmString(str: string): {
    ptr: number;
    len: number;
};
