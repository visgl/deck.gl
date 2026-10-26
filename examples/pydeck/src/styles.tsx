import styled, {createGlobalStyle, css} from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    overflow: hidden;
    font-family: sans-serif;
  }

  #app {
    width: 100vw;
    height: 100vh;
  }

  #root,
  #root * {
    box-sizing: border-box;
  }

  .inline-error > div {
    background: #fff1f0;
    border: 1px solid #ffccc7;
    border-radius: 6px;
    color: #a8071a;
    font-family: monospace;
    font-size: 12px;
    margin: 10px;
    padding: 8px;
    white-space: pre-wrap;
  }

  .gutter {
    flex: 0 0 auto;
    position: relative;
    background: #ececec;
  }

  .gutter.gutter-horizontal {
    width: 4px;
    cursor: col-resize;
    border-left: 1px solid #d7d7d7;
    border-right: 1px solid #d7d7d7;
  }

  .gutter.gutter-vertical {
    height: 4px;
    cursor: row-resize;
    border-top: 1px solid #d7d7d7;
    border-bottom: 1px solid #d7d7d7;
  }
`;

export const Root = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: stretch;
`;

export const LeftPane = styled.div.attrs({id: 'left-pane'})`
  flex: 0 0 auto;
  width: 40%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

export const Toolbar = styled.div.attrs({id: 'toolbar'})`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid #ccc;
  background: #f7f7f7;
`;

export const ToolbarTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const ToolbarLink = styled.a`
  color: #0b57d0;
  font-size: 13px;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

export const RunButton = styled.button`
  display: flex;
  gap: 4px;
  align-items: center;
  line-height: 1;
  padding: 6px 12px;
  border: 1px solid #999;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;

  &:disabled {
    opacity: 0.65;
    cursor: progress;
  }
`;

export const EditorPane = styled.div.attrs({id: 'editor'})`
  flex: 0 1 100%;
`;

export const RightPane = styled.div.attrs({id: 'right-pane'})`
  flex: 1 1 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
`;

const outputPaneCss = css`
  flex: 0 0 auto;
  min-height: 0;
`;

export const OutputPane = styled.section`
  ${outputPaneCss}
`;

export const HtmlPane = styled(OutputPane).attrs({className: 'output-pane html-pane'})`
  position: relative;
  background: #fff;

  iframe {
    width: 100%;
    height: 100%;
    border: none;
  }
`;

export const TextPane = styled(OutputPane).attrs({className: 'output-pane text-pane'})`
  overflow: auto;
  padding: 24px;
  background: #222;
  color: #fff;
  font-family: monospace;
  white-space: wrap;
`;

export const TextOutput = styled.pre`
  display: block;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font-family: inherit;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.45;
  white-space: pre-wrap;
  word-break: break-word;
`;

export const TextOutputPart = styled.span<{$type: 'stderr' | 'stdout'}>`
  color: ${({$type}) => ($type === 'stderr' ? '#ff9b9b' : 'inherit')};
`;

export const OutputEmpty = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #666;
  font-size: 13px;
`;

export const DropzoneSection = styled.section.attrs({id: 'dropzone'})`
  flex: 1 1 200px;
  min-height: fit-content;
  padding: 12px;
  border-top: 1px solid #ccc;
  background: #f7f7f7;
  font-size: 13px;
`;

export const FilesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
  max-height: 160px;
  overflow: auto;
`;

export const FileEntry = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 10px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background: #fff;
`;

export const FileMain = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1 1 auto;
`;

export const FileName = styled.div`
  overflow: hidden;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const FileInfo = styled.div`
  flex: 0 0 auto;
  color: #666;
  font-family: monospace;
  font-size: 12px;
  white-space: nowrap;
`;

export const CopyFileButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font: inherit;
  line-height: 1;

  &:hover {
    background: #f3f3f3;
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

export const DropzoneTarget = styled.div`
  padding: 12px;
  border: 1px dashed #bbb;
  border-radius: 6px;
  cursor: pointer;
  text-align: center;

  p {
    margin: 0;
  }
`;

export const DropzoneError = styled.p`
  margin-top: 8px;
  color: #a8071a;
`;
