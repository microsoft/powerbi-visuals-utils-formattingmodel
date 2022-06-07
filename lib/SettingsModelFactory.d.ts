import powerbi from "powerbi-visuals-api";
import { FormattingSettingsCards } from "./SettingsInterfaces";
import visuals = powerbi.visuals;
export declare class FormattingSettingsModel {
    cards: FormattingSettingsCards;
    populateFrom(dataView: powerbi.DataView): void;
    buildFormattingModel(): visuals.FormattingModel;
}
