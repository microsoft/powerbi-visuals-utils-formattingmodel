import { FormattingSettingsSlice } from "./SettingsInterfaces";
import powerbi from "powerbi-visuals-api";
import visuals = powerbi.visuals;
export declare function parseFormattingSettingsSlice(slice: FormattingSettingsSlice, objectName: string): visuals.FormattingSlice | undefined;
export declare function getPropertyValue(value: any, defaultValue: any): any;
