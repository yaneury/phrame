import { InvokeArgs, invoke } from '@tauri-apps/api/tauri'
import { BaseDirectory, appDataDir, join } from '@tauri-apps/api/path';
import { convertFileSrc } from '@tauri-apps/api/tauri';

import { MediaType, Memory, Musings, Result } from './models.ts';

const ENTRIES = ["a.jpg", "b.jpg", "c.jpg", "d.jpg", "e.jpg", "f.jpg", "a.heic", "b.heic", "c.heic", "d.heic", "e.heic"]

// Wrapper around invoke that doesn't throw exception
const invokeNoThrow = async <T>(cmd: string, timeoutInMs: number, args?: InvokeArgs | undefined): Promise<Result<T>> => {
  const promise = async (): Promise<Result<T>> => {
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

  return Promise.race([
    promise(),
    new Promise<Result<T>>((resolve, _) => {
      setTimeout(() => {
        resolve({
          kind: "error",
          message: `Timeout reached invoking '${cmd}'`
        })
      }, timeoutInMs);
    })
  ]);
}

export const fetchMemoriesFromDataDirectory = async (): Promise<Result<Memory[]>> => {
  interface Timestamp {
    secs_since_epoch: number;
    nanocs_since_epoch: number;
  }

  interface File {
    category: "video" | "picture" | "unsupported";
    filename: string;
    created: Timestamp;
  }

  const files: Result<File[]> = await invokeNoThrow('fetch_all_memories', 3000);

  if (files.kind === "error") {
    return files;
  }

  const appDataDirPath = await appDataDir();

  if (files.value.length === 0) {
    return {
      kind: "error",
      message: `${appDataDirPath} has no files.`
    }
  }

  const memories: Memory[] = await Promise.all(files.value.map(async ({ filename, category, created }) => {
    const createdAsDate = new Date(created.secs_since_epoch * 1000);
    if (category === "video") {
      return createVideoMemory(filename, new Date(createdAsDate));
    } else {
      return createPictureMemory(filename, new Date(createdAsDate));
    }
  }));

  return {
    kind: "value",
    value: memories,
  }
}

export const fetchMusingsFromDataDirectory = async (): Promise<Result<Musings>> => {
  const musings: Result<Musings> = await invokeNoThrow('fetch_all_musings', 3000);
  return musings;
}

export const fetchMemoriesFromSampleDirectory = (): Result<Memory[]> => {
  const memories: Memory[] = ENTRIES.map((e) => {
    return {
      created: new Date(),
      location: {
        type: "url",
        url: `/sample/${e}`
      },
      type: MediaType.Picture,
    }
  });

  return {
    kind: "value",
    value: memories,
  }
}

export const fetchMusingsFromSampleDirectory = (): Result<Musings> => {
  return {
    kind: "value",
    value: {
      quotes: [
        {
          body: "You gotta take care of home.",
          author: "Andrew Wiggins",
          work: "Some NBA Game",
        }
      ]
    },
  }
}

const createVideoMemory = (filename: string, created: Date): Memory => {
  return {
    created,
    location: {
      type: "file",
      path: filename,
      base: BaseDirectory.AppData,
    },
    type: MediaType.Video
  }
}

const createPictureMemory = async (filename: string, created: Date): Promise<Memory> => {
  if (filename.toLowerCase().endsWith("heic")) {
    return {
      created,
      location: {
        type: "file",
        path: filename,
        base: BaseDirectory.AppData
      },
      type: MediaType.Picture
    }
  }

  const appDataDirPath = await appDataDir();
  const filePath = await join(appDataDirPath, filename);
  const url = convertFileSrc(filePath);

  return {
    created,
    location: {
      type: "url",
      url
    },
    type: MediaType.Picture
  }
}
