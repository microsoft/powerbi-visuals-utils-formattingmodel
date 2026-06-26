import { describe, it, expect } from "vitest";
import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "../src/FormattingSettingsService";
import { Cards, SimpleCard, SimpleSlice } from "../src/FormattingSettingsComponents";
import {
    simpleCardWithHeader,
    simpleCardNoHeader,
    cardWithContainer,
    compositeCard,
    buildFullModel,
    modelOf,
    FixtureModel,
} from "./fixtures/model";

// The powerbi API types model cards/groups/slices as unions with "placeholder" variants.
// The service always emits the concrete variants, so narrow to them for assertions.
type VisualCard = powerbi.visuals.FormattingCard;
type VisualGroup = powerbi.visuals.FormattingGroup;
type VisualSlice = powerbi.visuals.FormattingSlice;

/** Build a single settings card and return the produced (concrete) formatting card. */
function build(card: Cards): VisualCard {
    return new FormattingSettingsService().buildFormattingModel(modelOf(card)).cards[0] as VisualCard;
}

const groupsOf = (card: VisualCard): VisualGroup[] => card.groups as VisualGroup[];
const slicesOf = (group: VisualGroup): VisualSlice[] => group.slices as VisualSlice[];

describe("buildFormattingModel", () => {
    it("produces one formatting card per visible settings card, with <name>-card uids", () => {
        const model = new FormattingSettingsService().buildFormattingModel(buildFullModel());
        expect((model.cards as VisualCard[]).map((c) => c.uid)).toEqual([
            "labels-card",
            "general-card",
            "perSeries-card",
            "title-card",
        ]);
    });

    describe("card headers (host-fallback regression guard)", () => {
        it("uses the provided displayName/description when set", () => {
            const card = build(simpleCardWithHeader());
            expect(card.displayName).toBe("Labels");
            expect(card.description).toBe("Label settings");
        });

        it("passes undefined (not the internal name) when displayName is unset", () => {
            const card = build(simpleCardNoHeader());
            // 7.0.0 coerced this to card.name ("general"); the host fallback must be preserved.
            expect(card.displayName).toBeUndefined();
        });
    });

    describe("SimpleCard group", () => {
        it("emits a single group with a <name>-group uid and undefined header", () => {
            const [group] = groupsOf(build(simpleCardWithHeader()));
            expect(group.uid).toBe("labels-group");
            // Regression guard: SimpleCard group displayName/description stay undefined.
            expect(group.displayName).toBeUndefined();
            expect(group.description).toBeUndefined();
        });

        it("builds a formatting slice for each visible slice", () => {
            const [group] = groupsOf(build(simpleCardWithHeader()));
            const slices = slicesOf(group);
            expect(slices).toHaveLength(4);
            expect(slices.every((s) => typeof s.uid === "string" && s.uid.length > 0)).toBe(true);
        });
    });

    describe("top-level toggle placement", () => {
        it("attaches the card's top-level toggle to the card (not the group) for a SimpleCard", () => {
            const card = build(simpleCardWithHeader());
            expect(card.topLevelToggle).toBeDefined();
            expect(groupsOf(card)[0].topLevelToggle).toBeUndefined();
        });
    });

    describe("container", () => {
        it("renders the 'Apply settings to' group with a container", () => {
            const [group] = groupsOf(build(cardWithContainer()));
            expect(group.displayName).toBe("Apply settings to");
            expect(group.collapsible).toBe(false);
            expect(group.container?.containerItems).toHaveLength(1);
            expect(group.container?.containerItems[0].displayName).toBe("All");
        });
    });

    describe("CompositeCard", () => {
        it("emits one group per card group, keeping the group displayName", () => {
            const groups = groupsOf(build(compositeCard()));
            expect(groups.map((g) => g.uid)).toEqual(["text-group", "spacing-group"]);
            // Composite groups keep their displayName (unlike SimpleCard groups).
            expect(groups.map((g) => g.displayName)).toEqual(["Text", "Spacing"]);
        });
    });

    it("attaches revertToDefaultDescriptors to each card", () => {
        const card = build(simpleCardWithHeader());
        expect(Array.isArray(card.revertToDefaultDescriptors)).toBe(true);
        expect(card.revertToDefaultDescriptors!.length).toBeGreaterThan(0);
    });
});

describe("populateFormattingSettingsModel", () => {
    it("applies dataView object values onto the settings model", () => {
        const dataView = {
            metadata: { objects: { labels: { bold: true, size: 20 } } },
        } as unknown as powerbi.DataView;

        const populated = new FormattingSettingsService().populateFormattingSettingsModel(FixtureModel, dataView);
        const labels = populated.cards[0] as SimpleCard;
        const bold = labels.slices?.find((s) => s.name === "bold") as SimpleSlice<boolean>;
        const size = labels.slices?.find((s) => s.name === "size") as SimpleSlice<number>;

        expect(bold.value).toBe(true);
        expect(size.value).toBe(20);
    });
});
