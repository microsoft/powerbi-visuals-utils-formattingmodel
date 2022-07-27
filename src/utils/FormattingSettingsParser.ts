import powerbi_api from "powerbi-visuals-api";
import * as formattingSettings from "../FormattingSettingsInterfaces";

import visuals = powerbi_api.visuals;

/**
 * Parse and convert formatting settings slice object to powerbi visuals formatting pane slice
 * @param slice custom visual formatting settings slice
 * @param objectName object name 
 * @returns formatting pane slice
 */
export function parseFormattingSettingsSlice(slice: formattingSettings.Slice, objectName: string): visuals.FormattingSlice | undefined {
    if (!slice)
        return undefined;

    const controlType = slice.type;
    const propertyName = slice.name;
    const componentDisplayName = {
        displayName: slice.displayName,
        description: slice.description,
        uid: objectName + '-' + propertyName,
    };

    if (isCompositeSlice(slice.type)) {
        return <visuals.CompositeVisualFormattingSlice>{
            ...componentDisplayName,
            control: {
                type: controlType,
                properties: buildCompositeFormattingComponent(<formattingSettings.CompositeSlice>slice, objectName)
            },
        }
    } else {
        return <visuals.SimpleVisualFormattingSlice>{
            ...componentDisplayName,
            control: {
                type: controlType,
                properties: buildSimpleFormattingComponent(<formattingSettings.SimpleSlice>slice, objectName)
            },
        };
    }
}

export function buildSimpleFormattingComponent(slice: formattingSettings.SimpleSlice, objectName: string): visuals.SimpleComponentBase<any> | undefined {
    if (!slice)
        return undefined;

    const controlType = slice.type;

    switch (controlType) {
        case visuals.FormattingComponent.ColorPicker:
            return {
                descriptor: getDescriptor(objectName, slice),
                value: { value: slice.value },
            };
        case visuals.FormattingComponent.NumUpDown:
        case visuals.FormattingComponent.ToggleSwitch:
        case visuals.FormattingComponent.FontPicker:
            return {
                descriptor: getDescriptor(objectName, slice),
                value: slice.value
            };
        case visuals.FormattingComponent.TextInput:
        case visuals.FormattingComponent.TextArea:
            let textSlice = <formattingSettings.TextInput>slice;
            return <visuals.TextInput>{
                descriptor: getDescriptor(objectName, slice),
                value: slice.value,
                placeholder: textSlice.placeholder
            };
    }

    return undefined;
}


export function buildCompositeFormattingComponent(slice: formattingSettings.CompositeSlice, objectName: string): visuals.CompositeComponentPropertyType | undefined {
    if (!slice)
        return undefined;

    const controlType = slice.type;
    switch (controlType) {
        case visuals.FormattingComponent.FontControl:
            let fontControlSlice = <formattingSettings.FontControl>slice;
            return <visuals.FontControl>{
                fontFamily: buildSimpleFormattingComponent(fontControlSlice.fontFamily, objectName),
                fontSize: buildSimpleFormattingComponent(fontControlSlice.fontSize, objectName),
                bold: buildSimpleFormattingComponent(fontControlSlice.bold, objectName),
                underline: buildSimpleFormattingComponent(fontControlSlice.underline, objectName),
                italic: buildSimpleFormattingComponent(fontControlSlice.italic, objectName),
            };
    }
    return undefined;
}

/**
 * Get property value from dataview objects if it exist there
 * Else return the default value from formatting settings object
 * 
 * @param value dataview object value
 * @param defaultValue formatting settings default value
 * @returns formatting property value
 */
export function getPropertyValue(value: any, defaultValue: any): any {
    if (value && (value as powerbi_api.Fill).solid) {
        return (value as powerbi_api.Fill).solid.color;
    }

    if (value == null || (typeof value === "object" && !(value as powerbi_api.Fill).solid)) {
        return defaultValue;
    }

    return value;
}

function getDescriptor(objectName: string, slice: formattingSettings.SimpleSlice): powerbi.visuals.FormattingDescriptor {
    return {
        objectName: objectName,
        propertyName: slice.name,
        selector: slice.selector,
        altConstantValueSelector: slice.altConstantSelector,
        instanceKind: slice.instanceKind
    };
}

export function isCompositeSlice(sliceType: visuals.FormattingComponent): boolean {
    return formattingSettings.CompositeSliceTypes.includes(sliceType);
}