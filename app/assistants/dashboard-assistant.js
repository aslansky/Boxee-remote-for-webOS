DashboardAssistant = Class.create({
    initialize: function ()
    {
        this.cmd = Boxee.Model.Command.getInstance();
        this.handleUpdate = this.update.bind(this);
    },
    
    setup: function ()
    {
        this.controller.get('dashboard-remote').addEventListener(Mojo.Event.tap, this.tapHandler.bindAsEventListener(this));
        this.cmd.getNowPlaying({
            onSuccess: this.handleUpdate
        });
        this.cmd.observe('onData', this.handleUpdate);
    },
    
    update: function (result)
    {
        data = {
            dashTitle: $L('Now playing')
        };
        if (result["Filename"] == "[Nothing Playing]" || !result["Type"])
        {
            data.title = $L("Nothing is playing");
            data.pause = "hidden";
        }
        else
        {
            if (result["Type"] == "Serie" || result["Show Title"].length > 0)
            {
                data.title = result["Show Title"] + " - " + result["Title"];
                data.pause = "";
            }
            else 
            {
                data.title = result["Title"];
                data.pause = "";
            }
            if (result["PlayStatus"] == "Paused")
            {
                data.pause = "pause";
            }
        }
        var renderedInfo = Mojo.View.render({object: data, template: 'dashboard/dashboard-remote'});
        Element.update(this.controller.get('dashboard-remote'), renderedInfo);
    },
    
    cleanup: function ()
    {
        this.controller.get('dashboard-remote').removeEventListener(Mojo.Event.tap, this.tapHandler.bindAsEventListener(this));
        this.cmd.stopObserving("onData", this.handleUpdate);
        this.handleNowPlaying = null;
        this.cmd  = null;
    },
    
    togglePlay: function ()
    {
        if (this.controller.get('playpause').hasClassName("pause"))
        {
            this.controller.get('playpause').removeClassName("pause");
        }
        else
        {
            this.controller.get('playpause').addClassName("pause");
        }
        this.cmd.playCmd({
            command: "Pause"
        });
    },
    
    tapHandler: function (event)
    {
        var id = event.target.id;
        if (id === 'playpause')
        {
            this.togglePlay();
        }
        else
        {
            new Mojo.Service.Request("palm://com.palm.applicationManager", {
                method: 'open',
                parameters: {
                    id:'com.aslansky.boxee'
                }
            });
        }
    }
});