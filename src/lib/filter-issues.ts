import type { getOctokit } from "@actions/github";
export type Client = ReturnType<typeof getOctokit>;
type Unwrapped<T> = T extends Promise<infer U> ? U : never;

interface FilterIssuesParameters {
  /** An authenticated GitHub API client. */
  client: Client;

  /** The owner of the repo containing the issues to filter. This is a GitHub username if the repo is user-owned, or a GitHub org name if the repo is org-owned. */
  owner: string;

  /** The name of the repo containing the issues to filter. */
  repo: string;

  /** A list of every label matched issues must include. */
  includedLabels?: string[];

  /** A list of any labels matched issues must not include. */
  excludedLabels?: string[];
}

export async function filterIssues({
  client,
  owner,
  repo,
  includedLabels = [],
  excludedLabels = [],
}: FilterIssuesParameters): Promise<string> {
  // Retrieve issues with all `includedLabels`.
  let issues: Unwrapped<
    ReturnType<typeof client.rest.issues.listForRepo>
  >["data"] = [];
  let pageIndex = 1;
  while (true) {
    const additionalIssues = (
      await client.rest.issues.listForRepo({
        owner,
        repo,
        labels:
          includedLabels.length > 0 ? includedLabels.join(",") : undefined,
        page: pageIndex++,
      })
    )?.data;
    if (!additionalIssues || additionalIssues.length === 0) {
      break;
    } else {
      issues = issues.concat(additionalIssues);
    }
  }

  // Match issues labeled without any `excludedLabels`.
  // Sort (for easier testing), convert to strings (implicitly), and space-delimit.
  const issueNumbers: string = issues
    .reduce((issueNumbers, issue) => {
      const labels = issue.labels.map(({ name }) => name);
      if (!excludedLabels.some((l) => labels.includes(l))) {
        issueNumbers.push(issue.number);
      }
      return issueNumbers;
    }, [] as number[])
    .sort()
    .join(" ");

  return issueNumbers;
}
