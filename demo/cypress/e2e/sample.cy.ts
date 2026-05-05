describe("This is a sample test", () => {
  it("This should be a passing test", () => {
    expect(true).to.equal(true);
  });
  it("This should be a failing test", () => {
    expect(true).to.equal(false);
  });
  it.skip("This should be a skipped test", () => {
    expect(true).to.equal(true);
  });
  it("This should be a failing test", () => {
    expect(5).to.equal(1);
  });
  it("This should be a failing test", () => {
    expect(5).to.equal(1);
  });
});
