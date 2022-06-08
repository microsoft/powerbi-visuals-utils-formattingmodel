import { parseFormattingSettingsSlice, getPropertyValue } from "./SettingsParser";
export class FormattingSettingsModel {
    constructor() {
        this.cards = {};
    }
    static populateFrom(dataView) {
        let defaultSettings = new this();
        if (!dataView || !dataView.metadata || !dataView.metadata.objects) {
            return;
        }
        // loop over each object and property in dataview and add its value to settings model object
        Object.keys(defaultSettings.cards).forEach((objectName) => {
            let slices = defaultSettings.cards[objectName].slices;
            Object.keys(slices).forEach((propertyName) => {
                var _a;
                let dataViewObjects = dataView.metadata.objects;
                if (((_a = dataViewObjects === null || dataViewObjects === void 0 ? void 0 : dataViewObjects[objectName]) === null || _a === void 0 ? void 0 : _a[propertyName]) !== undefined) {
                    slices[propertyName].value = getPropertyValue(dataViewObjects[objectName][propertyName], defaultSettings.cards[objectName].slices[propertyName].value);
                }
            });
        });
        return defaultSettings;
    }
    buildFormattingModel() {
        let formattingModel = {
            cards: []
        };
        Object.keys(this.cards).forEach((objectName) => {
            let settingsObject = this.cards[objectName];
            let formattingGroup = {
                displayName: undefined,
                slices: [],
                uid: objectName + "-group"
            };
            let formattingCard = {
                displayName: settingsObject.displayName,
                groups: [formattingGroup],
                uid: objectName
            };
            formattingModel.cards.push(formattingCard);
            let revertToDefaultDescriptors = [];
            // Build formatting slice for each property
            let settingsObjectProperties = settingsObject.slices;
            Object.keys(settingsObjectProperties).forEach((propertyName) => {
                // build formatting slice for object property
                let settingsProperty = settingsObjectProperties[propertyName];
                if (settingsProperty && settingsProperty.value != undefined) {
                    let formattingSlice = parseFormattingSettingsSlice(settingsProperty, objectName, propertyName);
                    if (formattingSlice) {
                        if (propertyName == "show" && formattingSlice.control.type == "ToggleSwitch" /* powerbi.visuals.FormattingComponent.ToggleSwitch */) {
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
//# sourceMappingURL=SettingsModelFactory.js.map