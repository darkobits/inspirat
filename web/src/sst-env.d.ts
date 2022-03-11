/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TITLE: string
  readonly VITE_STAGE: string
  readonly VITE_BUCKET_URL: string
  readonly SYNC_COLLECTION_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}