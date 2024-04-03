// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod memory;
mod window;

use {
    log::{error, info},
    notify::{Config, RecommendedWatcher, RecursiveMode, Watcher},
    serde::{Deserialize, Serialize},
    serde_yaml::Value,
    std::{collections::HashMap, convert::From, fs, time::SystemTime},
    tauri::Manager,
    tauri_plugin_log::LogTarget,
};

const NOTES_FILE: &str = "notes.yaml";

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "lowercase")]
enum Category {
    Picture,
    Video,
    Unknown,
}

impl From<String> for Category {
    fn from(extension: String) -> Category {
        let category_extensions_map: HashMap<&str, Category> = [
            ("png", Category::Picture),
            ("jpg", Category::Picture),
            ("heic", Category::Picture),
            ("gif", Category::Picture),
            ("mp4", Category::Video),
            ("mov", Category::Video),
        ]
        .into_iter()
        .collect();

        category_extensions_map
            .get(extension.as_str())
            .unwrap_or(&Category::Unknown)
            .clone()
    }
}

#[derive(Serialize, Deserialize, Clone, Debug)]
struct Entry {
    filename: String,
    category: Category,
    created: SystemTime,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
struct Quote {
    body: String,
    author: String,
    work: String,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
struct Document {
    quotes: Vec<Quote>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
enum Memory {
    #[serde(rename = "file")]
    File(Entry),

    #[serde(rename = "payload")]
    Payload(Quote),
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
fn fetch_all<R: tauri::Runtime>(app: tauri::AppHandle<R>) -> Result<Vec<Memory>, String> {
    info!("fetch_all invoked");
    let app_data_dir = app
        .path_resolver()
        .app_data_dir()
        .ok_or("Failed to resolve $APPDATADIR")?;

    info!("Resolved $APPDATADIR: {:?}", app_data_dir);
    // Fetch all files
    let files = fs::read_dir(app_data_dir.clone())
        .map_err(|e| format!("Failed to open $APPDATADIR: {}", e))?;

    let files = files
        .into_iter()
        .map(|path_or| match path_or {
            Ok(entry) => {
                let path = entry.path();

                let filename = path.file_name().ok_or("foo")?.to_str().unwrap().to_owned();

                let extension = path
                    .extension()
                    .unwrap()
                    .to_str()
                    .unwrap()
                    .to_owned()
                    .to_lowercase();
                let category = Category::from(extension.clone());

                let metadata = entry.metadata().unwrap();
                let created = metadata.created().unwrap();

                return Ok(Memory::File(Entry {
                    filename,
                    category,
                    created,
                }));
            }
            Err(err) => {
                return Err(format!("Failed to unwrap directory entry {}", err));
            }
        })
        .collect();

    info!("Fetched files: {:?}", files);

    info!("Fetching notes");
    match fs::read_to_string(app_data_dir.join(NOTES_FILE)) {
        Ok(content) => {
            let doc: Document = serde_yaml::from_str(&content).unwrap();
            info!("Document: {:?}", doc);
        }
        Err(err) => {
            error!("Failed to open notes file {}", err);
        }
    }

    files
}
