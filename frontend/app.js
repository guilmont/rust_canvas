"use strict";
let WASM;
let CANVAS_REGISTRY = new Map();
// Helper function to decode WASM strings
function decodeWasmString(ptr, len) {
    const bytes = new Uint8Array(WASM.memory.buffer, ptr, len);
    return new TextDecoder("utf-8").decode(bytes);
}
// Helper function to encode strings to WASM memory
function encodeWasmString(str) {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    const ptr = WASM.memory.grow(Math.ceil(bytes.length / 65536)); // Grow memory if needed
    const memoryBuffer = new Uint8Array(WASM.memory.buffer);
    memoryBuffer.set(bytes, ptr);
    return { ptr, len: bytes.length };
}
function createCanvasImports() {
    return {
        // --- Canvas Registration & Events ---
        register_canvas(namePtr, nameLen, canvasId) {
            const name = decodeWasmString(namePtr, nameLen);
            const canvas = document.getElementById(name);
            const context = canvas.getContext('2d');
            CANVAS_REGISTRY.set(canvasId, { canvas, context });
            canvas.addEventListener('mousemove', (event) => {
                WASM.on_mouse_move(canvasId, event.offsetX, event.offsetY);
            });
            canvas.addEventListener('mousedown', (event) => {
                WASM.on_mouse_down(canvasId, event.offsetX, event.offsetY);
            });
            canvas.addEventListener('mouseup', (event) => {
                WASM.on_mouse_up(canvasId, event.offsetX, event.offsetY);
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
            // CANVAS_REGISTRY.get(canvasId)!.context.font = `${decodeWasmString(fontPtr, fontLen)}`;
            CANVAS_REGISTRY.get(canvasId).canvas.style.font = decodeWasmString(fontPtr, fontLen);
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
async function loadWasm() {
    try {
        const wasmModule = await WebAssembly.instantiateStreaming(fetch('./web_canvas.wasm'), {
            Browser: createBrowserImports(),
            Canvas: createCanvasImports(),
            Console: createConsoleImports(),
        });
        WASM = wasmModule.instance.exports;
        console.log("WebAssembly loaded successfully!");
    }
    catch (error) {
        console.error("Failed to load WebAssembly:", error);
    }
}
/////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////
// Initialize when page loads
document.addEventListener('DOMContentLoaded', async () => {
    // Load the WebAssembly module
    await loadWasm();
    WASM.my_function();
});
