use {
    serde::Serialize,
    std::{collections::HashMap, convert::From, fs, path::Path},
};

#[derive(Serialize, Clone, Debug)]
#[serde(rename_all = "lowercase")]
pub enum Category {
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
pub struct Entry {
    filename: String,
    category: Category,
}

#[tauri::command]
pub async fn fetch<R: tauri::Runtime>(app: tauri::AppHandle<R>) -> Result<Vec<Entry>, String> {
    let app_data_dir = app
        .path_resolver()
        .app_data_dir()
        .ok_or("Failed to resolve $APPDATADIR")?;
    let asset_dir = Path::new(&app_data_dir).join("assets");
    let files =
        fs::read_dir(asset_dir).map_err(|e| format!("Failed to open $APPDATADIR: {}", e))?;

    files
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

                return Ok(Entry {
                    filename: filename,
                    category: category,
                });
            }
            Err(err) => {
                return Err(format!("Failed to unwrap directory entry {}", err));
            }
        })
        .collect()
}

