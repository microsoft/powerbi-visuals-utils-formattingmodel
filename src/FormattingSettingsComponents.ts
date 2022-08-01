/**
 * Powerbi utils interfaces for custom visual formatting pane settings objects
 * 
 */
import powerbi_api from "powerbi-visuals-api";


import * as FormattingSettingsParser from "./utils/FormattingSettingsUtils";

interface SettingsSlice {
    /**
     * Build and return simple/composite formatting slice from formatting settings slice
     * 
     * @param objectName Capabilities object name that contain this slice property
     * @returns formatting simple/composite slice
     */
    getFormattingSlice?(objectName: string): powerbi_api.visuals.SimpleVisualFormattingSlice | powerbi_api.visuals.CompositeVisualFormattingSlice;

    /**
     * Build and returns formatting simple/composite component object for formatting property
     * Formatting simple component base will contain basically descriptor and value objects
     * While formatting composite component will contain multiple of formatting simple component
     * Simple component base may be contain more parameters depends on which property that extends SimpleSlice class is called 
     *
     * @param objectName Capabilities object name that contain this slice property
     * @returns simple or omposite formatting component 
     */
    getFormattingComponent?(objectName: string): powerbi_api.visuals.SimpleComponentBase<any> | powerbi_api.visuals.CompositeComponentPropertyType;

    /**
     * Return array that contains formatting property default descriptor
     * This default descriptor contian only objectName and propertyName and it's used on revertToDefaultDescriptor object 
     * in formattingSlice for revert formatting pane properties to default values
     * 
     * @param objectName Capabilities object name that contain this slice property
     * @returns slice properites default desriptors array
     */
    getRevertToDefaultDescriptor?(objectName: string): powerbi_api.visuals.FormattingDescriptor[];

    /**
     * Extract and set formatting property value
     * 
     * @param dataViewObjects options dataview
     * @param objectName Capabilities object name that contain this slice property
     */
    setPropertiesValues?(dataViewObjects: powerbi_api.DataViewObjects, objectName: string): void;
}

class NamedEntity {
    displayName?: string;
    description?: string;
}

export class Card extends NamedEntity {
    name: string;
    slices: Array<Slice>;

    /** if true, this card should be populated into the analytics pane */
    analyticsPane?: boolean;
}

export type Slice = SimpleSlice | CompositeSlice;

export abstract class SimpleSlice<T = any> extends NamedEntity implements SettingsSlice {
    name: string;
    value: T;
    selector?: powerbi_api.data.Selector;
    altConstantSelector?: powerbi_api.data.Selector;
    instanceKind?: powerbi_api.VisualEnumerationInstanceKinds;

    type?: powerbi_api.visuals.FormattingComponent; // type declared in each slice sub class, No need to declare it in initializing object

    constructor(object: SimpleSlice<any>) {
        super();
        Object.assign(this, object);
    }

    getFormattingSlice?(objectName: string): powerbi_api.visuals.SimpleVisualFormattingSlice {
        const controlType = this.type;
        const propertyName = this.name;
        const componentDisplayName = {
            displayName: this.displayName,
            description: this.description,
            uid: objectName + '-' + propertyName,
        };

        return <powerbi_api.visuals.SimpleVisualFormattingSlice>{
            ...componentDisplayName,
            control: {
                type: controlType,
                properties: this.getFormattingComponent(objectName)
            },
        };
    }

    getFormattingComponent?(objectName: string): powerbi_api.visuals.SimpleComponentBase<any> {
        return {
            descriptor: FormattingSettingsParser.getDescriptor(objectName, this),
            value: this.value,
        }
    }

    getRevertToDefaultDescriptor?(objectName: string): powerbi_api.visuals.FormattingDescriptor[] {
        return [{
            objectName: objectName,
            propertyName: this.name
        }]
    }

    setPropertiesValues?(dataViewObjects: powerbi_api.DataViewObjects, objectName: string): void {
        let newValue = <T>dataViewObjects?.[objectName]?.[this.name]
        this.value = FormattingSettingsParser.getPropertyValue(newValue, this.value);
    }
}

export class AlignmentGroup extends SimpleSlice<string> {
    mode: powerbi_api.visuals.AlignmentGroupMode;
    supportsNoSelection?: boolean;

    type?= powerbi_api.visuals.FormattingComponent.AlignmentGroup;

    constructor(object: AlignmentGroup) {
        super(object);
    }

    getFormattingComponent?(objectName: string): powerbi_api.visuals.AlignmentGroup {
        return {
            ... super.getFormattingComponent(objectName),
            mode: this.mode,
            supportsNoSelection: this.supportsNoSelection
        }
    }
}

export class ToggleSwitch extends SimpleSlice<boolean> {
    topLevelToggle?: boolean;

    type?= powerbi_api.visuals.FormattingComponent.ToggleSwitch;

    constructor(object: ToggleSwitch) {
        super(object);
    }
}

export class ColorPicker extends SimpleSlice<powerbi_api.ThemeColorData> {
    defaultColor?: powerbi_api.ThemeColorData;
    isNoFillItemSupported?: boolean;

    type?= powerbi_api.visuals.FormattingComponent.ColorPicker;

    constructor(object: ColorPicker) {
        super(object);
    }

    getFormattingComponent?(objectName: string): powerbi_api.visuals.ColorPicker {
        return {
            ... super.getFormattingComponent(objectName),
            defaultColor: this.defaultColor,
            isNoFillItemSupported: this.isNoFillItemSupported
        }
    }
}

export class NumUpDown extends SimpleSlice<number> {
    options?: powerbi_api.visuals.NumUpDownFormat;

    type?= powerbi_api.visuals.FormattingComponent.NumUpDown;

    constructor(object: NumUpDown) {
        super(object);
    }

    getFormattingComponent?(objectName: string): powerbi_api.visuals.NumUpDown {
        return {
            ... super.getFormattingComponent(objectName),
            options: this.options
        };
    }
}

export class Slider extends NumUpDown {
    type?= powerbi_api.visuals.FormattingComponent.Slider;
}

export class DatePicker extends SimpleSlice<Date> {
    placeholder: string;
    validators?: {
        max?: powerbi_api.visuals.MaxValidator<Date>;
        min?: powerbi_api.visuals.MinValidator<Date>;
    };

    type?= powerbi_api.visuals.FormattingComponent.DatePicker;

    constructor(object: DatePicker) {
        super(object);
    }

    getFormattingComponent?(objectName: string): powerbi_api.visuals.DatePicker {
        return {
            ... super.getFormattingComponent(objectName),
            placeholder: this.placeholder,
            validators: this.validators
        }
    }
}

export class ItemDropdown extends SimpleSlice<powerbi_api.IEnumMember> {
    items: powerbi_api.IEnumMember[];

    type?= powerbi_api.visuals.FormattingComponent.Dropdown;

    constructor(object: ItemDropdown) {
        super(object);
    }

    getFormattingComponent?(objectName: string): powerbi_api.visuals.ItemDropdown {
        return {
            ... super.getFormattingComponent(objectName),
            items: this.items
        }
    }
}

export class AutoDropdown extends SimpleSlice<powerbi_api.EnumMemberValue> {
    mergeValues?: powerbi_api.IEnumMember[];
    filterValues?: powerbi_api.EnumMemberValue[];

    type?= powerbi_api.visuals.FormattingComponent.Dropdown;

    constructor(object: AutoDropdown) {
        super(object);
    }

    getFormattingComponent?(objectName: string): powerbi_api.visuals.AutoDropdown {
        return {
            ... super.getFormattingComponent(objectName),
            mergeValues: this.mergeValues,
            filterValues: this.filterValues
        }
    }
}

export class DurationPicker extends SimpleSlice<string> {
    validators?: {
        min?: string;
        max?: string;
        integer?: boolean;
    };

    type?= powerbi_api.visuals.FormattingComponent.DurationPicker;

    constructor(object: DurationPicker) {
        super(object);
    }

    getFormattingComponent?(objectName: string): powerbi_api.visuals.DurationPicker {
        return {
            ... super.getFormattingComponent(objectName),
            validators: this.validators
        }
    }
}

export class ErrorRangeControl extends SimpleSlice<undefined> {
    validators: powerbi.explore.directives.ValidationInfo;

    type?= powerbi_api.visuals.FormattingComponent.ErrorRangeControl;

    constructor(object: ErrorRangeControl) {
        super(object);
    }

    getFormattingComponent?(objectName: string): powerbi_api.visuals.ErrorRangeControl {
        return {
            ... super.getFormattingComponent(objectName),
            validators: this.validators
        }
    }
}

export class FieldPicker extends SimpleSlice<powerbi_api.data.ISQExpr[]> {
    validators: powerbi.explore.directives.ValidationInfo;
    allowMultipleValues?: boolean;

    type?= powerbi_api.visuals.FormattingComponent.FieldPicker;

    constructor(object: FieldPicker) {
        super(object);
    }

    getFormattingComponent?(objectName: string): powerbi_api.visuals.FieldPicker {
        return {
            ... super.getFormattingComponent(objectName),
            validators: this.validators,
            allowMultipleValues: this.allowMultipleValues
        }
    }
}

export class ItemFlagsSelection extends SimpleSlice<string> {
    items: powerbi_api.IEnumMember[];

    type?= powerbi_api.visuals.FormattingComponent.FlagsSelection;

    constructor(object: ItemFlagsSelection) {
        super(object);
    }

    getFormattingComponent?(objectName: string): powerbi_api.visuals.ItemFlagsSelection {
        return {
            ... super.getFormattingComponent(objectName),
            items: this.items
        }
    }
}

export class AutoFlagsSelection extends SimpleSlice<powerbi_api.EnumMemberValue> {
    type?= powerbi_api.visuals.FormattingComponent.FlagsSelection;
}

export class TextInput extends SimpleSlice<string> {
    placeholder: string;

    type?= powerbi_api.visuals.FormattingComponent.TextInput;

    constructor(object: TextInput) {
        super(object);
    }

    getFormattingComponent?(objectName: string): powerbi_api.visuals.TextInput {
        return {
            ... super.getFormattingComponent(objectName),
            placeholder: this.placeholder
        };
    }
}

export class TextArea extends TextInput {
    type?= powerbi_api.visuals.FormattingComponent.TextArea;
}

export class FontPicker extends SimpleSlice<string> {
    type?= powerbi_api.visuals.FormattingComponent.FontPicker;
}

export class GradientBar extends SimpleSlice<string> {
    type?= powerbi_api.visuals.FormattingComponent.GradientBar;
}

export class ImageUpload extends SimpleSlice<powerbi_api.ImageValue> {
    type?= powerbi_api.visuals.FormattingComponent.ImageUpload;
}

export class ListEditor extends SimpleSlice<powerbi_api.visuals.ListEditorValue> {
    type?= powerbi_api.visuals.FormattingComponent.ListEditor;
}

export class ReadOnlyText extends SimpleSlice<string> {
    type?= powerbi_api.visuals.FormattingComponent.ReadOnlyText;
}

export class ShapeMapSelector extends SimpleSlice<powerbi_api.GeoJson> {
    isAzMapReferenceSelector?: boolean;

    type?= powerbi_api.visuals.FormattingComponent.ShapeMapSelector;

    constructor(object: ShapeMapSelector) {
        super(object);
    }

    getFormattingComponent?(objectName: string): powerbi_api.visuals.ShapeMapSelector {
        return {
            ... super.getFormattingComponent(objectName),
            isAzMapReferenceSelector: this.isAzMapReferenceSelector
        }
    }
}

export abstract class CompositeSlice extends NamedEntity implements SettingsSlice {
    name: string;
    type?: powerbi_api.visuals.FormattingComponent;

    constructor(object: CompositeSlice) {
        super();
        Object.assign(this, object);
    }

    /**
     * Build and return composite formatting slice
     * @param objectName Capabilities object name that contain this slice property
     * @returns formatting composite slice
     */
    getFormattingSlice?(objectName: string): powerbi_api.visuals.CompositeVisualFormattingSlice {
        const controlType = this.type;
        const propertyName = this.name;
        const componentDisplayName = {
            displayName: this.displayName,
            description: this.description,
            uid: objectName + '-' + propertyName,
        };

        return <powerbi_api.visuals.CompositeVisualFormattingSlice>{
            ...componentDisplayName,
            control: {
                type: controlType,
                properties: this.getFormattingComponent(objectName)
            }
        }
    }
    

     getFormattingComponent?(objectName: string): powerbi_api.visuals.CompositeComponentPropertyType;

     getRevertToDefaultDescriptor?(objectName: string): powerbi_api.visuals.FormattingDescriptor[];
 
     setPropertiesValues?(dataViewObjects: powerbi_api.DataViewObjects, objectName: string);
}

export class FontControl extends CompositeSlice {
    fontFamily: FontPicker;
    fontSize: NumUpDown;
    bold?: ToggleSwitch;
    italic?: ToggleSwitch;
    underline?: ToggleSwitch;

    type?= powerbi_api.visuals.FormattingComponent.FontControl;

    constructor(object: FontControl) {
        super(object);
    }

    getFormattingComponent?(objectName: string): powerbi_api.visuals.FontControl {
        return {
            fontFamily: this.fontFamily.getFormattingComponent(objectName),
            fontSize: this.fontSize.getFormattingComponent(objectName),
            bold: this.bold?.getFormattingComponent(objectName),
            italic: this.italic?.getFormattingComponent(objectName),
            underline: this.underline.getFormattingComponent(objectName)
        }
    }

    getRevertToDefaultDescriptor?(objectName: string): powerbi_api.visuals.FormattingDescriptor[] {
        return this.fontFamily.getRevertToDefaultDescriptor(objectName)
            .concat(this.fontSize.getRevertToDefaultDescriptor(objectName))
            .concat(this.bold?.getRevertToDefaultDescriptor(objectName))
            .concat(this.italic?.getRevertToDefaultDescriptor(objectName))
            .concat(this.underline?.getRevertToDefaultDescriptor(objectName));
    }

    setPropertiesValues?(dataViewObjects: powerbi_api.DataViewObjects, objectName: string) {
        this.fontFamily.setPropertiesValues(dataViewObjects, objectName);
        this.fontSize.setPropertiesValues(dataViewObjects, objectName);
        this.bold?.setPropertiesValues(dataViewObjects, objectName);
        this.italic?.setPropertiesValues(dataViewObjects, objectName);
        this.underline?.setPropertiesValues(dataViewObjects, objectName);
    }
}

export class MarginPadding extends CompositeSlice {
    left: NumUpDown;
    right: NumUpDown;
    top: NumUpDown;
    bottom: NumUpDown;

    type?= powerbi_api.visuals.FormattingComponent.MarginPadding;

    constructor(object: MarginPadding) {
        super(object);
    }

    getFormattingComponent?(objectName: string): powerbi_api.visuals.MarginPadding {
        return {
            left: this.left.getFormattingComponent(objectName),
            right: this.right.getFormattingComponent(objectName),
            top: this.top?.getFormattingComponent(objectName),
            bottom: this.bottom?.getFormattingComponent(objectName)
        }
    }

    getRevertToDefaultDescriptor?(objectName: string): powerbi_api.visuals.FormattingDescriptor[] {
        return this.left.getRevertToDefaultDescriptor(objectName)
            .concat(this.right.getRevertToDefaultDescriptor(objectName))
            .concat(this.top.getRevertToDefaultDescriptor(objectName))
            .concat(this.bottom.getRevertToDefaultDescriptor(objectName));
    }

    setPropertiesValues?(dataViewObjects: powerbi_api.DataViewObjects, objectName: string) {
        this.left.setPropertiesValues(dataViewObjects, objectName);
        this.right.setPropertiesValues(dataViewObjects, objectName);
        this.top.setPropertiesValues(dataViewObjects, objectName);
        this.bottom.setPropertiesValues(dataViewObjects, objectName);
    }
}

export const CompositeSliceTypes = [powerbi_api.visuals.FormattingComponent.FontControl, powerbi_api.visuals.FormattingComponent.MarginPadding]
