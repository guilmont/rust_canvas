
all: build

.SILENT:

# Build everything
build: example

# Build WebAssembly for example
example:
	echo "Building Example WebAssembly..."
	cargo build --target wasm32-unknown-unknown --release --example canvas_example
	cp target/wasm32-unknown-unknown/release/examples/canvas_example.wasm examples/web/canvas_example.wasm

	echo "Compiling TypeScript library..."
	tsc --project ts/tsconfig.json

	echo "Copying library files to example directory..."
	cp target/ts_dist/canvas-wasm.js examples/web/canvas-wasm.js
	cp target/ts_dist/wasm-utils.js examples/web/wasm-utils.js

	cp target/ts_dist/canvas-wasm.d.ts examples/ts/canvas-wasm.d.ts
	cp target/ts_dist/wasm-utils.d.ts examples/ts/wasm-utils.d.ts

	echo "Compiling TypeScript for example..."
	tsc --project examples/ts/tsconfig.json

# Clean build artifacts
clean:
	echo "Cleaning build artifacts..."
	rm -rf target/
	rm -rf examples/ts/*.d.ts

# Check Rust code
check:
	echo "Checking Rust code..."
	cargo check

# Serve locally for development
serve: example
	echo "Starting HTTP server on port 8000..."
	python3 -m http.server 8000 --directory examples/web

