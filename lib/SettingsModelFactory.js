import { convertPropertySliceToFormattingSlice, getPropertyValue } from "./SettingsParser";
export class FormattingSettingsModel {
    populateFrom(dataView) {
        if (!dataView || !dataView.metadata || !dataView.metadata.objects) {
            return;
        }
        Object.keys(this).forEach((objectName) => {
            Object.keys(this[objectName]).forEach((propertyName) => {
                var _a;
                let dataViewObjects = dataView.metadata.objects;
                if ((_a = dataViewObjects === null || dataViewObjects === void 0 ? void 0 : dataViewObjects[objectName]) === null || _a === void 0 ? void 0 : _a[propertyName]) {
                    this[objectName][propertyName].value = getPropertyValue(dataViewObjects[objectName][propertyName], this[objectName][propertyName].value);
                }
            });
        });
    }
    buildFormattingModel() {
        let formattingModel = { cards: [] };
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
                uid: objectName // TODO need to be localized?
            };
            formattingModel.cards.push(formattingCard);
            // go over slices
            Object.keys(settingsObject).forEach((propertyName) => {
                let settingsProperty = settingsObject[propertyName];
                if (settingsProperty && settingsProperty.value != undefined) {
                    let circleCardFormattingSlice = convertPropertySliceToFormattingSlice(settingsProperty, objectName, propertyName);
                    if (circleCardFormattingSlice) {
                        if (propertyName == "show" && circleCardFormattingSlice.control.type == "ToggleSwitch" /* powerbi.visuals.FormattingComponent.ToggleSwitch */) {
                            circleCardFormattingSlice.suppressDisplayName = true;
                            formattingCard.topLevelToggle = circleCardFormattingSlice;
                        }
                        else {
                            formattingGroup.slices.push(circleCardFormattingSlice);
                        }
                    }
                }
            });
        });
        return formattingModel;
    }
}
//# sourceMappingURL=SettingsModelFactory.js.map