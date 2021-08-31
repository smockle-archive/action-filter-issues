export async function filterIssues({ client, owner, repo, includedLabels = [], excludedLabels = [], }) {
    // Retrieve issues.
    const issues = (await client.rest.issues.listForRepo({
        owner,
        repo,
    }))?.data;
    // Match issues labeled with every `includedLabels` and no `excludedLabels`.
    // Sort (for easier testing), convert to strings (implicitly), and space-delimit.
    const issueNumbers = issues
        .reduce((issueNumbers, issue) => {
        const labels = issue.labels.map(({ name }) => name);
        if (includedLabels.every((l) => labels.includes(l)) &&
            !excludedLabels.some((l) => labels.includes(l))) {
            issueNumbers.push(issue.number);
        }
        return issueNumbers;
    }, [])
        .sort()
        .join(" ");
    return issueNumbers;
}
