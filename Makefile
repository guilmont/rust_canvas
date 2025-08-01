
# Directories and files
EXAMPLE_PATH = examples/web

all: build

.SILENT:

# Build everything
build: example


# Build WebAssembly for example
example:
	echo "Building Example WebAssembly..."
	cargo build --target wasm32-unknown-unknown --release --example canvas_example
	echo "Copying WASM to example frontend...";

	echo "Compiling TypeScript for example..."
	tsc --project ts/tsconfig.json
	tsc --project examples/ts/tsconfig.json

	cp target/wasm32-unknown-unknown/release/examples/canvas_example.wasm $(EXAMPLE_PATH)/canvas_example.wasm
	cp frontend/canvas-wasm.js $(EXAMPLE_PATH)/canvas-wasm.js

# Clean build artifacts
clean:
	echo "Cleaning build artifacts..."
	rm -rf target/
	rm -rf frontend/
	rm -rf ${EXAMPLE_PATH}/*.js
	rm -rf ${EXAMPLE_PATH}/*.js.map
	rm -f $(EXAMPLE_PATH)/canvas_example.wasm
	rm -f ts/*.tsbuildinfo

# Check Rust code
check:
	echo "Checking Rust code..."
	cargo check

# Serve locally for development
serve: example
	echo "Starting HTTP server on port 8000..."
	python3 -m http.server 8000 --directory examples/web

# Help target
help:
	echo "Available targets:"
	echo "  all        - Build everything (default)"
	echo "  build      - Build library, example WASM, and TypeScript"
	echo "  lib        - Build Rust library only"
	echo "  wasm       - Build WebAssembly for example only"
	echo "  typescript - Compile TypeScript for example only"
	echo "  clean      - Remove all build artifacts"
	echo "  check      - Check Rust code"
	echo "  test       - Run Rust tests"
	echo "  serve      - Build and start HTTP server"
	echo "  help       - Show this help message"
