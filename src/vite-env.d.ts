/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  // Agrega más variables de entorno según necesites
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
