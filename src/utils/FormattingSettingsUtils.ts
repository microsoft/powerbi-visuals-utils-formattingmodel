import powerbi_api from "powerbi-visuals-api";
import * as formattingSettings from "../FormattingSettingsComponents";

/**
 * Build and return formatting descriptor for simple slice
 * @param objectName Object name from capabilities of the object that contain this slice property
 * @param slice formatting simple slice
 * @returns simple slice formatting descriptor
 */
export function getDescriptor(objectName: string, slice: formattingSettings.SimpleSlice): powerbi.visuals.FormattingDescriptor {
    return {
        objectName: objectName,
        propertyName: slice.name,
        selector: slice.selector,
        altConstantValueSelector: slice.altConstantSelector,
        instanceKind: slice.instanceKind
    };
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
        return {value: (value as powerbi_api.Fill)?.solid.color};
    }

    if (value == null || (typeof value === "object" && !(value as powerbi_api.Fill).solid)) {
        return defaultValue;
    }

    return value;
}
