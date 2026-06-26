/**
 * Fixture model exercising the major formattingmodel elements: SimpleCard and CompositeCard,
 * groups, a representative set of slices, composite slices and a container.
 *
 * Every builder returns FRESH instances so tests can mutate (e.g. populate) in isolation.
 */

import {
    Model,
    Cards,
    SimpleCard,
    CompositeCard,
    Group,
    Container,
    ContainerItem,
    ToggleSwitch,
    NumUpDown,
    TextInput,
    ItemDropdown,
    FontControl,
    FontPicker,
    MarginPadding,
} from "../../src/FormattingSettingsComponents";

/** SimpleCard with an explicit displayName/description and a top-level toggle. */
export function simpleCardWithHeader(): SimpleCard {
    const card = new SimpleCard();
    card.name = "labels";
    card.displayName = "Labels";
    card.description = "Label settings";
    card.topLevelSlice = new ToggleSwitch({ name: "show", value: true });
    card.slices = [
        new ToggleSwitch({ name: "bold", displayName: "Bold", value: false }),
        new NumUpDown({ name: "size", displayName: "Size", value: 12 }),
        new TextInput({ name: "prefix", displayName: "Prefix", value: "", placeholder: "Prefix" }),
        new ItemDropdown({
            name: "position",
            displayName: "Position",
            value: { value: "top", displayName: "Top" },
            items: [
                { value: "top", displayName: "Top" },
                { value: "bottom", displayName: "Bottom" },
            ],
        }),
    ];
    return card;
}

/** SimpleCard WITHOUT a displayName — exercises the host-fallback (undefined passthrough). */
export function simpleCardNoHeader(): SimpleCard {
    const card = new SimpleCard();
    card.name = "general";
    card.slices = [new ToggleSwitch({ name: "show", value: true })];
    return card;
}

/** SimpleCard whose group uses a container ("Apply settings to"). */
export function cardWithContainer(): SimpleCard {
    const card = new SimpleCard();
    card.name = "perSeries";
    card.slices = [new ToggleSwitch({ name: "show", value: true })];

    const item = new ContainerItem();
    item.displayName = "All";
    item.slices = [new NumUpDown({ name: "thickness", value: 2 })];

    card.container = new Container({ containerItems: [item] });
    return card;
}

class DemoCompositeCard extends CompositeCard {
    groups: Group[] = [];
}

/** CompositeCard with two groups, including composite slices (FontControl, MarginPadding). */
export function compositeCard(): CompositeCard {
    const card = new DemoCompositeCard();
    card.name = "title";
    card.displayName = "Title";

    const text = new Group({
        name: "text",
        displayName: "Text",
        slices: [
            new TextInput({ name: "titleText", displayName: "Title text", value: "", placeholder: "" }),
            new FontControl({
                name: "font",
                fontFamily: new FontPicker({ name: "fontFamily", value: "Arial" }),
                fontSize: new NumUpDown({ name: "fontSize", value: 12 }),
            }),
        ],
    });

    const spacing = new Group({
        name: "spacing",
        displayName: "Spacing",
        slices: [
            new MarginPadding({
                name: "margin",
                left: new NumUpDown({ name: "left", value: 0 }),
                right: new NumUpDown({ name: "right", value: 0 }),
                top: new NumUpDown({ name: "top", value: 0 }),
                bottom: new NumUpDown({ name: "bottom", value: 0 }),
            }),
        ],
    });

    card.groups = [text, spacing];
    return card;
}

/** Wrap one or more cards into a Model. */
export function modelOf(...cards: Cards[]): Model {
    const model = new Model();
    model.cards = cards;
    return model;
}

/** A full model exercising all the major elements at once. */
export function buildFullModel(): Model {
    return modelOf(simpleCardWithHeader(), simpleCardNoHeader(), cardWithContainer(), compositeCard());
}

/** Model subclass with a default constructor, for populateFormattingSettingsModel. */
export class FixtureModel extends Model {
    constructor() {
        super();
        this.cards = [simpleCardWithHeader()];
    }
}
