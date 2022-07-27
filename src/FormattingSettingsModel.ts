import powerbi_api from "powerbi-visuals-api";
import { getPropertyValue, isCompositeSlice, parseFormattingSettingsSlice } from "./utils/FormattingSettingsParser";
import visuals = powerbi_api.visuals;
import VisualUpdateOptions = powerbi_api.extensibility.visual.VisualUpdateOptions;
import * as formattingSettings from "./FormattingSettingsInterfaces";


export class FormattingSettingsModel {
    cards: Array<formattingSettings.Card> = [];

    /**
     * Build visual formatting settings model from metadata dataView
     * @param dataView metadata dataView object
     * @returns visual formatting settings model 
     */
    public static populateFrom<T extends FormattingSettingsModel>(options: VisualUpdateOptions): T {
        let defaultSettings = <T>new this();

        let dataViews = options.dataViews;
        if (!dataViews
            || !dataViews[0]
            || !dataViews[0].metadata
            || !dataViews[0].metadata.objects
        ) {
            return defaultSettings;
        }

        // loop over each object and property in dataview and add its value to settings model object
        let dataViewObjects = dataViews[0].metadata.objects;
        defaultSettings.cards.forEach((card: formattingSettings.Card) => {
            card.slices.forEach((slice: formattingSettings.Slice) => {
                const objectName = card.name;
                if (isCompositeSlice(slice.type)) {
                    let compositeSlice = <formattingSettings.CompositeSlice>slice;
                    Object.keys(compositeSlice).forEach(key => {
                        let property = compositeSlice[key];
                        if (property?.name) {
                            property.value = getPropertyValue(dataViewObjects[objectName][property.name], property.value);
                        }
                    });
                } else {
                    let simpleSlice = <formattingSettings.SimpleSlice>slice;
                    const propertyName = slice.name;
                    if (dataViewObjects?.[objectName]?.[propertyName] !== undefined) {
                        simpleSlice.value = getPropertyValue(dataViewObjects[objectName][propertyName], simpleSlice.value);
                    }
                }
            });
        });

        return defaultSettings;
    }

    /**
     * Build formatting model by parsing formatting settings model object 
     * @returns custom visual formatting model
     */
    public buildFormattingModel(): visuals.FormattingModel {
        let formattingModel = {
            cards: []
        }

        this.cards.forEach((card: formattingSettings.Card) => {
            const objectName = card.name;
            let formattingGroup: visuals.FormattingGroup = {
                displayName: undefined,
                slices: [],
                uid: objectName + "-group"
            }

            let formattingCard: visuals.FormattingCard = {
                displayName: card.displayName,
                groups: [formattingGroup],
                uid: objectName,
                analyticsPane: card.analyticsPane
            }

            formattingModel.cards.push(formattingCard);
            const sliceNames: { [name: string]: number } = {};

            // Build formatting slice for each property
            card.slices.forEach((slice: formattingSettings.Slice) => {
                let formattingSlice: visuals.FormattingSlice = parseFormattingSettingsSlice(slice, objectName);

                if (formattingSlice) {
                    if (sliceNames[slice.name] === undefined) {
                        sliceNames[slice.name] = 0;
                    } else {
                        sliceNames[slice.name]++;
                        formattingSlice.uid = `${formattingSlice.uid}-${sliceNames[slice.name]}`;
                    }

                    if ((slice as formattingSettings.ToggleSwitch).topLevelToggle) {
                        formattingSlice.suppressDisplayName = true;
                        formattingCard.topLevelToggle = <powerbi_api.visuals.EnabledSlice>formattingSlice;
                    } else {
                        formattingGroup.slices.push(formattingSlice);
                    }
                }
            });

            formattingCard.revertToDefaultDescriptors = this.getRevertToDefaultDescriptor(card);
        });

        return formattingModel;
    }

    private getRevertToDefaultDescriptor(card: formattingSettings.Card): powerbi_api.visuals.FormattingDescriptor[] {
        const sliceNames: { [name: string]: boolean } = {};
        let revertToDefaultDescriptors: powerbi_api.visuals.FormattingDescriptor[] = [];
        card.slices.forEach((slice: formattingSettings.Slice) => {

            if (!sliceNames[slice.name]) {
                sliceNames[slice.name] = true
                if (isCompositeSlice(slice.type)) {
                    Object.keys(slice).forEach(key => {
                        let property = slice[key];
                        if (property?.name) {
                            revertToDefaultDescriptors.push({
                                objectName: card.name,
                                propertyName: property.name
                            })
                        }
                    })
                } else {
                    revertToDefaultDescriptors.push({
                        objectName: card.name,
                        propertyName: slice.name
                    })
                }
            }
        });
        return revertToDefaultDescriptors;
    }
}