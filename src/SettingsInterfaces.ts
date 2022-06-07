import powerbi from "powerbi-visuals-api";
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

