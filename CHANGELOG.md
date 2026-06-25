## 7.0.1

### Fixed
* Restored object-literal initialization of slice components (e.g. `new ToggleSwitch({...})`, `new ItemDropdown({...})`). The strict-mode refactor in `7.0.0` made the slice methods required, which broke the documented initialization pattern. Constructor inputs now use the new `SliceInit<T>` type (data properties only; all methods are excluded automatically), and `IFormattingSettingsSlice.getFormattingComponent` is optional again.
* Removed the `[property: string]: unknown` index signature from `NamedEntity` (added in `7.0.0`). It silently disabled excess-property checking and weakened consumer typing. The single dynamic lookup in `getLocalizedProperty` is now handled with a localized cast instead. Object literals are type-checked precisely again (typos and missing required fields are reported).
* Restored formatting pane card/group/container headers: `displayName`/`description` are no longer coerced to the internal object `name` or an empty string. When unset, `undefined` is passed through again so the host falls back to the capabilities-defined display name.

## 7.0.0

### Breaking
* `getLocalizedProperty<T>(...)` now returns `string | undefined` instead of `string`; callers should handle the `undefined` case.
* `NamedEntity` now includes an index signature `[property: string]: unknown` to support strict-mode property access; dynamic index access in subclasses now yields `unknown` instead of `any`. This was identified as a regression (it disabled excess-property checking) and is reverted in `7.0.1`.
* Methods `getFormattingSlice`, `getFormattingComponent`, `getRevertToDefaultDescriptor` and `setPropertiesValues` on `SimpleSlice`/`IFormattingSettingsSlice` were changed from optional to required. This was identified as a regression — it broke object-literal initialization of components such as `ToggleSwitch` and `ItemDropdown` — and is reverted in `7.0.1`.

### Changed
* Updated `powerbi-visuals-api` to `^5.11.0`.
* Enabled full TypeScript strict checks (`strictNullChecks`, `strictPropertyInitialization`, `noImplicitAny`) and fixed related type issues.
* Refactored SimpleCard top-level toggle placement to use an explicit `isSimpleCard` check.

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
