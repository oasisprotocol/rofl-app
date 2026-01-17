// Mock for monaco-editor package
export const editor = {
  defineTheme: () => {},
  setModelMarkers: () => {},
}

export const MarkerSeverity = {
  Error: 8,
  Warning: 4,
  Info: 2,
  Hint: 1,
}

export default {
  editor,
  MarkerSeverity,
}
