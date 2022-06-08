import powerbi from "powerbi-visuals-api";

export const enum ValidatorType {
    Min = 0,
    Max = 1,
    Required = 2,
}

export interface ValidationNumericInfo {
    decimal?: boolean;
    integer?: boolean;
    min?: number | Date | string;
    max?: number | Date | string;
}

export interface FormattingSettingsSlice {
    name: string;
    value: any;
    type: powerbi.visuals.FormattingComponent;
    validators?: ValidationNumericInfo;
    placeholder?: string;
}

export interface FormattingSettingsCard {
    displayName: string;
    slices: FormattingSettingsSlices
}

export interface FormattingSettingsSlices {
    [propertyName: string]: FormattingSettingsSlice
}

export interface FormattingSettingsCards {
    [objectName: string]: FormattingSettingsCard
}