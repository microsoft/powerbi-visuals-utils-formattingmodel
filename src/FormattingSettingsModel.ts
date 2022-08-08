import powerbi from "powerbi-visuals-api";
import * as formattingSettings from "./FormattingSettingsComponents";

import visuals = powerbi.visuals;


export class FormattingSettingsModel {
    cards: Array<formattingSettings.Card>;

    /**
     * Build visual formatting settings model from metadata dataView
     * 
     * @param dataViews metadata dataView object
     * @returns visual formatting settings model 
     */
    public static populateFrom<T extends FormattingSettingsModel>(dataViews: powerbi.DataView[]): T {
        let defaultSettings = <T>new this();

        let dataViewObjects = dataViews?.[0]?.metadata?.objects;
        if (dataViewObjects) {
            // loop over each formatting property and set its new value if it exist in dataViews
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
     * 
     * @returns powerbi visual formatting model
     */
    public buildFormattingModel(): visuals.FormattingModel {
        let formattingModel = {
            cards: []
        }

        this.cards?.forEach((card: formattingSettings.Card) => {
            if (!card)
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
                        // In case formatting model contains multiple categories selectors which they use same capabilities 
                        // object name and property name, Modify the current slice uid to be unique by adding counter value to the new slice uid
                        sliceNames[slice.name]++;
                        formattingSlice.uid = `${formattingSlice.uid}-${sliceNames[slice.name]}`;
                    }

                    if ((slice as formattingSettings.ToggleSwitch).topLevelToggle) {
                        formattingSlice.suppressDisplayName = true;
                        formattingCard.topLevelToggle = <visuals.EnabledSlice>formattingSlice;
                    } else {
                        formattingGroup.slices.push(formattingSlice);
                    }
                }
            });

            formattingCard.revertToDefaultDescriptors = this.getRevertToDefaultDescriptor(card);
        });

        return formattingModel;
    }

    private getRevertToDefaultDescriptor(card: formattingSettings.Card): visuals.FormattingDescriptor[] {
        // Proceeded slice names are saved to prevent duplicated default descriptors in case of using 
        // formatting categories & selectors, since they have the same descriptor objectName and propertyName
        const sliceNames: { [name: string]: boolean } = {};
        let revertToDefaultDescriptors: visuals.FormattingDescriptor[] = [];

        card.slices?.forEach((slice: formattingSettings.Slice) => {
            if (slice && !sliceNames[slice.name]) {
                sliceNames[slice.name] = true
                revertToDefaultDescriptors = revertToDefaultDescriptors.concat(slice.getRevertToDefaultDescriptor(card.name));
            }
        });

        return revertToDefaultDescriptors;
    }
}