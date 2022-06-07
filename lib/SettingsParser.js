import _ from "lodash";
export function convertPropertySliceToFormattingSlice(slice, objectName, propertyName) {
    if (!slice)
        return undefined;
    let controlType = slice.type;
    let componentDisplayName = {
        displayName: slice.name,
        description: "",
        uid: objectName + '-' + slice.name,
    };
    switch (controlType) {
        case "ColorPicker" /* visuals.FormattingComponent.ColorPicker */:
            return Object.assign(Object.assign({}, componentDisplayName), { control: {
                    type: "ColorPicker" /* visuals.FormattingComponent.ColorPicker */,
                    properties: {
                        descriptor: { objectName: objectName, propertyName: propertyName },
                        value: { value: slice.value },
                        // isNoFillItemSupported: isNoFillItemSupported(slice),
                    }
                } });
        case "ToggleSwitch" /* visuals.FormattingComponent.ToggleSwitch */:
            return Object.assign(Object.assign({}, componentDisplayName), { control: {
                    type: controlType,
                    properties: {
                        descriptor: { objectName: objectName, propertyName: propertyName },
                        value: slice.value
                    }
                } });
        case "NumUpDown" /* visuals.FormattingComponent.NumUpDown */:
            return Object.assign(Object.assign({}, componentDisplayName), { control: {
                    type: controlType,
                    properties: {
                        descriptor: { objectName: objectName, propertyName: propertyName },
                        value: slice.value,
                        // options: {
                        //     unitSymbol: "",
                        //     minValue : {
                        //         value: slice.validators.min,
                        //         type:0
                        //     },
                        //     maxValue: {
                        //         value: slice.validators.max,
                        //         type:1
                        //     }
                        // }
                    }
                } });
        case "TextInput" /* visuals.FormattingComponent.TextInput */:
        case "TextArea" /* visuals.FormattingComponent.TextArea */:
            return Object.assign(Object.assign({}, componentDisplayName), { control: {
                    type: controlType,
                    properties: {
                        descriptor: { objectName: objectName, propertyName: propertyName },
                        value: slice.value,
                        placeholder: "ssssssss"
                    }
                } });
    }
    return undefined;
}
export function getValidSelectionValue(selectionOptions, value) {
    if (value != null && _.isNumber(value)) {
        // We need to convert numerical value to string, because when selection options bind in to the option in selectValue ng-model it been converted to a string.
        // Then we fail to find selectValue which is the value variable here in the option values, since selectValue is a number and option values are strings.
        let strValue = value.toString();
        for (let option of selectionOptions) {
            if (option.value === value)
                break;
            if (option.value === strValue)
                return strValue;
        }
    }
    return value;
}
// export function getPropertyValue(value: any, selectionOptions: powerbi.IEnumMember[], propertyDescriptor: powerbi.ValueTypeDescriptor): any {
//     if (value == null)
//         return value;
//     if (selectionOptions) {
//         // We need to convert numeric value to string for selection.
//         return getValidSelectionValue(selectionOptions, value);
//     }
//     // TODO: need a more generic way to detect the type mismatch when drill by level.
//     if (propertyDescriptor.numeric && !_.isFinite(parseFloat(value))) {
//         // For numeric type, we may pass in a string like '10', thus we need to parse it first.
//         return undefined;
//     }
//     if (isFillProperty(propertyDescriptor)) {
//         // Custom visuals can sometimes enumerate trash, therefore we make sure the value is a valid hex string, otherwise we send null
//         let extractedValue = value && value.solid ? value.solid.color : value;
//         let hexString = ColorUtility.ensureValidHex(extractedValue && extractedValue.toString());
//         value = {
//             value: hexString
//         } as powerbi.ThemeColorData;
//     }
//     return value;
// }
// function isFillProperty(propertyType: any): boolean {
//     let fill = (propertyType as powerbi.StructuralTypeDescriptor).fill;
//     return fill != null;
// }
export function getPropertyValue(value, defaultValue) {
    // const value: any = getValue(objects, propertyId, defaultValue);
    if (value && value.solid) {
        return value.solid.color;
    }
    if (value === undefined
        || value === null
        || (typeof value === "object" && !value.solid)) {
        return defaultValue;
    }
    return value;
}
//# sourceMappingURL=SettingsParser.js.map