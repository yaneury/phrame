// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use {
    log::{error, info},
    notify::{Config, RecommendedWatcher, RecursiveMode, Watcher},
    serde::Serialize,
    std::{collections::HashMap, convert::From, fs},
    tauri::Manager,
    tauri_plugin_log::LogTarget,
};

#[derive(Serialize, Clone, Debug)]
#[serde(rename_all = "lowercase")]
enum Category {
    Picture,
    Video,
    Text,
    Unknown,
}

impl From<String> for Category {
    fn from(extension: String) -> Category {
        let category_extensions_map: HashMap<&str, Category> = [
            ("png", Category::Picture),
            ("jpg", Category::Picture),
            ("gif", Category::Picture),
            ("mp4", Category::Video),
            ("mov", Category::Video),
            ("txt", Category::Text),
        ]
        .into_iter()
        .collect();

        category_extensions_map
            .get(extension.as_str())
            .unwrap_or(&Category::Unknown)
            .clone()
    }
}

#[derive(Serialize, Debug)]
struct Entry {
    filename: String,
    category: Category,
}

fn main() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::default()
                .targets([LogTarget::LogDir, LogTarget::Stdout, LogTarget::Webview])
                .build(),
        )
        .setup(|app| {
            let app = app.handle().clone();

            tauri::async_runtime::spawn(async move {
                let app_data_dir = app
                    .path_resolver()
                    .app_data_dir()
                    .ok_or("Failed to resolve $APPDATADIR")
                    .unwrap();

                let (tx, rx) = std::sync::mpsc::channel();

                let mut watcher = RecommendedWatcher::new(tx, Config::default())
                    .expect("Failed to create directory watcher");

                watcher
                    .watch(app_data_dir.as_ref(), RecursiveMode::Recursive)
                    .expect("Failed to watch directory");

                info!("Installed watcher for $APPDATADIR");

                for res in rx {
                    match res {
                        Ok(_) => {
                            info!("Entries updated for $APPDATADIR");
                            app.emit_all("entries_changed", ()).unwrap();
                        }
                        Err(e) => {
                            error!("Failed to watch $APPDATADIR: {:?}", e);
                        }
                    }
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![fetch_all])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn fetch_all<R: tauri::Runtime>(app: tauri::AppHandle<R>) -> Result<Vec<Entry>, String> {
    info!("fetch_all invoked");
    let app_data_dir = app
        .path_resolver()
        .app_data_dir()
        .ok_or("Failed to resolve $APPDATADIR")?;

    info!("Resolved $APPDATADIR: {:?}", app_data_dir);
    // Fetch all files
    let files =
        fs::read_dir(app_data_dir).map_err(|e| format!("Failed to open $APPDATADIR: {}", e))?;

    info!("Fetched all files");

    let files = files
        .into_iter()
        .map(|path_or| match path_or {
            Ok(path) => {
                let path = path.path();
                let filename = path.file_name().unwrap().to_str().unwrap().to_owned();
                let extension = path
                    .extension()
                    .unwrap()
                    .to_str()
                    .unwrap()
                    .to_owned()
                    .to_lowercase();
                let category = Category::from(extension.clone());

                return Ok(Entry { filename, category });
            }
            Err(err) => {
                return Err(format!("Failed to unwrap directory entry {}", err));
            }
        })
        .collect();

    info!("Files: {:?}", files);

    files
}
