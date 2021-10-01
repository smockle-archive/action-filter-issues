import type { RestEndpointMethodTypes } from "@octokit/rest";
import { Client } from "../../lib/filter-issues";

import fs from "fs";
import url from "url";
import { promisify } from "util";
import v8 from "v8";
const readFile = promisify(fs.readFile);
const { URL } = url;

// GET /repos/{owner}/{repo}/issues

type GetIssuesRequestParams =
  RestEndpointMethodTypes["issues"]["listForRepo"]["parameters"];
type GetIssuesResponse =
  RestEndpointMethodTypes["issues"]["listForRepo"]["response"];

export async function listForRepoMock(
  params: GetIssuesRequestParams
): Promise<GetIssuesResponse> {
  // Track the number of times 'listForRepoMock' has been called.
  counter.rest.issues.listForRepo++;
  // Return mock data read from a file.
  const path: url.URL = new URL("./getIssuesResponse.json", import.meta.url);
  const unparsedResponse = await readFile(path, "utf8");
  const unfilteredResponse: GetIssuesResponse = JSON.parse(unparsedResponse);
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
      const labels = issue.labels.map((label) =>
        typeof label === "string" ? label : label.name
      );
      return includedLabels.every((l) => labels.includes(l));
    })
    .sort(({ number: a }, { number: b }) => a - b)
    .reduce((pages, issue, issueIndex) => {
      const pageIndex = Math.floor(issueIndex / perPage);
      pages[pageIndex] = (pages[pageIndex] ?? []).concat(issue);
      return pages;
    }, [] as Array<Array<GetIssuesResponse["data"][0]>>);
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
} as Client & { reset: () => void };
client.reset = () => {
  client.rest.issues.listForRepo =
    listForRepoMock as Client["rest"]["issues"]["listForRepo"];
};

// Counter

type NumberMap<T extends object> = {
  [K in keyof T]: T[K] extends object
    ? "defaults" extends keyof T[K]
      ? number
      : NumberMap<T[K]>
    : number;
};

class Counter {
  #initialCount = {
    rest: {
      issues: {
        listForRepo: 0,
      },
    },
  } as NumberMap<Client>;
  // Deep clone the initial counts
  // Use `rest` for parallelism with `client` keys; for example,
  // `client.rest.issues.get`’s call count is `counter.rest.issues.get`.
  rest: NumberMap<Client>["rest"] = v8.deserialize(
    v8.serialize(this.#initialCount.rest)
  );
  reset() {
    this.rest = v8.deserialize(v8.serialize(this.#initialCount.rest));
  }
}

export const counter = new Counter();
