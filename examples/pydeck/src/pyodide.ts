export type UploadedFileRecord = {
  originalName: string;
  path: string;
  storedName: string;
  size: number;
  type: string;
  uploadedAt: string;
};

export type PreloadedFileConfig = {
  name: string;
  url: string;
};

export type WorkerStatus = 'Loading packages...' | 'Running...';

type UploadFileInput = {
  buffer: ArrayBuffer;
  name: string;
  size: number;
  type: string;
};

type PendingRequest = {
  onStatus?: (status: WorkerStatus) => void;
  reject: (reason?: unknown) => void;
  resolve: (value: unknown) => void;
};

type WorkerMessage =
  | {id: number; type: 'result'; result: unknown}
  | {id: number; type: 'error'; error: string}
  | {id: number; type: 'status'; status: WorkerStatus};

function createWorker() {
  return new Worker(new URL('./pyodide-worker.ts', import.meta.url), {type: 'module'});
}

class PyodideClient {
  private nextRequestId = 0;
  private readonly pendingRequests = new Map<number, PendingRequest>();
  private readonly worker = createWorker();

  readonly ready: Promise<void>;

  constructor() {
    this.worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
      const message = event.data;
      const pending = this.pendingRequests.get(message.id);

      if (!pending) {
        return;
      }

      if (message.type === 'status') {
        pending.onStatus?.(message.status);
        return;
      }

      this.pendingRequests.delete(message.id);

      if (message.type === 'error') {
        pending.reject(new Error(message.error));
        return;
      }

      pending.resolve(message.result);
    };

    this.ready = this.request<void>({type: 'prepare-runtime'});
  }

  async getVersion() {
    return this.request<string>({type: 'get-version'});
  }

  async preloadFiles(files: PreloadedFileConfig[]) {
    return this.request<Record<string, UploadedFileRecord>>({files, type: 'preload-files'});
  }

  async runPython(code: string, onStatus?: (status: WorkerStatus) => void) {
    return this.request<string>({code, type: 'run-python'}, {onStatus});
  }

  async uploadFiles(files: UploadFileInput[]) {
    const transfer = files.map(file => file.buffer);
    return this.request<Record<string, UploadedFileRecord>>(
      {files, type: 'upload-files'},
      {transfer}
    );
  }

  private request<T>(
    payload: Record<string, unknown>,
    options?: {onStatus?: (status: WorkerStatus) => void; transfer?: Transferable[]}
  ): Promise<T> {
    const id = this.nextRequestId++;

    return new Promise<T>((resolve, reject) => {
      this.pendingRequests.set(id, {onStatus: options?.onStatus, reject, resolve});

      this.worker.postMessage({id, ...payload}, options?.transfer ?? []);
    });
  }
}

export const pyodide = new PyodideClient();
