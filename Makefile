# Directories and files
WASM_SRC = target/wasm32-unknown-unknown/release/web_canvas.wasm
WASM_DEST = frontend/web_canvas.wasm
TS_DIR = ts
TS_CONFIG = $(TS_DIR)/tsconfig.json

all: build

.SILENT:

# Build everything
build: wasm typescript

# Build WebAssembly
wasm:
	echo "Building WebAssembly..."
	cargo build --target wasm32-unknown-unknown --release
	echo "Copying WASM to frontend...";
	cp $(WASM_SRC) $(WASM_DEST);

# Compile TypeScript
typescript:
	echo "Compiling TypeScript..."
	tsc --project $(TS_CONFIG)

# Clean build artifacts
clean:
	echo "Cleaning build artifacts..."
	rm -rf target/
	rm -rf frontend/*.js.map
	rm -f $(TS_DIR)/*.tsbuildinfo

# Check Rust code
check:
	echo "Checking Rust code..."
	cargo check

# Test Rust code
test:
	echo "Running Rust tests..."
	cargo test

# Serve locally for development
serve: build
	echo "Starting HTTP server on port 8000..."
	python3 -m http.server 8000 --directory frontend

# Help target
help:
	echo "Available targets:"
	echo "  all        - Build everything (default)"
	echo "  build      - Build WASM and TypeScript"
	echo "  wasm       - Build WebAssembly only"
	echo "  typescript - Compile TypeScript only"
	echo "  clean      - Remove all build artifacts"
	echo "  check      - Check Rust code"
	echo "  test       - Run Rust tests"
	echo "  serve      - Build and start HTTP server"
	echo "  help       - Show this help message"
