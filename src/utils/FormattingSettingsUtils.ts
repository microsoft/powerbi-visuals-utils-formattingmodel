import powerbi from "powerbi-visuals-api";
import { ItemDropdown, SimpleSlice } from "../FormattingSettingsComponents";

import Fill = powerbi.Fill;
import visuals = powerbi.visuals;

/**
 * Build and return formatting descriptor for simple slice
 * 
 * @param objectName Object name from capabilities
 * @param slice formatting simple slice
 * @returns simple slice formatting descriptor
 */
export function getDescriptor(objectName: string, slice: SimpleSlice): visuals.FormattingDescriptor {
    return {
        objectName: objectName,
        propertyName: slice.name,
        selector: slice.selector,
        altConstantValueSelector: slice.altConstantSelector,
        instanceKind: slice.instanceKind
    };
}

/**
 * Get property value from dataview objects if exists
 * Else return the default value from formatting settings object
 * 
 * @param value dataview object value
 * @param defaultValue formatting settings default value
 * @returns formatting property value
 */
export function getPropertyValue(slice: SimpleSlice, value: any, defaultValue: any): any {
    if (value == null || (typeof value === "object" && !(value as Fill).solid)) {
        return defaultValue;
    }

    if ((value as Fill).solid) {
        return { value: (value as Fill)?.solid.color };
    }

    if ((slice as ItemDropdown)?.items) {
        let itemsArray = (slice as ItemDropdown).items;
        return itemsArray.find(item => item.value == value);
    }

    return value;
}
