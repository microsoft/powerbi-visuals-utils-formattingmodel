
import powerbi from "powerbi-visuals-api"
import { parseFormattingSettingsSlice, getPropertyValue } from "./SettingsParser"
import visuals = powerbi.visuals;

export class FormattingSettingsModel {

    public populateFrom(dataView: powerbi.DataView): void {
        if (!dataView || !dataView.metadata || !dataView.metadata.objects) {
            return;
        }

        Object.keys(this).forEach((objectName: string) => {
            Object.keys(this[objectName]).forEach((propertyName: string) => {
                let dataViewObjects = dataView.metadata.objects;
                if (dataViewObjects?.[objectName]?.[propertyName]) {
                    this[objectName][propertyName].value = getPropertyValue(dataViewObjects[objectName][propertyName], this[objectName][propertyName].value);
                }
            });
        });
    }

    public buildFormattingModel(): visuals.FormattingModel {
        let formattingModel = { cards: [] }
        Object.keys(this).forEach((objectName: string) => {
            let settingsObject = this[objectName];

            let formattingGroup: visuals.FormattingGroup = {
                displayName: undefined,
                slices: [],
                uid: objectName + "-group"
            }


            let formattingCard: visuals.FormattingCard = {
                displayName: settingsObject.displayName,
                groups: [formattingGroup],
                uid: objectName // TODO need to be localized?
            }

            formattingModel.cards.push(formattingCard);

            // go over slices
            Object.keys(settingsObject).forEach((propertyName: string) => {
                let settingsProperty: any = settingsObject[propertyName];
                if (settingsProperty && settingsProperty.value!=undefined ) {
                    let circleCardFormattingSlice: visuals.FormattingSlice = parseFormattingSettingsSlice(settingsProperty, objectName,propertyName);

                    if (circleCardFormattingSlice){
                        if(propertyName == "show" && circleCardFormattingSlice.control.type == powerbi.visuals.FormattingComponent.ToggleSwitch){
                            circleCardFormattingSlice.suppressDisplayName = true;
                            formattingCard.topLevelToggle = <powerbi.visuals.EnabledSlice>circleCardFormattingSlice;
                        }else {
                        formattingGroup.slices.push(circleCardFormattingSlice);
                        }
                    }
                }
            });
        });
        return formattingModel;
    }
}
