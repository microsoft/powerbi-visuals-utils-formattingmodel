import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
    test: {
        environment: "node",
        include: ["test/**/*.test.ts"],
    },
    resolve: {
        alias: {
            // The real package has no runtime values for the powerbi.visuals.* namespaces.
            "powerbi-visuals-api": fileURLToPath(
                new URL("./test/mocks/powerbi-visuals-api.ts", import.meta.url),
            ),
        },
    },
});
