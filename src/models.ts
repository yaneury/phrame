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

export type Result<T> = ErrorResult | ValueResult<T>;

export interface LoadingState {
  status: 'loading';
};

export interface SuccessState<T> {
  status: 'success';
  value: T;
};

export interface ErrorState {
  status: 'error';
  error: string;
};

export type State<T> = LoadingState | SuccessState<T> | ErrorState;
