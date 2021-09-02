import type { getOctokit } from "@actions/github";
export type Client = ReturnType<typeof getOctokit>;

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
  const issues = (
    await client.rest.issues.listForRepo({
      owner,
      repo,
      labels: includedLabels.length > 0 ? includedLabels.join(",") : undefined,
    })
  )?.data;

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
