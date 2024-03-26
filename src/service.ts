import { invoke } from '@tauri-apps/api/tauri'
import { BaseDirectory, appDataDir, join } from '@tauri-apps/api/path';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import Content, { Category, FetchCommandValue } from "./models.ts";


const ENTRIES = ["a.jpg", "b.jpg", "c.jpg", "d.jpg", "e.jpg", "f.jpg"]    

export const fetchSlidesFromDataDirectory = async (): Promise<Content[]> => {
    const files: FetchCommandValue[] = await invoke('fetch');
    const appDataDirPath = await appDataDir();
    const results = await Promise.all(files.map(async ({ filename, category }) => {
        const path = `assets/${filename}`;
        if (category === "text") {
          return {
            kind: Category.Text,
            path,
            base: BaseDirectory.AppData,
          }
        } else {
          const filePath = await join(appDataDirPath, path);
          const assetUrl = convertFileSrc(filePath);

          return {
            kind: Category.Picture,
            url: assetUrl,
          }
        }
      }));
   
      // @ts-ignore
      return results;
}

export const fetchSlidesFromSampleDirectory = (): Content[] => {
    return ENTRIES.map((e) => {
        return {
            kind: Category.Picture,
            url: `/sample/${e}`
        }
    });
}
