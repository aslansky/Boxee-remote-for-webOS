StageAssistant = Class.create({
	initialize : function (stageController)
	{
		AppAssistant.prototype.dealWithDeferredParams(stageController);
	},
	cleanup : function ()
	{
	    Boxee.Model.Command.getInstance().cleanup();
	    Boxee.Model.Command = null;
	}
});