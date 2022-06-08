import powerbi from "powerbi-visuals-api"
import { parseFormattingSettingsSlice, getPropertyValue } from "./SettingsParser"
import { FormattingSettingsCards } from "./SettingsInterfaces"
import visuals = powerbi.visuals;

export class FormattingSettingsModel {

    cards: FormattingSettingsCards = {};

    public populateFrom(dataView: powerbi.DataView): void {
        if (!dataView || !dataView.metadata || !dataView.metadata.objects) {
            return;
        }

        // loop over each object and property in dataview and add its value to settings model object
        Object.keys(this.cards).forEach((objectName: string) => {
            let slices = this.cards[objectName].slices;
            Object.keys(slices).forEach((propertyName: string) => {
                let dataViewObjects = dataView.metadata.objects;
                if (dataViewObjects?.[objectName]?.[propertyName] !== undefined) {
                    slices[propertyName].value = getPropertyValue(dataViewObjects[objectName][propertyName], this.cards[objectName].slices[propertyName].value);
                }
            });
        });
    }

    public buildFormattingModel(): visuals.FormattingModel {
        let formattingModel = {
            cards: []
        }

        Object.keys(this.cards).forEach((objectName: string) => {
            let settingsObject = this.cards[objectName];

            let formattingGroup: visuals.FormattingGroup = {
                displayName: undefined,
                slices: [],
                uid: objectName + "-group"
            }

            let formattingCard: visuals.FormattingCard = {
                displayName: settingsObject.displayName,
                groups: [formattingGroup],
                uid: objectName
            }

            formattingModel.cards.push(formattingCard);

            // Build formatting slice for each property
            let settingsObjectProperties = settingsObject.slices;
            Object.keys(settingsObjectProperties).forEach((propertyName: string) => {
                let settingsProperty: any = settingsObjectProperties[propertyName];
                if (settingsProperty && settingsProperty.value != undefined) {
                    let formattingSlice: visuals.FormattingSlice = parseFormattingSettingsSlice(settingsProperty, objectName, propertyName);

                    if (formattingSlice) {
                        if (propertyName == "show" && formattingSlice.control.type == powerbi.visuals.FormattingComponent.ToggleSwitch) {
                            formattingSlice.suppressDisplayName = true;
                            formattingCard.topLevelToggle = <powerbi.visuals.EnabledSlice>formattingSlice;
                        } else {
                            formattingGroup.slices.push(formattingSlice);
                        }
                    }
                }
            });
        });
        return formattingModel;
    }
}
