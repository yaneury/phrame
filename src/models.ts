import { BaseDirectory } from "@tauri-apps/api/fs";

export enum Category {
  Picture,
  Video,
  Text,
  Unknown
}

export interface Asset {
  kind: Category.Picture | Category.Video;
  url: string;
}

export interface File {
  kind: Category.Text;
  path: string;
  base: BaseDirectory;
}

export type Content = File | Asset;

export default Content;

export interface FetchCommandValue {
  category: "text" | "picture" | "video" | "unknown";
  filename: string;
}
