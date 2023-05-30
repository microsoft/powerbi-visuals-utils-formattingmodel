
import powerbi from "powerbi-visuals-api";
import { Model } from "./FormattingSettingsComponents";

import visuals = powerbi.visuals;

export interface IFormattingSettingsService {

    /**
     * Build visual formatting settings model from metadata dataView
     * 
     * @param dataViews metadata dataView object
     * @returns visual formatting settings model 
     */
    populateFormattingSettingsModel<T extends Model>(typeClass: new () => T, dataView: powerbi.DataView): T;

    /**
     * Build formatting model by parsing formatting settings model object 
     * 
     * @returns powerbi visual formatting model
     */
    buildFormattingModel(formattingSettingsModel: Model): visuals.FormattingModel;

}

export interface IFormattingSettingsSlice {
    /**
     * Build and return simple/composite formatting slice from formatting settings slice
     * 
     * @param objectName Object name from capabilities 
     */
    getFormattingSlice?(objectName: string, localizationManager?: powerbi.extensibility.ILocalizationManager): visuals.SimpleVisualFormattingSlice | visuals.CompositeVisualFormattingSlice;

    /**
     * Build and returns formatting simple/composite component object for formatting property
     * Formatting simple component contains basically value, descriptor and additional parameters (depends on its type)
     * Formatting composite component contains multiple of formatting simple components
     *
     * @param objectName Capabilities object name that contain this slice property
     * @returns simple or composite formatting component 
     */
    getFormattingComponent?(objectName: string, localizationManager?: powerbi.extensibility.ILocalizationManager): visuals.SimpleComponentBase<any> | visuals.CompositeComponentPropertyType;

    /**
     * Return array of formatting properties default descriptors
     * Default descriptor contain only objectName and propertyName
     * 
     * @param objectName Object name from capabilities
     * @returns slice properties default descriptors array
     */
    getRevertToDefaultDescriptor?(objectName: string): visuals.FormattingDescriptor[];

    /**
     * Set formatting property value
     * 
     * @param dataViewObjects Dataview objects
     * @param objectName Object name from capabilities
     */
    setPropertiesValues?(dataViewObjects: powerbi.DataViewObjects, objectName: string): void;
}
