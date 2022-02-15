import github from "@actions/github";
import { Client, filterIssues } from "../../lib/filter-issues";

describe("FilterIssues", () => {
  /** The owner of the repo containing the test issue. */
  const owner: string = "smockle";

  /** The name of the repo containing the test issue. */
  const repo: string = "action-filter-issues";

  /** An authenticated GitHub API client. */
  let client: Client;

  beforeAll(async () => {
    const token = process.env.GH_TOKEN;
    if (!token) {
      throw new Error(
        "Failed to retrieve a GitHub token. A GitHub token with the `public_repo` (for use in public repos) or `repo` (for use in private repos) scope is required to be present in the environment as `GH_TOKEN` to run integration tests."
      );
    }
    client = github.getOctokit(token);
  });

  test("includes 'bug', no excludes => 2 matches", async () => {
    const issueNumbers = await filterIssues({
      client,
      owner,
      repo,
      includedLabels: ["bug"],
    });
    expect(issueNumbers).toEqual("3 4");
  });

  test("includes 'bug' and 'wip' => 1 match", async () => {
    const issueNumbers = await filterIssues({
      client,
      owner,
      repo,
      includedLabels: ["bug", "wip"],
    });
    expect(issueNumbers).toEqual("4");
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
  });

  test("includes an overly-restrictive set => 0 matches", async () => {
    const issueNumbers = await filterIssues({
      client,
      owner,
      repo,
      includedLabels: ["wip", "not-wip"],
    });
    expect(issueNumbers).toEqual("");
  });

  // Skipping: Newly-opened issues/PRs may cause this to flake.
  test.skip("excludes an overly-restrictive set => 0 matches", async () => {
    const issueNumbers = await filterIssues({
      client,
      owner,
      repo,
      excludedLabels: ["wip", "not-wip"],
    });
    expect(issueNumbers).toEqual("");
  });
});
