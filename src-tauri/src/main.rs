// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use {
    notify::{Config, RecommendedWatcher, RecursiveMode, Watcher},
    std::{
        collections::HashMap,
        convert::From,
        fs,
        path::Path,
        sync::{Arc, Mutex},
        thread,
        time::SystemTime,
    },
    tauri::Manager,
};

mod fetch;

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let app = app.handle().clone();

            tauri::async_runtime::spawn(async move {
                let app_data_dir = app
                    .path_resolver()
                    .app_data_dir()
                    .ok_or("Failed to resolve $APPDATADIR")
                    .unwrap();
                let asset_dir = Path::new(&app_data_dir).join("assets");

                let (tx, rx) = std::sync::mpsc::channel();

                let mut watcher = RecommendedWatcher::new(tx, Config::default())
                    .expect("Failed to create directory watcher");

                watcher
                    .watch(asset_dir.as_ref(), RecursiveMode::Recursive)
                    .expect("Failed to watch directory");

                for res in rx {
                    match res {
                        Ok(_) => app.emit_all("entries_changed", ()).unwrap(),
                        Err(error) => eprintln!("Error: {error:?}"),
                    }
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![fetch::fetch])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
