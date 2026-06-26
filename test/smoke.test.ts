import { describe, it, expect } from "vitest";
import { ToggleSwitch } from "../src/FormattingSettingsComponents";

describe("test harness smoke", () => {
    it("instantiates a component (powerbi-visuals-api mock works)", () => {
        const toggle = new ToggleSwitch({ name: "show", displayName: "Show", value: true });
        expect(toggle.name).toBe("show");
        // field initializer reads visuals.FormattingComponent.ToggleSwitch via the mock
        expect(toggle.type).toBe("ToggleSwitch");
    });
});
