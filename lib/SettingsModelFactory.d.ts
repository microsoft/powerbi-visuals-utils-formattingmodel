import powerbi from "powerbi-visuals-api";
import { FormattingSettingsCards } from "./SettingsInterfaces";
import visuals = powerbi.visuals;
export declare class FormattingSettingsModel {
    cards: FormattingSettingsCards;
    static populateFrom<T extends FormattingSettingsModel>(dataView: powerbi.DataView): T;
    buildFormattingModel(): visuals.FormattingModel;
}
