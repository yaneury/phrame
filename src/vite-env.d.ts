/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_INTERVAL_IN_SECS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
