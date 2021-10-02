/** Number of issues to retrieve per page. Increasing this from 30 (the default) to 100 (the max) in order to decrease the number of requests. Docs: https://docs.github.com/en/rest/reference/issues#list-repository-issues--parameters */
const perPage = 100;
export async function filterIssues({ client, owner, repo, includedLabels = [], excludedLabels = [], }) {
    // Retrieve issues with all `includedLabels`.
    let issues = [];
    let pageIndex = 1;
    while (true) {
        const additionalIssues = (await client.rest.issues.listForRepo({
            owner,
            repo,
            labels: includedLabels.length > 0 ? includedLabels.join(",") : undefined,
            page: pageIndex++,
            per_page: perPage,
        }))?.data;
        if (!additionalIssues || additionalIssues.length === 0) {
            break;
        }
        else {
            issues = issues.concat(additionalIssues);
        }
    }
    // Match issues labeled without any `excludedLabels`.
    // Sort (for easier testing), convert to strings (implicitly), and space-delimit.
    const issueNumbers = issues
        .reduce((issueNumbers, issue) => {
        const labels = issue.labels.map((label) => typeof label === "string" ? label : label.name);
        if (!excludedLabels.some((l) => labels.includes(l))) {
            issueNumbers.push(issue.number);
        }
        return issueNumbers;
    }, [])
        .sort()
        .join(" ");
    return issueNumbers;
}
