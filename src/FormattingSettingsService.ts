import powerbi from "powerbi-visuals-api";

import { Cards, CardGroupEntity, CompositeCard, Model, SimpleCard, Slice, SimpleSlice } from "./FormattingSettingsComponents";
import { formattingSettings } from ".";
import { IBuildFormattingSlicesParams, IFormattingSettingsService } from "./FormattingSettingsInterfaces";

import ILocalizationManager = powerbi.extensibility.ILocalizationManager;
import visuals = powerbi.visuals;

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
    public populateFormattingSettingsModel<T extends Model>(typeClass: new () => T, dataView: powerbi.DataView): T {
        let defaultSettings: T = new typeClass();

        let dataViewObjects = dataView?.metadata?.objects;
        if (dataViewObjects) {
            // loop over each formatting property and set its new value if exists
            defaultSettings.cards?.forEach((card: Cards) => {
                if (card instanceof CompositeCard) card.topLevelSlice?.setPropertiesValues(dataViewObjects, card.name);

                const cardGroupInstances = <CardGroupEntity[]>(card instanceof SimpleCard ? [card] : card.groups);
                cardGroupInstances.forEach((cardGroupInstance: CardGroupEntity) => {
                    // Set current top level toggle value
                    cardGroupInstance.topLevelSlice?.setPropertiesValues(dataViewObjects, card.name);
                    cardGroupInstance?.slices?.forEach((slice: Slice) => {
                        slice?.setPropertiesValues(dataViewObjects, card.name);
                    });

                    cardGroupInstance?.container?.containerItems?.forEach((containerItem: formattingSettings.ContainerItem) => {
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

        formattingSettingsModel.cards
            .filter(({ visible = true }) => visible)
            .forEach((card: Cards) => {
                let formattingCard: visuals.FormattingCard = {
                    displayName: (this.localizationManager && card.displayNameKey) ? this.localizationManager.getDisplayName(card.displayNameKey) : card.displayName,
                    description: (this.localizationManager && card.descriptionKey) ? this.localizationManager.getDisplayName(card.descriptionKey) : card.description,
                    groups: [],
                    uid: card.name + "-card",
                    analyticsPane: card.analyticsPane,
                };

                const objectName = card.name;

                if (card.topLevelSlice) {
                    let topLevelToggleSlice: visuals.FormattingSlice = card.topLevelSlice.getFormattingSlice(objectName, this.localizationManager);
                    topLevelToggleSlice.suppressDisplayName = true;
                    formattingCard.topLevelToggle = (<visuals.EnabledSlice>topLevelToggleSlice);
                }

                card.onPreProcess?.();

                const isSimpleCard = card instanceof SimpleCard;
                const cardGroupInstances = <CardGroupEntity[]>(isSimpleCard ?
                    [card].filter(({ visible = true }) => visible) :
                    card.groups.filter(({ visible = true }) => visible));
                cardGroupInstances
                    .forEach((cardGroupInstance: CardGroupEntity) => {
                        const groupUid = cardGroupInstance.name + "-group";

                        // Build formatting group for each group
                        const formattingGroup: visuals.FormattingGroup = {
                            displayName: isSimpleCard ? undefined : (this.localizationManager && cardGroupInstance.displayNameKey)
                                ? this.localizationManager.getDisplayName(cardGroupInstance.displayNameKey) : cardGroupInstance.displayName,
                            description: isSimpleCard ? undefined : (this.localizationManager && cardGroupInstance.descriptionKey)
                                ? this.localizationManager.getDisplayName(cardGroupInstance.descriptionKey) : cardGroupInstance.description,
                            slices: [],
                            uid: groupUid,
                            collapsible: cardGroupInstance.collapsible,
                            delaySaveSlices: cardGroupInstance.delaySaveSlices,
                            disabled: cardGroupInstance.disabled,
                            disabledReason: cardGroupInstance.disabledReason,
                        }
                        formattingCard.groups.push(formattingGroup);

                        // In case formatting model adds data points or top categories (Like when you modify specific visual category color).
                        // these categories use same object name and property name from capabilities and the generated uid will be the same for these formatting categories properties
                        // Solution => Save slice names to modify each slice uid to be unique by adding counter value to the new slice uid
                        const sliceNames: { [name: string]: number } = {};

                        // creating slices using same uid as described above is ok at this stage, powerbi identify the specific slice by the selector.
                        // so the correct thing to do is to provide a unique selector for each datapoint if needed.
                        // We are keeping sliceNames for backward compatibility.
                        // This map helps us to check if we need to change the uid
                        const selectorsMap: Record<string, { [selector: string]: boolean }> = {}

                        // Build formatting container slice for each property
                        if (cardGroupInstance.container) {
                            const container = cardGroupInstance.container;
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
                                this.buildFormattingSlices({ slices: containerItem.slices, objectName, sliceNames, selectorsMap, formattingSlices: formattingContainerItem.slices });
                                formattingContainer.containerItems.push(formattingContainerItem);
                            });

                            formattingGroup.container = formattingContainer;
                        }

                        if (cardGroupInstance.slices) {
                            if (cardGroupInstance.topLevelSlice) {
                                let topLevelToggleSlice: visuals.FormattingSlice = cardGroupInstance.topLevelSlice.getFormattingSlice(objectName, this.localizationManager);
                                topLevelToggleSlice.suppressDisplayName = true;
                                (formattingGroup.displayName == undefined ? formattingCard : formattingGroup).topLevelToggle = (<visuals.EnabledSlice>topLevelToggleSlice);
                            }
                            // Build formatting slice for each property
                            this.buildFormattingSlices({ slices: cardGroupInstance.slices, objectName, sliceNames, selectorsMap, formattingSlices: formattingGroup.slices as visuals.FormattingSlice[] });
                        }

                    });

                formattingCard.revertToDefaultDescriptors = this.getRevertToDefaultDescriptor(card);

                formattingModel.cards.push(formattingCard);
            });

        return formattingModel;
    }

    private buildFormattingSlices({ slices, objectName, sliceNames, selectorsMap, formattingSlices }: IBuildFormattingSlicesParams) {
        // Filter slices based on their visibility
        slices?.filter(({ visible = true }) => visible)
            .forEach((slice: Slice) => {
                let formattingSlice: visuals.FormattingSlice = slice?.getFormattingSlice(objectName, this.localizationManager);

                if (formattingSlice) {
                    // Modify formatting slice uid if needed
                    const sliceName = slice.name;
                    const sliceSelector = (slice as SimpleSlice).selector;
                    if (sliceNames[slice.name] === undefined) {
                        selectorsMap[sliceName] = {};
                        sliceNames[slice.name] = 0;
                        if (sliceSelector) {
                            selectorsMap[slice.name][JSON.stringify(sliceSelector)] = true;
                        }
                    } else {
                        sliceNames[slice.name]++;
                        const selectorExistsInMap = sliceSelector ? selectorsMap[slice.name][JSON.stringify(sliceSelector)] : undefined;
                        if (sliceSelector && !selectorExistsInMap) {
                            selectorsMap[slice.name][JSON.stringify(sliceSelector)] = true;
                        } else {
                            formattingSlice.uid = `${formattingSlice.uid}-${sliceNames[slice.name]}`;
                        }
                    }

                    formattingSlices.push(formattingSlice);
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

        if (card instanceof CompositeCard && card.topLevelSlice) revertToDefaultDescriptors.push(...card.topLevelSlice?.getRevertToDefaultDescriptor(card.name));

        const cardGroupInstances = <CardGroupEntity[]>(card instanceof SimpleCard ?
            [card].filter(({ visible = true }) => visible) :
            card.groups.filter(({ visible = true }) => visible));
        cardGroupInstances.forEach((cardGroupInstance: CardGroupEntity) => {
            cardSlicesDefaultDescriptors = this.getSlicesRevertToDefaultDescriptor(card.name, cardGroupInstance.slices, sliceNames, cardGroupInstance.topLevelSlice);

            cardGroupInstance.container?.containerItems?.forEach((containerItem: formattingSettings.ContainerItem) => {
                cardContainerSlicesDefaultDescriptors = cardContainerSlicesDefaultDescriptors.concat(
                    this.getSlicesRevertToDefaultDescriptor(card.name, containerItem.slices, sliceNames))
            });

            revertToDefaultDescriptors.push(...cardSlicesDefaultDescriptors.concat(cardContainerSlicesDefaultDescriptors));
        });

        return revertToDefaultDescriptors;
    }

    private getSlicesRevertToDefaultDescriptor(cardName: string, slices: Slice[], sliceNames: { [name: string]: boolean }, topLevelSlice?: formattingSettings.SimpleSlice): visuals.FormattingDescriptor[] {
        let revertToDefaultDescriptors: visuals.FormattingDescriptor[] = [];
        if (topLevelSlice) {
            sliceNames[topLevelSlice.name] = true
            revertToDefaultDescriptors = revertToDefaultDescriptors.concat(topLevelSlice.getRevertToDefaultDescriptor(cardName));
        }
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