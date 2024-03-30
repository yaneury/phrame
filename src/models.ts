import { BaseDirectory } from "@tauri-apps/api/fs";

export enum MediaType {
  Picture,
  Text,
  Unsupported
}

export interface Url {
  type: "url",
  url: string;
}

export interface File {
  type: "file",
  path: string;
  base: BaseDirectory;
}

export type FileOrUrl = File | Url;

export interface PictureMemory {
  type: MediaType.Picture;
  source: FileOrUrl;
  created: Date;
}

export interface TextMemory {
  type: MediaType.Text;
  source: File;
  created: Date;
}

export type Memory = TextMemory | PictureMemory;

export interface ErrorResult {
  kind: 'error';
  message: string;
}

export interface ValueResult<T> {
  kind: 'value';
  value: T;
}

export interface LoadingResult {
  kind: 'loading';
}

export type Result<T> = ValueResult<T> | ErrorResult;

export type AwaitableResult<T> = LoadingResult | ValueResult<T> | ErrorResult;
