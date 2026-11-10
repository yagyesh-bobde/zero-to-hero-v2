// Runs learner code off the main thread. The page terminates this worker after 2 seconds,
// which is how infinite loops are stopped.
import { runTests, type RunnableProblem } from './runner';

export interface RunRequest {
  code: string;
  problem: RunnableProblem;
}

self.onmessage = (event: MessageEvent<RunRequest>) => {
  const { code, problem } = event.data;
  let reply: ReturnType<typeof runTests>;
  try {
    reply = runTests(code, problem);
  } catch (error) {
    reply = { results: [], error: String(error).slice(0, 500) };
  }
  self.postMessage(reply);
};
