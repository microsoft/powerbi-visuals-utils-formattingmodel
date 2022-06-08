import powerbi from "powerbi-visuals-api"
import { parseFormattingSettingsSlice, getPropertyValue } from "./SettingsParser"
import { FormattingSettingsCards } from "./SettingsInterfaces"
import visuals = powerbi.visuals;

export class FormattingSettingsModel {

    cards: FormattingSettingsCards = {};

    public static populateFrom<T extends FormattingSettingsModel>(dataView: powerbi.DataView): T {
        let defaultSettings = <T>new this();
        if (!dataView || !dataView.metadata || !dataView.metadata.objects) {
            return;
        }

        // loop over each object and property in dataview and add its value to settings model object
        Object.keys(defaultSettings.cards).forEach((objectName: string) => {
            let slices = defaultSettings.cards[objectName].slices;
            Object.keys(slices).forEach((propertyName: string) => {
                let dataViewObjects = dataView.metadata.objects;
                if (dataViewObjects?.[objectName]?.[propertyName] !== undefined) {
                    slices[propertyName].value = getPropertyValue(dataViewObjects[objectName][propertyName], defaultSettings.cards[objectName].slices[propertyName].value);
                }
            });
        });

        return defaultSettings;
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
            let revertToDefaultDescriptors: visuals.FormattingDescriptor[] = []
            // Build formatting slice for each property
            let settingsObjectProperties = settingsObject.slices;
            Object.keys(settingsObjectProperties).forEach((propertyName: string) => {

                // build formatting slice for object property
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

                // add formatting slice to revert to default object
                revertToDefaultDescriptors.push({ objectName: objectName, propertyName: propertyName })
            });
            
            formattingCard.revertToDefaultDescriptors = revertToDefaultDescriptors;
        });

        return formattingModel;
    }
}
