#![allow(dead_code)]
mod js {
    #[link(wasm_import_module = "Console")]
    extern "C" {
        pub fn log(ptr: *const u8, len: usize);
        pub fn error(ptr: *const u8, len: usize);
    }
}

pub fn log(msg: &str) { unsafe { js::log(msg.as_ptr(), msg.len()); } }
pub fn error(msg: &str) { unsafe { js::error(msg.as_ptr(), msg.len()); } }