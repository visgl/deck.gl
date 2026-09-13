import * as React from 'react';
import {forwardRef, useImperativeHandle, useRef} from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import MonacoEditor from '@monaco-editor/react';

export type EditorHandle = {
  getValue: () => string;
  showError: (error: {lineNumber: number; message: string} | null) => void;
};

export function clearErrorZone(editor: any, zoneIdRef: React.MutableRefObject<string | null>) {
  if (!editor || !zoneIdRef.current) {
    return;
  }

  editor.changeViewZones(accessor => {
    accessor.removeZone(zoneIdRef.current!);
  });
  zoneIdRef.current = null;
}

export const Editor = forwardRef<EditorHandle, {defaultValue: string}>(function Editor(
  {defaultValue},
  ref
) {
  const editorRef = useRef<any>(null);
  const errorZoneRef = useRef<string | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      getValue: () => editorRef.current?.getValue() ?? '',
      showError: error => {
        if (!editorRef.current) {
          return;
        }

        clearErrorZone(editorRef.current, errorZoneRef);

        if (!error) {
          return;
        }

        const domNode = document.createElement('div');
        domNode.className = 'inline-error';
        const contentNode = document.createElement('div');
        domNode.append(contentNode);
        contentNode.textContent = error.message;

        editorRef.current.changeViewZones(accessor => {
          errorZoneRef.current = accessor.addZone({
            afterLineNumber: error.lineNumber,
            domNode,
            heightInLines: error.message.split('\n').length + 1
          });
        });
        editorRef.current.revealLineInCenter(error.lineNumber);
      }
    }),
    []
  );

  return (
    <AutoSizer>
      {({width, height}) => (
        <MonacoEditor
          width={`${width}px`}
          height={`${height}px`}
          defaultLanguage="python"
          defaultValue={defaultValue}
          onMount={editor => {
            editorRef.current = editor;
          }}
          theme="light"
          options={{scrollBeyondLastLine: false, minimap: {enabled: false}}}
        />
      )}
    </AutoSizer>
  );
});
