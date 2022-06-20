import { FormattingSettingsSlice } from "../FormattingSettingsInterfaces";
import powerbi from "powerbi-visuals-api"

import visuals = powerbi.visuals;

/**
 * Parse and convert formatting settings slice object to powerbi visuals formatting pane slice
 * @param slice custom visual formatting settings slice
 * @param objectName object name 
 * @returns formatting pane slice
 */
export function parseFormattingSettingsSlice(slice: FormattingSettingsSlice, objectName: string): visuals.FormattingSlice | undefined {
    if (!slice)
        return undefined;

    const controlType = slice.type;
    const propertyName = slice.name;
    const componentDisplayName = {
        displayName: slice.displayName,
        description: slice.description,
        uid: objectName + '-' + propertyName,
    };

    switch (controlType) {
        case visuals.FormattingComponent.ColorPicker:
            return {
                ...componentDisplayName,
                control: {
                    type: visuals.FormattingComponent.ColorPicker,
                    properties: {
                        descriptor: getDescriptor(objectName, propertyName),
                        value: { value: slice.value },
                    }
                },
            };
        case visuals.FormattingComponent.NumUpDown:
        case visuals.FormattingComponent.ToggleSwitch:
            return {
                ...componentDisplayName,
                control: {
                    type: controlType,
                    properties: {
                        descriptor: getDescriptor(objectName, propertyName),
                        value: slice.value
                    }
                },

            };
        case visuals.FormattingComponent.TextInput:
        case visuals.FormattingComponent.TextArea:
            return {
                ...componentDisplayName,
                control: {
                    type: controlType,
                    properties: {
                        descriptor: getDescriptor(objectName, propertyName),
                        value: slice.value,
                        placeholder: slice.placeholder
                    }
                },
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
    if (value && (value as powerbi.Fill).solid) {
        return (value as powerbi.Fill).solid.color;
    }

    if (value == null || (typeof value === "object" && !(value as powerbi.Fill).solid)) {
        return defaultValue;
    }

    return value;
}

function getDescriptor(objectName: string, propertyName: string): powerbi.visuals.FormattingDescriptor {
    return {
        objectName: objectName,
        propertyName: propertyName
    };
}
