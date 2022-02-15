import { client, counter } from "./mocks";
import { filterIssues } from "../../lib/filter-issues";

describe("FilterIssues", () => {
  /** The owner of the repo containing the test issue. */
  const owner: string = "smockle";

  /** The name of the repo containing the test issue. */
  const repo: string = "action-filter-issues";

  beforeEach(() => {
    client.reset();
    counter.reset();
    expect(counter.rest.issues.listForRepo).toEqual(0);
  });

  test("includes 'bug', no excludes => 2 matches", async () => {
    const issueNumbers = await filterIssues({
      client,
      owner,
      repo,
      includedLabels: ["bug"],
    });
    expect(issueNumbers).toEqual("3 4");
    expect(counter.rest.issues.listForRepo).toEqual(2);
  });

  test("includes 'bug', no excludes, requires pagination => 2 matches", async () => {
    const originalFn = client.rest.issues.listForRepo;
    const wrappedFn = ((params) =>
      originalFn({
        ...params,
        per_page: 1,
      } as typeof params)) as typeof originalFn;
    client.rest.issues.listForRepo = wrappedFn;
    const issueNumbers = await filterIssues({
      client,
      owner,
      repo,
      includedLabels: ["bug"],
    });
    expect(issueNumbers).toEqual("3 4");
    expect(counter.rest.issues.listForRepo).toEqual(3);
  });

  test("includes 'bug' and 'wip' => 1 match", async () => {
    const issueNumbers = await filterIssues({
      client,
      owner,
      repo,
      includedLabels: ["bug", "wip"],
    });
    expect(issueNumbers).toEqual("4");
    expect(counter.rest.issues.listForRepo).toEqual(2);
  });

  test("includes 'bug', excludes 'wip' => 1 match", async () => {
    const issueNumbers = await filterIssues({
      client,
      owner,
      repo,
      includedLabels: ["bug"],
      excludedLabels: ["wip"],
    });
    expect(issueNumbers).toEqual("3");
    expect(counter.rest.issues.listForRepo).toEqual(2);
  });

  test("includes an overly-restrictive set => 0 matches", async () => {
    const issueNumbers = await filterIssues({
      client,
      owner,
      repo,
      includedLabels: ["wip", "not-wip"],
    });
    expect(issueNumbers).toEqual("");
    expect(counter.rest.issues.listForRepo).toEqual(1);
  });

  test("excludes an overly-restrictive set => 0 matches", async () => {
    const issueNumbers = await filterIssues({
      client,
      owner,
      repo,
      excludedLabels: ["wip", "not-wip"],
    });
    expect(issueNumbers).toEqual("");
    expect(counter.rest.issues.listForRepo).toEqual(2);
  });
});
