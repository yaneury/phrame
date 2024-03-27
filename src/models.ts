import { BaseDirectory } from "@tauri-apps/api/fs";

export enum MediaType {
  Picture,
  Text,
  Unsupported
}

export interface Url {
  kind: MediaType.Picture;
  url: string;
}

export interface File {
  kind: MediaType.Text;
  path: string;
  base: BaseDirectory;
}

export type Source = File | Url;

export interface Memory {
  source: Source;
  created: Date;
}

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