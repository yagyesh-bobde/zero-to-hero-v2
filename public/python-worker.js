/* Real Python execution in an isolated, terminable browser worker. */
let runtime;
let output = '';
async function initialize() {
  if (!runtime)
    runtime = (async () => {
      importScripts('https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js');
      const py = await loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/' });
      const append = (text) => {
        if (output.length < 50000) output += text.slice(0, 50000 - output.length) + '\n';
      };
      py.setStdout({ batched: append });
      py.setStderr({ batched: append });
      return py;
    })();
  return runtime;
}
self.onmessage = async ({ data }) => {
  try {
    const py = await initialize();
    self.postMessage({ type: 'ready' });
    if (data.type === 'init') return;
    output = '';
    const scope = py.runPython("dict(__name__='__main__')");
    try {
      await py.runPythonAsync(
        data.code + (data.tests ? '\n\n# Course checks\n' + data.tests : ''),
        { globals: scope },
      );
      self.postMessage({
        type: 'result',
        ok: true,
        output:
          output || (data.tests ? 'All checks passed.' : 'Finished. Add print() to see output.'),
      });
    } catch (error) {
      self.postMessage({ type: 'result', ok: false, output: output + String(error) });
    } finally {
      scope.destroy();
    }
  } catch (error) {
    runtime = undefined;
    self.postMessage({
      type: 'error',
      output: 'Python could not load. Check your connection and try again.\n' + String(error),
    });
  }
};
