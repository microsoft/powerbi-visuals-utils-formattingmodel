import _ from "lodash";
export function parseFormattingSettingsSlice(slice, objectName, propertyName) {
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
                } });
        case "TextInput" /* visuals.FormattingComponent.TextInput */:
        case "TextArea" /* visuals.FormattingComponent.TextArea */:
            return Object.assign(Object.assign({}, componentDisplayName), { control: {
                    type: controlType,
                    properties: {
                        descriptor: { objectName: objectName, propertyName: propertyName },
                        value: slice.value,
                        placeholder: slice.placeholder
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
export function getPropertyValue(value, defaultValue) {
    if (value && value.solid) {
        return value.solid.color;
    }
    if (value === undefined || value === null || (typeof value === "object" && !value.solid)) {
        return defaultValue;
    }
    return value;
}
//# sourceMappingURL=SettingsParser.js.map