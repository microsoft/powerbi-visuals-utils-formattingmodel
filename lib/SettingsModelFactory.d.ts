import powerbi from "powerbi-visuals-api";
import visuals = powerbi.visuals;
export declare class FormattingSettingsModel {
    populateFrom(dataView: powerbi.DataView): void;
    buildFormattingModel(): visuals.FormattingModel;
}
