import { InvokeArgs, invoke } from '@tauri-apps/api/tauri'
import { BaseDirectory, appDataDir, join } from '@tauri-apps/api/path';
import { convertFileSrc } from '@tauri-apps/api/tauri';

import { MediaType, Memory, Result } from './models.ts';


const ENTRIES = ["a.jpg", "b.jpg", "c.jpg", "d.jpg", "e.jpg", "f.jpg"]

// Wrapper around invoke that doesn't throw exception
const invokeNoThrow = async <T>(cmd: string, args?: InvokeArgs | undefined): Promise<Result<T>> => {
  try {
    const result = await invoke<T>(cmd, args);
    return {
      kind: "value",
      value: result,
    };
  } catch (err: any) {
    return {
      kind: "error",
      // `err` is set to string on the Rust backend side.
      message: err
    };
  }
}

export const fetchMemoriesFromDataDirectory = async (): Promise<Result<Memory[]>> => {
  interface File {
    category: "text" | "picture" | "unsupported";
    filename: string;
  }

  const files: Result<File[]> = await invokeNoThrow('fetch_all');

  if (files.kind === "error") {
    return files;
  }

  const appDataDirPath = await appDataDir();

  const results = await Promise.all(files.value.map(async ({ filename, category }) => {
    const path = `assets/${filename}`;
    if (category === "text") {
      return {
        created: new Date(),
        source: {
          kind: MediaType.Text,
          path,
          base: BaseDirectory.AppData,
        }
      }
    } else {
      const filePath = await join(appDataDirPath, path);
      const assetUrl = convertFileSrc(filePath);

      return {
        created: new Date(),
        source: {
          kind: MediaType.Picture,
          url: assetUrl,
        }
      }
    }
  }));

  // @ts-ignore
  return results;
}

export const fetchMemoriesFromSampleDirectory = (): Result<Memory[]> => {
  const memories: Memory[] = ENTRIES.map((e) => {
    return {
      created: new Date(),
      source: {
        kind: MediaType.Picture,
        url: `/sample/${e}`
      }
    }
  });

  return {
    kind: "value",
    value: memories,
  }
}
