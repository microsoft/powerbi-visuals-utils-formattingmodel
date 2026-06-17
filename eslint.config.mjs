import powerbiVisuals from "eslint-plugin-powerbi-visuals";

export default [
    {
        ignores: [
            "node_modules/**",
            "lib/**",
        ],
    },
    {
        ...powerbiVisuals.configs.recommended,
        languageOptions: {
            ...powerbiVisuals.configs.recommended.languageOptions,
            parserOptions: {
                project: "tsconfig.json",
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
];
