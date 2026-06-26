/**
 * Type-level tests for the slice initialization contract (`SliceInit` / component constructors).
 *
 * These are compile-time checks, not runtime tests: the suite "passes" when this file type-checks
 * under `tsconfig.test.json` (run with `npm test`). The code is never executed — only its types
 * are verified, so it guards the public typing contract that runtime tests cannot.
 *
 * How each case is caught:
 *  - Positive case: a plain statement that MUST compile (e.g. `new ToggleSwitch({ ... })`). If a
 *    regression tightens the contract so valid usage no longer compiles, `tsc` reports the error
 *    on that line and the suite fails.
 *  - Negative case: a `// @ts-expect-error` directive on the line above a statement that MUST be
 *    rejected. While the error exists it is swallowed and the suite stays green; if a regression
 *    loosens the contract so the statement becomes valid, the directive is no longer "used" and
 *    `tsc` fails with TS2578 ("unused '@ts-expect-error' directive").
 *
 * IMPORTANT: `@ts-expect-error` only suppresses an error on the single line immediately after it.
 * Keep every negative case on ONE line, otherwise the expected error may land on a later line and
 * the directive will be reported as unused (a false failure).
 */

import {
    ToggleSwitch,
    ItemDropdown,
    NumUpDown,
    Container,
    SliceInit,
} from "../src/FormattingSettingsComponents";

/* -------------------------------------------------------------------------- */
/* Positive: the documented object-literal initialization must compile.        */
/* Guards: SliceInit + slice constructors (src/FormattingSettingsComponents.ts) */
/* -------------------------------------------------------------------------- */

export const toggle = new ToggleSwitch({ name: "show", displayName: "Show", value: false });
export const numUpDown = new NumUpDown({ name: "size", value: 12 });
export const dropdown = new ItemDropdown({
    name: "mode",
    value: { value: "a", displayName: "A" },
    items: [{ value: "a", displayName: "A" }],
});
export const container = new Container({ containerItems: [] });

/* -------------------------------------------------------------------------- */
/* Negative: required data fields are enforced.                                */
/* Guards: required (non-`?`) fields on the component classes                   */
/*         (src/FormattingSettingsComponents.ts)                                */
/* -------------------------------------------------------------------------- */

// @ts-expect-error 'name' and 'value' are required
export const missingNameValue = new ToggleSwitch({ displayName: "Show" });

// @ts-expect-error 'items' is required for ItemDropdown
export const missingItems = new ItemDropdown({ name: "mode", value: { value: "a", displayName: "A" } });

/* -------------------------------------------------------------------------- */
/* Negative: typos / unknown properties are rejected (no silent index sig).    */
/* Guards: absence of an index signature on NamedEntity                         */
/*         (src/FormattingSettingsComponents.ts)                                */
/* -------------------------------------------------------------------------- */

// @ts-expect-error 'typo' is not a known property of ToggleSwitch
export const typo = new ToggleSwitch({ name: "x", value: false, typo: 1 });

/* -------------------------------------------------------------------------- */
/* Negative: component methods are not part of the init object.                */
/* Guards: SliceInit / NonFunctionPropertyNames (src/FormattingSettingsComponents.ts) */
/* -------------------------------------------------------------------------- */

// @ts-expect-error getFormattingComponent is implemented by the class, not supplied
export const withMethod = new ToggleSwitch({ name: "x", value: false, getFormattingComponent: () => ({}) as never });

/* -------------------------------------------------------------------------- */
/* SliceInit contract: data kept (incl. future fields), all methods dropped.   */
/* This guards the callback caveat: a method is excluded regardless of name.   */
/* Guards: SliceInit / NonFunctionPropertyNames (src/FormattingSettingsComponents.ts) */
/* -------------------------------------------------------------------------- */

class Probe {
    requiredData!: string;
    optionalData?: number;
    // Any method must be excluded from SliceInit purely by virtue of being a function —
    // regardless of its name and whether it exists today or is added later.
    method(): void {
        /* no-op */
    }
}

export const probeOk = { requiredData: "x" } satisfies SliceInit<Probe>;
export const probeOptional = { requiredData: "x", optionalData: 1 } satisfies SliceInit<Probe>;

// @ts-expect-error 'requiredData' is required
export const probeMissing = {} satisfies SliceInit<Probe>;

// @ts-expect-error methods are excluded from the init object
export const probeMethod = { requiredData: "x", method: () => undefined } satisfies SliceInit<Probe>;
