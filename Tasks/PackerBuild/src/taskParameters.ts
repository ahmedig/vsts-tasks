"use strict";

import * as tl from "vsts-task-lib/task";
import * as constants from "./constants";
import * as utils from "./utilities";

export default class TaskParameters {
    public templateType: string;
    public customTemplateLocation: string;
    public serviceEndpoint: string;

    public resourceGroup: string;
    public location: string;
    public storageAccount: string;

    public baseImageSource: string;
    public builtinBaseImage: string;
    public customBaseImageUrl: string;
    public imagePublisher: string;
    public imageOffer: string;
    public imageSku: string;
    public osType: string;

    public packagePath: string;
    public deployScriptPath: string;
    public deployScriptArguments: string;

    public imageUri: string;

    constructor() {
        try {
            this.templateType = tl.getInput(constants.TemplateTypeInputName, true);

            if(this.templateType === constants.TemplateTypeCustom) {
                this.customTemplateLocation = tl.getPathInput(constants.CustomTemplateLocationInputType, true, true);
            } else {               
                this.serviceEndpoint = tl.getInput(constants.ConnectedServiceInputName, true);
                this.resourceGroup = tl.getInput(constants.ResourceGroupInputName, true);
                this.storageAccount = tl.getInput(constants.StorageAccountInputName, true);
                this.location = tl.getInput(constants.LocationInputName, true);  

                this.baseImageSource = tl.getInput(constants.BaseImageSourceInputName, true);
                if(this.baseImageSource === constants.BaseImageSourceCustomVhd) {
                    this.customBaseImageUrl = tl.getInput(constants.CustomImageUrlInputName, true);
                    this.osType = tl.getInput(constants.CustomImageOsTypeInputName, true);
                } else {
                    this.builtinBaseImage = tl.getInput(constants.BuiltinBaseImageInputName, true);
                    this._extractImageDetails();
                }              

                this.deployScriptPath = this._getResolvedPath(tl.getInput(constants.DeployScriptPathInputName, true));
                console.log(tl.loc("ResolvedDeployPackgePath", this.deployScriptPath));
                this.packagePath = this._getResolvedPath(tl.getInput(constants.DeployPackageInputName, true));
                console.log(tl.loc("ResolvedDeployScriptPath", this.packagePath));
                this.deployScriptArguments = tl.getInput(constants.DeployScriptArgumentsInputName, false);
            }                

            this.imageUri = tl.getInput(constants.OutputVariableImageUri, false);
        } 
        catch (error) {
            throw (tl.loc("TaskParametersConstructorFailed", error.message));
        }
    }

    // extract image details from base image e.g. "MicrosoftWindowsServer:WindowsServer:2012-R2-Datacenter:windows"
    private _extractImageDetails() {
        var parts = this.builtinBaseImage.split(':');
        this.imagePublisher = parts[0];
        this.imageOffer = parts[1];
        this.imageSku = parts[2];
        this.osType = parts[3];
    }

    private _getResolvedPath(inputPath: string) {
        var rootFolder = tl.getVariable('System.DefaultWorkingDirectory');

        var matchingFiles = utils.findMatch(rootFolder, inputPath);
        if(!utils.HasItems(matchingFiles)) {
            throw tl.loc("ResolvedPathNotFound", inputPath, rootFolder);
        }

        return matchingFiles[0];
    }
}