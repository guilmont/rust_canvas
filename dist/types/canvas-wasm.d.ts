export declare function getCanvasImports(): {
    Canvas: {
        register_canvas(namePtr: number, nameLen: number, canvasId: number): void;
        start_animation_loop: (canvasId: number) => void;
        stop_animation_loop: (canvasId: number) => void;
        height: (canvasId: number) => number;
        width: (canvasId: number) => number;
        set_height: (canvasId: number, height: number) => void;
        set_width: (canvasId: number, width: number) => void;
        font: (canvasId: number) => {
            ptr: number;
            len: number;
        };
        set_font: (canvasId: number, fontPtr: number, fontLen: number) => void;
        fill_text: (canvasId: number, textPtr: number, textLen: number, x: number, y: number) => void;
        measure_text_width: (canvasId: number, textPtr: number, textLen: number) => number;
        arc: (canvasId: number, x: number, y: number, radius: number, startAngle: number, endAngle: number) => void;
        begin_path: (canvasId: number) => void;
        clear_rect: (canvasId: number, x: number, y: number, width: number, height: number) => void;
        fill: (canvasId: number) => void;
        fill_rect: (canvasId: number, x: number, y: number, width: number, height: number) => void;
        line_to: (canvasId: number, x: number, y: number) => void;
        move_to: (canvasId: number, x: number, y: number) => void;
        stroke: (canvasId: number) => void;
        stroke_rect: (canvasId: number, x: number, y: number, width: number, height: number) => void;
        set_fill_color: (canvasId: number, r: number, g: number, b: number, a: number) => void;
        set_line_width: (canvasId: number, width: number) => void;
        set_stroke_color: (canvasId: number, r: number, g: number, b: number, a: number) => void;
    };
};
