#!/usr/bin/env node --es-module-specifier-resolution=node

import core from "@actions/core";
import github from "@actions/github";
import { filterIssues } from "./lib/filter-issues";

(async () => {
  try {
    // Retrieve GitHub token from environment.
    /** A [GitHub token](https://docs.github.com/en/github/authenticating-to-github/keeping-your-account-and-data-secure/creating-a-personal-access-token) with the `public_repo` (for use in public repos) or `repo` (for use in private repos) scope. */
    const token = process.env.GH_TOKEN;
    if (!token) {
      throw new Error(
        "Failed to retrieve a GitHub token. Does this repository have a secret named 'GH_TOKEN'? https://docs.github.com/en/actions/reference/encrypted-secrets#creating-encrypted-secrets-for-a-repository"
      );
    }

    // Retrieve 'owner' and 'repo' from 'inputs' or from the `github` context.
    // Ref: https://docs.github.com/en/developers/webhooks-and-events/webhooks/webhook-events-and-payloads#webhook-payload-object-common-properties
    /** The owner of the repo containing the issues to filter. This is a GitHub username if the repo is user-owned, or a GitHub org name if the repo is org-owned. */
    let owner: string | undefined =
      core.getInput("owner") || github.context.payload.repository?.owner?.login;
    if (!owner) {
      throw new Error(
        `Failed to retrieve 'owner' or to determine it from context ('repository' in 'context': ${github.context.payload.repository}).`
      );
    }
    /** The name of the repo containing the issues to filter. */
    let repo: string | undefined =
      core.getInput("repo") || github.context.payload.repository?.name;
    if (!repo) {
      throw new Error(
        `Failed to retrieve 'repo' or to determine it from context ('repository' in 'context': ${github.context.payload.repository}).`
      );
    }

    // Retrieve 'included_labels' and 'excluded_labels' from 'inputs'.
    /** A set of every label matched issues must include. For example, `'["bug","enhancement"]'`. */
    let includedLabels: Set<string>;
    try {
      includedLabels = new Set(
        JSON.parse(core.getInput("included_labels") || "[]")
      );
    } catch (error) {
      const originalErrorMessage =
        error instanceof Error ? error.message : error;
      throw new Error(
        `Failed to retrieve input 'included_labels' with error: ${originalErrorMessage}. Is the input a valid JSON string?`
      );
    }
    /** A set of any label matched issues must not include. For example, `'["wip","draft","proposal"]'`. */
    let excludedLabels: Set<string>;
    try {
      excludedLabels = new Set(
        JSON.parse(core.getInput("excluded_labels") || "[]")
      );
    } catch (error) {
      const originalErrorMessage =
        error instanceof Error ? error.message : error;
      throw new Error(
        `Failed to retrieve input 'excluded_labels' with error: ${originalErrorMessage}. Is the input a valid JSON string?`
      );
    }

    // Retrieve an authenticated client
    const client = github.getOctokit(token);

    // Filter issues matching the specified criteria.
    const issueNumbers = await filterIssues({
      client,
      owner,
      repo,
      includedLabels: [...includedLabels],
      excludedLabels: [...excludedLabels],
    });
    core.setOutput("issue_numbers", issueNumbers);
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : `A top-level error occurred: ${error}`;
    core.setFailed(errorMessage);
  }
})();
