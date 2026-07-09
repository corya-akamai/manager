---
"@linode/manager": Upcoming Features
---

Adds the Inference Platform Usage tab and updates shared chart behavior used by this feature ([#519](https://git.source.akamai.com/projects/FEE/repos/cloud-manager/pull-requests/519)).

Behavioral changes in shared components under src/components:

- StackedBarChart: adds loading spinner overlay support, timeout-based no-data fallback, no-data overlay transition updates, and reserved legend height for stable layout while transitioning between loading/no-data/data states.
- DonutChart: adds loading spinner overlay support, timeout-based no-data fallback, no-data overlay transition updates, and fixed legend area sizing to prevent layout shifts during loading/no-data/data transitions.
- SingleMetricChart: adds loading spinner overlay support and timeout-based no-data fallback behavior for metric value display transitions.

Newly introduced/updated Usage feature components in this PR scope:

- Usage page composition wiring for loading and no-data chart flows.
- TokensUsedChart wrapper updates to pass loading state into shared chart components.
- TokensUsedChart input/output variant updates to pass loading state into chart wrappers.
