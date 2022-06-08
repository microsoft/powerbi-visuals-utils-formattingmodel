import { FormattingSettingsSlice } from "./SettingsInterfaces";
import powerbi from "powerbi-visuals-api"
import visuals = powerbi.visuals;
import _ from "lodash"


export function parseFormattingSettingsSlice(slice: FormattingSettingsSlice, objectName: string, propertyName: string): visuals.FormattingSlice | undefined {
    if (!slice)
        return undefined;

    let controlType = slice.type;
    let componentDisplayName = {
        displayName: slice.name,
        description: "",
        uid: objectName + '-' + slice.name,
    };

    switch (controlType) {
        case visuals.FormattingComponent.ColorPicker:
            return {
                ...componentDisplayName,
                control: {
                    type: visuals.FormattingComponent.ColorPicker,
                    properties: {
                        descriptor: { objectName: objectName, propertyName: propertyName },
                        value: { value: slice.value },
                        // isNoFillItemSupported: isNoFillItemSupported(slice),
                    }
                },
            };
        case visuals.FormattingComponent.ToggleSwitch:
            return {
                ...componentDisplayName,
                control: {
                    type: controlType,
                    properties: {
                        descriptor: { objectName: objectName, propertyName: propertyName },
                        value: slice.value
                    }
                },

            };
        case visuals.FormattingComponent.NumUpDown:
            return {
                ...componentDisplayName,
                control: {
                    type: controlType,
                    properties: {
                        descriptor: { objectName: objectName, propertyName: propertyName },
                        value: slice.value,
                        // options: {
                        //     unitSymbol: "",
                        //     minValue: {
                        //         value: slice.validators.min,
                        //         type: ValidatorType.Min
                        //     },
                        //     maxValue: {
                        //         value: slice.validators.max,
                        //         type: ValidatorType.Max
                        //     }
                        // }
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
                        descriptor: { objectName: objectName, propertyName: propertyName },
                        value: slice.value,
                        placeholder: slice.placeholder
                    }
                },
            };
    }

    return undefined;
}


export function getValidSelectionValue(selectionOptions: powerbi.IEnumMember[], value: any): any {
    if (value != null && _.isNumber(value)) {
        // We need to convert numerical value to string, because when selection options bind in to the option in selectValue ng-model it been converted to a string.
        // Then we fail to find selectValue which is the value variable here in the option values, since selectValue is a number and option values are strings.
        let strValue = value.toString();
        for (let option of selectionOptions) {
            if (option.value === value) break;
            if (option.value === strValue) return strValue;
        }
    }
    return value;
}

export function getPropertyValue(value: any, defaultValue: any): any {
    if (value && (value as powerbi.Fill).solid) {
        return (value as powerbi.Fill).solid.color;
    }

    if (value === undefined || value === null || (typeof value === "object" && !(value as powerbi.Fill).solid)) {
        return defaultValue;
    }

    return value;
}
