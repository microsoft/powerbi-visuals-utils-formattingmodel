import { parseFormattingSettingsSlice, getPropertyValue } from "./utils/FormattingSettingsParser";
export class FormattingSettingsModel {
    constructor() {
        this.cards = [];
    }
    /**
     * Build visual formatting settings model from metadata dataView
     * @param dataView metadata dataView object
     * @returns visual formatting settings model
     */
    static populateFrom(dataView) {
        let defaultSettings = new this();
        if (!dataView || !dataView.metadata || !dataView.metadata.objects) {
            return defaultSettings;
        }
        // loop over each object and property in dataview and add its value to settings model object
        defaultSettings.cards.forEach((card) => {
            card.slices.forEach((slice) => {
                var _a;
                let dataViewObjects = dataView.metadata.objects;
                const objectName = card.name;
                const propertyName = slice.name;
                if (((_a = dataViewObjects === null || dataViewObjects === void 0 ? void 0 : dataViewObjects[objectName]) === null || _a === void 0 ? void 0 : _a[propertyName]) !== undefined) {
                    slice.value = getPropertyValue(dataViewObjects[objectName][propertyName], slice.value);
                }
            });
        });
        return defaultSettings;
    }
    /**
     * Build formatting model by parsing formatting settings model object
     * @returns custom visual formatting model
     */
    buildFormattingModel() {
        let formattingModel = {
            cards: []
        };
        this.cards.forEach((card) => {
            const objectName = card.name;
            let formattingGroup = {
                displayName: undefined,
                slices: [],
                uid: objectName + "-group"
            };
            let formattingCard = {
                displayName: card.displayName,
                groups: [formattingGroup],
                uid: objectName,
                analyticsPane: card.analyticsPane
            };
            formattingModel.cards.push(formattingCard);
            let revertToDefaultDescriptors = [];
            // Build formatting slice for each property
            card.slices.forEach((slice) => {
                const propertyName = slice.name;
                if (slice.value != undefined) {
                    let formattingSlice = parseFormattingSettingsSlice(slice, objectName);
                    if (formattingSlice) {
                        if (slice.topLevelToggle) {
                            formattingSlice.suppressDisplayName = true;
                            formattingCard.topLevelToggle = formattingSlice;
                        }
                        else {
                            formattingGroup.slices.push(formattingSlice);
                        }
                    }
                }
                // add formatting slice to revert to default object
                revertToDefaultDescriptors.push({ objectName: objectName, propertyName: propertyName });
            });
            formattingCard.revertToDefaultDescriptors = revertToDefaultDescriptors;
        });
        return formattingModel;
    }
}
//# sourceMappingURL=FormattingSettingsModel.js.map