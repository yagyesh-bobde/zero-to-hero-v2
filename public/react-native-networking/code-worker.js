// Isolated, disposable execution for the course's small pure-JavaScript exercises.
// The parent terminates this worker after 2 seconds, including infinite loops.
self.onmessage = async ({ data }) => {
  try {
    const equal = (a, b) => {
      if (Object.is(a, b)) return true;
      if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;
      if (Array.isArray(a) !== Array.isArray(b)) return false;
      const keys = Object.keys(a).sort();
      return (
        keys.length === Object.keys(b).length &&
        keys.every((key) => Object.hasOwn(b, key) && equal(a[key], b[key]))
      );
    };
    const display = (value) =>
      (typeof value === 'string' ? value : JSON.stringify(value)) ?? String(value);
    const { code, functionName, tests } = data;
    const fn = new Function(
      '"use strict";\n' +
        code +
        '\nreturn typeof ' +
        functionName +
        ' === "function" ? ' +
        functionName +
        ' : null;',
    )();
    if (!fn) throw new Error('Define the function ' + functionName + ' with the given signature.');
    const results = [];
    for (const test of tests) {
      try {
        const actual = await fn(...structuredClone(test.args));
        results.push({
          name: test.name,
          passed: equal(actual, test.expected),
          actual: display(actual).slice(0, 500),
          expected: display(test.expected),
        });
      } catch (error) {
        results.push({
          name: test.name,
          passed: false,
          actual: String(error).slice(0, 160),
          expected: String(test.expected),
        });
      }
    }
    self.postMessage({ results });
  } catch (error) {
    self.postMessage({ error: String(error).slice(0, 500) });
  }
};
