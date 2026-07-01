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
export type RunUpdate = {
  status?: WorkerStatus;
  stderr?: string;
  stdout?: string;
};
export type RunPythonResult = {
  files: Blob[];
  result: string;
  timeElapsed: number;
};
type WorkerTransferredFile = {
  buffer: ArrayBuffer;
  name: string;
  type: string;
};
type WorkerRunPythonResult = {
  files: WorkerTransferredFile[];
  result: string;
  timeElapsed: number;
};

type UploadFileInput = {
  buffer: ArrayBuffer;
  name: string;
  size: number;
  type: string;
};

type PendingRequest = {
  onUpdate?: (update: RunUpdate) => void;
  reject: (reason?: unknown) => void;
  resolve: (value: unknown) => void;
};

type WorkerMessage =
  | {id: number; type: 'result'; result: unknown}
  | {id: number; type: 'error'; error: string}
  | {id: number; type: 'update'; update: RunUpdate};

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

      if (message.type === 'update') {
        pending.onUpdate?.(message.update);
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

  async runPython(code: string, onUpdate: (update: RunUpdate) => void) {
    const result = await this.request<WorkerRunPythonResult>(
      {code, type: 'run-python'},
      {onUpdate}
    );

    return {
      files: result.files.map(file => new Blob([file.buffer], {type: file.type})),
      result: result.result,
      timeElapsed: result.timeElapsed
    };
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
    options?: {onUpdate?: (update: RunUpdate) => void; transfer?: Transferable[]}
  ): Promise<T> {
    const id = this.nextRequestId++;

    return new Promise<T>((resolve, reject) => {
      this.pendingRequests.set(id, {onUpdate: options?.onUpdate, reject, resolve});

      this.worker.postMessage({id, ...payload}, options?.transfer ?? []);
    });
  }
}

export const pyodide = new PyodideClient();
