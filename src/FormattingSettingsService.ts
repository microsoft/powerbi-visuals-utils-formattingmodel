import powerbi from "powerbi-visuals-api";
import { Card, Model, Slice, ToggleSwitch } from "./FormattingSettingsComponents";
import { IFormattingSettingsCard, IFormattingSettingsService } from "./FormattingSettingsInterfaces";

import visuals = powerbi.visuals;
import ILocalizationManager = powerbi.extensibility.ILocalizationManager;

export class FormattingSettingsService implements IFormattingSettingsService {
    private localizationManager: ILocalizationManager;

    constructor(localizationManager?: ILocalizationManager) {
        this.localizationManager = localizationManager;
    }

    /**
     * Build visual formatting settings model from metadata dataView
     * 
     * @param dataViews metadata dataView object
     * @returns visual formatting settings model 
     */
    public populateFormattingSettingsModel<T extends Model>(typeClass: new () => T, dataViews: powerbi.DataView[]): T {

        let defaultSettings: T = new typeClass();

        let dataViewObjects = dataViews?.[0]?.metadata?.objects;
        if (dataViewObjects) {
            // loop over each formatting property and set its new value if it exist in dataViews
            defaultSettings.cards?.forEach((card: Card) => {
                card?.slices?.forEach((slice: Slice) => {
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
    public buildFormattingModel(formattingSettingsModel: Model): visuals.FormattingModel {
        let formattingModel = {
            cards: []
        }

        formattingSettingsModel.cards?.forEach((card: Card) => {
            if (!card)
                return;

            const objectName = card.name;
            let formattingGroup: visuals.FormattingGroup = {
                displayName: undefined,
                slices: [],
                uid: objectName + "-group"
            }

            let formattingCard: visuals.FormattingCard = card.getFormattingCard(objectName, formattingGroup, this.localizationManager);

            formattingModel.cards.push(formattingCard);

            // In case formatting model contains multiple categories selectors which they use same capabilities object name and property name, 
            // Save slice names to modify each slice uid to be unique by adding counter value to the new slice uid
            const sliceNames: { [name: string]: number } = {};

            // Build formatting slice for each property
            card.slices?.forEach((slice: Slice) => {
                let formattingSlice: visuals.FormattingSlice = slice?.getFormattingSlice(objectName, this.localizationManager);

                if (formattingSlice) {
                    if (sliceNames[slice.name] === undefined) {
                        sliceNames[slice.name] = 0;
                    } else {
                        sliceNames[slice.name]++;
                        formattingSlice.uid = `${formattingSlice.uid}-${sliceNames[slice.name]}`;
                    }

                    if ((slice as ToggleSwitch).topLevelToggle) {
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

    private getRevertToDefaultDescriptor(card: Card): visuals.FormattingDescriptor[] {
        // Proceeded slice names are saved to prevent duplicated default descriptors in case of using 
        // formatting categories & selectors, since they have the same descriptor objectName and propertyName
        const sliceNames: { [name: string]: boolean } = {};
        let revertToDefaultDescriptors: visuals.FormattingDescriptor[] = [];

        card.slices?.forEach((slice: Slice) => {
            if (slice && !sliceNames[slice.name]) {
                sliceNames[slice.name] = true
                revertToDefaultDescriptors = revertToDefaultDescriptors.concat(slice.getRevertToDefaultDescriptor(card.name));
            }
        });

        return revertToDefaultDescriptors;
    }
}

export default FormattingSettingsService;