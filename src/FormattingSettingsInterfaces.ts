/**
 * Powerbi utils interfaces for custom visual formatting pane settings objects
 * 
 */
import powerbi_api from "powerbi-visuals-api";

interface NamedEntity {
    displayName?: string;
    description?: string;
}

export interface Card extends NamedEntity {
    name: string;
    slices: Array<Slice>;

    /** if true, this card should be populated into the analytics pane */
    analyticsPane?: boolean;
}

export interface SimpleComponentBase<T = any> {
    value: T;
}

export type Slice = SimpleSlice | CompositeSlice;

export interface SimpleSlice<T = any> extends NamedEntity {
    name: string;
    value: T;
    type: powerbi_api.visuals.FormattingComponent;
    selector?: powerbi_api.data.Selector;
    altConstantSelector?: powerbi_api.data.Selector;
    instanceKind?: powerbi_api.VisualEnumerationInstanceKinds;
}

export interface CompositeSlice extends NamedEntity {
    name: string;
    type: powerbi_api.visuals.FormattingComponent;
}

export interface ToggleSwitch extends SimpleSlice<boolean> {
    topLevelToggle?: boolean;
}

export interface ColorPicker extends SimpleSlice<string> {
}

export interface NumUpDown extends SimpleSlice<number> {
}

export interface TextInput extends SimpleSlice<string> {
    placeholder: string;
}

export interface TextArea extends TextInput {
}

export interface FontPicker extends SimpleSlice<string> { }

export interface FontControl extends CompositeSlice {
    fontFamily: FontPicker;
    fontSize: NumUpDown;
    bold?: ToggleSwitch;
    italic?: ToggleSwitch;
    underline?: ToggleSwitch;
}

export const CompositeSliceTypes = [powerbi_api.visuals.FormattingComponent.FontControl]// todo add all composite slice types
