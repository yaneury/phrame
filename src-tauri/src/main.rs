// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use {
    serde::{Serialize},
    std::{
        fs,
        path::Path
    }
};

#[derive(Serialize, Debug)]
enum Category {
    Picture,
    Video,
    Text
}

#[derive(Serialize, Debug)]
struct Entry {
    filename: String,
    category: Category
}

#[tauri::command]
async fn fetch<R: tauri::Runtime>(app: tauri::AppHandle<R>) -> Vec<Entry> {
    let app_data_dir = app.path_resolver().app_data_dir().expect("App data directory is empty");
    let asset_dir = Path::new(&app_data_dir).join("assets");
    let files = fs::read_dir(asset_dir).unwrap();
    
    files.into_iter().map(|p| {
       Entry {
            filename: p.unwrap().file_name().into_string().unwrap(),
            category: Category::Picture
        }
    }).collect()
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![fetch])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
