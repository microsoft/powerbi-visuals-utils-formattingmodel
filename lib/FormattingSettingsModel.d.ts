import powerbi from "powerbi-visuals-api";
import { FormattingSettingsCard } from "./FormattingSettingsInterfaces";
import visuals = powerbi.visuals;
export declare class FormattingSettingsModel {
    cards: Array<FormattingSettingsCard>;
    /**
     * Build visual formatting settings model from metadata dataView
     * @param dataView metadata dataView object
     * @returns visual formatting settings model
     */
    static populateFrom<T extends FormattingSettingsModel>(dataView: powerbi.DataView): T;
    /**
     * Build formatting model by parsing formatting settings model object
     * @returns custom visual formatting model
     */
    buildFormattingModel(): visuals.FormattingModel;
}
