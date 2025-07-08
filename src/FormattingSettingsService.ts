import powerbi from "powerbi-visuals-api";
import { formattingSettings } from ".";
import { Cards, CardGroupEntity, CompositeCard, Model, SimpleCard, Slice } from "./FormattingSettingsComponents";
import { IBuildFormattingSlicesParams, IFormattingSettingsService } from "./FormattingSettingsInterfaces";

import visuals = powerbi.visuals;
import ILocalizationManager = powerbi.extensibility.ILocalizationManager;
import { getLocalizedProperty } from "./utils/FormattingSettingsUtils";

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
        const defaultSettings: T = new typeClass();

        const dataViewObjects = dataView?.metadata?.objects;
        if (dataViewObjects) {
            // loop over each formatting property and set its new value if exists
            defaultSettings.cards?.forEach((card: Cards) => {
                if (card instanceof CompositeCard) card.topLevelSlice?.setPropertiesValues(dataViewObjects, card.name);

                const cardGroupInstances = <CardGroupEntity[]>(card instanceof SimpleCard ? [ card ] : card.groups);
                cardGroupInstances?.forEach((cardGroupInstance: CardGroupEntity) => {
                    // Set current top level toggle value
                    cardGroupInstance.topLevelSlice?.setPropertiesValues(dataViewObjects, card.name);
                    cardGroupInstance?.slices?.forEach((slice: Slice) => {
                        slice?.setPropertiesValues(dataViewObjects, card.name);
                    });

                    cardGroupInstance?.container?.containerItems?.forEach((containerItem: formattingSettings.ContainerItem) => {
                        containerItem?.slices?.forEach((slice: Slice) => {
                            slice?.setPropertiesValues(dataViewObjects, card.name);
                        });
                        containerItem?.groups?.forEach((group: formattingSettings.Group) => {
                            group?.topLevelSlice?.setPropertiesValues(dataViewObjects, card.name);
                            group?.slices?.forEach((slice: Slice) => {
                                slice?.setPropertiesValues(dataViewObjects, card.name);
                            });
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
        const formattingModel = {
            cards: []
        }
        
        formattingSettingsModel.cards
            .filter(({visible = true}) => visible)
            .forEach((card: Cards) => {
                const formattingCard: visuals.FormattingCard = {
                    displayName: getLocalizedProperty(card, "displayName", this.localizationManager),
                    description: getLocalizedProperty(card, "description", this.localizationManager),
                    disabled: card.disabled,
                    disabledReason: getLocalizedProperty(card, "disabledReason", this.localizationManager),
                    groups: [],
                    uid: card.name + "-card",
                    analyticsPane: card.analyticsPane,
                };

                const objectName = card.name;
                
                this.setTopLevelToggleSliceClone(card, formattingCard, objectName);
                card.onPreProcess?.();

                const isSimpleCard = card instanceof SimpleCard;
                const cardGroupInstances = <CardGroupEntity[]>(isSimpleCard ? 
                    [ card ].filter(({visible = true}) => visible) : 
                    card.groups.filter(({visible = true}) => visible));

                cardGroupInstances?.forEach((cardGroupInstance: CardGroupEntity) => {
                    const formattingGroup = this.buildCardGroupInstances(cardGroupInstance, formattingCard, isSimpleCard, objectName);
                    formattingCard.groups.push(formattingGroup);
                });

                formattingCard.revertToDefaultDescriptors = this.getRevertToDefaultDescriptor(card);
                formattingModel.cards.push(formattingCard);
            });
        return formattingModel;
    }

    private buildCardGroupInstances(cardGroupInstance: CardGroupEntity, formattingCard: visuals.FormattingCard, isSimpleCard: boolean, objectName: string): visuals.FormattingGroup {
        const groupUid = cardGroupInstance.name + "-group";

        // Build formatting group for each group
        const formattingGroup: visuals.FormattingGroup = {
            displayName: isSimpleCard ? undefined : getLocalizedProperty(cardGroupInstance, "displayName", this.localizationManager),
            description: isSimpleCard ? undefined : getLocalizedProperty(cardGroupInstance, "description", this.localizationManager),
            slices: [],
            uid: groupUid,
            collapsible: cardGroupInstance.collapsible,
            delaySaveSlices: cardGroupInstance.delaySaveSlices,
            disabled: cardGroupInstance.disabled,
            disabledReason: getLocalizedProperty(cardGroupInstance, "disabledReason", this.localizationManager),
        }
        // In case formatting model adds data points or top categories (Like when you modify specific visual category color).
        // these categories use same object name and property name from capabilities and the generated uid will be the same for these formatting categories properties
        // Solution => Save slice names to modify each slice uid to be unique by adding counter value to the new slice uid
        const sliceNames: { [name: string]: number } = {};

        // Build formatting container slice for each property
        if (cardGroupInstance.container) {
            const containerUid = formattingGroup.uid + "-container";
            const formattingContainer = this.buildContainerGroupInstance(cardGroupInstance.container, containerUid, objectName, sliceNames);
            formattingGroup.displayName = "Apply settings to";
            formattingGroup.sliceWithContainer = false;
            formattingGroup.collapsible = false;
            formattingGroup.container = formattingContainer;
        }

        if (cardGroupInstance.slices) {
            this.setTopLevelToggleSliceClone(cardGroupInstance, (formattingGroup.displayName==undefined ? formattingCard : formattingGroup), objectName);
            // Build formatting slice for each property
            this.buildFormattingSlices({slices: cardGroupInstance.slices, objectName, sliceNames, formattingSlices: formattingGroup.slices as visuals.FormattingSlice[]});
        }
        return formattingGroup;
    }

    private buildContainerGroupInstance(container: formattingSettings.Container, containerUid: string, objectName: string, sliceNames: { [name: string]: number }): visuals.FormattingContainer {
        const formattingContainer: visuals.FormattingContainer = {
            displayName: getLocalizedProperty(container, "displayName", this.localizationManager),
            description: getLocalizedProperty(container, "description", this.localizationManager),
            containerItems: [],
            uid: containerUid
        }

        container.containerItems.filter(({visible = true}) => visible).forEach((containerItem: formattingSettings.ContainerItem) => {
            if(!containerItem) { // This is to prevent error when container item is null or undefined
                return;
            }
            // Build formatting container item object
            const containerIemName = containerItem.displayNameKey ? containerItem.displayNameKey : containerItem.displayName;
            const containerItemUid: string = containerUid + containerIemName;
            const formattingContainerItem: visuals.FormattingContainerItem = {
                displayName: getLocalizedProperty(containerItem, "displayName", this.localizationManager),
                slices: [],
                groups: [],
                uid: containerItemUid   
            }
            // Build formatting slices and add them to current formatting container item
            if(containerItem.slices) {
                this.buildFormattingSlices({slices: containerItem.slices, objectName, sliceNames, formattingSlices: formattingContainerItem.slices});
            }
            // Build formatting groups and add them to current formatting container item
            if(containerItem.groups) {
                containerItem.groups.forEach((group: formattingSettings.Group) => {
                    const groupSlices: visuals.FormattingGroup = {
                        displayName: getLocalizedProperty(group, "displayName", this.localizationManager),
                        description: getLocalizedProperty(group, "description", this.localizationManager),
                        slices: [],
                        uid: group.name + "-container-group",
                        collapsible: group.collapsible,
                        delaySaveSlices: group.delaySaveSlices,
                        disabled: group.disabled,
                        disabledReason: getLocalizedProperty(group, "disabledReason", this.localizationManager)
                    };
                    this.setTopLevelToggleSliceClone(group, groupSlices, objectName);
                    this.buildFormattingSlices({slices: group.slices, objectName, sliceNames, formattingSlices: groupSlices.slices as visuals.FormattingSlice[]});
                    formattingContainerItem.groups.push(groupSlices);
                });
            }
            formattingContainer.containerItems.push(formattingContainerItem); // pushes specific container item (All, name1, name2) with slices
        });

        return formattingContainer;
    }

    private buildFormattingSlices({slices, objectName, sliceNames, formattingSlices }: IBuildFormattingSlicesParams) {
        // Filter slices based on their visibility
        slices?.filter(({visible = true}) => visible)
            .forEach((slice: Slice) => {
            const formattingSlice: visuals.FormattingSlice = slice?.getFormattingSlice(objectName, this.localizationManager);
            if (formattingSlice) {
                // Modify formatting slice uid if needed
                if (sliceNames[slice.name] === undefined) {
                    sliceNames[slice.name] = 0;
                } else {
                    sliceNames[slice.name]++;
                    formattingSlice.uid = `${formattingSlice.uid}-${sliceNames[slice.name]}`;
                }

                formattingSlices.push(formattingSlice);
            }
        });
    }

    private getRevertToDefaultDescriptor(card: Cards): visuals.FormattingDescriptor[] {
        // Proceeded slice names are saved to prevent duplicated default descriptors in case of using 
        // formatting categories & selectors, since they have the same descriptor objectName and propertyName
        const sliceNames: { [name: string]: boolean } = {};
        const revertToDefaultDescriptors: visuals.FormattingDescriptor[] = [];
        let cardSlicesDefaultDescriptors: visuals.FormattingDescriptor[]
        let cardContainerSlicesDefaultDescriptors: visuals.FormattingDescriptor[] = [];

        // eslint-disable-next-line
        if (card instanceof CompositeCard && card.topLevelSlice) revertToDefaultDescriptors.push(...card.topLevelSlice?.getRevertToDefaultDescriptor(card.name));

        const cardGroupInstances = <CardGroupEntity[]>(card instanceof SimpleCard ? 
            [ card ].filter(({visible = true}) => visible) : 
            card.groups.filter(({visible = true}) => visible));
        cardGroupInstances?.forEach((cardGroupInstance: CardGroupEntity) => {
            cardSlicesDefaultDescriptors = this.getSlicesRevertToDefaultDescriptor(card.name, cardGroupInstance.slices, sliceNames, cardGroupInstance.topLevelSlice);

            cardGroupInstance.container?.containerItems?.forEach((containerItem: formattingSettings.ContainerItem) => {
                cardContainerSlicesDefaultDescriptors = cardContainerSlicesDefaultDescriptors.concat(
                    this.getSlicesRevertToDefaultDescriptor(card.name, containerItem.slices, sliceNames)
                )
                containerItem.groups?.forEach((group: formattingSettings.Group) => {
                    cardContainerSlicesDefaultDescriptors = cardContainerSlicesDefaultDescriptors.concat(
                        this.getSlicesRevertToDefaultDescriptor(card.name, group.slices, sliceNames)
                    )
                });
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

    private setTopLevelToggleSliceClone(objectToClone: Cards | CardGroupEntity, newParent: visuals.FormattingGroup | visuals.FormattingCard, objectName: string) {
        if (objectToClone.topLevelSlice) {
            const topLevelToggleSlice: visuals.FormattingSlice = objectToClone.topLevelSlice.getFormattingSlice(objectName, this.localizationManager);
            topLevelToggleSlice.suppressDisplayName = true;
            newParent.topLevelToggle = (<visuals.EnabledSlice>topLevelToggleSlice);
        }
    }
}

export default FormattingSettingsService;
