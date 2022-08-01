import powerbi_api from "powerbi-visuals-api";
import * as formattingSettings from "./FormattingSettingsComponents";
import visuals = powerbi_api.visuals;


export class FormattingSettingsModel {
    cards: Array<formattingSettings.Card>;

    /**
     * Build visual formatting settings model from metadata dataView
     * @param dataView metadata dataView object
     * @returns visual formatting settings model 
     */
    public static populateFrom<T extends FormattingSettingsModel>(dataViews: powerbi_api.DataView[]): T {
        let defaultSettings = <T>new this();

        let dataViewObjects = dataViews?.[0]?.metadata?.objects;
        if (dataViewObjects) {
            // loop over each object and property in dataview and add its value to settings model object
            defaultSettings.cards?.forEach((card: formattingSettings.Card) => {
                card?.slices?.forEach((slice: formattingSettings.Slice) => {
                    slice?.setPropertiesValues(dataViewObjects, card.name);
                });
            });
        }

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

        this.cards?.forEach((card: formattingSettings.Card) => {
            if(!card)
                return;
                
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
            card.slices?.forEach((slice: formattingSettings.Slice) => {
                let formattingSlice: visuals.FormattingSlice = slice?.getFormattingSlice(objectName);

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

        card.slices?.forEach((slice: formattingSettings.Slice) => {
            if (slice && !sliceNames[slice.name]) {
                sliceNames[slice.name] = true
                revertToDefaultDescriptors = revertToDefaultDescriptors.concat(slice.getRevertToDefaultDescriptor(card.name));
            }
        });

        return revertToDefaultDescriptors;
    }
}