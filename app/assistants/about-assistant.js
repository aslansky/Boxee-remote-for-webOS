Boxee.Scene.About = Class.create(Boxee.Util.Base, {
    
    initialize : function ($super, args)
    {
        $super(args);
        this.name = "Boxee.Scene.About - " + Math.round(Math.random()*100);
        
        this.handleWebsite = this.onWebsite.bind(this);
        this.handleSupport = this.onSupport.bind(this);
        this.handleEmail = this.onEmail.bind(this);
    },
    
    setup : function ($super)
    {
        Mojo.Event.listen(this.controller.get('website'), Mojo.Event.tap, this.handleWebsite);
        Mojo.Event.listen(this.controller.get('support'), Mojo.Event.tap, this.handleSupport);
        Mojo.Event.listen(this.controller.get('email'), Mojo.Event.tap, this.handleEmail);
        $super();
    },
    
    aboutToActivate : function ($super, callback)
    {
        $super(callback);
    },
    
    activate : function ($super)
    {
        $super();
    },
    
    deactivate : function ()
    {
        
    },
    
    cleanup : function ($super)
    {
        this.name = null;
        Mojo.Event.stopListening(this.controller.get('website'), Mojo.Event.tap, this.handleWebsite);
        Mojo.Event.stopListening(this.controller.get('support'), Mojo.Event.tap, this.handleSupport);
        Mojo.Event.stopListening(this.controller.get('email'), Mojo.Event.tap, this.handleEmail);
        this.handleWebsite = null;
        this.handleSupport = null;
        this.handleEmail = null;
        $super();
    },
    
    onWebsite : function ()
    {
        this.controller.serviceRequest("palm://com.palm.applicationManager", {
            method: "open",
            parameters:  {
                id: 'com.palm.app.browser',
                params: {
                    target: "http://slansky.net/boxee"
                }
            }
        });
    },
    
    onSupport : function ()
    {
        this.controller.serviceRequest("palm://com.palm.applicationManager", {
            method: "open",
            parameters:  {
                id: 'com.palm.app.browser',
                params: {
                    target: "http://support.slansky.net"
                }
            }
        });
    },
    
    onEmail : function ()
    {
        this.controller.serviceRequest('palm://com.palm.applicationManager', {
            method:'open',
            parameters:{ target: 'mailto:support@slansky.net?subject=Support%20for%20Boxee%20Remote'}
        });
    }
    
});