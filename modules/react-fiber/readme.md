TODOs

- [ ] It seems changing callback functions on props (hot reload) does not take affect

Injecting a custom or third party layer:

```jsx
class MyCoolLayer extends CompositeLayer {
  ...
}

// inject into renderer
extend({ MyCoolLayer });

// use in react
<myCoolLayer />
```

---

If you declaratively add a View to your tree all layers under that view will by default only render in that view. Caveat is if you provide a custom `filterLayers` on the root DeckGL component this feature will be overridden with your own custom logic.

```jsx
<DeckGL>
  <mapView id="main">
    <MainApplicationLayers />
  </mapView>
  <Some>
    <Nested>
      <mapView id="minimap">
        <MinimapLayers />
      </mapView>
    </Nested>
  </Some>
</DeckGL>
```

---

Ordering of layers is based on the React tree e.g.

```jsx
<MainApplication>
  <bitmapLayer />
  <scatterplotLayer />
  <lineLayer />
  <Some>
    <Nested>
      <Component>
        <myCustomLayer />
      </Component>
    </Nested>
  </Some>
  ...
</MainApplication>
```

will pass the following to deck's `layers` prop:

```
[bitmapLayer, scatterplotLayer, lineLayer, myCustomLayer]
```
