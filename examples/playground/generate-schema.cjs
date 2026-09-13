const fs = require('fs');
const path = require('path');
const {
  AnyType,
  NeverType,
  SchemaGenerator,
  createFormatter,
  createParser,
  createProgram,
  ts
} = require('ts-json-schema-generator');

class ThisTypeNodeParser {
  supportsNode(node) {
    return node.kind === ts.SyntaxKind.ThisType;
  }

  createType() {
    return new AnyType();
  }
}

class ReadonlyTypeNodeParser {
  constructor(childNodeParser) {
    this.childNodeParser = childNodeParser;
  }

  supportsNode(node) {
    return (
      ts.isTypeReferenceNode(node) &&
      ts.isIdentifier(node.typeName) &&
      (node.typeName.text === 'Readonly' || node.typeName.text === 'ReadonlyArray') &&
      Boolean(node.typeArguments?.length)
    );
  }

  createType(node, context, reference) {
    const [innerType] = node.typeArguments;

    if (node.typeName.text === 'ReadonlyArray') {
      const arrayTypeNode = ts.factory.createArrayTypeNode(innerType);
      return this.childNodeParser.createType(arrayTypeNode, context, reference);
    }

    return this.childNodeParser.createType(innerType, context, reference);
  }
}

class ClassTypeNodeParser {
  constructor(typeChecker) {
    this.typeChecker = typeChecker;
  }

  supportsNode(node) {
    if (!ts.isTypeReferenceNode(node) && !ts.isExpressionWithTypeArguments(node)) {
      return false;
    }

    const target = ts.isTypeReferenceNode(node) ? node.typeName : node.expression;
    const symbol = this.getResolvedSymbol(target);
    return Boolean(symbol && symbol.declarations?.some(declaration => ts.isClassDeclaration(declaration)));
  }

  createType(node) {
    return new NeverType();
  }

  getResolvedSymbol(node) {
    const symbol = this.typeChecker.getSymbolAtLocation(node);

    if (!symbol) {
      return undefined;
    }

    return symbol.flags & ts.SymbolFlags.Alias ? this.typeChecker.getAliasedSymbol(symbol) : symbol;
  }
}

function isNeverSchema(schema) {
  if (!schema || typeof schema !== 'object' || Array.isArray(schema)) {
    return false;
  }

  if (
    !schema.not ||
    typeof schema.not !== 'object' ||
    Array.isArray(schema.not) ||
    Object.keys(schema.not).length !== 0
  ) {
    return false;
  }

  const annotationKeys = new Set([
    'description',
    'markdownDescription',
    'title',
    'default',
    'examples',
    '$comment',
    'readOnly',
    'writeOnly',
    'deprecated'
  ]);

  return Object.keys(schema).every(key => key === 'not' || annotationKeys.has(key));
}

function stripNever(schema) {
  if (!schema || typeof schema !== 'object') {
    return schema;
  }

  if (isNeverSchema(schema)) {
    return undefined;
  }

  if (Array.isArray(schema)) {
    return schema
      .map(item => stripNever(item))
      .filter(item => item !== undefined && !isNeverSchema(item));
  }

  if (schema.properties && typeof schema.properties === 'object') {
    for (const [key, value] of Object.entries(schema.properties)) {
      if (isNeverSchema(value)) {
        delete schema.properties[key];
        if (Array.isArray(schema.required)) {
          schema.required = schema.required.filter(name => name !== key);
        }
      } else {
        stripNever(value);
      }
    }
  }

  if (schema.definitions && typeof schema.definitions === 'object') {
    for (const [key, value] of Object.entries(schema.definitions)) {
      const strippedValue = stripNever(value);
      if (strippedValue === undefined || isNeverSchema(strippedValue)) {
        delete schema.definitions[key];
      } else {
        schema.definitions[key] = strippedValue;
      }
    }
  }

  for (const key of ['items', 'additionalProperties', 'contains', 'if', 'then', 'else']) {
    if (schema[key]) {
      schema[key] = stripNever(schema[key]);
      if (schema[key] === undefined) {
        delete schema[key];
      }
    }
  }

  for (const key of ['anyOf', 'oneOf', 'allOf']) {
    if (Array.isArray(schema[key])) {
      schema[key] = stripNever(schema[key]);
      if (schema[key].length === 0) {
        delete schema[key];
      }
    }
  }

  return schema;
}

const cwd = __dirname;
const rootDir = path.resolve(cwd, '..', '..');
const schemaPath = path.resolve(cwd, 'src/schema.ts');
const outPath = path.resolve(cwd, 'schema.generated.json');

const config = {
  path: schemaPath,
  tsconfig: path.resolve(rootDir, 'tsconfig.json'),
  type: 'DeckJson',
  expose: 'export',
  jsDoc: 'extended',
  functions: 'hide',
  skipTypeCheck: true
};

const program = createProgram(config);
const parser = createParser(program, config, prs => {
  prs.addNodeParser(new ThisTypeNodeParser());
  prs.addNodeParser(new ClassTypeNodeParser(program.getTypeChecker()));
  prs.addNodeParser(new ReadonlyTypeNodeParser(prs));
});
const formatter = createFormatter(config);
const generator = new SchemaGenerator(program, parser, formatter, config);
const schema = generator.createSchema(config.type);
stripNever(schema);

fs.writeFileSync(outPath, `${JSON.stringify(schema, null, 2)}\n`);
console.log(`Wrote ${outPath}`);
