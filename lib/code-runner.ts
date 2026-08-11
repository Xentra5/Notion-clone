/**
 * lib/code-runner.ts
 *
 * In-browser code execution engine.
 * - JavaScript: Sandboxed eval with console.log interception.
 * - Python: On-demand Pyodide CDN loading (zero server cost).
 */

export interface RunResult {
  output: string;
  error: string | null;
  durationMs: number;
}

// ── JavaScript Runner ────────────────────────────────────────────────────────

export async function runJavaScript(code: string): Promise<RunResult> {
  const logs: string[] = [];
  const start = performance.now();

  try {
    // Create a sandboxed function with overridden console
    const sandbox = new Function(
      "console",
      `"use strict";
      ${code}`
    );

    const fakeConsole = {
      log: (...args: unknown[]) => logs.push(args.map(stringify).join(" ")),
      error: (...args: unknown[]) => logs.push("[error] " + args.map(stringify).join(" ")),
      warn: (...args: unknown[]) => logs.push("[warn] " + args.map(stringify).join(" ")),
      info: (...args: unknown[]) => logs.push(args.map(stringify).join(" ")),
      table: (data: unknown) => logs.push(JSON.stringify(data, null, 2)),
      dir: (obj: unknown) => logs.push(JSON.stringify(obj, null, 2)),
      clear: () => { logs.length = 0; },
    };

    const result = sandbox(fakeConsole);

    // If the code returns a value (expression), show it
    if (result !== undefined && logs.length === 0) {
      logs.push(stringify(result));
    }

    return {
      output: logs.join("\n"),
      error: null,
      durationMs: Math.round((performance.now() - start) * 100) / 100,
    };
  } catch (err: unknown) {
    const e = err as Error;
    return {
      output: logs.join("\n"),
      error: `${e.name}: ${e.message}`,
      durationMs: Math.round((performance.now() - start) * 100) / 100,
    };
  }
}

// ── Python Runner (Pyodide) ──────────────────────────────────────────────────

let pyodidePromise: Promise<PyodideInstance> | null = null;

interface PyodideInstance {
  runPython: (code: string) => unknown;
  runPythonAsync: (code: string) => Promise<unknown>;
  setStdout: (opts: { batched: (text: string) => void }) => void;
  setStderr: (opts: { batched: (text: string) => void }) => void;
}

declare global {
  interface Window {
    loadPyodide?: () => Promise<PyodideInstance>;
  }
}

async function loadPyodideRuntime(): Promise<PyodideInstance> {
  if (pyodidePromise) return pyodidePromise;

  pyodidePromise = new Promise<PyodideInstance>((resolve, reject) => {
    // Load the Pyodide CDN script
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js";
    script.onload = async () => {
      try {
        if (!window.loadPyodide) throw new Error("Pyodide failed to load");
        const pyodide = await window.loadPyodide();
        resolve(pyodide);
      } catch (err) {
        pyodidePromise = null;
        reject(err);
      }
    };
    script.onerror = () => {
      pyodidePromise = null;
      reject(new Error("Failed to load Pyodide CDN"));
    };
    document.head.appendChild(script);
  });

  return pyodidePromise;
}

export async function runPython(code: string): Promise<RunResult> {
  const logs: string[] = [];
  const start = performance.now();

  try {
    const pyodide = await loadPyodideRuntime();

    pyodide.setStdout({ batched: (text: string) => logs.push(text) });
    pyodide.setStderr({ batched: (text: string) => logs.push("[stderr] " + text) });

    const result = await pyodide.runPythonAsync(code);

    if (result !== undefined && result !== null && logs.length === 0) {
      logs.push(String(result));
    }

    return {
      output: logs.join("\n"),
      error: null,
      durationMs: Math.round((performance.now() - start) * 100) / 100,
    };
  } catch (err: unknown) {
    const e = err as Error;
    return {
      output: logs.join("\n"),
      error: e.message || String(err),
      durationMs: Math.round((performance.now() - start) * 100) / 100,
    };
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function stringify(val: unknown): string {
  if (val === null) return "null";
  if (val === undefined) return "undefined";
  if (typeof val === "string") return val;
  if (typeof val === "object") {
    try {
      return JSON.stringify(val, null, 2);
    } catch {
      return String(val);
    }
  }
  return String(val);
}
