Boxee.Util.Base = Class.create(Class.create(), {
	initialize : function(params)
	{
		this.params = params || {};
		this.params.applicationRoot = this.params.applicationRoot || "";
		this.cmd = Boxee.Model.Command.getInstance();
		this.dashboard = Boxee.Util.Dashboard.getInstance();
		
		this.handleSuspend = this.doSuspend.bind(this);
		this.activateHandler = this.activateWindow.bind(this);
        this.deactivateHandler = this.deactivateWindow.bind(this);
	},

    setup : function () {
        this.sceneName = this.controller.sceneName;
        // app menu
        this.controller.setupWidget(
            Mojo.Menu.appMenu,
            {
                omitDefaultItems: true
            }, {
                visible: true,
            	items: [
                    Mojo.Menu.editItem,
                    { label: $L("About"), command: "do-about"  },
                    Mojo.Menu.prefsItem,
                    { label: $L("Suspend boxee"), command: "do-suspend" },
                    Mojo.Menu.helpItem
                ]
            }
        );
    },

	aboutToActivate : function(callback)
	{
	},

	activate : function()
	{
	    Mojo.Event.listen(this.controller.stageController.document, Mojo.Event.stageActivate, this.activateHandler);
        Mojo.Event.listen(this.controller.stageController.document, Mojo.Event.stageDeactivate, this.deactivateHandler);
	},
	
	activateWindow : function ()
    {
        this.dashboard.hide();
        //this.hideDashboard();
    },
    
    deactivateWindow : function ()
    {
        this.dashboard.show();
        //this.createDashboard();
    },
    
    deactivate : function ()
    {
    },

	cleanup : function()
	{
	    this.params = null;
	    this.sceneName = null;
	    this.cmd = null;
	    
	    this.activateHandler = null;
        this.deactivateHandler = null;
	    this.handleSuspend = null;
	},

	showScene : function(name, params)
	{
	    if (this.sceneName != name || name == "list")
	    {
    		var pushParams = {};
    		var sceneParams = params || {};
    		if (typeof name === "object")
    		{
    			pushParams = name;
    		}
    		else if (typeof name === "string")
    		{
    			pushParams = {name: name};
    		}
    		else
    		{
    			throw "showScene has invalid params.";
    		}
    		if (name == "list" && this.sceneName == "list")
    		{
    		    pushParams.transition = Mojo.Transition.crossFade;
    		}
    		else
    		{
    		    pushParams.transition = Mojo.Transition.zoomFade;
    		}
    		pushParams.assistantConstructor = Boxee.Scene[pushParams.name.capitalize().camelize()];
    		sceneParams.applicationRoot = this.params.applicationRoot;
    		this.controller.stageController.pushScene(pushParams, sceneParams);
	    }
	},
	
	hasScene : function (name)
	{
	    var scenes = this.controller.stageController.getScenes();
	    for (var i = 0; i < scenes.length; i++)
	    {
	        if (scenes[i].sceneName == name)
	        {
	            return true;
	        }
	    }
	    return false;
	},
	
	handleCommand : function(event) {
	    if (event.type == Mojo.Event.commandEnable)
	    {
	        switch(event.command) {
	            case Mojo.Menu.prefsCmd:
	            case Mojo.Menu.helpCmd:
	                event.stopPropagation();
	            break;
	        }
	    }
        if(event.type == Mojo.Event.command)
        {
            switch(event.command) {
                case Mojo.Menu.prefsCmd:
                    this.showScene("settings", {});
                    break;
     	        case 'do-about':
     	            this.showScene("about", {});
     	            break;
     	        case Mojo.Menu.helpCmd:
     	            new Mojo.Service.Request("palm://com.palm.applicationManager", { 
            	  	    method: "open", 
            		    parameters: { 
            		        id: 'com.palm.app.help'
            		    }
                    });
     	            break;
     	        case 'do-suspend':
                    this.controller.showAlertDialog({
                        onChoose: this.handleSuspend,
                        title: $L("Suspend boxee"),
                        message: $L("Do you really want to suspend your boxee box?"),
                        choices:[
                            {label:$L('Suspend'), value:"ok", type:'negative'},  
                            {label:$L("Cancel"), value:"cancel", type:'dismiss'}
                        ]
                    });
     	            break;
     	    }
        }
	},
	
	doSuspend : function (value)
	{
	    if (value == "ok")
	    {
	        this.cmd.playCmd({
                command: "ExecBuiltIn(Suspend)"
            });
	    }
	},

	ready : function() {
	}
});

