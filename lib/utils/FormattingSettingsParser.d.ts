import { FormattingSettingsSlice } from "../FormattingSettingsInterfaces";
import powerbi from "powerbi-visuals-api";
import visuals = powerbi.visuals;
/**
 * Parse and convert formatting settings slice object to powerbi visuals formatting pane slice
 * @param slice custom visual formatting settings slice
 * @param objectName object name
 * @returns formatting pane slice
 */
export declare function parseFormattingSettingsSlice(slice: FormattingSettingsSlice, objectName: string): visuals.FormattingSlice | undefined;
/**
 * Get property value from dataview objects if it exist there
 * Else return the default value from formatting settings object
 *
 * @param value dataview object value
 * @param defaultValue formatting settings default value
 * @returns formatting property value
 */
export declare function getPropertyValue(value: any, defaultValue: any): any;
