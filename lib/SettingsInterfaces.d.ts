/**
 * Powerbi utils interfaces for custom visual formatting pane settings object
 *
 */
import powerbi from "powerbi-visuals-api";
export interface NamedEntity {
    displayName: string;
    description?: string;
    /** If true it means this entity is filtered and shouldn't be shown to the user */
    filtered?: boolean;
}
export declare const enum ValidatorType {
    Min = 0,
    Max = 1,
    Required = 2
}
export interface ValidationNumericInfo {
    decimal?: boolean;
    integer?: boolean;
    min?: number | Date | string;
    max?: number | Date | string;
}
export interface FormattingSettingsSlice extends NamedEntity {
    name: string;
    value: any;
    type: powerbi.visuals.FormattingComponent;
    description?: string;
    validators?: ValidationNumericInfo;
    placeholder?: string;
    selector?: powerbi.data.Selector;
    altConstantValueSelector?: powerbi.data.Selector;
    instanceKind?: powerbi.VisualEnumerationInstanceKinds;
}
export interface FormattingSettingsCard extends NamedEntity {
    name: string;
    slices: Array<FormattingSettingsSlice>;
    /** if true, this card should be populated into the analytics pane */
    analyticsPane?: boolean;
}
