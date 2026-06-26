/**
 * Minimal runtime mock of `powerbi-visuals-api`.
 *
 * The real package ships mostly type-only declarations: at runtime its `index.js` exposes only
 * `version` and `schemas`. In a real visual the Power BI host injects the runtime `powerbi`
 * global (with the real enums); in plain Node there is nothing.
 *
 * Component field initializers read `visuals.FormattingComponent.*` at construction time, so we
 * provide that enum here. Each member resolves to its own name as a stable string, which is all
 * the library needs (it only compares these values for identity).
 *
 * Wired in via `resolve.alias` in vitest.config.ts. Type-checking still uses the real `.d.ts`.
 */
const nameEnum = new Proxy({} as Record<string, string>, {
    get: (_target, property) => property,
});

const powerbi = {
    visuals: {
        FormattingComponent: nameEnum,
    },
    data: {},
};

export default powerbi;
