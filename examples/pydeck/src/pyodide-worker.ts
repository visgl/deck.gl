const PYODIDE_CDN_URL = 'https://cdn.jsdelivr.net/pyodide/v314.0.2/full/pyodide.mjs';

const UPLOADS_DIR = '/uploads';

type UploadedFileRecord = {
  originalName: string;
  path: string;
  storedName: string;
  size: number;
  type: string;
  uploadedAt: string;
};

type PreloadedFileConfig = {
  name: string;
  url: string;
};

type UploadFileInput = {
  buffer: ArrayBuffer;
  name: string;
  size: number;
  type: string;
};

type WorkerRequest =
  | {id: number; type: 'prepare-runtime'}
  | {id: number; type: 'get-version'}
  | {id: number; type: 'preload-files'; files: PreloadedFileConfig[]}
  | {id: number; type: 'upload-files'; files: UploadFileInput[]}
  | {id: number; type: 'run-python'; code: string};

type WorkerStatus = 'Loading packages...' | 'Running...';
type RunUpdate = {
  status?: WorkerStatus;
  stderr?: string;
  stdout?: string;
};
type RunPythonResult = {
  files: Array<{
    buffer: ArrayBuffer;
    name: string;
    type: string;
  }>;
  result: string;
  timeElapsed: number;
};
type FileSnapshotEntry = {
  mtime: number;
  size: number;
};

const knownModules = new Set(['pandas', 'pydeck']);
const uploadedFiles: Record<string, UploadedFileRecord> = {};
let currentRunRequestId: number | null = null;
let pendingStderr = '';
let pendingStdout = '';
let flushScheduled = false;
let captureStreams = false;

const pyodideReadyPromise = (async () => {
  const {loadPyodide} = await import(PYODIDE_CDN_URL);
  const pyodide = await loadPyodide();
  pyodide.FS.mkdirTree(UPLOADS_DIR);
  pyodide.setStdout({
    raw(charCode: number) {
      if (!captureStreams) {
        return;
      }
      pendingStdout += String.fromCharCode(charCode);
      scheduleFlush();
    }
  });
  pyodide.setStderr({
    raw(charCode: number) {
      if (!captureStreams) {
        return;
      }
      pendingStderr += String.fromCharCode(charCode);
      scheduleFlush();
    }
  });
  pyodide.runPython(`
import json
uploaded_files = json.loads("{}")
  `);
  return pyodide;
})();

const runtimeReadyPromise = (async () => {
  const pyodide = await pyodideReadyPromise;
  await pyodide.loadPackage(['micropip', 'pandas']);
  const micropip = pyodide.pyimport('micropip');
  await micropip.install('pydeck');
})();

function postResult(id: number, result: unknown, transfer: Transferable[] = []) {
  self.postMessage({id, type: 'result', result}, transfer);
}

function postError(id: number, error: string) {
  self.postMessage({id, type: 'error', error});
}

function postUpdate(id: number, update: RunUpdate) {
  self.postMessage({id, type: 'update', update});
}

function resetRunStreams() {
  pendingStdout = '';
  pendingStderr = '';
  flushScheduled = false;
}

function flushPendingOutput() {
  if (currentRunRequestId === null) {
    resetRunStreams();
    return;
  }

  const update: RunUpdate = {};

  if (pendingStdout) {
    update.stdout = pendingStdout;
    pendingStdout = '';
  }

  if (pendingStderr) {
    update.stderr = pendingStderr;
    pendingStderr = '';
  }

  flushScheduled = false;

  if (update.stdout || update.stderr) {
    postUpdate(currentRunRequestId, update);
  }
}

function scheduleFlush() {
  if (flushScheduled) {
    return;
  }

  flushScheduled = true;
  queueMicrotask(() => {
    flushPendingOutput();
  });
}

function getUniqueStoredName(fileName: string) {
  const lastDot = fileName.lastIndexOf('.');
  const hasExtension = lastDot > 0;
  const baseName = hasExtension ? fileName.slice(0, lastDot) : fileName;
  const extension = hasExtension ? fileName.slice(lastDot) : '';
  const safeBaseName = baseName.replace(/[^a-zA-Z0-9-_]+/g, '_') || 'upload';
  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return `${safeBaseName}__${uniqueSuffix}${extension}`;
}

async function syncUploadedFiles(pyodide: any) {
  const uploadedFilePaths = Object.fromEntries(
    Object.entries(uploadedFiles).map(([fileName, fileRecord]) => [fileName, fileRecord.path])
  );

  pyodide.globals.set('__uploaded_files_json', JSON.stringify(uploadedFilePaths));
  pyodide.runPython(`
import json
uploaded_files = json.loads(__uploaded_files_json)
  `);
}

function findImports(pyodide: any, code: string): string[] {
  pyodide.globals.set('__source_for_import_scan', code);
  const imports = pyodide.runPython(`
from pyodide.code import find_imports

find_imports(__source_for_import_scan)
  `);

  return Array.isArray(imports) ? imports : imports.toJs();
}

function getMimeType(path: string): string {
  const normalizedPath = path.toLowerCase();

  if (normalizedPath.endsWith('.html') || normalizedPath.endsWith('.htm')) {
    return 'text/html';
  }
  if (normalizedPath.endsWith('.json')) {
    return 'application/json';
  }
  if (normalizedPath.endsWith('.csv')) {
    return 'text/csv';
  }
  if (
    normalizedPath.endsWith('.txt') ||
    normalizedPath.endsWith('.log') ||
    normalizedPath.endsWith('.md')
  ) {
    return 'text/plain';
  }
  if (normalizedPath.endsWith('.svg')) {
    return 'image/svg+xml';
  }
  if (normalizedPath.endsWith('.png')) {
    return 'image/png';
  }
  if (normalizedPath.endsWith('.jpg') || normalizedPath.endsWith('.jpeg')) {
    return 'image/jpeg';
  }
  if (normalizedPath.endsWith('.gif')) {
    return 'image/gif';
  }
  if (normalizedPath.endsWith('.webp')) {
    return 'image/webp';
  }

  return 'application/octet-stream';
}

function getBasename(path: string): string {
  const segments = path.split('/');
  return segments[segments.length - 1] || path;
}

function getMonitoredRoots(pyodide: any): string[] {
  const cwd = String(
    pyodide.runPython(`
import os
os.getcwd()
  `)
  );
  return Array.from(new Set([cwd, UPLOADS_DIR]));
}

function snapshotDirectory(pyodide: any, path: string, snapshot: Map<string, FileSnapshotEntry>) {
  let stat;

  try {
    stat = pyodide.FS.stat(path);
  } catch {
    return;
  }

  if (pyodide.FS.isFile(stat.mode)) {
    snapshot.set(path, {
      mtime: Number(stat.mtime),
      size: Number(stat.size)
    });
    return;
  }

  if (!pyodide.FS.isDir(stat.mode)) {
    return;
  }

  for (const entry of pyodide.FS.readdir(path)) {
    if (entry === '.' || entry === '..') {
      continue;
    }

    const childPath = path === '/' ? `/${entry}` : `${path}/${entry}`;
    snapshotDirectory(pyodide, childPath, snapshot);
  }
}

function takeFilesystemSnapshot(pyodide: any): Map<string, FileSnapshotEntry> {
  const snapshot = new Map<string, FileSnapshotEntry>();

  for (const root of getMonitoredRoots(pyodide)) {
    snapshotDirectory(pyodide, root, snapshot);
  }

  return snapshot;
}

function getWrittenFiles(pyodide: any, before: Map<string, FileSnapshotEntry>) {
  const after = takeFilesystemSnapshot(pyodide);
  const files: RunPythonResult['files'] = [];
  const transfer: Transferable[] = [];

  for (const [path, entry] of after.entries()) {
    const previousEntry = before.get(path);
    const isChanged =
      !previousEntry || previousEntry.mtime !== entry.mtime || previousEntry.size !== entry.size;

    if (!isChanged) {
      continue;
    }

    const bytes = pyodide.FS.readFile(path, {encoding: 'binary'});
    const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);

    files.push({
      buffer,
      name: getBasename(path),
      type: getMimeType(path)
    });
    transfer.push(buffer);
  }

  return {files, transfer};
}

async function registerUploadedFile(pyodide: any, file: UploadFileInput) {
  const previousRecord = uploadedFiles[file.name];
  const storedName = getUniqueStoredName(file.name);
  const path = `${UPLOADS_DIR}/${storedName}`;

  pyodide.FS.writeFile(path, new Uint8Array(file.buffer));

  if (previousRecord) {
    try {
      pyodide.FS.unlink(previousRecord.path);
    } catch {
      // Ignore stale file cleanup failures and keep the latest upload registered.
    }
  }

  uploadedFiles[file.name] = {
    originalName: file.name,
    path,
    storedName,
    size: file.size,
    type: file.type,
    uploadedAt: new Date().toISOString()
  };
}

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const request = event.data;

  try {
    const pyodide = await pyodideReadyPromise;

    switch (request.type) {
      case 'prepare-runtime':
        await runtimeReadyPromise;
        postResult(request.id, true);
        return;
      case 'get-version': {
        const result = await pyodide.runPython(`
            import sys
            sys.version
        `);
        postResult(request.id, String(result));
        return;
      }
      case 'preload-files': {
        for (const file of request.files) {
          const response = await fetch(file.url);

          if (!response.ok) {
            throw new Error(
              `Failed to preload ${file.name}: ${response.status} ${response.statusText}`
            );
          }

          const buffer = await response.arrayBuffer();
          await registerUploadedFile(pyodide, {
            buffer,
            name: file.name,
            size: buffer.byteLength,
            type: response.headers.get('content-type') ?? ''
          });
        }

        await syncUploadedFiles(pyodide);
        postResult(request.id, uploadedFiles);
        return;
      }
      case 'upload-files': {
        for (const file of request.files) {
          await registerUploadedFile(pyodide, file);
        }

        await syncUploadedFiles(pyodide);
        postResult(request.id, uploadedFiles);
        return;
      }
      case 'run-python': {
        const startedAt = performance.now();
        currentRunRequestId = request.id;
        resetRunStreams();
        postUpdate(request.id, {status: 'Loading packages...'});
        await runtimeReadyPromise;
        const importedModules = findImports(pyodide, request.code);
        const hasUnknownImports = importedModules.some(moduleName => !knownModules.has(moduleName));

        if (hasUnknownImports) {
          captureStreams = false;
          await pyodide.loadPackagesFromImports(request.code);
          importedModules.forEach(moduleName => {
            knownModules.add(moduleName);
          });
        }
        postUpdate(request.id, {status: 'Running...'});
        captureStreams = true;
        const filesystemBeforeRun = takeFilesystemSnapshot(pyodide);
        const result = await pyodide.runPython(request.code);
        flushPendingOutput();
        const writtenFiles = getWrittenFiles(pyodide, filesystemBeforeRun);
        const payload: RunPythonResult = {
          files: writtenFiles.files,
          result: String(result),
          timeElapsed: performance.now() - startedAt
        };
        captureStreams = false;
        currentRunRequestId = null;
        postResult(request.id, payload, writtenFiles.transfer);
        return;
      }
      default:
        throw new Error('Unknown worker request');
    }
  } catch (error) {
    captureStreams = false;
    flushPendingOutput();
    currentRunRequestId = null;
    postError(request.id, error instanceof Error ? error.message : String(error));
  }
};
