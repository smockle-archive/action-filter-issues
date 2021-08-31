import fs from "fs";
import url from "url";
import { promisify } from "util";
import v8 from "v8";
const readFile = promisify(fs.readFile);
const { URL } = url;
export async function listForRepoMock() {
    // Track the number of times 'listForRepoMock' has been called.
    counter.rest.issues.listForRepo++;
    // Return mock data read from a file.
    const path = new URL("./getIssuesResponse.json", import.meta.url);
    const unparsedResponse = await readFile(path, "utf8");
    const response = JSON.parse(unparsedResponse);
    return Promise.resolve(response);
}
listForRepoMock.defaults = undefined;
listForRepoMock.endpoint = undefined;
// Client
export const client = {
    rest: {
        issues: {
            listForRepo: listForRepoMock,
        },
    },
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
