import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
} from '@playwright/test/reporter';

/**
 * Fails list-mode discovery when a grep matches only disabled tests. Matrix
 * jobs may use --pass-with-no-tests because the preflight has already proved
 * that at least one normal slot or the isolated TC40 lane will execute.
 */
export default class RunnableTestReporter implements Reporter {
  private hasRunnableTest = false;

  printsToStdio(): boolean {
    return true;
  }

  onBegin(_config: FullConfig, suite: Suite): void {
    this.hasRunnableTest = suite
      .allTests()
      .some((test) => test.expectedStatus !== 'skipped');

    if (!this.hasRunnableTest) {
      console.error('The requested grep does not match a runnable Filings test.');
    }
  }

  async onEnd(
    _result: FullResult,
  ): Promise<{ status?: FullResult['status'] } | undefined> {
    return this.hasRunnableTest ? undefined : { status: 'failed' };
  }
}
