
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
