const logMethods = ['log', 'deprecated', 'info', 'group', 'groupCollapsed', 'groupEnd', 'table'];

module.exports = function _(opts) {
  return {
    visitor: {
      MemberExpression(path, state) {
        const object = path.get('object');

        if (object.isIdentifier({name: 'log'})) {
          const property = path.get('property');
          const methodName = logMethods.find(name => property.isIdentifier({name}));
          if (methodName) {
            // Uncomment to debug
            // console.log(`${state.file.opts.filename}: log.${methodName} removed`);
            path.parentPath.parentPath.remove();
          }
        }
      }
    }
  };
};
