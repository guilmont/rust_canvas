#![allow(dead_code)]

mod js {
    #[link(wasm_import_module = "Browser")]
    extern "C" {
        pub fn alert(ptr: *const u8, len: usize);
        pub fn time_now() -> f64;
        pub fn random() -> f64;
    }
}

pub fn alert(msg: &str)  { unsafe { js::alert(msg.as_ptr(), msg.len()); } }
pub fn time_now() -> f64 { unsafe { js::time_now()                      } }
pub fn random() -> f64   { unsafe { js::random()                        } }