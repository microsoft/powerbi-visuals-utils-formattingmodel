
import powerbi from "powerbi-visuals-api";
import visuals = powerbi.visuals;

export interface SettingsSlice {
    /**
     * Build and return simple/composite formatting slice from formatting settings slice
     * 
     * @param objectName Capabilities object name that contain this slice property
     * @returns formatting simple/composite slice
     */
    getFormattingSlice?(objectName: string): visuals.SimpleVisualFormattingSlice | visuals.CompositeVisualFormattingSlice;

    /**
     * Build and returns formatting simple/composite component object for formatting property
     * Formatting simple component base will contain basically descriptor and value objects
     * While formatting composite component will contain multiple of formatting simple component
     * Simple component base may be contain more parameters depends on which property that extends SimpleSlice class is called 
     *
     * @param objectName Capabilities object name that contain this slice property
     * @returns simple or omposite formatting component 
     */
    getFormattingComponent?(objectName: string): visuals.SimpleComponentBase<any> | visuals.CompositeComponentPropertyType;

    /**
     * Return array that contains formatting property default descriptor
     * This default descriptor contian only objectName and propertyName and it's used on revertToDefaultDescriptor object 
     * in formattingSlice for revert formatting pane properties to default values
     * 
     * @param objectName Capabilities object name that contain this slice property
     * @returns slice properites default desriptors array
     */
    getRevertToDefaultDescriptor?(objectName: string): visuals.FormattingDescriptor[];

    /**
     * Extract and set formatting property value
     * 
     * @param dataViewObjects options dataview
     * @param objectName Capabilities object name that contain this slice property
     */
    setPropertiesValues?(dataViewObjects: powerbi.DataViewObjects, objectName: string): void;
}
