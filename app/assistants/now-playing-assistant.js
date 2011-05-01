Boxee.Scene.NowPlaying = Class.create(Boxee.Util.ToggleScene, {
    
    initialize : function ($super, args)
    {
        $super(args);
        this.name = "Boxee.Scene.NowPlaying - " + Math.round(Math.random()*100);
        this.image = null;
        this.handleDetails = this.onDetails.bind(this);
        this.handleError = this.onError.bind(this);
        this.handleCheckImg = this.checkImage.bind(this);
        this.handleActivate= this.activateWindow.bind(this);
        this.handleDeActivate = this.deactivateWindow.bind(this);
        
        this.handleImage = this.onImage.bind(this);
        this.handleImageError = this.onImageError.bind(this);
    },
    
    setup : function ($super)
    {
        this.controller.setupWidget(
            Mojo.Menu.commandMenu,
            this.cMenuAttributes = {
                spacerHeight: 0,
                menuClass: 'blue-command-not'
            },
            this.cMenuModel = {
                visible: true,
                items: [{}, {}, {}]
            }
        );
        Mojo.Event.listen(this.controller.get('cover-art-img'), Mojo.Event.tap, this.handleDetails);
        $super();
    },
    
    aboutToActivate : function ($super, callback)
    {
        $('title').innerHTML = $L("Now Playing");
        $super(callback);
    },
    
    activate : function ($super)
    {
        $super();
    },
    
    deactivate : function ($super)
    {
        $super();
    },
    
    cleanup : function ($super)
    {
        Mojo.Event.stopListening(this.controller.get('cover-art-img'), Mojo.Event.tap, this.handleDetails);
        
        this.name = null;
        this.image = null;
        this.animProps = null;
        
        this.handleDetails = null;
        this.handleError = null;
        this.handleCheckImg = null;
        this.handleClose = null;
        this.handleActivate= null;
        this.handleDeActivate = null;
        this.handleImage = null;
        this.handleImageError = null;
        
        $super();
    },
    
    onNowPlaying : function ($super, result)
    {
        if (this.isActive)
        {
            if ((result["Thumb"] && this.nowPlaying.Thumb != result["Thumb"]) || !this.image)
            {
                this.image = true;
                this.cmd.getImage({
                    thumb : result.Thumb,
                    onSuccess : this.handleImage,
                    onError : this.handleImageError
                });
            }
            if ((result["Thumb"] && this.nowPlaying.Thumb != result["Thumb"]))
            {
                this.controller.get('cover-art-img').setStyle({"visibility":"hidden"});
            }
            /*if (result.Percentage && (result["Type"] == "Video" || result["Type"] == "Audio"))
            {
                this.controller.get("progress").setStyle({
                    visibility : "",
                    width : result.Percentage +"%"
                });
            }
            else {
                this.controller.get("progress-bar").setStyle("visibility", "hidden");
            }
            if (result["PlayStatus"] && result["PlayStatus"] == "Playing") {
                $('progress-bar').setStyle({
                    display: ""
                });
            }
            else {
                $('progress-bar').setStyle({
                    display: "none"
                });
            }*/
        }
        $super(result);
    },
    
    checkImage : function ()
    {
        var img = this.controller.get('cover-art-img');
        if (img.complete) {
            if (img.getWidth() == img.getHeight())
            {
                img.setStyle({
                    width: "300px",
                    height: "auto"
                });
            }
            else if (img.getWidth() != img.getHeight() && img.getWidth() < img.getHeight())
            {
                img.setStyle({
                    width: "auto",
                    height: "310px"
                });
            }
            else if (img.getWidth() != img.getHeight() && img.getWidth() > img.getHeight())
            {
                img.setStyle({
                    width: "300px",
                    height: "auto"
                });
            }
            img.setStyle({"visibility":""});
        }
        else
        {
            setTimeout(this.handleCheckImg, 500);
        }
    },
    
    onImage : function (image)
    {
        var img = this.controller.get('cover-art-img');
        if (image !== null)
        {
            img.src = "data:image/png;base64," + image;
            setTimeout(this.handleCheckImg, 500);
        }
        else
        {
            img.setStyle({"visibility":"hidden"});
        }
    },
    
    onImageError : function (error)
    {
        this.controller.get('cover-art-img').setStyle({"visibility":"hidden"});
    },
    
    onDetails : function ()
    {
        if (this.nowPlaying["Type"] && (this.nowPlaying["Title"] || this.nowPlaying["Show Title"])) {
            Mojo.Event.stopListening(this.controller.get('cover-art-img'), Mojo.Event.tap, this.handleDetails);
            this.controller.showDialog({
                template : 'now-playing/dialog',
                assistant : new Boxee.Scene.DetailsDialog(this, this.nowPlaying)
            });
        }
    },
    
    closeDetails : function ()
    {
        Mojo.Event.listen(this.controller.get('cover-art-img'), Mojo.Event.tap, this.handleDetails);
    },
    
    onError : function (error)
    {
        if (error.code == "404")
        {
            clearInterval(this.interval);
            Mojo.Controller.errorDialog($L('Could not connect to boxee. Maybe the ip address or port changed.'));
        }
    }
    
});

Boxee.Scene.DetailsDialog = Class.create(Boxee.Util.Base, {
    initialize : function (sceneAssistant, data)
    {
        this.name = "DetailsDialog";
        this.sceneAssistant = sceneAssistant;
        this.controller = sceneAssistant.controller;
        this.data = data;
        
        this.handleClose = this.close.bind(this);
    },
    
    setup : function (widget)
    {
        this.widget = widget;
        
        this.controller.setupWidget(
            'dialog-button',
            this.sendBtnAttr = {},
            this.sendBtnModel = {
                buttonLabel : $L('Close'),
                buttonClass : '',
                disable : false
            }
        );
        Mojo.Event.listen(this.controller.get('dialog-button'), Mojo.Event.tap, this.handleClose);
    },
    
    activate : function ()
    {
        if (this.data["Type"] == "Serie" || this.data["Show Title"].length > 0)
        {
            this.renderSeriesDialog();
        }
        else if (this.data["Type"] == "Video")
        {
            this.renderVideoDialog();
        }
        else if (this.data["Type"] == "Audio")
        {
            this.renderAudioDialog();
        }
        else 
        {
            $('dialog-title').innerHTML = this.data["Title"];
        }
        
    },
    
    deactivate : function ()
    {
        Mojo.Event.stopListening(this.controller.get('dialog-button'), Mojo.Event.tap, this.handleClose);
        this.data = null;
        this.name = null;
        this.widget = null;
        this.sceneAssistant = null;
        this.controller = null;
        this.handleClose = null;
    },
    
    renderSeriesDialog : function ()
    {
        $('dialog-title').innerHTML = this.data["Show Title"] + "<br />" + this.data["Title"].truncate(50);
        var html = "";
        if (this.data["Season"] && this.data["Episode"])
            html += $L("Season") + ": " + this.data["Season"] + "  " + $L("Episode") + ": " + this.data["Episode"] + "<br /><br />";
        if (this.data["Director"])
            html += $L("Director") + ": " + this.data["Director"] + "<br /><br />";
        if (this.data["Genre"])
            html += $L("Genre") + ": " + this.data["Genre"] + "<br /><br />";
        if (this.data["Duration"])
            html += $L("Duration") + ": " + this.data["Duration"] + "<br /><br />";
        if (this.data["Plotoutline"])
            html += this.data["Plotoutline"] + "<br /><br />";
        
        $('dialog-content').innerHTML = html;
    },
    
    renderVideoDialog : function ()
    {
        $('dialog-title').innerHTML = this.data["Title"].truncate(80);
        var html = "";
        if (this.data["Director"])
            html += $L("Director") + ": " + this.data["Director"] + "<br /><br />";
        if (this.data["Year"])
            html += $L("Year") + ": " + this.data["Year"] + "<br /><br />";
        if (this.data["Genre"])
            html += $L("Genre") + ": " + this.data["Genre"] + "<br /><br />";
        if (this.data["Duration"])
            html += $L("Duration") + ": " + this.data["Duration"] + "<br /><br />";
        if (this.data["Plotoutline"])
            html += this.data["Plotoutline"] + "<br /><br />";
        $('dialog-content').innerHTML = html;
    },
    
    renderAudioDialog : function ()
    {
        $('dialog-title').innerHTML = this.data["Title"].truncate(80);
        var html = "";
        if (this.data["Artist"])
            html += $("Artist") + ": " + this.data["Artist"] + "<br /><br />";
        if (this.data["Genre"])
            html += $L("Genre") + ": " + this.data["Genre"] + "<br /><br />";
        if (this.data["Year"])
            html += $L("Year") + ": " + this.data["Year"] + "<br /><br />";
        if (this.data["Duration"])
            html += $L("Duration") + ": " + this.data["Duration"] + "<br /><br />";
        if (this.data["Lyrics"])
            html += $L("Lyrics") + ":<br />" + this.data["Lyrics"].replace(/\n/g, "<br />") + "<br /><br />";
        $('dialog-content').innerHTML = html;
    },
    
    close : function ()
    {
        this.sceneAssistant.closeDetails();
        this.widget.mojo.close();
    }
    
});