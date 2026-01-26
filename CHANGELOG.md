# Change Log

All notables changes to this project are documented in this file.

The format is inspired by [Keep a Changelog].

[Keep a Changelog]: https://keepachangelog.com/en/1.0.0/

<!-- markdownlint-disable no-duplicate-heading -->

<!-- NOTE: towncrier will not alter content above the TOWNCRIER line below. -->

<!-- TOWNCRIER -->

## 2.0.0 (2026-01-26)

### Removals and Breaking Changes

- Remove survey popup
  ([#382](https://github.com/oasisprotocol/rofl-app/issues/382))

### Features

- ROFL Paymaster testnet integration
  ([#345](https://github.com/oasisprotocol/rofl-app/issues/345))

- Display proxy domains
  ([#366](https://github.com/oasisprotocol/rofl-app/issues/366))

- Show "View logs" button in explore page if someone grants you permission
  ([#376](https://github.com/oasisprotocol/rofl-app/issues/376))

- Grant logs permission on a machine and restart
  ([#391](https://github.com/oasisprotocol/rofl-app/issues/391))

- Enable read only mode for machines and apps
  ([#396](https://github.com/oasisprotocol/rofl-app/issues/396))

### Bug Fixes and Improvements

- Fix isTokenExpired only updated in a 10-second interval
  ([#393](https://github.com/oasisprotocol/rofl-app/issues/393))

- Fix account switching
  ([#397](https://github.com/oasisprotocol/rofl-app/issues/397))

- Display new endorsement fields
  ([#399](https://github.com/oasisprotocol/rofl-app/issues/399))

- Un-reverse logs (show new log lines at the bottom)
  ([#400](https://github.com/oasisprotocol/rofl-app/issues/400))

- Display who can view logs
  ([#401](https://github.com/oasisprotocol/rofl-app/issues/401))

### Internal Changes

- Update dependencies
  ([#292](https://github.com/oasisprotocol/rofl-app/issues/292),
   [#300](https://github.com/oasisprotocol/rofl-app/issues/300),
   [#324](https://github.com/oasisprotocol/rofl-app/issues/324),
   [#364](https://github.com/oasisprotocol/rofl-app/issues/364),
   [#365](https://github.com/oasisprotocol/rofl-app/issues/365),
   [#368](https://github.com/oasisprotocol/rofl-app/issues/368),
   [#402](https://github.com/oasisprotocol/rofl-app/issues/402))

- Bump rofl-containers
  ([#371](https://github.com/oasisprotocol/rofl-app/issues/371),
   [#388](https://github.com/oasisprotocol/rofl-app/issues/388))

- Prepare app routing for read only mode
  ([#394](https://github.com/oasisprotocol/rofl-app/issues/394))

- Update Wallet Connect id
  ([#404](https://github.com/oasisprotocol/rofl-app/issues/404))

## 1.1.1 (2025-11-20)

### Bug Fixes and Improvements

- Small UI improvements:
  ([#358](https://github.com/oasisprotocol/rofl-app/issues/358),
   [#360](https://github.com/oasisprotocol/rofl-app/issues/360))

  - align tooltip terminology with Explorer
  - update custom template compose placeholder
  - update labels

- Enable testnet deployment for custom-build template
  ([#362](https://github.com/oasisprotocol/rofl-app/issues/362))

### Documentation Improvements

- Rewrite README to make it clearer and up-to-date
  ([#357](https://github.com/oasisprotocol/rofl-app/issues/357))

### Internal Changes

- Update dependencies
  ([#321](https://github.com/oasisprotocol/rofl-app/issues/321),
   [#344](https://github.com/oasisprotocol/rofl-app/issues/344),
   [#348](https://github.com/oasisprotocol/rofl-app/issues/348))

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
