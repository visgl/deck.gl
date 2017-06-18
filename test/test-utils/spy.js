// Inspired by https://github.com/popomore/spy
export default function(obj, func) {
  let methodName;

  if (!obj && !func) {
    func = function mock() {};
    obj = {};
    methodName = 'spy';
  } else if (typeof obj === 'function' && !func) {
    func = obj;
    obj = {};
    methodName = `${func.name}-spy`;
  } else {
    methodName = func;
    func = obj[methodName];
  }

  // will not wrap more than once
  if (func.func !== undefined) {
    return func;
  }

  function spy(...args) {
    spy.callCount++;
    spy.called = true;
    /* eslint-disable no-invalid-this */
    return func.apply(this, args);
  }

  spy.reset = () => {
    spy.callCount = 0;
    spy.called = false;
  };

  spy.restore = () => {
    obj[methodName] = func;
  };

  spy.obj = obj;
  spy.methodName = methodName;
  spy.func = func;
  spy.method = func;

  spy.reset();

  obj[methodName] = spy;
  return spy;
}
