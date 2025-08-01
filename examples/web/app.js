// @ts-ignore
import { loadCanvasWasm } from './canvas-wasm.js';
document.addEventListener('DOMContentLoaded', async () => {
    await loadCanvasWasm('./web_canvas.wasm');
});
