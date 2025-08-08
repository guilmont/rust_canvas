#![allow(dead_code)]

use crate::console;

/// Matplotlib-inspired color palette ////////////////////////////////////////////////////

pub type Color = (u8, u8, u8);

// Basic colors
pub const BLACK: Color = (0, 0, 0);
pub const DARK_GRAY: Color = (64, 64, 64);
pub const LIGHT_GRAY: Color = (200, 200, 200);
pub const WHITE: Color = (255, 255, 255);
pub const RED: Color = (255, 0, 0);
pub const GREEN: Color = (0, 255, 0);
pub const BLUE: Color = (0, 0, 255);
pub const MAGENTA: Color = (255, 0, 255);
pub const YELLOW: Color = (255, 255, 0);
pub const CYAN: Color = (0, 255, 255);

// Matplotlib default color cycle (C0-C9)
pub const TAB_BLUE: Color = (31, 119, 180);    // #1f77b4
pub const TAB_ORANGE: Color = (255, 127, 14);  // #ff7f0e
pub const TAB_GREEN: Color = (44, 160, 44);    // #2ca02c
pub const TAB_RED: Color = (214, 39, 40);      // #d62728
pub const TAB_PURPLE: Color = (148, 103, 189); // #9467bd
pub const TAB_BROWN: Color = (140, 86, 75);    // #8c564b
pub const TAB_PINK: Color = (227, 119, 194);   // #e377c2
pub const TAB_GRAY: Color = (127, 127, 127);   // #7f7f7f
pub const TAB_OLIVE: Color = (188, 189, 34);   // #bcbd22
pub const TAB_CYAN: Color = (23, 190, 207);    // #17becf

/// Event handler trait for canvas events ///////////////////////////////////////////////

pub trait EventHandler {
    fn on_mouse_move(&mut self, _canvas: &Canvas, _x: f32, _y: f32) {}
    fn on_mouse_down(&mut self, _canvas: &Canvas, _x: f32, _y: f32, _button: MouseButton) {}
    fn on_mouse_up(&mut self, _canvas: &Canvas, _x: f32, _y: f32, _button: MouseButton) {}
    fn on_double_click(&mut self, _canvas: &Canvas, _x: f32, _y: f32, _button: MouseButton) {}
    fn on_wheel(&mut self, _canvas: &Canvas, _x: f32, _y: f32, _delta_y: f32) {}
    fn on_animation_frame(&mut self, _canvas: &Canvas, _elapsed: f32) {}
    fn on_key_down(&mut self, _canvas: &Canvas, _key_code: KeyCode) {}
    fn on_key_up(&mut self, _canvas: &Canvas, _key_code: KeyCode) {}
}

/// Mouse button types
#[derive(Debug, Clone, Copy, PartialEq)]
pub enum MouseButton {
    Left = 0,
    Middle = 1,
    Right = 2,
    Unknown = 255,
}

/// Keyboard key types
#[derive(Debug, Clone, Copy, PartialEq)]
pub enum KeyCode {
    // Numbers
    Key0 = 48,
    Key1 = 49,
    Key2 = 50,
    Key3 = 51,
    Key4 = 52,
    Key5 = 53,
    Key6 = 54,
    Key7 = 55,
    Key8 = 56,
    Key9 = 57,

    // Letters
    A = 65,
    B = 66,
    C = 67,
    D = 68,
    E = 69,
    F = 70,
    G = 71,
    H = 72,
    I = 73,
    J = 74,
    K = 75,
    L = 76,
    M = 77,
    N = 78,
    O = 79,
    P = 80,
    Q = 81,
    R = 82,
    S = 83,
    T = 84,
    U = 85,
    V = 86,
    W = 87,
    X = 88,
    Y = 89,
    Z = 90,

    // Arrow keys
    ArrowLeft = 37,
    ArrowUp = 38,
    ArrowRight = 39,
    ArrowDown = 40,

    // Special keys
    Space = 32,
    Enter = 13,
    Escape = 27,
    Tab = 9,
    Shift = 16,
    Ctrl = 17,
    Alt = 18,

    // Symbols
    Minus = 189,      // -
    Equal = 187,      // = (and + with Shift)

    Unknown = 65535,
}

/// Canvas object that encapsulates canvas operations ///////////////////////////////////

#[derive(Clone)]
pub struct Canvas {
    id: u32,
}

impl Canvas {
    /// Create a Canvas handle for an existing HTML canvas element with the given name
    pub fn from_element(name: &str) -> Canvas {
        // Hash the canvas name to create a unique ID
        // This is a simple hash function, the djb2 hash function
        let mut canvas_id: u32 = 5381;
        for b in name.bytes() {
            canvas_id = ((canvas_id << 5).wrapping_add(canvas_id)).wrapping_add(b as u32);
        }

        // Register the canvas if it doesn't exist yet and prepare terrain at the browser
        WASM_REGISTERED_CANVASES.with(|registered| {
            if !registered.borrow().contains(&canvas_id) {
                unsafe { js::register_canvas(name.as_ptr(), name.len(), canvas_id); }
                registered.borrow_mut().push(canvas_id);
            }
        });

        // Return a new Canvas instance by value
        Canvas { id: canvas_id }
    }

    /// Register event handler for HTML canvas
    pub fn register_handler<T: EventHandler + 'static>(&self, event_handler: T) {
        // Store event handler separately if provided
        WASM_EVENT_HANDLERS.with(|handlers| {
            handlers.borrow_mut().insert(self.id, Box::new(event_handler));
        });
    }

    /// Get the unique ID of this canvas
    pub fn id(&self) -> u32 { self.id }

    /// Start the animation loop for this canvas
    pub fn start_animation_loop(&self) { unsafe { js::start_animation_loop(self.id); } }
    /// Stop the animation loop for this canvas
    pub fn stop_animation_loop(&self) { unsafe { js::stop_animation_loop(self.id); } }

    /// Get canvas width
    pub fn width(&self) -> f32 { unsafe { js::width(self.id) } }

    /// Get canvas height
    pub fn height(&self) -> f32 { unsafe { js::height(self.id) } }

    /// Measures the width of a given text with a specified font.
    pub fn measure_text_width(&self, text: &str, font: &str) -> f32 {
        unsafe {
            js::set_font(self.id, font.as_ptr(), font.len());
            js::measure_text_width(self.id, text.as_ptr(), text.len())
        }
    }

    /// Clears the entire canvas
    pub fn clear(&self) {
        unsafe { js::clear_rect(self.id, 0.0, 0.0, js::width(self.id), js::height(self.id)) };
    }

    /// Clears a rectangular area on the canvas
    pub fn clear_rect(&self, x: f32, y: f32, width: f32, height: f32) {
        unsafe { js::clear_rect(self.id, x, y, width, height) };
    }

    /// Draws a filled rectangle at (x, y) with given dimensions, rotation angle and color
    pub fn fill_rect(&self, x: f32, y: f32, width: f32, height: f32, angle: f32, color: Color) {
        self.set_fill_style(color);
        if angle == 0.0 {
            // Use optimized fill_rect for non-rotated rectangles
            unsafe { js::fill_rect(self.id, x, y, width, height); }
        } else {
            self.draw_rect_path(x, y, width, height, angle);
            unsafe { js::fill(self.id); }
        }
    }

    /// Draws a stroked rectangle at (x, y) with given dimensions, rotation angle, line width and color
    pub fn stroke_rect(&self, x: f32, y: f32, width: f32, height: f32, angle: f32, line_width: f32, color: Color) {
        self.set_stroke_style(color, line_width);
        if angle == 0.0 {
            // Use optimized stroke_rect for non-rotated rectangles
            unsafe { js::stroke_rect(self.id, x, y, width, height); }
        } else {
            self.draw_rect_path(x, y, width, height, angle);
            unsafe { js::stroke(self.id); }
        }
    }

    /// Draws a filled circle at (x, y) with given radius and color
    pub fn fill_circle(&self, x: f32, y: f32, radius: f32, color: Color) {
        self.set_fill_style(color);
        self.draw_circle_path(x, y, radius);
        unsafe { js::fill(self.id); }
    }

    /// Draws a stroked circle at (x, y) with given radius, line width and color
    pub fn stroke_circle(&self, x: f32, y: f32, radius: f32, line_width: f32, color: Color) {
        self.set_stroke_style(color, line_width);
        self.draw_circle_path(x, y, radius);
        unsafe { js::stroke(self.id); }
    }

    /// Draws a line from (x1, y1) to (x2, y2) with given line width and color
    pub fn draw_line(&self, x1: f32, y1: f32, x2: f32, y2: f32, line_width: f32, color: Color) {
        self.set_stroke_style(color, line_width);
        unsafe {
            js::begin_path(self.id);
            js::move_to(self.id, x1, y1);
            js::line_to(self.id, x2, y2);
            js::stroke(self.id);
        }
    }

    /// Draws text at (x, y) with given font and color
    pub fn draw_text(&self, text: &str, x: f32, y: f32, font: &str, color: Color) {
        self.set_fill_style(color);
        unsafe {
            js::set_font(self.id, font.as_ptr(), font.len());
            js::fill_text(self.id, text.as_ptr(), text.len(), x, y);
        }
    }

    /// Draws a filled triangle centered at (x, y) with given size, rotation angle and color
    pub fn fill_triangle(&self, x: f32, y: f32, size: f32, angle: f32, color: Color) {
        self.set_fill_style(color);
        self.draw_triangle_path(x, y, size, angle);
        unsafe { js::fill(self.id); }
    }

    /// Draws a stroked triangle centered at (x, y) with given size, rotation angle, line width and color
    pub fn stroke_triangle(&self, x: f32, y: f32, size: f32, angle: f32, line_width: f32, color: Color) {
        self.set_stroke_style(color, line_width);
        self.draw_triangle_path(x, y, size, angle);
        unsafe { js::stroke(self.id); }
    }

    /// Draws an arrow from (x1, y1) to (x2, y2) with given line width and color
    pub fn draw_arrow(&self, x1: f32, y1: f32, x2: f32, y2: f32, line_width: f32, color: Color) {
        // Skip drawing if the length is too small to be visible
        let length = ((x2 - x1).powi(2) + (y2 - y1).powi(2)).sqrt();
        if length < line_width { return; }

        // Draw the main line
        self.draw_line(x1, y1, x2, y2, line_width, color);

        let height = 6.0 * line_width;
        let angle = (y2 - y1).atan2(x2 - x1);

        // Draw arrowhead
        self.fill_triangle(x2 - height * angle.cos(), y2 - height * angle.sin(), height, angle, color);
    }

    /// Draws a curve by connecting points with given line width and color
    /// x_points and y_points must have the same length
    pub fn stroke_curve(&self, x_points: &[f32], y_points: &[f32], line_width: f32, color: Color) {
        if x_points.len() != y_points.len() || x_points.len() < 2 {
            console::error("stroke_curve: x_points and y_points must have the same length and at least 2 points");
            console::error(format!("x_points: {:?}, y_points: {:?}", x_points, y_points).as_str());
            console::error(format!("Length: {}", x_points.len()).as_str());
            console::error(format!("Returning without drawing curve").as_str());
            return;
        }

        self.set_stroke_style(color, line_width);
        unsafe {
            js::begin_path(self.id);
            js::move_to(self.id, x_points[0], y_points[0]);

            for i in 1..x_points.len() {
                js::line_to(self.id, x_points[i], y_points[i]);
            }

            js::stroke(self.id);
        }
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////
    /// PRIVATE METHODS

    // Helper methods to reduce duplication
    fn set_fill_style(&self, color: Color) {
        unsafe { js::set_fill_color(self.id, color.0, color.1, color.2, 1.0); }
    }

    fn set_stroke_style(&self, color: Color, line_width: f32) {
        unsafe {
            js::set_stroke_color(self.id, color.0, color.1, color.2, 1.0);
            js::set_line_width(self.id, line_width);
        }
    }

    fn draw_rect_path(&self, x: f32, y: f32, width: f32, height: f32, angle: f32) {
        unsafe {
            if angle == 0.0 {
                // Simple case - no rotation, but we still need to create a path for consistency
                js::begin_path(self.id);
                js::move_to(self.id, x, y);
                js::line_to(self.id, x + width, y);
                js::line_to(self.id, x + width, y + height);
                js::line_to(self.id, x, y + height);
                js::line_to(self.id, x, y);
            } else {
                // Rotated rectangle using path
                let cos_a = angle.cos();
                let sin_a = angle.sin();
                let hw = width / 2.0;
                let hh = height / 2.0;

                // Calculate corners relative to center, then translate
                let cx = x + hw;
                let cy = y + hh;

                js::begin_path(self.id);
                js::move_to(self.id, cx + (-hw * cos_a - -hh * sin_a), cy + (-hw * sin_a + -hh * cos_a));
                js::line_to(self.id, cx + (hw * cos_a - -hh * sin_a), cy + (hw * sin_a + -hh * cos_a));
                js::line_to(self.id, cx + (hw * cos_a - hh * sin_a), cy + (hw * sin_a + hh * cos_a));
                js::line_to(self.id, cx + (-hw * cos_a - hh * sin_a), cy + (-hw * sin_a + hh * cos_a));
                js::line_to(self.id, cx + (-hw * cos_a - -hh * sin_a), cy + (-hw * sin_a + -hh * cos_a));
            }
        }
    }

    fn draw_circle_path(&self, x: f32, y: f32, radius: f32) {
        unsafe {
            js::begin_path(self.id);
            js::arc(self.id, x, y, radius, 0.0, 2.0 * std::f32::consts::PI);
        }
    }

    fn draw_triangle_path(&self, x: f32, y: f32, size: f32, angle: f32) {
        let h = size; // height from center to tip
        let w = size * 0.6; // width of the base
        // Calculate the three vertices
        let tip_x = x + h * angle.cos();
        let tip_y = y + h * angle.sin();
        let base_angle1 = angle + std::f32::consts::PI * 2.0 / 3.0;
        let base_angle2 = angle - std::f32::consts::PI * 2.0 / 3.0;
        let base1_x = x + w * base_angle1.cos();
        let base1_y = y + w * base_angle1.sin();
        let base2_x = x + w * base_angle2.cos();
        let base2_y = y + w * base_angle2.sin();

        unsafe {
            js::begin_path(self.id);
            js::move_to(self.id, tip_x, tip_y);
            js::line_to(self.id, base1_x, base1_y);
            js::line_to(self.id, base2_x, base2_y);
            js::line_to(self.id, tip_x, tip_y);
        }
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////

use std::cell::RefCell;
use std::collections::HashMap;
thread_local! {
    static WASM_EVENT_HANDLERS: RefCell<HashMap<u32, Box<dyn EventHandler>>> = RefCell::new(HashMap::new());
    // And don't expect to have too many canvases, so a vector should be fine.
    static WASM_REGISTERED_CANVASES: RefCell<Vec<u32>> = RefCell::new(Vec::new());
}

/// WASM-exported mouse event handlers
#[no_mangle]
pub extern "C" fn on_mouse_move(canvas_id: u32, x: f32, y: f32) {
    WASM_EVENT_HANDLERS.with(|handlers| {
        let mut handlers_ref = handlers.borrow_mut();
        if let Some(mut handler) = handlers_ref.remove(&canvas_id) {
            let canvas = Canvas { id: canvas_id };
            handler.on_mouse_move(&canvas, x, y);
            handlers_ref.insert(canvas_id, handler);
        }
    });
}

#[no_mangle]
pub extern "C" fn on_mouse_down(canvas_id: u32, x: f32, y: f32, button: u32) {
    WASM_EVENT_HANDLERS.with(|handlers| {
        let mut handlers_ref = handlers.borrow_mut();
        if let Some(mut handler) = handlers_ref.remove(&canvas_id) {
            let canvas = Canvas { id: canvas_id };
            handler.on_mouse_down(&canvas, x, y, MouseButton::from(button));
            handlers_ref.insert(canvas_id, handler);
        }
    });
}

#[no_mangle]
pub extern "C" fn on_mouse_up(canvas_id: u32, x: f32, y: f32, button: u32) {
    WASM_EVENT_HANDLERS.with(|handlers| {
        let mut handlers_ref = handlers.borrow_mut();
        if let Some(mut handler) = handlers_ref.remove(&canvas_id) {
            let canvas = Canvas { id: canvas_id };
            handler.on_mouse_up(&canvas, x, y, MouseButton::from(button));
            handlers_ref.insert(canvas_id, handler);
        }
    });
}

#[no_mangle]
pub extern "C" fn on_double_click(canvas_id: u32, x: f32, y: f32, button: u32) {
    WASM_EVENT_HANDLERS.with(|handlers| {
        let mut handlers_ref = handlers.borrow_mut();
        if let Some(mut handler) = handlers_ref.remove(&canvas_id) {
            let canvas = Canvas { id: canvas_id };
            handler.on_double_click(&canvas, x, y, MouseButton::from(button));
            handlers_ref.insert(canvas_id, handler);
        }
    });
}

#[no_mangle]
pub extern "C" fn on_animation_frame(canvas_id: u32, elapsed: f32) {
    WASM_EVENT_HANDLERS.with(|handlers| {
        let mut handlers_ref = handlers.borrow_mut();
        if let Some(mut handler) = handlers_ref.remove(&canvas_id) {
            let canvas = Canvas { id: canvas_id };
            handler.on_animation_frame(&canvas, elapsed);
            handlers_ref.insert(canvas_id, handler);
        }
    });
}

#[no_mangle]
pub extern "C" fn on_key_down(canvas_id: u32, key_code: u32) {
    WASM_EVENT_HANDLERS.with(|handlers| {
        let mut handlers_ref = handlers.borrow_mut();
        if let Some(mut handler) = handlers_ref.remove(&canvas_id) {
            let canvas = Canvas { id: canvas_id };
            handler.on_key_down(&canvas, KeyCode::from(key_code));
            handlers_ref.insert(canvas_id, handler);
        }
    });
}

#[no_mangle]
pub extern "C" fn on_key_up(canvas_id: u32, key_code: u32) {
    WASM_EVENT_HANDLERS.with(|handlers| {
        let mut handlers_ref = handlers.borrow_mut();
        if let Some(mut handler) = handlers_ref.remove(&canvas_id) {
            let canvas = Canvas { id: canvas_id };
            handler.on_key_up(&canvas, KeyCode::from(key_code));
            handlers_ref.insert(canvas_id, handler);
        }
    });
}

#[no_mangle]
pub extern "C" fn on_wheel(canvas_id: u32, x: f32, y: f32, delta_y: f32) {
    WASM_EVENT_HANDLERS.with(|handlers| {
        let mut handlers_ref = handlers.borrow_mut();
        if let Some(mut handler) = handlers_ref.remove(&canvas_id) {
            let canvas = Canvas { id: canvas_id };
            handler.on_wheel(&canvas, x, y, delta_y);
            handlers_ref.insert(canvas_id, handler);
        }
    });
}

/// API imported from JavaScript at the browser //////////////////////////////////////////
mod js {
    #[link(wasm_import_module = "Canvas")]
    extern "C" {
        pub fn register_canvas(name_ptr: *const u8, name_len: usize, canvas_id: u32);
        pub fn start_animation_loop(canvas_id: u32);
        pub fn stop_animation_loop(canvas_id: u32);
        pub fn arc(canvas_id: u32, x: f32, y: f32, radius: f32, start_angle: f32, end_angle: f32);
        pub fn begin_path(canvas_id: u32);
        pub fn clear_rect(canvas_id: u32, x: f32, y: f32, width: f32, height: f32);
        pub fn fill(canvas_id: u32);
        pub fn fill_rect(canvas_id: u32, x: f32, y: f32, width: f32, height: f32);
        pub fn height(canvas_id: u32) -> f32;
        pub fn line_to(canvas_id: u32, x: f32, y: f32);
        pub fn move_to(canvas_id: u32, x: f32, y: f32);
        pub fn set_fill_color(canvas_id: u32, r: u8, g: u8, b: u8, a: f32);
        pub fn set_line_width(canvas_id: u32, width: f32);
        pub fn set_stroke_color(canvas_id: u32, r: u8, g: u8, b: u8, a: f32);
        pub fn stroke(canvas_id: u32);
        pub fn stroke_rect(canvas_id: u32, x: f32, y: f32, width: f32, height: f32);
        pub fn width(canvas_id: u32) -> f32;
        pub fn fill_text(canvas_id: u32, text_ptr: *const u8, text_len: usize, x: f32, y: f32);
        pub fn set_font(canvas_id: u32, font_ptr: *const u8, font_len: usize);
        pub fn measure_text_width(canvas_id: u32, text_ptr: *const u8, text_len: usize) -> f32;
    }
}

impl From<u32> for MouseButton {
    fn from(button: u32) -> Self {
        match button {
            0 => MouseButton::Left,
            1 => MouseButton::Middle,
            2 => MouseButton::Right,
            _ => MouseButton::Unknown,
        }
    }
}

impl From<u32> for KeyCode {
    fn from(code: u32) -> Self {
        match code {
            48 => KeyCode::Key0,
            49 => KeyCode::Key1,
            50 => KeyCode::Key2,
            51 => KeyCode::Key3,
            52 => KeyCode::Key4,
            53 => KeyCode::Key5,
            54 => KeyCode::Key6,
            55 => KeyCode::Key7,
            56 => KeyCode::Key8,
            57 => KeyCode::Key9,
            65 => KeyCode::A,
            66 => KeyCode::B,
            67 => KeyCode::C,
            68 => KeyCode::D,
            69 => KeyCode::E,
            70 => KeyCode::F,
            71 => KeyCode::G,
            72 => KeyCode::H,
            73 => KeyCode::I,
            74 => KeyCode::J,
            75 => KeyCode::K,
            76 => KeyCode::L,
            77 => KeyCode::M,
            78 => KeyCode::N,
            79 => KeyCode::O,
            80 => KeyCode::P,
            81 => KeyCode::Q,
            82 => KeyCode::R,
            83 => KeyCode::S,
            84 => KeyCode::T,
            85 => KeyCode::U,
            86 => KeyCode::V,
            87 => KeyCode::W,
            88 => KeyCode::X,
            89 => KeyCode::Y,
            90 => KeyCode::Z,
            37 => KeyCode::ArrowLeft,
            38 => KeyCode::ArrowUp,
            39 => KeyCode::ArrowRight,
            40 => KeyCode::ArrowDown,
            32 => KeyCode::Space,
            13 => KeyCode::Enter,
            27 => KeyCode::Escape,
            9 => KeyCode::Tab,
            16 => KeyCode::Shift,
            17 => KeyCode::Ctrl,
            18 => KeyCode::Alt,
            189 => KeyCode::Minus,
            187 => KeyCode::Equal,
            _ => KeyCode::Unknown,
        }
    }
}