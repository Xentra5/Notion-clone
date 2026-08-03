// document-canvas.tsx — re-exports the refactored Editor from editor/Editor.tsx
// All existing imports of DocumentCanvas and DocumentCanvasProps continue to work.
export { Editor as DocumentCanvas } from "./editor/Editor";
export type { EditorProps as DocumentCanvasProps } from "./editor/Editor";
