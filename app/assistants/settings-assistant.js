Boxee.Scene.Settings = Class.create(Boxee.Util.Base, {
    
    initialize : function ($super, args)
    {
        $super(args);
        this.name = "Boxee.Scene.Settings - " + Math.round(Math.random()*100);
        this.cmd = Boxee.Model.Command.getInstance();
        this.scrim = null;
        this.handleDeActivate = this.deactivateWindow.bind(this);
    },
    
    setup : function ($super)
    {
        this.controller.setupWidget(
            'host', 
            {
                hintText : $L('Enter the ip address of boxee'),
                modifierState : Mojo.Widget.numLock,
                focusMode : Mojo.Widget.focusSelectMode,
                maxLength : 30
            }, 
            this.hostModel = {
                value : ''
            }
        );
        
        this.controller.setupWidget(
            'port', 
            {
                hintText : $L('Enter the port of boxee'),
                modifierState : Mojo.Widget.numLock,
                focusMode : Mojo.Widget.focusSelectMode,
                maxLength : 4
            }, 
            this.portModel = {
                value : ''
            }
        );
        
        this.controller.setupWidget(
            'password', 
            {
                hintText : $L('Enter your password (optional)'),
                focusMode : Mojo.Widget.focusSelectMode,
                maxLength : 30
            }, 
            this.passModel = {
                value : ''
            }
        );
        
        this.controller.setupWidget(
            'vibrate',
            {
                trueValue: "On",
                falseValue: "Off" 
            },
            this.vibrateModel = {
                value: false,
                disabled: false
            }
        );
        
        this.controller.setupWidget("spinner",
            this.attributes = {
                spinnerSize: Mojo.Widget.spinnerLarge
            },
            this.model = {
                spinning: true,
                type: 'default'
            }
        );
         
        this.scrim = Mojo.View.createScrim(this.controller.document, {
             scrimClass:'palm-scrim' 
        });
        this.controller.get("scrim-container").appendChild(this.scrim).appendChild($('spinner'));
        
        Mojo.Event.listen(this.controller.stageController.document, Mojo.Event.stageDeactivate, this.handleDeActivate);

        $super();
    },
    
    aboutToActivate : function ($super, callback)
    {
        this.scrim.hide();
        if (Boxee.Util.Settings.getInstance().get("server") && Boxee.Util.Settings.getInstance().get("server").host)
        {
            this.hostModel.value = Boxee.Util.Settings.getInstance().get("server").host;
            this.controller.modelChanged(this.hostModel);
        }
        if (Boxee.Util.Settings.getInstance().get("server") && Boxee.Util.Settings.getInstance().get("server").port)
        {
            this.portModel.value = Boxee.Util.Settings.getInstance().get("server").port;
            this.controller.modelChanged(this.portModel);
        }
        else {
            this.portModel.value = '8800';
            this.controller.modelChanged(this.portModel);
        }
        if (Boxee.Util.Settings.getInstance().get("server") && Boxee.Util.Settings.getInstance().get("server").vibrate == "On")
        {
            this.vibrateModel.value = "On";
            this.controller.modelChanged(this.vibrateModel);
        }
        if (Boxee.Util.Settings.getInstance().get("server") && Boxee.Util.Settings.getInstance().get("server").password)
        {
            this.passModel.value = Boxee.Util.Settings.getInstance().get("server").password;
            this.controller.modelChanged(this.passModel);
        }
        $super(callback);
    },
    
    activate : function ($super)
    {
        $super();
    },
    
    deactivate : function ()
    {
        this.save();
    },
    
    deactivateWindow : function ()
    {
        this.save();
    },
    
    cleanup : function ($super)
    {
        this.name = null;
        this.cmd = null;
        this.scrim = null;
        Mojo.Event.stopListening(this.controller.stageController.document, Mojo.Event.stageDeactivate, this.handleDeActivate);
        this.handleDeActivate = null;
        $super();
    },
    
    handleCommand : function($super, event)
    {
        if (event.type === Mojo.Event.command) {
            switch (event.command) {
                case 'do-save-seetings':
                    this.save();
                break;
            }
        }
        $super(event);
    },
    
    save : function ()
    {
        if (this.hostModel.value.length == 0 || this.portModel.value.length == 0)
        {
            Mojo.Controller.errorDialog($L('Enter ip address and port of boxee.'));
        }
        else
        {
            Boxee.Util.Settings.getInstance().set("server", {host: this.hostModel.value, port: this.portModel.value, password: this.passModel.value, vibrate: this.vibrateModel.value});
            this.cmd.setConn();
        }
    },
        
    onError : function (error)
    {
        this.scrim.hide();
        if (error.code == "404")
        {
            Mojo.Controller.errorDialog($L('Could not connect to boxee. Check the ip address and port.'));
        }
    }
    
});