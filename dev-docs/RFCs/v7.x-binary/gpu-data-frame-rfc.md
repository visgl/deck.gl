# RFC: GPU Data Frame Support

* Authors: Ib Green, ...
* Date: March, 2019
* Status: **Draft**

This RFC is a component of deck.gl's "binary support roadmap".

This RFC is independent of, but would benefit from:
* [Texture Attribute RFC](/dev-docs/v7.x/texture-attribute-rfc.md) - Enable _variable-primitive layers_ read "descriptive attributes" from a single column value.
* [Chunked Data Support](/dev-docs/v7.x/chunked-data-rfc.md) - Proposal for enabling deck.gl to work directly with Chunked Columnar data.


## Summary

This RFC proposes a way to run data frame **filters** directly on the GPU, allowing ultra efficient filtering of massive (chunked) columnar tables, as well as offering (partial) parity between data frame operations on JS side and GPU side.

Basically, the app will be able to specify a zero cost filter in JS and immediately see it applied to every data row data during rendering without any memory being copied or memory.


## Background

Data Frame operations allow applications to slice and dice data in large data tables (multi gigabyte) at effectively "zero cost". This is done by a variety of techniques, including applying "abstract filters" to the data frame that are not applied until the application iterates over the data.

This deferral, in combination with the abstract filter specification, makes it possible to a generate GLSL function that implements the filter and use that function when rendering the data to drop any elements that do not pass filtering.

Filter predicates are built as trees using And, Or, Not, Value, Literal, Eq, LTEq, GTEq. This simple tree grammar allows for code generation using recursive descent. A possible complication is that type information may need to be inferred when dealing with literals or values to ensure correct GLSL is emitted.


## Downsides

**Shader recompilation** would need to be supported for non-trivial cases. One can imagine having a small subset of simple filters supported by a generic code path, and only resort to code generation for more complex cases to avoid the cost of regeneration.

Shader regeneration cost is so high that it could cause stutter e.g. when user modifies a filter through dragging a slider, but presumably this would be implemented by keeping the predicate fixed and using a `Value` predicate (semantics to be confirmed).

We could either detect no change and avoid regenerating the GLSL predicate, or just rely on our shader cache to catch the unchanged shader and prevent recompiliation.


### Custom filters

While Arrow predices support custom JavaScript filters, it is not generally possible to support such filters on the GPU, it would however be possible to support custom GLSL filters as an extension to Arrow (we might be able to add a "`GLSLPredicate`" subclass that does nothing under Arrow).


## Other data frame operations

Filtering using predicates is only one option. There are other "zero cost" changes that can be done to data frames, we should consider each one to ensure we support it as efficiently as possible.

* Slicing tables - modify start and end index of draw calls
* Dropping/adding columns - causes new table structure to be defined
* ...


## Other filtering considerations

Representations like Arrow support other concepts, like null maps (a binary array cannot represent missing values). Presumably such values should be automatically filtered out, by exposing the null maps to the GPU we can also handle this case.

Supporting null maps requires two attribute slots per column and will put pressure on the WebGL2-mandated lower limit of 32 attributes (16 in WebGL1...), so we may want to offer user control of this feature.


## Example Code

This is a slightly pseudo-codish example of how Apache Arrow data frame predicates could be converted to GLSL. These functions could go into a `deck.gl/arrow` module that would provide glue code to get Arrow API constructions mapped to deck.gl GPU concepts.

```js
import {predicate} from 'apache-arrow';

function mapArrowSchemaToGPUAttributes(schema) {
  const gpuSchema = {};
  for (const field of schema.fields) {
    console.log(field);

    switch (field.type) {
    case Int:
      break;
    case Float:
      break;
    case Bool:
      break;
    case Date:
      break;
    }
  }
}

function convertPredicateToGLSL(arrowPredicate, gpuSchema) {
  const {left, right} = convertBinaryPredicateComponentsToGLSL(arrowPredicate, gpuSchema);
  switch (arrowPredicate) {

  // Comparisons
  case predicate.Eq:
    // == Does not work well for Floats, but maybe OK as JS would have same issue?
    return `(${left} == ${right})`;
  case predicate.GTeq:
    return `(${left} >= ${right})`;
  case predicate.LTeq:
    return `(${left} <= ${right})`;

  case predicate.And:
    return `(${left} && ${right})`;
  case predicate.Or:
    return `(${left} || ${right})`;
  case predicate.Not:
    const expression = convertPredicateToGLSL(arrowPredicate.l, gpuSchema);
    return `(!${expression})`;

  case predicate.Col:
    const attribute = gpuSchema.getColumnAttribute(arrowPredicate.name);
    return attribute.name;

  case predicate.Literal:
    return convertLiteralToGLSL(arrowPredicate, gpuSchema);

  // case predicate.Value:
  //   return convertLiteralToGLSL(attribute, gpuSchema);

  case predicate.Custom:
    // TODO - support custom GLSL predicates
    throw new Error('Cant convert custom predicates to GLSL');

  default:
    throw new Error('Unknown Arrow predicate');
  }
}

function convertBinaryPredicateComponentsToGLSL(arrowPredicate, gpuSchema) {
  return {
    left: arrowPredicate.left && convertPredicateToGLSL(arrowPredicate.left, gpuSchema),
    right: arrowPredicate.right && convertPredicateToGLSL(arrowPredicate.right, gpuSchema)
  };
}

function convertLiteralToGLSL(arrowPredicate) {
  // TBA
}

```
