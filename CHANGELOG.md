# Change Log

All notables changes to this project are documented in this file.

The format is inspired by [Keep a Changelog].

[Keep a Changelog]: https://keepachangelog.com/en/1.0.0/

<!-- markdownlint-disable no-duplicate-heading -->

<!-- NOTE: towncrier will not alter content above the TOWNCRIER line below. -->

<!-- TOWNCRIER -->

## 1.1.0 (2025-11-18)

### Features

- Add custom build template
  ([#256](https://github.com/oasisprotocol/rofl-app/issues/256),
   [#308](https://github.com/oasisprotocol/rofl-app/issues/308))

- Highlight errors in logs
  ([#338](https://github.com/oasisprotocol/rofl-app/issues/338),
   [#346](https://github.com/oasisprotocol/rofl-app/issues/346))

### Bug Fixes and Improvements

- Handle stg.rofl.app in Siwe domains
  ([#314](https://github.com/oasisprotocol/rofl-app/issues/314))

- Show build details in footer
  ([#320](https://github.com/oasisprotocol/rofl-app/issues/320))

- Reset selected offer if user switches chain
  ([#329](https://github.com/oasisprotocol/rofl-app/issues/329))

- Remove template specific values from init app data state
  ([#350](https://github.com/oasisprotocol/rofl-app/issues/350))

### Internal Changes

- Update dependencies
  ([#287](https://github.com/oasisprotocol/rofl-app/issues/287),
   [#307](https://github.com/oasisprotocol/rofl-app/issues/307),
   [#309](https://github.com/oasisprotocol/rofl-app/issues/309),
   [#317](https://github.com/oasisprotocol/rofl-app/issues/317),
   [#325](https://github.com/oasisprotocol/rofl-app/issues/325),
   [#327](https://github.com/oasisprotocol/rofl-app/issues/327))

- Update renovate config
  ([#315](https://github.com/oasisprotocol/rofl-app/issues/315))

- Trigger workflows for stable/* branches
  ([#322](https://github.com/oasisprotocol/rofl-app/issues/322))

- Bump rofl-containers
  ([#330](https://github.com/oasisprotocol/rofl-app/issues/330),
   [#343](https://github.com/oasisprotocol/rofl-app/issues/343))

- Fix renovate by enabling cloneSubmodules option
  ([#334](https://github.com/oasisprotocol/rofl-app/issues/334))

- Remove unused top-up feature
  ([#347](https://github.com/oasisprotocol/rofl-app/issues/347))

## 1.0.1 (2025-09-16)

### Process Changes

- Add release GitHub workflow
  ([#311](https://github.com/oasisprotocol/rofl-app/issues/311))

## 1.0.0 (2025-09-16)

### Process Changes

- Add Change Log and the Change Log fragments process for assembling it
  ([#262](https://github.com/oasisprotocol/rofl-app/issues/262))

  This follows the same Change Log fragments process as is used by [Oasis Core].

  For more details, see [Change Log fragments].

  [Oasis Core]: https://github.com/oasisprotocol/oasis-core
  [Change Log fragments]: .changelog/README.md
