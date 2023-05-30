/**
 * Powerbi utils components classes for custom visual formatting pane objects
 * 
 */

import powerbi from "powerbi-visuals-api";

import { IFormattingSettingsSlice } from "./FormattingSettingsInterfaces";
import * as FormattingSettingsParser from "./utils/FormattingSettingsUtils";

import data = powerbi.data;
import visuals = powerbi.visuals;

class NamedEntity {
    displayName?: string;
    displayNameKey?: string;
    description?: string;
    descriptionKey?: string;
}

export class CardGroupEntity extends NamedEntity {
    /** name should be the exact same object name from capabilities objects that this formatting card is representing */
    name: string;

    slices?: Array<Slice>;
    container?: Container;

    disabled?: boolean;
    /** group disabled reason */
    disabledReason?: string;
    /**
     * If delaySaveSlices is true, then this group's slices' value changes won't be saved to the visual until a
     * signal action is taken. E.g., for an Analytics Pane forecast, the forecast parameter values shouldn't be
     * saved to the visual until the Apply button is clicked. Note that this applies to all slices in the group.
     */
    delaySaveSlices?: boolean;
    /** Group can expand/collapse */
    collapsible?: boolean;
    /** if true, this group will be populated into the formatting pane */
    visible?: boolean;
    /** Slice, usually a ToggleSwitch, to be rendered at the top of the card/group */
    topLevelSlice?: SimpleSlice;
}

export class Model {
    cards: Array<Card>;
}

/** CompositeCard is use to populate a card into the formatting pane with multiple groups */
export abstract class CompositeCard extends NamedEntity {
    /** name should be the exact same object name from capabilities objects that this formatting card is representing */
    name: string;

    abstract groups: Array<Group>;
    /** if true, this card will be populated into the formatting pane */
    visible?: boolean;
    /** if true, this card should be populated into the analytics pane */
    analyticsPane?: boolean;
    /** Slice, usually a ToggleSwitch, to be rendered at the top of the card/group */
    topLevelSlice?: SimpleSlice;
    /** 
     * Called before the card is populated. 
     * This is useful for setting the card's slices' visibility before the card is populated into the formatting pane.
    */
    onPreProcess?(): void;
}

export class Group extends CardGroupEntity {
    constructor(object: Group) {
        super();
        Object.assign(this, object);
    }
}

/** SimpleCard is use to populate a card into the formatting pane in a single group */
export class SimpleCard extends CardGroupEntity {
    /** if true, this card should be populated into the analytics pane */
    analyticsPane?: boolean;
    /** 
     * Called before the card is populated. 
     * This is useful for setting the card's slices' visibility before the card is populated into the formatting pane.
    */
    onPreProcess?(): void;
}

export type Card = SimpleCard | CompositeCard;

export type Slice = SimpleSlice | CompositeSlice;

export abstract class SimpleSlice<T = any> extends NamedEntity implements IFormattingSettingsSlice {
    /** name should be the exact same property name from capabilities object properties list that this formatting slice is representing */
    name: string;
    value: T;
    selector?: data.Selector;
    altConstantSelector?: data.Selector;
    instanceKind?: powerbi.VisualEnumerationInstanceKinds;
    /** if true, this slice will be populated into the formatting pane */
    visible?: boolean;

    /** type declared in each slice sub class, No need to declare it in initializing object */
    type?: visuals.FormattingComponent;

    constructor(object: SimpleSlice<any>) {
        super();
        Object.assign(this, object);
    }

    getFormattingSlice?(objectName: string, localizationManager?: powerbi.extensibility.ILocalizationManager): visuals.SimpleVisualFormattingSlice {
        const controlType = this.type;
        const propertyName = this.name;
        const sliceDisplayName = (localizationManager && this.displayNameKey) ? localizationManager.getDisplayName(this.displayNameKey) : this.displayName;
        const sliceDescription = (localizationManager && this.descriptionKey) ? localizationManager.getDisplayName(this.descriptionKey) : this.description;
        const componentDisplayName = {
            displayName: sliceDisplayName,
            description: sliceDescription,
            uid: objectName + '-' + propertyName,
        };

        return <visuals.SimpleVisualFormattingSlice>{
            ...componentDisplayName,
            control: {
                type: controlType,
                properties: this.getFormattingComponent(objectName, localizationManager)
            },
        };
    }

    getFormattingComponent?(objectName: string, localizationManager?: powerbi.extensibility.ILocalizationManager): visuals.SimpleComponentBase<any> {
        return {
            descriptor: FormattingSettingsParser.getDescriptor(objectName, this),
            value: this.value,
        }
    }

    getRevertToDefaultDescriptor?(objectName: string): visuals.FormattingDescriptor[] {
        return [{
            objectName: objectName,
            propertyName: this.name
        }]
    }

    setPropertiesValues?(dataViewObjects: powerbi.DataViewObjects, objectName: string): void {
        let newValue = <T>dataViewObjects?.[objectName]?.[this.name]
        this.value = FormattingSettingsParser.getPropertyValue(this, newValue, this.value);
    }
}

export class AlignmentGroup extends SimpleSlice<string> {
    mode: visuals.AlignmentGroupMode;
    supportsNoSelection?: boolean;

    type?= visuals.FormattingComponent.AlignmentGroup;

    constructor(object: AlignmentGroup) {
        super(object);
    }

    getFormattingComponent?(objectName: string): visuals.AlignmentGroup {
        return {
            ... super.getFormattingComponent(objectName),
            mode: this.mode,
            supportsNoSelection: this.supportsNoSelection
        }
    }
}

export class ToggleSwitch extends SimpleSlice<boolean> {
    type?= visuals.FormattingComponent.ToggleSwitch;

    constructor(object: ToggleSwitch) {
        super(object);
    }
}

export class ColorPicker extends SimpleSlice<powerbi.ThemeColorData> {
    defaultColor?: powerbi.ThemeColorData;
    isNoFillItemSupported?: boolean;

    type?= visuals.FormattingComponent.ColorPicker;

    constructor(object: ColorPicker) {
        super(object);
    }

    getFormattingComponent?(objectName: string): visuals.ColorPicker {
        return {
            ... super.getFormattingComponent(objectName),
            defaultColor: this.defaultColor,
            isNoFillItemSupported: this.isNoFillItemSupported
        }
    }
}

export class NumUpDown extends SimpleSlice<number> {
    options?: visuals.NumUpDownFormat;

    type?= visuals.FormattingComponent.NumUpDown;

    constructor(object: NumUpDown) {
        super(object);
    }

    getFormattingComponent?(objectName: string): visuals.NumUpDown {
        return {
            ... super.getFormattingComponent(objectName),
            options: this.options
        };
    }
}

export class Slider extends NumUpDown {
    type?= visuals.FormattingComponent.Slider;
}

export class DatePicker extends SimpleSlice<Date> {
    placeholder: string;
    placeholderKey?: string;
    validators?: {
        max?: visuals.MaxValidator<Date>;
        min?: visuals.MinValidator<Date>;
    };

    type?= visuals.FormattingComponent.DatePicker;

    constructor(object: DatePicker) {
        super(object);
    }

    getFormattingComponent?(objectName: string, localizationManager?: powerbi.extensibility.ILocalizationManager): visuals.DatePicker {
        return {
            ... super.getFormattingComponent(objectName),
            placeholder: (localizationManager && this.placeholderKey) ? localizationManager.getDisplayName(this.placeholderKey) : this.placeholder,
            validators: this.validators
        }
    }
}

export class ItemDropdown extends SimpleSlice<powerbi.IEnumMember> {
    items: powerbi.IEnumMember[];

    type?= visuals.FormattingComponent.Dropdown;

    constructor(object: ItemDropdown) {
        super(object);
    }

    getFormattingComponent?(objectName: string): visuals.ItemDropdown {
        return {
            ... super.getFormattingComponent(objectName),
            items: this.items
        }
    }
}

export class AutoDropdown extends SimpleSlice<powerbi.EnumMemberValue> {
    mergeValues?: powerbi.IEnumMember[];
    filterValues?: powerbi.EnumMemberValue[];

    type?= visuals.FormattingComponent.Dropdown;

    constructor(object: AutoDropdown) {
        super(object);
    }

    getFormattingComponent?(objectName: string): visuals.AutoDropdown {
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

    type?= visuals.FormattingComponent.DurationPicker;

    constructor(object: DurationPicker) {
        super(object);
    }

    getFormattingComponent?(objectName: string): visuals.DurationPicker {
        return {
            ... super.getFormattingComponent(objectName),
            validators: this.validators
        }
    }
}

export class ErrorRangeControl extends SimpleSlice<undefined> {
    validators: powerbi.explore.directives.ValidationInfo;

    type?= visuals.FormattingComponent.ErrorRangeControl;

    constructor(object: ErrorRangeControl) {
        super(object);
    }

    getFormattingComponent?(objectName: string): visuals.ErrorRangeControl {
        return {
            ... super.getFormattingComponent(objectName),
            validators: this.validators
        }
    }
}

export class FieldPicker extends SimpleSlice<data.ISQExpr[]> {
    validators: powerbi.explore.directives.ValidationInfo;
    allowMultipleValues?: boolean;

    type?= visuals.FormattingComponent.FieldPicker;

    constructor(object: FieldPicker) {
        super(object);
    }

    getFormattingComponent?(objectName: string): visuals.FieldPicker {
        return {
            ... super.getFormattingComponent(objectName),
            validators: this.validators,
            allowMultipleValues: this.allowMultipleValues
        }
    }
}

export class ItemFlagsSelection extends SimpleSlice<string> {
    items: powerbi.IEnumMember[];

    type?= visuals.FormattingComponent.FlagsSelection;

    constructor(object: ItemFlagsSelection) {
        super(object);
    }

    getFormattingComponent?(objectName: string): visuals.ItemFlagsSelection {
        return {
            ... super.getFormattingComponent(objectName),
            items: this.items
        }
    }
}

export class AutoFlagsSelection extends SimpleSlice<powerbi.EnumMemberValue> {
    type?= visuals.FormattingComponent.FlagsSelection;
}

export class TextInput extends SimpleSlice<string> {
    placeholder: string;

    type?= visuals.FormattingComponent.TextInput;

    constructor(object: TextInput) {
        super(object);
    }

    getFormattingComponent?(objectName: string): visuals.TextInput {
        return {
            ... super.getFormattingComponent(objectName),
            placeholder: this.placeholder
        };
    }
}

export class TextArea extends TextInput {
    type?= visuals.FormattingComponent.TextArea;
}

export class FontPicker extends SimpleSlice<string> {
    type?= visuals.FormattingComponent.FontPicker;
}

export class GradientBar extends SimpleSlice<string> {
    type?= visuals.FormattingComponent.GradientBar;
}

export class ImageUpload extends SimpleSlice<powerbi.ImageValue> {
    type?= visuals.FormattingComponent.ImageUpload;
}

export class ListEditor extends SimpleSlice<visuals.ListEditorValue> {
    constructor(object: ListEditor) {
        super(object);
    }

    type?= visuals.FormattingComponent.ListEditor;
}

export class ReadOnlyText extends SimpleSlice<string> {
    type?= visuals.FormattingComponent.ReadOnlyText;
}

export class ShapeMapSelector extends SimpleSlice<powerbi.GeoJson> {
    isAzMapReferenceSelector?: boolean;

    type?= visuals.FormattingComponent.ShapeMapSelector;

    constructor(object: ShapeMapSelector) {
        super(object);
    }

    getFormattingComponent?(objectName: string): visuals.ShapeMapSelector {
        return {
            ... super.getFormattingComponent(objectName),
            isAzMapReferenceSelector: this.isAzMapReferenceSelector
        }
    }
}

export abstract class CompositeSlice extends NamedEntity implements IFormattingSettingsSlice {
    /** composite slice name isn't required to be from capabilities 
     * it will only be used for building formatting slice uid*/
    name: string;
    type?: visuals.FormattingComponent;

    visible?: boolean;

    constructor(object: CompositeSlice) {
        super();
        Object.assign(this, object);
    }

    getFormattingSlice?(objectName: string): visuals.CompositeVisualFormattingSlice {
        const controlType = this.type;
        const propertyName = this.name;
        const componentDisplayName = {
            displayName: this.displayName,
            description: this.description,
            uid: objectName + '-' + propertyName,
        };

        return <visuals.CompositeVisualFormattingSlice>{
            ...componentDisplayName,
            control: {
                type: controlType,
                properties: this.getFormattingComponent(objectName)
            }
        }
    }

    getFormattingComponent?(objectName: string): visuals.CompositeComponentPropertyType;

    getRevertToDefaultDescriptor?(objectName: string): visuals.FormattingDescriptor[];

    setPropertiesValues?(dataViewObjects: powerbi.DataViewObjects, objectName: string);
}

export class FontControl extends CompositeSlice {
    fontFamily: FontPicker;
    fontSize: NumUpDown;
    bold?: ToggleSwitch;
    italic?: ToggleSwitch;
    underline?: ToggleSwitch;

    type?= visuals.FormattingComponent.FontControl;

    constructor(object: FontControl) {
        super(object);
    }

    getFormattingComponent?(objectName: string): visuals.FontControl {
        return {
            fontFamily: this.fontFamily.getFormattingComponent(objectName),
            fontSize: this.fontSize.getFormattingComponent(objectName),
            bold: this.bold?.getFormattingComponent(objectName),
            italic: this.italic?.getFormattingComponent(objectName),
            underline: this.underline?.getFormattingComponent(objectName)
        }
    }

    getRevertToDefaultDescriptor?(objectName: string): visuals.FormattingDescriptor[] {
        return this.fontFamily.getRevertToDefaultDescriptor(objectName)
            .concat(this.fontSize.getRevertToDefaultDescriptor(objectName))
            .concat(this.bold ? this.bold.getRevertToDefaultDescriptor(objectName) : [])
            .concat(this.italic ? this.italic.getRevertToDefaultDescriptor(objectName) : [])
            .concat(this.underline ? this.underline.getRevertToDefaultDescriptor(objectName) : []);
    }

    setPropertiesValues?(dataViewObjects: powerbi.DataViewObjects, objectName: string) {
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

    type?= visuals.FormattingComponent.MarginPadding;

    constructor(object: MarginPadding) {
        super(object);
    }

    getFormattingComponent?(objectName: string): visuals.MarginPadding {
        return {
            left: this.left.getFormattingComponent(objectName),
            right: this.right.getFormattingComponent(objectName),
            top: this.top.getFormattingComponent(objectName),
            bottom: this.bottom.getFormattingComponent(objectName)
        }
    }

    getRevertToDefaultDescriptor?(objectName: string): visuals.FormattingDescriptor[] {
        return this.left.getRevertToDefaultDescriptor(objectName)
            .concat(this.right.getRevertToDefaultDescriptor(objectName))
            .concat(this.top.getRevertToDefaultDescriptor(objectName))
            .concat(this.bottom.getRevertToDefaultDescriptor(objectName));
    }

    setPropertiesValues?(dataViewObjects: powerbi.DataViewObjects, objectName: string) {
        this.left.setPropertiesValues(dataViewObjects, objectName);
        this.right.setPropertiesValues(dataViewObjects, objectName);
        this.top.setPropertiesValues(dataViewObjects, objectName);
        this.bottom.setPropertiesValues(dataViewObjects, objectName);
    }
}


export class Container extends NamedEntity {
    constructor(object: Container) {
        super();
        Object.assign(this, object);
    }

    containerItems: ContainerItem[];
    /**
     * Whether this container allows editing, including add/remove container items, and
     * edit of individual container item's value itself.
     */
    isEditable?: boolean;
}

export class ContainerItem extends NamedEntity {
    slices?: Slice[];
}
