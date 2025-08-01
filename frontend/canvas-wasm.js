// Library for WASM canvas glue
let WASM_CANVAS;
const CANVAS_REGISTRY = new Map();
function decodeWasmString(ptr, len) {
    const bytes = new Uint8Array(WASM_CANVAS.memory.buffer, ptr, len);
    return new TextDecoder("utf-8").decode(bytes);
}
function encodeWasmString(str) {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    const ptr = WASM_CANVAS.memory.grow(Math.ceil(bytes.length / 65536));
    const memoryBuffer = new Uint8Array(globalThis.WASM_CANVAS.memory.buffer);
    memoryBuffer.set(bytes, ptr);
    return { ptr, len: bytes.length };
}
function createCanvasImports() {
    return {
        register_canvas(namePtr, nameLen, canvasId) {
            const name = decodeWasmString(namePtr, nameLen);
            const canvas = document.getElementById(name);
            const context = canvas.getContext('2d');
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
        height: (canvasId) => { return CANVAS_REGISTRY.get(canvasId).canvas.height; },
        width: (canvasId) => { return CANVAS_REGISTRY.get(canvasId).canvas.width; },
        set_height: (canvasId, height) => { CANVAS_REGISTRY.get(canvasId).canvas.height = height; },
        set_width: (canvasId, width) => { CANVAS_REGISTRY.get(canvasId).canvas.width = width; },
        // --- Font & Text ---
        font: (canvasId) => {
            return encodeWasmString(CANVAS_REGISTRY.get(canvasId).context.font);
        },
        set_font: (canvasId, fontPtr, fontLen) => {
            CANVAS_REGISTRY.get(canvasId).context.font = `${decodeWasmString(fontPtr, fontLen)}`;
        },
        fill_text: (canvasId, textPtr, textLen, x, y) => {
            const text = decodeWasmString(textPtr, textLen);
            CANVAS_REGISTRY.get(canvasId).context.fillText(text, x, y);
        },
        measure_text_width: (canvasId, textPtr, textLen) => {
            const text = decodeWasmString(textPtr, textLen);
            const ctx = CANVAS_REGISTRY.get(canvasId).context;
            ctx.save();
            const width = ctx.measureText(text).width;
            ctx.restore();
            return width;
        },
        // --- Drawing Primitives ---
        arc: (canvasId, x, y, radius, startAngle, endAngle) => {
            CANVAS_REGISTRY.get(canvasId).context.arc(x, y, radius, startAngle, endAngle);
        },
        begin_path: (canvasId) => {
            CANVAS_REGISTRY.get(canvasId).context.beginPath();
        },
        clear_rect: (canvasId, x, y, width, height) => {
            CANVAS_REGISTRY.get(canvasId).context.clearRect(x, y, width, height);
        },
        fill: (canvasId) => {
            CANVAS_REGISTRY.get(canvasId).context.fill();
        },
        fill_rect: (canvasId, x, y, width, height) => {
            CANVAS_REGISTRY.get(canvasId).context.fillRect(x, y, width, height);
        },
        line_to: (canvasId, x, y) => {
            CANVAS_REGISTRY.get(canvasId).context.lineTo(x, y);
        },
        move_to: (canvasId, x, y) => {
            CANVAS_REGISTRY.get(canvasId).context.moveTo(x, y);
        },
        stroke: (canvasId) => {
            CANVAS_REGISTRY.get(canvasId).context.stroke();
        },
        stroke_rect: (canvasId, x, y, width, height) => {
            CANVAS_REGISTRY.get(canvasId).context.strokeRect(x, y, width, height);
        },
        // --- Color & Styling ---
        set_fill_color: (canvasId, r, g, b, a) => {
            CANVAS_REGISTRY.get(canvasId).context.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
        },
        set_line_width: (canvasId, width) => {
            CANVAS_REGISTRY.get(canvasId).context.lineWidth = width;
        },
        set_stroke_color: (canvasId, r, g, b, a) => {
            CANVAS_REGISTRY.get(canvasId).context.strokeStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
        },
    };
}
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
// WASM_CANVAS is set by the application when it loads the WASM module
export function setWasmExports(exports) {
    WASM_CANVAS = exports;
}
export function createWasmImports() {
    return {
        Browser: createBrowserImports(),
        Canvas: createCanvasImports(),
        Console: createConsoleImports(),
    };
}
