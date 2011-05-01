Boxee.Scene.Remote = Class.create(Boxee.Util.ToggleScene, {
    
    initialize : function ($super, args)
    {
        $super(args);
        this.name = "Boxee.Scene.Remote - " + Math.round(Math.random()*100);
        this.cmd = Boxee.Model.Command.getInstance();
        
        this.handleUp = this.onUp.bind(this);
        this.handleDown = this.onDown.bind(this);
        this.handleLeft = this.onLeft.bind(this);
        this.handleRight = this.onRight.bind(this);
        this.handleOk = this.onOk.bind(this);
        this.handleBack = this.onBack.bind(this);
        this.handleKey = this.onKey.bind(this);
        this.handleKeyError = this.onKeyError.bind(this);
        this.handleError = this.onError.bind(this);
    },
    
    setup : function ($super)
    {
        $super();
        
        Mojo.Event.listen(this.controller.get('up'), Mojo.Event.tap, this.handleUp);
        Mojo.Event.listen(this.controller.get('down'), Mojo.Event.tap, this.handleDown);
        Mojo.Event.listen(this.controller.get('left'), Mojo.Event.tap, this.handleLeft);
        Mojo.Event.listen(this.controller.get('right'), Mojo.Event.tap, this.handleRight);
        Mojo.Event.listen(this.controller.get('ok'), Mojo.Event.tap, this.handleOk);
        Mojo.Event.listen(this.controller.get('back'), Mojo.Event.tap, this.handleBack);
        // need to log enter key press
        //document.addEventListener("keydown", this.handleKey, true);
    },
    
    aboutToActivate : function ($super, callback)
    {
        $('title').innerHTML = $L("Remote");
        $('remote-ui').setStyle({
           marginTop: (Mojo.Environment.DeviceInfo.screenHeight / 2 - 149) + "px"
        });
        $super();
    },
    
    activate : function ($super)
    {
        document.addEventListener("keydown", this.handleKey, true);
        $super();
    },
    
    deactivate : function ($super)
    {
        document.removeEventListener("keydown", this.handleKey, true);
        $super();
    },
    
    cleanup : function ($super)
    {
        Mojo.Event.stopListening(this.controller.get('up'), Mojo.Event.tap, this.handleUp);
        Mojo.Event.stopListening(this.controller.get('down'), Mojo.Event.tap, this.handleDown);
        Mojo.Event.stopListening(this.controller.get('left'), Mojo.Event.tap, this.handleLeft);
        Mojo.Event.stopListening(this.controller.get('right'), Mojo.Event.tap, this.handleRight);
        Mojo.Event.stopListening(this.controller.get('ok'), Mojo.Event.tap, this.handleOk);
        Mojo.Event.stopListening(this.controller.get('back'), Mojo.Event.tap, this.handleBack);

        document.removeEventListener("keydown", this.handleKey, true);

        this.name = null;
        this.handleUp = null;
        this.handleDown = null;
        this.handleLeft = null;
        this.handleRight = null;
        this.handleOk = null;
        this.handleBack = null;
        this.handleKey = null;
        this.handleKeyError = null;
        this.handleError = null;
        $super();
    },
    
    vibrate: function ()
    {
        if (Boxee.Util.Settings.getInstance().get("server") && Boxee.Util.Settings.getInstance().get("server").vibrate == "On")
        {
            Mojo.Controller.getAppController().playSoundNotification("vibrate", "", 100);
        }
    },
    
    handleCommand : function($super, event)
    {
        $super(event);
    },
    
    onUp : function ()
    {
        this.cmd.sendKey({
            key: 270,
            onError: this.handleKeyError
        });
        this.vibrate();
    },
    
    onDown : function ()
    {
        this.cmd.sendKey({
            key: 271,
            onError: this.handleKeyError
        });
        this.vibrate();
    },
    
    onLeft : function ()
    {
        this.cmd.sendKey({
            key: 272,
            onError: this.handleKeyError
        });
        this.vibrate();
    },
    
    onRight : function ()
    {
        this.cmd.sendKey({
            key: 273,
            onError: this.handleKeyError
        });
        this.vibrate();
    },
    
    onOk : function ()
    {
        this.cmd.sendKey({
            key: 256,
            onError: this.handleKeyError
        });
        this.vibrate();
    },
    
    onBack : function () 
    {
        this.cmd.sendKey({
            key: 275,
            onError: this.handleKeyError
        });
        this.vibrate();
    },
    
    onKey : function (event)
    {
        if (Mojo.Char.isEnterKey(event.keyCode))
        {
            this.cmd.sendKey({
                key: 256,
                onError: this.handleKeyError
            });
        }
        else
        {
            if (event.keyCode != 16 && event.keyCode != 129 && event.keyCode != 17)
            {
                this.cmd.sendKey({
                    key: event.keyCode + 61696,
                    onError: this.handleKeyError
                });
            }
        }
    },
    
    onKeyError : function (error)
    {
        if (error.code == "400")
        {
            Mojo.Controller.errorDialog($L('Could not get volume, try restarting boxee.'));
        }
        else if (error.code == "404")
        {
            Mojo.Controller.errorDialog($L('Could not connect to boxee. Maybe the ip address or port changed.'));
        }
    },
    
    onError : function (error)
    {
        if (error.code == "404")
        {
            Mojo.Controller.errorDialog($L('Could not connect to boxee. Maybe the ip address or port changed.'));
        }
    }
     
});