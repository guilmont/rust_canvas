// Example event handler implementation
use web_canvas::canvas;
use web_canvas::console;

struct DrawingTool;

impl canvas::EventHandler for DrawingTool {
    fn on_mouse_down(&mut self, canvas: &canvas::Canvas, x: f32, y: f32) {
        canvas.set_fill_color(canvas::RED, 1.0);
        canvas.fill_rect(x - 5.0, y - 5.0, 10.0, 10.0);
    }

    fn on_mouse_move(&mut self, canvas: &canvas::Canvas, x: f32, y: f32) {
        canvas.set_font("10px sans-serif");
        canvas.clear_rect(0.0, 0.0, 80.0, 16.0);
        canvas.set_fill_color(canvas::BLACK, 1.0);

        let text = format!("x: {:.0}, y: {:.0}", x, y);
        canvas.fill_text(&text, 10.0, 10.0);
    }

    fn on_mouse_up(&mut self, canvas: &canvas::Canvas, x: f32, y: f32) {
        canvas.draw_circle(x, y, 8.0, canvas::TAB_BLUE);
    }

    fn on_animation_frame(&mut self, canvas: &canvas::Canvas, elapsed: f32) {
        let w = 70.0;
        let h = 20.0;
        let x = canvas.width() - w;
        let y = canvas.height() - h;
        let text = format!("{:.3} secs", elapsed);

        canvas.set_fill_color(canvas::WHITE, 1.0);
        canvas.fill_rect(x, y, w, h);

        canvas.set_fill_color(canvas::BLACK, 1.0);
        canvas.fill_text(&text, x + 10.0, y + h - 5.0);
    }
}

#[no_mangle]
pub fn main_function() {
    // Example: draw a circle and show mouse coordinates
    console::log("Hello from Example!");

    let cv = canvas::Canvas::new("example-canvas", Some(DrawingTool));

    cv.set_fill_color(canvas::LIGHT_GRAY, 1.0);
    cv.fill_rect(0.0, 0.0, cv.width(), cv.height());
    cv.draw_circle(100.0, 100.0, 50.0, canvas::TAB_BLUE);

    cv.start_animation_loop();
    console::log("Animation loop started.");
}

// Required for cargo example build, but not used for WASM entry.
fn main() {}
