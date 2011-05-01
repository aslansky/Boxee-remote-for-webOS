AppAssistant = Class.create({

    name : "AppAssistant",
    baseScene : {
        name: "remote",
        assistantConstructor: Boxee.Scene.Remote
    },
    settingsScene : {
        name: "settings",
        assistantConstructor: Boxee.Scene.Settings
    },
    initialize: function()
	{
	    //Boxee.Util.Settings.getInstance().cookie().remove();
	},

	handleLaunch: function(params)
	{
		if (!AppAssistant.stageController) {
			AppAssistant.deferredParams = params || {};
			return;
		}

		if (params) {
			AppAssistant.prototype.dealWithParams(params, true);
			return;
		}
		AppAssistant.stageController.activate();
	},
	
	dealWithDeferredParams: function(stageController)
	{
		AppAssistant.stageController = stageController;
		AppAssistant.prototype.dealWithParams(AppAssistant.deferredParams);
	},
	
	dealWithParams: function(params, deferActivate)
	{
		if (!AppAssistant.stageController.topScene()) {
			AppAssistant.stageController.pushScene(this.baseScene);
		} else {
			AppAssistant.stageController.popScenesTo(this.baseScene.name);
		}
		if (!Boxee.Util.Settings.getInstance().get("server") || !Boxee.Util.Settings.getInstance().get("server").host)
        {
            AppAssistant.stageController.pushScene(this.settingsScene);
        }
	}
});