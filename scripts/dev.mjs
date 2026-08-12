import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ragDir = resolve(root, "rag_service");
const localPython = process.platform === "win32"
  ? resolve(ragDir, "venv", "Scripts", "python.exe")
  : resolve(ragDir, "venv", "bin", "python");

const pythonCommand = existsSync(localPython)
  ? localPython
  : process.platform === "win32" ? "python" : "python3";

const children = [];
let shuttingDown = false;

function start(command, args, options = {}) {
  const child = spawn(command, args, {
    cwd: root,
    stdio: "inherit",
    windowsHide: false,
    ...options,
  });
  children.push(child);
  child.on("error", (error) => {
    console.error(`[dev] Could not start ${command}: ${error.message}`);
  });
  return child;
}

console.log(`[dev] Starting RAG service with ${pythonCommand}...`);
const rag = start(pythonCommand, [
  "-m",
  "uvicorn",
  "main:app",
  "--reload",
  "--port",
  "8000",
  "--app-dir",
  ragDir,
]);

console.log("[dev] Starting Next.js...");
const nextBin = resolve(root, "node_modules", "next", "dist", "bin", "next");
const next = start(process.execPath, [nextBin, "dev"]);

function stop() {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (!child.killed) child.kill();
  }
}

process.on("SIGINT", () => {
  stop();
  process.exit(130);
});
process.on("SIGTERM", () => {
  stop();
  process.exit(143);
});

next.on("exit", (code, signal) => {
  const wasShuttingDown = shuttingDown;
  stop();
  if (!wasShuttingDown) process.exit(code ?? (signal ? 1 : 0));
});

rag.on("exit", (code) => {
  if (!shuttingDown && code && code !== 0) {
    console.error("[dev] RAG service stopped. Next.js is still running; AI requests will use the fallback path.");
  }
});
