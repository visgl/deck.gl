import CodeBlock from '@theme/CodeBlock';
import '@deck.gl/widgets/stylesheet.css';
import {ScreenshotWidget, DarkTheme, LightTheme, DarkGlassTheme, LightGlassTheme} from '@deck.gl/widgets';
import {DeckGL} from '@deck.gl/react';

function Widget({ cls = ScreenshotWidget, props = {} }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: 52 }}>
      <div style={{ pointerEvents: 'auto', position: 'absolute', height: '100%', width: '100%', zIndex: 1000 }}/>
      <DeckGL widgets={[new cls(props)]}/>
    </div>
  )
}

export function WidgetPreview({ cls = ScreenshotWidget, props = {} }) {
  return (
    <div style={{display: 'flex', width: '100%', marginBottom: 16, borderRadius: 8, background: "url('/images/examples/scatterplot-layer.jpg')" }}>
      <Widget cls={cls} props={props}/>
    </div>
  )
}


const THEMES = [
  { code: "import {DarkTheme} from '@deck.gl/widgets';", theme: DarkTheme },
  { code: "import {LightTheme} from '@deck.gl/widgets';", theme: LightTheme },
  { code: "import {DarkGlassTheme} from '@deck.gl/widgets';", theme: DarkGlassTheme },
  { code: "import {LightGlassTheme} from '@deck.gl/widgets';", theme: LightGlassTheme }
]

export function WidgetThemes({ themes = THEMES }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Preview</th>
          <th>Theme</th>
        </tr>
      </thead>
      <tbody>
        {themes.map(({ code, theme }) => (
          <tr key={code}>
            <td><Widget props={{style: theme}}/></td>
            <td><CodeBlock language="ts">{code}</CodeBlock></td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
