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
  // Retrieve labels from request params
  const includedLabels = params.labels?.split(",") || [];
  // Filter the response
  const response = {
    ...unfilteredResponse,
    data: unfilteredResponse.data.filter((issue) => {
      const labels = issue.labels.map(({ name }) => name);
      return includedLabels.every((l) => labels.includes(l));
    }),
  };
  return Promise.resolve(response);
}
listForRepoMock.defaults = undefined as any;
listForRepoMock.endpoint = undefined as any;

// Client

export const client = {
  rest: {
    issues: {
      listForRepo: listForRepoMock,
    },
  },
} as Client;

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
