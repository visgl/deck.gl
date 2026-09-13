import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react';
import Dropzone from 'react-dropzone';

import {CopyIcon, SpinnerIcon} from './icons';
import {PyodideClient, type PreloadedFileConfig, type UploadedFileRecord} from './pyodide';
import {
  CopyFileButton,
  DropzoneError,
  DropzoneSection,
  DropzoneTarget,
  FileEntry,
  FileInfo,
  FileMain,
  FileName,
  FilesList
} from './styles';

type FileDropProps = {
  engine: PyodideClient;
  preloadedFiles?: PreloadedFileConfig[];
};

export type FileDropHandle = {
  readonly isLoading: boolean;
  readonly loading: Promise<void>;
};

function createLoadingController() {
  let resolve!: () => void;
  const promise = new Promise<void>(res => {
    resolve = res;
  });

  return {promise, resolve};
}

export const FileDrop = forwardRef<FileDropHandle, FileDropProps>(function FileDrop(
  {engine, preloadedFiles = []}: FileDropProps,
  ref
) {
  const [copiedFileName, setCopiedFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<UploadedFileRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const loadingControllerRef = useRef<{promise: Promise<void>; resolve: () => void}>({
    promise: Promise.resolve(),
    resolve: () => {}
  });

  useImperativeHandle(
    ref,
    () => ({
      get isLoading() {
        return isLoading;
      },
      get loading() {
        return loadingControllerRef.current.promise;
      }
    }),
    [isLoading]
  );

  const beginLoading = useCallback(() => {
    loadingControllerRef.current = createLoadingController();
    setIsLoading(true);
  }, []);

  const finishLoading = useCallback(() => {
    loadingControllerRef.current.resolve();
    setIsLoading(false);
  }, []);

  useEffect(() => {
    beginLoading();

    engine
      .preloadFiles(preloadedFiles)
      .then(result => {
        setFiles(Object.values(result));
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        finishLoading();
      });
  }, [engine, preloadedFiles]);

  const handleUpload = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) {
        return;
      }

      beginLoading();
      setError(null);

      try {
        const filesToUpload = await Promise.all(
          acceptedFiles.map(async file => ({
            buffer: await file.arrayBuffer(),
            name: file.name,
            size: file.size,
            type: file.type
          }))
        );
        const nextUploadedFiles = await engine.uploadFiles(filesToUpload);
        setFiles(Object.values(nextUploadedFiles));
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        finishLoading();
      }
    },
    [beginLoading, engine, finishLoading]
  ) as (files: File[]) => void;

  const handleCopy = useCallback(async (fileName: string) => {
    const escapedFileName = fileName.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    await navigator.clipboard.writeText(`uploaded_files["${escapedFileName}"]`);
    setCopiedFileName(fileName);
    window.setTimeout(() => {
      setCopiedFileName(currentFileName => (currentFileName === fileName ? null : currentFileName));
    }, 1200);
  }, []);

  return (
    <Dropzone onDrop={handleUpload}>
      {({getRootProps, getInputProps}) => (
        <DropzoneSection>
          <FilesList>
            {files.map(file => (
              <FileEntry key={file.originalName}>
                <FileMain>
                  <FileName>{file.originalName}</FileName>
                  <CopyFileButton
                    aria-label={`Copy uploaded_files path for ${file.originalName}`}
                    onClick={event => {
                      event.preventDefault();
                      event.stopPropagation();
                      void handleCopy(file.originalName);
                    }}
                    title={
                      copiedFileName === file.originalName ? 'Copied' : 'Copy uploaded_files path'
                    }
                    type="button"
                  >
                    <CopyIcon />
                  </CopyFileButton>
                </FileMain>
                <FileInfo>{formatByteSize(file.size)}</FileInfo>
              </FileEntry>
            ))}
          </FilesList>
          <DropzoneTarget {...getRootProps()}>
            <input {...getInputProps()} />
            {isLoading ? (
              <SpinnerIcon />
            ) : (
              <p>Drag and drop some files here, or click to browse files</p>
            )}
            {error && <DropzoneError>{error}</DropzoneError>}
          </DropzoneTarget>
        </DropzoneSection>
      )}
    </Dropzone>
  );
});

function formatByteSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const units = ['KB', 'MB', 'GB', 'TB'];
  let value = bytes / 1024;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const roundedValue = value >= 10 ? value.toFixed(0) : value.toFixed(1);
  return `${roundedValue} ${units[unitIndex]}`;
}
