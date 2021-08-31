# action-filter-issues

Output a space-delimited list of issues matching the specified criteria.

## Usage

### Inputs

#### `owner`

**Optional** The owner of the repo containing the issue to filter. This is a GitHub username if the repo is user-owned, or a GitHub org name if the repo is org-owned. For example, `owner: smockle`. By default, `owner` is the owner of the repo containing the workflow running `smockle/action-filter-issues`.

#### `repo`

**Optional** The name of the repo containing the issue to filter. For example, `repo: action-filter-issues`. By default, `repo` is the repo containing the workflow running `smockle/action-filter-issues`.

#### `included_labels`

**Optional** A JSON-stringified list of every label matched issues must include. For example, `'["bug"]'`. Default: `'[]'`.

#### `excluded_labels`

**Optional** A JSON-stringified list of any labels issues must not include. For example, `'["wip","draft","proposal"]'`. Default: `'[]'`.

### Environment Variables

#### `GH_TOKEN`

**Required** A [GitHub token](https://docs.github.com/en/github/authenticating-to-github/keeping-your-account-and-data-secure/creating-a-personal-access-token) with the `public_repo` (for use in public repos) or `repo` (for use in private repos) scope.

### Example workflow

```YAML
name: Filter bugs
on:
  # Run manually
  workflow_dispatch:

jobs:
  filter_bugs:
    name: Filter bugs
    runs-on: ubuntu-latest
    steps:
      - id: filter_bugs
        uses: smockle/action-filter-issues@dist
        with:
          owner: smockle
          repo: action-filter-issues
          included_labels: '["bug"]'
          excluded_labels: '["wip"]'
        env:
          GH_TOKEN: ${{ secrets.GH_TOKEN }}
      - run: echo ${{ steps.filter_bugs.outputs.issue_numbers }}
```

## Development

### Testing

`smockle/action-filter-issues` includes unit and integration tests. After cloning the `smockle/action-filter-issues` repo locally, run `npm install` in the project folder to install dependencies. Run `npm run test:unit` to execute unit tests, or run `npm run test:integration` to execute integration tests. A GitHub token with the `public_repo` (for use in public repos) or `repo` (for use in private repos) scope is required to be present in the environment as `GH_TOKEN` to run integration tests.

### Publishing

After every commit to [`main`](https://github.com/smockle/action-filter-issues/tree/main), the [“Publish” workflow](https://github.com/smockle/action-filter-issues/blob/main/.github/workflows/publish.yml) uses [smockle/action-release-branch](https://github.com/smockle/action-release-branch) to build and deploy to the [`dist` branch](https://github.com/smockle/action-filter-issues/tree/dist) (which, as noted in [Example usage](#example-usage) above, is the branch users should specify in their workflows: `uses: smockle/action-filter-issues@dist`).
