import {loadPyodide} from 'https://cdn.jsdelivr.net/pyodide/v314.0.0/full/pyodide.mjs';

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

const uploadedFiles: Record<string, UploadedFileRecord> = {};

const pyodideReadyPromise = (async () => {
  const pyodide = await loadPyodide();
  pyodide.FS.mkdirTree(UPLOADS_DIR);
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

function postResult(id: number, result: unknown) {
  self.postMessage({id, type: 'result', result});
}

function postError(id: number, error: string) {
  self.postMessage({id, type: 'error', error});
}

function postStatus(id: number, status: WorkerStatus) {
  self.postMessage({id, type: 'status', status});
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
        postStatus(request.id, 'Loading packages...');
        await runtimeReadyPromise;
        await pyodide.loadPackagesFromImports(request.code);
        postStatus(request.id, 'Running...');
        const result = await pyodide.runPython(request.code);
        postResult(request.id, String(result));
        return;
      }
      default:
        throw new Error('Unknown worker request');
    }
  } catch (error) {
    postError(request.id, error instanceof Error ? error.message : String(error));
  }
};
