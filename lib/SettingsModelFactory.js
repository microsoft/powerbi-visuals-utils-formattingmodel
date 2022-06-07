import { parseFormattingSettingsSlice, getPropertyValue } from "./SettingsParser";
export class FormattingSettingsModel {
    populateFrom(dataView) {
        if (!dataView || !dataView.metadata || !dataView.metadata.objects) {
            return;
        }
        // loop over each object and property in dataview and add its value to settings model object
        Object.keys(this).forEach((objectName) => {
            Object.keys(this[objectName]).forEach((propertyName) => {
                var _a;
                let dataViewObjects = dataView.metadata.objects;
                if ((_a = dataViewObjects === null || dataViewObjects === void 0 ? void 0 : dataViewObjects[objectName]) === null || _a === void 0 ? void 0 : _a[propertyName]) {
                    this[objectName].slices[propertyName].value = getPropertyValue(dataViewObjects[objectName][propertyName], this[objectName][propertyName].value);
                }
            });
        });
    }
    buildFormattingModel() {
        let formattingModel = {
            cards: []
        };
        Object.keys(this).forEach((objectName) => {
            let settingsObject = this[objectName];
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
            // Build formatting slice for each property
            let settingsObjectProperties = settingsObject.slices;
            Object.keys(settingsObjectProperties).forEach((propertyName) => {
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
            });
        });
        return formattingModel;
    }
}
//# sourceMappingURL=SettingsModelFactory.js.map