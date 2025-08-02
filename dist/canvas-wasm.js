// Library for WASM canvas glue
import { decodeWasmString, encodeWasmString } from './wasm-utils.js';
import { getWasmExports } from './wasm-utils.js';
const CANVAS_REGISTRY = new Map();
export function getCanvasImports() {
    return { Canvas: {
            register_canvas(namePtr, nameLen, canvasId) {
                const name = decodeWasmString(namePtr, nameLen);
                const canvas = document.getElementById(name);
                const context = canvas.getContext('2d');
                CANVAS_REGISTRY.set(canvasId, { canvas, context, animationId: null, timer: null });
                canvas.addEventListener('mousemove', (event) => {
                    let expo = getWasmExports();
                    expo.on_mouse_move(canvasId, event.offsetX, event.offsetY);
                });
                canvas.addEventListener('mousedown', (event) => {
                    let expo = getWasmExports();
                    expo.on_mouse_down(canvasId, event.offsetX, event.offsetY);
                });
                canvas.addEventListener('mouseup', (event) => {
                    let expo = getWasmExports();
                    expo.on_mouse_up(canvasId, event.offsetX, event.offsetY);
                });
            },
            start_animation_loop: (canvasId) => {
                const canvasInfo = CANVAS_REGISTRY.get(canvasId);
                if (canvasInfo.animationId !== null)
                    return; // Already running
                function animationFrame() {
                    let currTime = performance.now();
                    let elapsed = currTime - (canvasInfo.timer || currTime);
                    canvasInfo.timer = currTime;
                    let expo = getWasmExports();
                    expo.on_animation_frame(canvasId, elapsed / 1000.0); // Convert to seconds
                    canvasInfo.animationId = requestAnimationFrame(animationFrame);
                }
                canvasInfo.timer = performance.now() - 16; // Start timer with a small offset for 60Hz
                canvasInfo.animationId = requestAnimationFrame(animationFrame);
            },
            stop_animation_loop: (canvasId) => {
                const canvasInfo = CANVAS_REGISTRY.get(canvasId);
                if (canvasInfo.animationId !== null) {
                    cancelAnimationFrame(canvasInfo.animationId);
                    canvasInfo.animationId = null;
                }
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
        } };
}
