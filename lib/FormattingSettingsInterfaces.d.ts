/**
 * Powerbi utils interfaces for custom visual formatting pane settings objects
 *
 */
import powerbi from "powerbi-visuals-api";
export interface NamedEntity {
    displayName: string;
    description?: string;
}
export interface FormattingSettingsCard extends NamedEntity {
    name: string;
    slices: Array<FormattingSettingsSlice>;
    /** if true, this card should be populated into the analytics pane */
    analyticsPane?: boolean;
}
export interface FormattingSettingsSlice extends NamedEntity {
    name: string;
    value: any;
    type: powerbi.visuals.FormattingComponent;
    placeholder?: string;
    selector?: powerbi.data.Selector;
    altConstantValueSelector?: powerbi.data.Selector;
    instanceKind?: powerbi.VisualEnumerationInstanceKinds;
    topLevelToggle?: boolean;
}
