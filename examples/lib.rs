// Single Player Pong Game
use web_canvas::canvas;
use web_canvas::console;

use web_canvas::canvas::MouseButton;
use web_canvas::canvas::KeyCode;

struct Point {
    x: f32,
    y: f32,
}

struct Ball {
    pos: Point,
    vel: Point,
    radius: f32,
}

struct Paddle {
    pos: Point,
    width: f32,
    height: f32,
}

struct PongGame {
    ball: Ball,
    paddle: Paddle,
    score: u32,
    game_over: bool,
    elapsed_time: f32,
    paused: bool,
    speed_multiplier: f32,
}

impl PongGame {
    fn new(canvas_width: f32, canvas_height: f32) -> Self {
        Self {
            ball: Ball {
                pos: Point {
                    x: canvas_width / 2.0,
                    y: canvas_height / 2.0,
                },
                vel: Point {
                    x: 200.0,
                    y: 150.0,
                },
                radius: 8.0,
            },
            paddle: Paddle {
                pos: Point {
                    x: canvas_width / 2.0 - 50.0,
                    y: canvas_height - 30.0,
                },
                width: 100.0,
                height: 10.0,
            },
            score: 0,
            game_over: false,
            elapsed_time: 0.0,
            paused: true,  // Start paused - wait for Space to begin
            speed_multiplier: 1.0,
        }
    }

    fn reset(&mut self, canvas_width: f32, canvas_height: f32) {
        self.ball.pos.x = canvas_width / 2.0;
        self.ball.pos.y = canvas_height / 2.0;
        self.ball.vel.x = 200.0;
        self.ball.vel.y = 150.0;
        self.paddle.pos.x = canvas_width / 2.0 - self.paddle.width / 2.0;
        self.paddle.pos.y = canvas_height - 30.0;
        self.score = 0;
        self.game_over = false;
        self.paused = false;
        self.speed_multiplier = 1.0;
    }

    fn update(&mut self, canvas: &canvas::Canvas, dt: f32) {
        if self.game_over || self.paused { return; }

        // Keep paddle within bounds
        if self.paddle.pos.x < 0.0 {
            self.paddle.pos.x = 0.0;
        }
        if self.paddle.pos.x + self.paddle.width > canvas.width() {
            self.paddle.pos.x = canvas.width() - self.paddle.width;
        }

        // Update ball position with speed multiplier
        self.ball.pos.x += self.ball.vel.x * dt * self.speed_multiplier;
        self.ball.pos.y += self.ball.vel.y * dt * self.speed_multiplier;

        // Ball collision with walls
        if self.ball.pos.x - self.ball.radius <= 0.0 || self.ball.pos.x + self.ball.radius >= canvas.width() {
            self.ball.vel.x = -self.ball.vel.x;
        }
        if self.ball.pos.y - self.ball.radius <= 0.0 {
            self.ball.vel.y = -self.ball.vel.y;
        }

        // Ball collision with paddle
        if self.ball.pos.y + self.ball.radius >= self.paddle.pos.y
            && self.ball.pos.y - self.ball.radius <= self.paddle.pos.y + self.paddle.height
            && self.ball.pos.x >= self.paddle.pos.x
            && self.ball.pos.x <= self.paddle.pos.x + self.paddle.width {

            self.ball.vel.y = -self.ball.vel.y.abs(); // Always bounce up

            // Add some angle based on where it hits the paddle
            let hit_pos = (self.ball.pos.x - self.paddle.pos.x) / self.paddle.width;
            let angle_factor = (hit_pos - 0.5) * 2.0; // -1 to 1
            self.ball.vel.x += angle_factor * 100.0;

            self.score += 1;
        }

        // Game over if ball goes below paddle
        if self.ball.pos.y - self.ball.radius > canvas.height() {
            self.game_over = true;
        }

        // Keep ball within horizontal bounds
        if self.ball.pos.x - self.ball.radius < 0.0 {
            self.ball.pos.x = self.ball.radius;
        }
        if self.ball.pos.x + self.ball.radius > canvas.width() {
            self.ball.pos.x = canvas.width() - self.ball.radius;
        }
    }

    fn draw(&self, canvas: &canvas::Canvas) {
        // Clear canvas
        canvas.fill_rect(0.0, 0.0, canvas.width(), canvas.height(), 0.0, canvas::BLACK);

        if !self.game_over {
            canvas.fill_circle(self.ball.pos.x, self.ball.pos.y, self.ball.radius, canvas::WHITE);
            canvas.fill_rect(self.paddle.pos.x, self.paddle.pos.y, self.paddle.width, self.paddle.height, 0.0, canvas::TAB_ORANGE);
        }

        // Draw score and speed multiplier
        let score_text = format!("Score: {} | Speed: {:.1}x", self.score, self.speed_multiplier);
        canvas.draw_text(&score_text, 10.0, 30.0, "20px sans-serif", canvas::WHITE);

        // Draw pause status
        if self.paused {
            let pause_text = if self.score == 0 {
                "Click canvas, then press SPACE to start"
            } else {
                "PAUSED - Press SPACE to resume"
            };
            let pause_width = canvas.measure_text_width(pause_text, "24px sans-serif");
            canvas.draw_text(pause_text, (canvas.width() - pause_width) / 2.0, canvas.height() / 2.0 - 50.0, "24px sans-serif", canvas::TAB_BLUE);
        }

        // Draw game over message
        if self.game_over {
            let game_over_text = "GAME OVER";
            let text_width = canvas.measure_text_width(game_over_text, "30px sans-serif");
            canvas.draw_text(game_over_text, (canvas.width() - text_width) / 2.0, canvas.height() / 2.0, "30px sans-serif", canvas::RED);

            let restart_text = "Space to restart";
            let restart_width = canvas.measure_text_width(restart_text, "16px sans-serif");
            canvas.draw_text(restart_text, (canvas.width() - restart_width) / 2.0, canvas.height() / 2.0 + 40.0, "16px sans-serif", canvas::WHITE);
        }
    }
}

impl canvas::EventHandler for PongGame {
    fn on_mouse_move(&mut self, _canvas: &canvas::Canvas, x: f32, _y: f32) {
        if ! (self.paused || self.game_over) {
            self.paddle.pos.x = x - self.paddle.width / 2.0;
        }
    }

    fn on_mouse_down(&mut self, _canvas: &canvas::Canvas, _x: f32, _y: f32, button: MouseButton) {
        match button {
            MouseButton::Left => { // Increase speed
                self.speed_multiplier = (self.speed_multiplier + 0.5).min(3.0);
            }
            MouseButton::Right => { // Decrease speed
                self.speed_multiplier = (self.speed_multiplier - 0.5).max(0.1);
            }
            MouseButton::Middle => { self.speed_multiplier = 1.0; }
            _ => {}
        }
    }

    fn on_mouse_up(&mut self, canvas: &canvas::Canvas, _x: f32, _y: f32, button: MouseButton) {
        if self.game_over && button == MouseButton::Left {
            self.reset(canvas.width(), canvas.height());
        }
    }

    fn on_animation_frame(&mut self, canvas: &canvas::Canvas, elapsed: f32) {
        self.elapsed_time = elapsed;
        self.update(canvas, elapsed);
        self.draw(canvas);
    }

    fn on_key_down(&mut self, canvas: &canvas::Canvas, key_code: KeyCode) {
        match key_code {
            KeyCode::ArrowLeft => { // Move paddle left
                if ! (self.paused || self.game_over) {
                    let speed = 2.0 * canvas.width() * self.elapsed_time;
                    self.paddle.pos.x = f32::max(self.paddle.pos.x - speed, 0.0);
                }
            }
            KeyCode::ArrowRight => { // Move paddle right
                if ! (self.paused || self.game_over) {
                    let speed = 2.0 * canvas.width() * self.elapsed_time;
                    self.paddle.pos.x = f32::min(self.paddle.pos.x + speed, canvas.width() - self.paddle.width / 2.0);
                }
            }
            KeyCode::ArrowDown => { // Decrease speed
                self.speed_multiplier = (self.speed_multiplier - 0.5).max(0.1);
            }
            KeyCode::ArrowUp => { // Increase speed
                self.speed_multiplier = (self.speed_multiplier + 0.5).min(3.0);
            }
            KeyCode::Space => { // Toggle pause/start
                if self.game_over {
                    self.reset(canvas.width(), canvas.height());
                } else {
                    self.paused = !self.paused;
                }
            }
            KeyCode::Escape => { self.speed_multiplier = 1.0; }
            _ => {}
        }
    }
}

#[no_mangle]
pub fn main_function() {
    console::log("Starting Pong Game!");

    // Create pong game with standard canvas dimensions (800x400 from HTML)
    let pong_game = PongGame::new(800.0, 400.0);

    let cv = canvas::Canvas::new("example-canvas");
    cv.register_handler(pong_game);
    cv.start_animation_loop();
    console::log("Pong game started - move mouse to control paddle!");
}

// Required for cargo example build, but not used for WASM entry.
fn main() {}
