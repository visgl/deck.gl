# React Widgets Test App

Manual test app for verifying React widget behavior across different configurations.

## Running

```bash
# With published packages
npm install
npm start

# With local deck.gl source
npm run start-local
```

## Test Scenarios

### StrictMode ON (default)
- [ ] App loads with widgets visible
- [ ] Toggle Compass ON/OFF - widget appears/disappears smoothly
- [ ] Toggle Zoom ON/OFF - widget appears/disappears smoothly
- [ ] Switch to "widgets prop" mode - widgets still render
- [ ] Switch back to "JSX children" mode - widgets still render
- [ ] No console errors about duplicate widgets

### StrictMode OFF
- [ ] Toggle StrictMode OFF - app remounts correctly
- [ ] Toggle Compass ON/OFF - widget appears/disappears smoothly
- [ ] Toggle Zoom ON/OFF - widget appears/disappears smoothly
- [ ] Switch to "widgets prop" mode - widgets still render
- [ ] No console errors

### Both Modes
- [ ] No console errors about undefined properties
- [ ] Widgets are interactive (zoom buttons work, compass rotates)
- [ ] Fullscreen widget works (if supported by browser)

## What This Tests

1. **StrictMode compatibility** - React 18 StrictMode double-mounts components; widgets should not duplicate
2. **Reactive widget management** - Adding/removing widgets at runtime should work smoothly
3. **widgets prop vs JSX children** - Both approaches should work correctly
4. **Widget cleanup** - Removed widgets should be properly cleaned up from DOM
