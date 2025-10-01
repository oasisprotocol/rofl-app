/// <reference types="vite/client" />

declare const APP_VERSION: string
declare const BUILD_COMMIT: string
declare const BUILD_DATETIME: number
declare const GITHUB_REPOSITORY_URL: string

interface ImportMetaEnv {
  VITE_WALLET_CONNECT_PROJECT_ID: string
  VITE_ROFL_APP_BACKEND: string
  VITE_FATHOM_SIDE_ID: string
  VITE_NITRO_PARTNER_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '@metamask/jazzicon' {
  const jazzicon: (diameter: number, seed: number) => HTMLDivElement
  export default jazzicon
}
