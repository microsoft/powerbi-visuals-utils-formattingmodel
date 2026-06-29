## 7.1.0

### Fixed
* Object-literal initialization of components (e.g. `new ToggleSwitch({...})`, `new ItemDropdown({...})`) compiles again — the `7.0.0` strict-mode refactor had broken the documented pattern.
* Component initializers are type-checked precisely again (typos and missing required fields are reported).
* Card and group headers no longer show the internal object name when `displayName` is unset; the host fallback is preserved.
* Components no longer lose their data at runtime (e.g. empty `ItemDropdown` items, unusable `FontControl`/`MarginPadding`) — a `7.0.0` regression that could throw.

### Added
* Test suite (type and runtime tests) covering the initialization contract and `FormattingSettingsService`.

### Breaking changes
* Components must be created via their constructor (`new ColorPicker({...})`, `new ItemDropdown({...})`), not assigned as bare object literals — the slice methods are required, so a plain `{...}` no longer satisfies the component type. This was loosely accepted in `6.x` and is now enforced; wrap any such literals in `new` when upgrading.

## 7.0.0

### Breaking
* `getLocalizedProperty<T>(...)` now returns `string | undefined` instead of `string`; callers should handle the `undefined` case.
* `NamedEntity` gained an index signature `[property: string]: unknown`. *(Reverted in 7.1.0.)*
* The slice methods (`getFormattingSlice`, `getFormattingComponent`, `getRevertToDefaultDescriptor`, `setPropertiesValues`) were made required. *(Reverted in 7.1.0 — it broke object-literal initialization.)*

### Changed
* Updated `powerbi-visuals-api` to `^5.11.0`.
* Enabled full TypeScript strict checks and fixed related type issues.
* Refactored SimpleCard top-level toggle placement to use an explicit `isSimpleCard` check.
* Changed the compilation `target` to `ES2022`. *(Implicitly enabled `useDefineForClassFields`; reverted in 7.1.0.)*

### Infrastructure
* Migrated ESLint config to flat-config ESM `eslint.config.mjs`.
* Removed legacy `.eslintrc.js` and `.eslintignore` in favor of flat-config equivalents.
* Updated the lint stack to ESLint 10 with TypeScript ESLint 8.
* Pinned `typescript` as a direct devDependency and updated TypeScript config for TS6 compatibility.

## 6.2.2
* Added missing `disabled` property to `FontPicker`

## 6.2.1
* Improved type definitions and JSDoc documentation for `ItemFlagsSelection` and `AutoFlagsSelection` components
* Added clarification that both flag selection components require bitwise values (powers of 2) for proper flag functionality

## 6.2.0
* All *Slices*, *Groups* and *Cards* now can be `disabled` and provided with `disabledReason` or `disabledReasonKey` for localized version.
* *Container* card can have `Groups` inside
* Bug with delaySaveSlices was fixed for *Container*s
* Localization support for `AutoDropdown` and `ItemFlagsSelection`

## 6.1.0
* `ItemDropdown` now supports new interface `ILocalizedItemMember` for localization of dropdown items.
* `ItemDropdown` got new method `setValue(value: powerbi.EnumMemberValue, localizationManager?: powerbi.extensibility.ILocalizationManager)` to set value by unique enum member value.
* Fixed empty groups exception

## 6.0.4
* Fix AutoDropDown issue

## 6.0.3
* Fix ItemFlagSelection unexpected behavior

## 6.0.2
* Update powerbi-visuals-api to 5.9.0
* Add build.yml and codeql-analysis.yml

## 6.0.1
* Update powerbi-visuals-api to 5.7.0

## 6.0.0
* Added support for creating custom Formatting groups
* Added extra attributes to Card, like missing `topLevelToggle` and `disabled`
* Added extra (optional) `visible` slice attribute for easier show/hide slices in a dynamic way
