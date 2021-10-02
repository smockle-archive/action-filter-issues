import fs from "fs";
import url from "url";
import { promisify } from "util";
import v8 from "v8";
const readFile = promisify(fs.readFile);
const { URL } = url;
export async function listForRepoMock(params) {
    // Track the number of times 'listForRepoMock' has been called.
    counter.rest.issues.listForRepo++;
    // Return mock data read from a file.
    const path = new URL("./getIssuesResponse.json", import.meta.url);
    const unparsedResponse = await readFile(path, "utf8");
    const unfilteredResponse = JSON.parse(unparsedResponse);
    // ref: https://docs.github.com/en/rest/reference/issues#list-issues-assigned-to-the-authenticated-user--parameters
    // Retrieve labels from request params
    const includedLabels = params.labels?.split(",") ?? [];
    // Retrieve paging info from request params
    const perPage = params.per_page ?? 30;
    const page = params.page ?? 1;
    // Filter non-matching issues from the mock data, then
    // group the remaining issues into pages
    const pages = unfilteredResponse.data
        .filter((issue) => {
        const labels = issue.labels.map((label) => typeof label === "string" ? label : label.name);
        return includedLabels.every((l) => labels.includes(l));
    })
        .sort(({ number: a }, { number: b }) => a - b)
        .reduce((pages, issue, issueIndex) => {
        const pageIndex = Math.floor(issueIndex / perPage);
        pages[pageIndex] = (pages[pageIndex] ?? []).concat(issue);
        return pages;
    }, []);
    const response = {
        ...unfilteredResponse,
        data: pages[page - 1] ?? [],
    };
    return Promise.resolve(response);
}
// Client
export const client = {
    rest: {
        issues: {
            listForRepo: listForRepoMock,
        },
    },
};
client.reset = () => {
    client.rest.issues.listForRepo =
        listForRepoMock;
};
class Counter {
    #initialCount = {
        rest: {
            issues: {
                listForRepo: 0,
            },
        },
    };
    // Deep clone the initial counts
    // Use `rest` for parallelism with `client` keys; for example,
    // `client.rest.issues.get`’s call count is `counter.rest.issues.get`.
    rest = v8.deserialize(v8.serialize(this.#initialCount.rest));
    reset() {
        this.rest = v8.deserialize(v8.serialize(this.#initialCount.rest));
    }
}
export const counter = new Counter();
