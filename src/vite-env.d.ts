/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_INTERVAL_IN_SECS: string
  readonly VITE_USE_DATA_DIR: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
