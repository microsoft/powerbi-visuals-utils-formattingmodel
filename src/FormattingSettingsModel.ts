import powerbi from "powerbi-visuals-api";
import { FormattingSettingsCard, FormattingSettingsSlice } from "./FormattingSettingsInterfaces";
import { getPropertyValue, parseFormattingSettingsSlice } from "./utils/FormattingSettingsParser";
import visuals = powerbi.visuals;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;

export class FormattingSettingsModel {
    cards: Array<FormattingSettingsCard> = [];

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
        defaultSettings.cards.forEach((card: FormattingSettingsCard) => {
            card.slices.forEach((slice: FormattingSettingsSlice) => {
                const objectName = card.name;
                const propertyName = slice.name;
                if (dataViewObjects?.[objectName]?.[propertyName] !== undefined) {
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
    public buildFormattingModel(): visuals.FormattingModel {
        let formattingModel = {
            cards: []
        }

        this.cards.forEach((card: FormattingSettingsCard) => {
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
            card.slices.forEach((slice: FormattingSettingsSlice) => {
                if (slice.value != undefined) {
                    let formattingSlice: visuals.FormattingSlice = parseFormattingSettingsSlice(slice, objectName);

                    if (formattingSlice) {
                        if (sliceNames[slice.name] === undefined) {
                            sliceNames[slice.name] = 0;
                        } else {
                            sliceNames[slice.name]++;
                            formattingSlice.uid = `${formattingSlice.uid}-${sliceNames[slice.name]}`;
                        }

                        if (slice.topLevelToggle) {
                            formattingSlice.suppressDisplayName = true;
                            formattingCard.topLevelToggle = <powerbi.visuals.EnabledSlice>formattingSlice;
                        } else {
                            formattingGroup.slices.push(formattingSlice);
                        }
                    }
                }
            });

            formattingCard.revertToDefaultDescriptors = this.getRevertToDefaultDescriptor(card);
        });

        return formattingModel;
    }

    private getRevertToDefaultDescriptor(card: FormattingSettingsCard): powerbi.visuals.FormattingDescriptor[] {
        const sliceNames: { [name: string]: boolean } = {};
        let revertToDefaultDescriptors: powerbi.visuals.FormattingDescriptor[] = [];
        card.slices.forEach((slice: FormattingSettingsSlice) => {
            if (!sliceNames[slice.name]) {
                sliceNames[slice.name] = true
                revertToDefaultDescriptors.push({
                    objectName: card.name,
                    propertyName: slice.name
                })
            }
        });
        return revertToDefaultDescriptors;
    }
}