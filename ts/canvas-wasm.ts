// Library for WASM canvas glue

interface CanvasInfo {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
}

export interface WasmExports extends WebAssembly.Exports {
    memory: WebAssembly.Memory;
    on_mouse_move(canvasId: number, x: number, y: number): void;
    on_mouse_down(canvasId: number, x: number, y: number): void;
    on_mouse_up(canvasId: number, x: number, y: number): void;
}

let WASM_CANVAS: WasmExports;
const CANVAS_REGISTRY: Map<number, CanvasInfo> = new Map();

function decodeWasmString(ptr: number, len: number): string {
    const bytes = new Uint8Array(WASM_CANVAS.memory.buffer, ptr, len);
    return new TextDecoder("utf-8").decode(bytes);
}

function encodeWasmString(str: string): { ptr: number, len: number } {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    const ptr = WASM_CANVAS.memory.grow(Math.ceil(bytes.length / 65536));
    const memoryBuffer = new Uint8Array((globalThis as any).WASM_CANVAS.memory.buffer);
    memoryBuffer.set(bytes, ptr);
    return { ptr, len: bytes.length };
}

function createCanvasImports() {
    return {
        register_canvas(namePtr: number, nameLen: number, canvasId: number) {
            const name = decodeWasmString(namePtr, nameLen);
            const canvas = document.getElementById(name)! as HTMLCanvasElement;
            const context = canvas.getContext('2d')! as CanvasRenderingContext2D;
            CANVAS_REGISTRY.set(canvasId, { canvas, context });
            canvas.addEventListener('mousemove', (event) => {
                WASM_CANVAS.on_mouse_move(canvasId, event.offsetX, event.offsetY);
            });
            canvas.addEventListener('mousedown', (event) => {
                WASM_CANVAS.on_mouse_down(canvasId, event.offsetX, event.offsetY);
            });
            canvas.addEventListener('mouseup', (event) => {
                WASM_CANVAS.on_mouse_up(canvasId, event.offsetX, event.offsetY);
            });
        },
        // --- Canvas Dimensions ---
        height:     (canvasId: number): number         => { return CANVAS_REGISTRY.get(canvasId)!.canvas.height;   },
        width:      (canvasId: number): number         => { return CANVAS_REGISTRY.get(canvasId)!.canvas.width;    },
        set_height: (canvasId: number, height: number) => { CANVAS_REGISTRY.get(canvasId)!.canvas.height = height; },
        set_width:  (canvasId: number, width: number)  => { CANVAS_REGISTRY.get(canvasId)!.canvas.width = width;   },

        // --- Font & Text ---
        font: (canvasId: number) => {
            return encodeWasmString(CANVAS_REGISTRY.get(canvasId)!.context.font);
        },
        set_font: (canvasId: number, fontPtr: number, fontLen: number) => {
            CANVAS_REGISTRY.get(canvasId)!.context.font = `${decodeWasmString(fontPtr, fontLen)}`;
        },
        fill_text: (canvasId: number, textPtr: number, textLen: number, x: number, y: number) => {
            const text = decodeWasmString(textPtr, textLen);
            CANVAS_REGISTRY.get(canvasId)!.context.fillText(text, x, y);
        },
        measure_text_width: (canvasId: number, textPtr: number, textLen: number): number => {
            const text = decodeWasmString(textPtr, textLen);
            const ctx = CANVAS_REGISTRY.get(canvasId)!.context;
            ctx.save();
            const width = ctx.measureText(text).width;
            ctx.restore();
            return width;
        },

        // --- Drawing Primitives ---
        arc: (canvasId: number, x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
            CANVAS_REGISTRY.get(canvasId)!.context.arc(x, y, radius, startAngle, endAngle);
        },
        begin_path: (canvasId: number) => {
            CANVAS_REGISTRY.get(canvasId)!.context.beginPath();
        },
        clear_rect: (canvasId: number, x: number, y: number, width: number, height: number) => {
            CANVAS_REGISTRY.get(canvasId)!.context.clearRect(x, y, width, height);
        },
        fill: (canvasId: number) => {
            CANVAS_REGISTRY.get(canvasId)!.context.fill();
        },
        fill_rect: (canvasId: number, x: number, y: number, width: number, height: number) => {
            CANVAS_REGISTRY.get(canvasId)!.context.fillRect(x, y, width, height);
        },
        line_to: (canvasId: number, x: number, y: number) => {
            CANVAS_REGISTRY.get(canvasId)!.context.lineTo(x, y);
        },
        move_to: (canvasId: number, x: number, y: number) => {
            CANVAS_REGISTRY.get(canvasId)!.context.moveTo(x, y);
        },
        stroke: (canvasId: number) => {
            CANVAS_REGISTRY.get(canvasId)!.context.stroke();
        },
        stroke_rect: (canvasId: number, x: number, y: number, width: number, height: number) => {
            CANVAS_REGISTRY.get(canvasId)!.context.strokeRect(x, y, width, height);
        },

        // --- Color & Styling ---
        set_fill_color: (canvasId: number, r: number, g: number, b: number, a: number) => {
            CANVAS_REGISTRY.get(canvasId)!.context.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
        },
        set_line_width: (canvasId: number, width: number) => {
            CANVAS_REGISTRY.get(canvasId)!.context.lineWidth = width;
        },
        set_stroke_color: (canvasId: number, r: number, g: number, b: number, a: number) => {
            CANVAS_REGISTRY.get(canvasId)!.context.strokeStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
        },
    };
}

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

// WASM_CANVAS is set by the application when it loads the WASM module
export function setWasmExports(exports: WasmExports): void {
    WASM_CANVAS = exports;
}

export function createWasmImports() {
    return {
        Browser: createBrowserImports(),
        Canvas: createCanvasImports(),
        Console: createConsoleImports(),
    };
}
