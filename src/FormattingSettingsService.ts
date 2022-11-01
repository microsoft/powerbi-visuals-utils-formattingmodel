import powerbi from "powerbi-visuals-api";
import { formattingSettings } from ".";
import { Card, Cards, Group, Model, Slice, ToggleSwitch } from "./FormattingSettingsComponents";
import { IFormattingSettingsService } from "./FormattingSettingsInterfaces";

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
            // loop over each formatting property and set its new value if exists
            defaultSettings.cards?.forEach((card: Cards) => {
                (card instanceof Card ? [ card ] : card.groups).forEach((group: Group) => {
                    group?.slices?.forEach((slice: Slice) => {
                        slice?.setPropertiesValues(dataViewObjects, card.name);
                    });

                    group?.container?.containerItems?.forEach((containerItem: formattingSettings.ContainerItem) => {
                        containerItem?.slices?.forEach((slice: Slice) => {
                            slice?.setPropertiesValues(dataViewObjects, card.name);
                        });
                    });
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
        
        formattingSettingsModel.cards.forEach((card: Cards) => {
            if (!card)
                return;
            
            const isSimpleCard = card instanceof Card;
            let formattingCard: visuals.FormattingCard = {
                displayName: card.displayName,
                groups: [],
                uid: card.name,
                analyticsPane: card.analyticsPane,
            };

            const objectName = card.name;

            (isSimpleCard ? [ card ] : card.groups).forEach((group: Group) => {
                const groupUid = group.name + "-group";

                let formattingGroup: visuals.FormattingGroup;

                if (isSimpleCard) {
                    formattingGroup = {
                        displayName: isSimpleCard ? undefined : group.displayName,
                        slices: [],
                        uid: groupUid
                    };
                    formattingCard = card.getFormattingCard(objectName, formattingGroup, this.localizationManager);
                } else {
                    formattingGroup = group.getFormattingGroup(objectName, this.localizationManager);
                    formattingCard.groups.push(formattingGroup);
                }
                
                // In case formatting model adds data points or top categories (Like when you modify specific visual category color).
                // these categories use same object name and property name from capabilities and the generated uid will be the same for these formatting categories properties
                // Solution => Save slice names to modify each slice uid to be unique by adding counter value to the new slice uid
                const sliceNames: { [name: string]: number } = {};

                // Build formatting container slice for each property
                if (group.container) {
                    const container = group.container;
                    const containerUid = groupUid + "-container";
                    const formattingContainer: visuals.FormattingContainer = {
                        displayName: (this.localizationManager && container.displayNameKey)
                            ? this.localizationManager.getDisplayName(container.displayNameKey) : container.displayName,
                        description: (this.localizationManager && container.descriptionKey)
                            ? this.localizationManager.getDisplayName(container.descriptionKey) : container.description,
                        containerItems: [],
                        uid: containerUid
                    }

                    container.containerItems.forEach((containerItem: formattingSettings.ContainerItem) => {
                        // Build formatting container item object
                        const containerIemName = containerItem.displayNameKey ? containerItem.displayNameKey : containerItem.displayName;
                        const containerItemUid: string = containerUid + containerIemName;
                        let formattingContainerItem: visuals.FormattingContainerItem = {
                            displayName: (this.localizationManager && containerItem.displayNameKey)
                                ? this.localizationManager.getDisplayName(containerItem.displayNameKey) : containerItem.displayName,
                            slices: [],
                            uid: containerItemUid
                        }

                        // Build formatting slices and add them to current formatting container item
                        this.buildFormattingSlices(containerItem.slices, objectName, sliceNames, isSimpleCard ? formattingCard : formattingGroup, formattingContainerItem.slices);
                        formattingContainer.containerItems.push(formattingContainerItem);
                    });

                    formattingGroup.container = formattingContainer;
                }

                if (group.slices) {
                    // Build formatting slice for each property
                    this.buildFormattingSlices(group.slices, objectName, sliceNames, isSimpleCard ? formattingCard : formattingGroup, formattingGroup.slices as visuals.FormattingSlice[]);
                }

            });

            formattingCard.revertToDefaultDescriptors = this.getRevertToDefaultDescriptor(card);

            formattingModel.cards.push(formattingCard);
        });

    return formattingModel;
    }

    private buildFormattingSlices(slices: formattingSettings.Slice[], objectName: string, sliceNames: { [name: string]: number; }, parent: visuals.FormattingCard | visuals.FormattingGroup, formattingSlices: visuals.FormattingSlice[]) {
        // Filter slices based on their visibility
        slices?.filter((slice: Slice) => slice.visible ?? true)
            .forEach((slice: Slice) => {
            let formattingSlice: visuals.FormattingSlice = slice?.getFormattingSlice(objectName, this.localizationManager);

            if (formattingSlice) {
                // Modify formatting slice uid if needed
                if (sliceNames[slice.name] === undefined) {
                    sliceNames[slice.name] = 0;
                } else {
                    sliceNames[slice.name]++;
                    formattingSlice.uid = `${formattingSlice.uid}-${sliceNames[slice.name]}`;
                }

                // Set as topLevelToggle if topLevelToggle boolean was set to true
                if ((slice as ToggleSwitch).topLevelToggle) {
                    formattingSlice.suppressDisplayName = true;
                    parent.topLevelToggle = <visuals.EnabledSlice>formattingSlice;
                } else {
                    formattingSlices.push(formattingSlice);
                }
            }
        });
    }

    private getRevertToDefaultDescriptor(card: Cards): visuals.FormattingDescriptor[] {
        // Proceeded slice names are saved to prevent duplicated default descriptors in case of using 
        // formatting categories & selectors, since they have the same descriptor objectName and propertyName
        const sliceNames: { [name: string]: boolean } = {};
        let revertToDefaultDescriptors: visuals.FormattingDescriptor[] = [];
        let cardSlicesDefaultDescriptors: visuals.FormattingDescriptor[]
        let cardContainerSlicesDefaultDescriptors: visuals.FormattingDescriptor[] = [];

        (card instanceof Card ? [ card ] : card.groups).forEach((group: Group) => {
            cardSlicesDefaultDescriptors = this.getSlicesRevertToDefaultDescriptor(card.name, group.slices, sliceNames);

            group.container?.containerItems?.forEach((containerItem: formattingSettings.ContainerItem) => {
                cardContainerSlicesDefaultDescriptors = cardContainerSlicesDefaultDescriptors.concat(
                    this.getSlicesRevertToDefaultDescriptor(card.name, containerItem.slices, sliceNames))
            });

            revertToDefaultDescriptors.push(...cardSlicesDefaultDescriptors.concat(cardContainerSlicesDefaultDescriptors));
        });

        return revertToDefaultDescriptors;
    }

    private getSlicesRevertToDefaultDescriptor(cardName: string, slices: Slice[], sliceNames: { [name: string]: boolean }): visuals.FormattingDescriptor[] {
        let revertToDefaultDescriptors: visuals.FormattingDescriptor[] = [];
        slices?.forEach((slice: Slice) => {
            if (slice && !sliceNames[slice.name]) {
                sliceNames[slice.name] = true
                revertToDefaultDescriptors = revertToDefaultDescriptors.concat(slice.getRevertToDefaultDescriptor(cardName));
            }
        });

        return revertToDefaultDescriptors;
    }
}

export default FormattingSettingsService;