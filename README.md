# Rust Canvas

A Rust WebAssembly library for 2D canvas graphics in the browser. Build interactive graphics applications with Rust that run natively in web browsers.

## Features

- **Canvas Drawing**: Full 2D canvas API with shapes, paths, text, and colors
- **Event Handling**: Mouse and keyboard events with easy trait-based handling
- **Animation Loop**: Built-in requestAnimationFrame support for smooth animations
- **Type Safety**: Full TypeScript definitions for seamless integration
- **Lightweight**: Pure client-side library with no external dependencies

## Example: Pong Game

The repository includes a complete Pong game implementation that demonstrates the library's capabilities:

- **Interactive Gameplay**: Mouse and keyboard controls for paddle movement
- **Physics**: Ball collision detection with walls and paddle
- **Graphics**: Real-time rendering with shapes, text, and colors
- **Game Loop**: Smooth 60fps animation with proper delta timing

Try the [live demo](https://guilmont.github.io/rust_canvas/) to see the Pong game in action!

## Getting Started

### Prerequisites

- Rust (with `wasm32-unknown-unknown` target)
- Node.js (for TypeScript compilation)
- A web browser that supports WebAssembly
- Python for HTTP.Server

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/guilmont/rust_canvas.git
   cd rust_canvas
   ```

2. **Install the WebAssembly target:**
   ```bash
   rustup target add wasm32-unknown-unknown
   ```

3. **Run the example:**
   ```bash
   make serve
   ```
   Then open http://localhost:8000 in your browser.

## Using in Your Project

### Required Files

To integrate this library into your web project, you need these files from the `dist/` directory:

- **`canvas-wasm.js`** - Core canvas functionality and event handling
- **`wasm-utils.js`** - WebAssembly utilities and browser integration
- **`types/`** - TypeScript definitions (optional for JavaScript)
- **Your compiled `.wasm` file** - Generated from your Rust code

### Basic Setup

1. **Create your Rust game/application:**

```rust
use web_canvas::canvas;
use web_canvas::console;

struct MyApp {
    // Your game state here
}

impl canvas::EventHandler for MyApp {
    fn on_animation_frame(&mut self, canvas: &canvas::Canvas, elapsed: f32) {
        // Clear and draw your content
        canvas.clear();

        // Draw your game objects
        canvas.fill_circle(100.0, 100.0, 20.0, canvas::WHITE);
    }

    fn on_mouse_move(&mut self, _canvas: &canvas::Canvas, x: f32, y: f32) {
        // Handle mouse movement
    }

    fn on_key_down(&mut self, _canvas: &canvas::Canvas, key_code: KeyCode) {
        // Handle keyboard input
    }
}

#[no_mangle]
pub fn main_function() {
    console::log("Starting application!");

    let canvas = canvas::Canvas::from_element("my-canvas");
    canvas.register_handler(MyApp { /* initialize your state */ });
    canvas.start_animation_loop();
}
```

2. **Create your HTML file:**

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>My Web Canvas App</title>
</head>
<body>
    <canvas id="my-canvas" width="800" height="600"></canvas>
    <script type="module" src="./app.js"></script>
</body>
</html>
```

3. **Create your JavaScript loader (app.js):**

```javascript
import { loadWasm } from './wasm-utils.js';
import { getCanvasImports } from './canvas-wasm.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const wasmExports = await loadWasm('./your-app.wasm', getCanvasImports());
        wasmExports.main_function();
    } catch (error) {
        console.error('Failed to load WASM:', error);
    }
});
```

4. **Compile your Rust code to WebAssembly:**

```bash
cargo build --target wasm32-unknown-unknown --release
```

Your compiled `.wasm` file will be in `target/wasm32-unknown-unknown/release/`.

### File Structure

Your web project should look like this:

```
your-project/
├── index.html
├── app.js
├── your-app.wasm          # Your compiled Rust code
├── canvas-wasm.js         # From dist/
└── wasm-utils.js          # From dist/
```

## API Overview

### Canvas Operations

```rust
// Drawing primitives
canvas.fill_circle(x, y, radius, color);
canvas.stroke_circle(x, y, radius, line_width, color);
canvas.fill_rect(x, y, width, height, angle, color);
canvas.stroke_rect(x, y, width, height, angle, line_width, color);
canvas.draw_line(x1, y1, x2, y2, line_width, color);
canvas.draw_arrow(x1, y1, x2, y2, line_width, color);

// Text rendering
canvas.draw_text("Hello World", x, y, "20px Arial", color);
let width = canvas.measure_text_width("Hello World", "20px Arial");

// Advanced shapes
canvas.fill_triangle(x, y, size, angle, color);
canvas.stroke_triangle(x, y, size, angle, line_width, color);
canvas.stroke_curve(&x_points, &y_points, line_width, color);
```

### Event Handling

```rust
impl canvas::EventHandler for YourApp {
    fn on_mouse_move(&mut self, canvas: &canvas::Canvas, x: f32, y: f32) { }
    fn on_mouse_down(&mut self, canvas: &canvas::Canvas, x: f32, y: f32, button: MouseButton) { }
    fn on_mouse_up(&mut self, canvas: &canvas::Canvas, x: f32, y: f32, button: MouseButton) { }
    fn on_double_click(&mut self, canvas: &canvas::Canvas, x: f32, y: f32, button: MouseButton) { }
    fn on_key_down(&mut self, canvas: &canvas::Canvas, key_code: KeyCode) { }
    fn on_animation_frame(&mut self, canvas: &canvas::Canvas, elapsed: f32) { }
}
```

### Predefined Colors

```rust
canvas::BLACK, canvas::WHITE, canvas::RED, canvas::GREEN, canvas::BLUE
canvas::TAB_ORANGE, canvas::TAB_BLUE, canvas::TAB_GREEN
// And many more matplotlib-style colors
```

## Architecture

- **`src/`** - Rust library source code with modules for canvas, console, and browser APIs
- **`examples/`** - Demo applications (currently includes the Pong game)
- **`ts/`** - TypeScript source for browser integration
- **`dist/`** - Compiled JavaScript and TypeScript definitions ready for use
- **`.github/`** - GitHub Pages configuration and deployment

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
