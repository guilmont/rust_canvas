
all: build

.SILENT:

# Build everything
build: example

# Build typescript library for the main project
typescript:
	echo "Compiling TypeScript library..."
	tsc --project ts/tsconfig.json


# Build WebAssembly for example
example: typescript
	echo "Building Example WebAssembly..."
	cargo build --target wasm32-unknown-unknown --release --example canvas_example

	cp target/wasm32-unknown-unknown/release/examples/canvas_example.wasm examples/web/canvas_example.wasm

	# Copy JavaScript files to example directory for runtime static linking
	cp dist/*.js examples/web/.

	echo "Compiling TypeScript for example..."
	tsc --project examples/ts/tsconfig.json

# Clean build artifacts
clean:
	echo "Cleaning build artifacts..."
	rm -rf target/

# Check Rust code
check:
	echo "Checking Rust code..."
	cargo check

# Serve locally for development
serve: example
	echo "Starting HTTP server on port 8000..."
	python3 -m http.server 8000 --directory examples/web

