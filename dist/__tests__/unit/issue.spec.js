import { client, counter } from "./mocks";
import { filterIssues } from "../../lib/filter-issues";
describe("FilterIssues", () => {
    /** The owner of the repo containing the test issue. */
    const owner = "smockle";
    /** The name of the repo containing the test issue. */
    const repo = "action-filter-issues";
    beforeEach(() => {
        counter.reset();
        expect(counter.rest.issues.listForRepo).toEqual(0);
    });
    afterEach(() => {
        expect(counter.rest.issues.listForRepo).toEqual(1);
    });
    test("includes 'bug', no excludes => 2 matches", async () => {
        const issueNumbers = await filterIssues({
            client,
            owner,
            repo,
            includedLabels: ["bug"],
        });
        expect(issueNumbers).toEqual("1 2");
    });
    test("includes 'bug' and 'wip' => 1 match", async () => {
        const issueNumbers = await filterIssues({
            client,
            owner,
            repo,
            includedLabels: ["bug", "wip"],
        });
        expect(issueNumbers).toEqual("2");
    });
    test("includes 'bug', excludes 'wip' => 1 match", async () => {
        const issueNumbers = await filterIssues({
            client,
            owner,
            repo,
            includedLabels: ["bug"],
            excludedLabels: ["wip"],
        });
        expect(issueNumbers).toEqual("1");
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
    test("excludes an overly-restrictive set => 0 matches", async () => {
        const issueNumbers = await filterIssues({
            client,
            owner,
            repo,
            excludedLabels: ["wip", "not-wip"],
        });
        expect(issueNumbers).toEqual("");
    });
});
