import powerbi from "powerbi-visuals-api";
import { FormattingSettingsCard } from "./SettingsInterfaces";
import visuals = powerbi.visuals;
export declare class FormattingSettingsModel {
    cards: Array<FormattingSettingsCard>;
    static populateFrom<T extends FormattingSettingsModel>(dataView: powerbi.DataView): T;
    buildFormattingModel(): visuals.FormattingModel;
}
