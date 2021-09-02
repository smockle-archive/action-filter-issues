export async function filterIssues({ client, owner, repo, includedLabels = [], excludedLabels = [], }) {
    // Retrieve issues with all `includedLabels`.
    const issues = (await client.rest.issues.listForRepo({
        owner,
        repo,
        labels: includedLabels.length > 0 ? includedLabels.join(",") : undefined,
    }))?.data;
    // Match issues labeled without any `excludedLabels`.
    // Sort (for easier testing), convert to strings (implicitly), and space-delimit.
    const issueNumbers = issues
        .reduce((issueNumbers, issue) => {
        const labels = issue.labels.map(({ name }) => name);
        if (!excludedLabels.some((l) => labels.includes(l))) {
            issueNumbers.push(issue.number);
        }
        return issueNumbers;
    }, [])
        .sort()
        .join(" ");
    return issueNumbers;
}
