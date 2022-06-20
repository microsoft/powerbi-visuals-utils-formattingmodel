/**
 * Parse and convert formatting settings slice object to powerbi visuals formatting pane slice
 * @param slice custom visual formatting settings slice
 * @param objectName object name
 * @returns formatting pane slice
 */
export function parseFormattingSettingsSlice(slice, objectName) {
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
        case "ColorPicker" /* visuals.FormattingComponent.ColorPicker */:
            return Object.assign(Object.assign({}, componentDisplayName), { control: {
                    type: "ColorPicker" /* visuals.FormattingComponent.ColorPicker */,
                    properties: {
                        descriptor: getDescriptor(objectName, propertyName),
                        value: { value: slice.value },
                    }
                } });
        case "NumUpDown" /* visuals.FormattingComponent.NumUpDown */:
        case "ToggleSwitch" /* visuals.FormattingComponent.ToggleSwitch */:
            return Object.assign(Object.assign({}, componentDisplayName), { control: {
                    type: controlType,
                    properties: {
                        descriptor: getDescriptor(objectName, propertyName),
                        value: slice.value
                    }
                } });
        case "TextInput" /* visuals.FormattingComponent.TextInput */:
        case "TextArea" /* visuals.FormattingComponent.TextArea */:
            return Object.assign(Object.assign({}, componentDisplayName), { control: {
                    type: controlType,
                    properties: {
                        descriptor: getDescriptor(objectName, propertyName),
                        value: slice.value,
                        placeholder: slice.placeholder
                    }
                } });
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
export function getPropertyValue(value, defaultValue) {
    if (value && value.solid) {
        return value.solid.color;
    }
    if (value == null || (typeof value === "object" && !value.solid)) {
        return defaultValue;
    }
    return value;
}
function getDescriptor(objectName, propertyName) {
    return {
        objectName: objectName,
        propertyName: propertyName
    };
}
//# sourceMappingURL=FormattingSettingsParser.js.map