import { test, expect } from '../support/pwtest';

test.describe.skip("This is a sample test", () => {
  test("This should be a passing test", async () => {
    expect(true).to.equal(true);
  });

  test("This should be a failing test", async () => {
    expect(true).to.equal(false);
  });

  test.skip("This should be a skipped test", async () => {
    expect(true).to.equal(true);
  });

  test("This should be a failing test (2)", async () => {
    expect(5).to.equal(1);
  });

  test("This should be a failing test (3)", async () => {
    expect(5).to.equal(1);
  });
});
