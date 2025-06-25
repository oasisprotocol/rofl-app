/// <reference types="vite/client" />

declare const APP_VERSION: string

interface ImportMetaEnv {
  VITE_WALLET_CONNECT_PROJECT_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '@metamask/jazzicon' {
  const jazzicon: (diameter: number, seed: number) => HTMLDivElement
  export default jazzicon
}
