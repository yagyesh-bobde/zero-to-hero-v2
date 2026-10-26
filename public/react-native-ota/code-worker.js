// Isolated, disposable execution for the course's small pure-JavaScript exercises.
// The parent terminates this worker after 2 seconds, including infinite loops.
self.onmessage = async ({ data }) => {
  try {
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
          passed: JSON.stringify(actual) === JSON.stringify(test.expected),
          actual: String(actual).slice(0, 160),
          expected: String(test.expected),
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
