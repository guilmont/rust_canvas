// Library for WASM canvas glue

import { decodeWasmString, encodeWasmString } from './wasm-utils.js';
import { getWasmExports, WasmExports } from './wasm-utils.js';


export interface CanvasExports extends WasmExports {
    on_mouse_move(canvasId: number, x: number, y: number): void;
    on_mouse_down(canvasId: number, x: number, y: number): void;
    on_mouse_up(canvasId: number, x: number, y: number): void;
}

interface CanvasInfo {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
}

const CANVAS_REGISTRY: Map<number, CanvasInfo> = new Map();

export function createCanvasImports() {
    return {
        register_canvas(namePtr: number, nameLen: number, canvasId: number) {
            const name = decodeWasmString(namePtr, nameLen);
            const canvas = document.getElementById(name)! as HTMLCanvasElement;
            const context = canvas.getContext('2d')! as CanvasRenderingContext2D;
            CANVAS_REGISTRY.set(canvasId, { canvas, context });
            canvas.addEventListener('mousemove', (event) => {
                let expo = getWasmExports() as CanvasExports;
                expo.on_mouse_move(canvasId, event.offsetX, event.offsetY);
            });
            canvas.addEventListener('mousedown', (event) => {
                let expo = getWasmExports() as CanvasExports;
                expo.on_mouse_down(canvasId, event.offsetX, event.offsetY);
            });
            canvas.addEventListener('mouseup', (event) => {
                let expo = getWasmExports() as CanvasExports;
                expo.on_mouse_up(canvasId, event.offsetX, event.offsetY);
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


