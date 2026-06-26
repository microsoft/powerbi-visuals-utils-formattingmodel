# Tests

This folder contains the test suite for `powerbi-visuals-utils-formattingmodel`. It is **not**
published to npm (the package `files` allowlist ships only `lib` and `src`).

There are two complementary layers. Both run via `npm test`:

| Layer | Command | Tool | What it guards |
| --- | --- | --- | --- |
| Type tests | `npm run test:types` | `tsc -p tsconfig.test.json` | The public typing contract (how consumers construct components) |
| Runtime tests | `npm run test:unit` | Vitest | The actual behavior of `FormattingSettingsService` |

The two layers are intentionally separate because they catch **different classes of regression** —
several of the bugs this suite was built around are invisible to one layer but caught by the other.

---

## 1. Type tests — `types.test-d.ts`

Compile-time only: the suite "passes" when the file type-checks. Nothing is executed.

- **Positive cases** are statements that MUST compile (e.g. `new ToggleSwitch({ name, value })`).
  If a change tightens the contract so valid usage stops compiling, `tsc` fails.
- **Negative cases** use `// @ts-expect-error` on the line above a statement that MUST be rejected.
  While the error exists it is swallowed; if a change loosens the contract so the statement becomes
  valid, the directive is "unused" and `tsc` fails with **TS2578**.

### Why a separate type-test layer at all?

The original incident (the `7.0.0` regression) was a **compile-time** break: the documented
`new ToggleSwitch({ ... })` object-literal pattern stopped compiling because the slice methods were
made required. Runtime tests cannot see this — the code still runs; it just no longer type-checks for
consumers. Only a type test catches it.

### Nuances

- **One line per negative case.** `@ts-expect-error` suppresses an error only on the single line
  immediately after it. A multi-line statement can push the expected error onto a later line, leaving
  the directive "unused" (a false failure). Keep each negative case on one line.
- The `Probe` class exercises the generic `SliceInit` contract independently of any real component:
  data fields are kept, and **any** function member is excluded — current or future. This is what
  guards the "consumer callback" caveat documented on `NonFunctionPropertyNames`.

---

## 2. Runtime tests — `buildFormattingModel.test.ts`

Drive a fixture settings model through `FormattingSettingsService` and assert the produced model.

### The `powerbi-visuals-api` mock (`mocks/powerbi-visuals-api.ts`)

This is the single most important piece of test infrastructure.

`powerbi-visuals-api` is **type-only at runtime**: its `index.js` exposes only `version` and
`schemas`. Everything under `powerbi.visuals.*` (including the `FormattingComponent` enum) exists in
the `.d.ts` files but has **no runtime value**. In a real visual the Power BI host injects the runtime
`powerbi` global; in plain Node there is nothing.

Component field initializers read `visuals.FormattingComponent.*` at construction time, so without a
mock `new ToggleSwitch(...)` throws `Cannot read properties of undefined`. The mock provides that enum
(a `Proxy` returning each member's name as a stable string), wired in via `resolve.alias` in
`vitest.config.ts`. Type-checking is unaffected — `tsc` still uses the real `.d.ts`.

If a new code path touches another runtime member of the API, extend the mock (the failure message
tells you which member).

### Fixture design (`fixtures/model.ts`)

- Every builder returns **fresh instances** so tests that mutate the model (e.g. `populate`) stay
  isolated.
- The fixture deliberately covers the major elements: `SimpleCard` and `CompositeCard`, groups, a
  representative spread of slices, composite slices (`FontControl`, `MarginPadding`) and a `Container`.
- `CompositeCard` is `abstract`, so the fixture defines a small concrete subclass.

### Why these particular assertions (regression guards)

The runtime tests pin the behaviors that broke in `7.0.0` and were restored in `7.0.1`:

- **Card/group headers**: `displayName`/`description` pass `undefined` through when unset (so the host
  falls back to the capabilities-defined name) instead of being coerced to the internal `name`/`""`.
- **SimpleCard group**: its `displayName`/`description` stay `undefined`.
- **Top-level toggle placement**: attached to the card for a `SimpleCard`.
- **Container**: produces the "Apply settings to" group.

### The bug the fixture *found*: `useDefineForClassFields`

Writing the fixture immediately surfaced a third, separate `7.0.0` runtime regression that the type
tests could not see.

`7.0.0` changed `target` from `ES2015` to `ES2022`, which flips the TypeScript default
`useDefineForClassFields` to `true`. With that default, a subclass field declaration without an
initializer (`fontFamily!`, `items!`, `mode!`, …) emits a native class field that runs **after**
`super()` and **resets the value to `undefined`** — overwriting what the base constructor's
`Object.assign(this, object)` had just assigned. So `FontControl.fontFamily` threw and
`ItemDropdown.items` silently became empty (masked by a `?? []` guard).

The fix is `useDefineForClassFields: false` in `tsconfig.json` (restoring the pre-ES2022 "set"
semantics that `6.2.2` relied on). This is exactly the kind of bug runtime tests exist to catch:
the types are fine, but the constructed object is wrong.

### Typing nuance in the assertions

The powerbi API types model `cards`/`groups`/`slices` as unions with `*Placeholder` variants. The
service always emits the concrete variant, so the tests narrow to it with small cast helpers
(`VisualCard`, `groupsOf`, `slicesOf`). This keeps assertions type-safe without fighting the union.

---

## Running

```bash
npm test          # type tests + runtime tests
npm run test:types
npm run test:unit
```

CI (`.github/workflows/build.yml`) runs `npm run build`, `npm run test`, and `npm run lint` on every
PR, so both layers gate merges.
