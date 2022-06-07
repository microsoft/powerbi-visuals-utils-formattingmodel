import { FormattingSettingsSlice } from "./SettingsInterfaces";
import powerbi from "powerbi-visuals-api";
import visuals = powerbi.visuals;
export declare function convertPropertySliceToFormattingSlice(slice: FormattingSettingsSlice, objectName: string, propertyName: string): visuals.FormattingSlice | undefined;
export declare function getValidSelectionValue(selectionOptions: powerbi.IEnumMember[], value: any): any;
export declare function getPropertyValue(value: any, defaultValue: any): any;
