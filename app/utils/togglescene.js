Boxee.Util.ToggleScene = Class.create(Boxee.Util.Base, {
    initialize : function($super, params)
    {
        $super(params);
        
        this.name = "Boxee.Scene.ToggleScene - " + Math.round(Math.random()*100);
        this.volumeVisible = true;
        this.scrubVisible = false;
        this.command = null;
        this.volume = null;
        this.volumeToggle = null;
        this.scrubToggle = null;
        
        this.nowPlaying = {};
        this.nowPlaying["PlayStatus"] = "pause";
        this.isPlaying = false;
        this.isActive = false;
        
        this.handleRemoteToggle = this.onRemoteToggle.bind(this);
        this.handleListToggle = this.onListToggle.bind(this);
        this.handleNowToggle = this.onNowToggle.bind(this);
        this.handleSetVolume = this.setVolume.bind(this);
        this.handleGetVolume = this.onGetVolume.bind(this);
        this.handleScrub = this.onScrub.bind(this);
        this.handleNowPlaying = this.onNowPlaying.bind(this);
        this.handleMenuChange = this.onMenuChange.bind(this);
        this.handleVolumeHide = this.onVolumeHide.bind(this);
        this.handleVolumeScrubHide = this.onVolumeScrubHide.bind(this);
        this.handleScrubVolumeHide = this.onScrubVolumeHide.bind(this);
        this.handleScrubControlHide = this.onScrubControlHide.bind(this);
        this.handleControlHide = this.onControlHide.bind(this);
        this.handleCheck = this.startUpdateInterval.bind(this);
    },

    setup : function ($super, args) {
        $super();
        
        this.controller.setupWidget(
            Mojo.Menu.commandMenu,
            this.cMenuAttributes = {
                spacerHeight: 0,
                menuClass: 'blue-command-not'
            },
            this.cMenuModel = {
                visible: true,
                items: [
                    {
                        //toggleCmd: "do-menu-toggle",
                        items: [
                            { template : "volume-button", command: "do-menu-volume-toggle"}
                            //{ iconPath: "images/menu-icon-volume.png", command: "do-menu-toggle" }
                        ]
                    },
                    {
                        items : [
                            { command: "button-action-rewind", iconPath: "images/menu-icon-rewind.png"},
                            { command: "button-action-pause", iconPath: "images/menu-icon-pause.png"},
                            { command: "button-action-stop", iconPath: "images/menu-icon-stop.png"},
                            { command: "button-action-forward", iconPath: "images/menu-icon-forward.png"}
                        ]
                    },
                    {
                        //toggleCmd: "do-menu-toggle",
                        items: [
                            { template : "scrub-button", command: "do-menu-scrub-toggle"}
                            //{ iconPath: "images/menu-icon-scrub.png", command: "do-menu-scrub-toggle" }
                        ]
                    },
                    {
                        items : [
                            { iconPath: "images/menu-icon-mute.png", command: "button-volume-mute"},
                            { template : "slider-menu"}
                        ]
                    },
                    {
                        items : [
                            { template : "scrub-menu"}
                        ]
                    }
                ]
            }
        );
        
        this.controller.setupWidget("volumeSlider",
            {
                minValue: 0,
                maxValue: 100,
                round : true
            },
            this.sliderModel = {
                value: 0,
                disabled: false
            }
        );
        
        this.controller.setupWidget("scrubSlider",
            {
                minValue: 0,
                maxValue: 100,
                round : true
            },
            this.scrubSliderModel = {
                value: 0,
                disabled: false
            }
        );
    },
    
    aboutToActivate : function($super, callback)
    {
        this.onMenuChange();
        if (!Boxee.Util.Settings.getInstance().get("server") || !Boxee.Util.Settings.getInstance().get("server").host)
        {
            Mojo.Controller.errorDialog($L('Go to settings first and enter connection data to your boxee box.'));
        }
        else {
            this.cmd.checkConn({
                host: Boxee.Util.Settings.getInstance().get("server").host,
                port: Boxee.Util.Settings.getInstance().get("server").port,
                password: Boxee.Util.Settings.getInstance().get("server").password,
                onSuccess : this.handleCheck,
                onError: this.handleError
            });
        }
        $super(callback);
    },

    activate : function($super)
    {
        this.isActive = true;
        
        Mojo.Event.listen(this.controller.get('toggle-remote-view'), Mojo.Event.tap, this.handleRemoteToggle);
        Mojo.Event.listen(this.controller.get('toggle-list-view'), Mojo.Event.tap, this.handleListToggle);
        Mojo.Event.listen(this.controller.get('toggle-now-view'), Mojo.Event.tap, this.handleNowToggle);
        Mojo.Event.listen(this.controller.get('volumeSlider'), Mojo.Event.propertyChange, this.handleSetVolume);
        Mojo.Event.listen(this.controller.get('scrubSlider'), Mojo.Event.propertyChange, this.handleScrub);
        $super();
    },
    
    activateWindow : function ($super)
    {
        if (this.controller.stageController.activeScene().sceneName == this.controller.sceneName)
        {
            this.cmd.accelerateNowPlaying();
        }
        $super();
    },
    
    deactivate : function ($super)
    {
        this.isActive = false;
        $super();
    },
    
    deactivateWindow : function ($super)
    {
        this.cmd.slowDownNowPlaying();
        $super();
    },
    
    cleanup : function($super)
    {
        Mojo.Event.stopListening(this.controller.get('toggle-remote-view'), Mojo.Event.tap, this.handleRemoteToggle);
        Mojo.Event.stopListening(this.controller.get('toggle-list-view'), Mojo.Event.tap, this.handleListToggle);
        Mojo.Event.stopListening(this.controller.get('toggle-now-view'), Mojo.Event.tap, this.handleNowToggle);
        Mojo.Event.stopListening(this.controller.get('volumeSlider'), Mojo.Event.propertyChange, this.handleSetVolume);
        Mojo.Event.stopListening(this.controller.get('scrubSlider'), Mojo.Event.propertyChange, this.handleScrub);
        
        this.cmd.stopObserving("onData", this.handleNowPlaying);
        this.name = null;
        this.volumeVisible = null;
        this.command = null;
        this.volume = null;
        this.nowPlaying = null;
        this.isPlaying = null;
        this.volumeToggle = null;
        this.scrubToggle = null;
        
        this.handleRemoteToggle = null;
        this.handleListToggle = null;
        this.handleNowToggle = null;
        this.handleSetVolume = null;
        this.handleGetVolume = null;
        this.handleScrub = null;
        this.handleVolumeScrubHide = null;
        this.handleScrubVolumeHide = null;
        this.handleScrubControlHide = null;
        this.handleNowPlaying = null;
        this.handleMenuChange = null;
        this.handleVolumeHide = null;
        this.handleControlHide = null;
        this.handleCheck = null;
        
        $super();
    },
    
    handleCommand : function($super, event) {
        if(event.type == Mojo.Event.command) {
            var mitems = this.command.select(".palm-menu-button");
            switch(event.command) {
                /* TOP-MENU */
                case 'do-menu-volume-toggle':
                    if (this.volumeToggle.select(".palm-menu-button")[0].hasClassName("palm-depressed"))
                    {
                        this.volumeToggle.select(".palm-menu-button")[0].removeClassName("palm-depressed");
                        Mojo.Animation.animateStyle(this.volume, 'top', 'ease-in-out', {
                            from: 0,
                            to: 60,
                            duration: 0.15,
                            reverse: false,
                            onComplete: this.handleVolumeHide}
                        );
                    }
                    else
                    {
                        this.volumeVisible = true;
                        if (this.scrubToggle.select(".palm-menu-button")[0].hasClassName("palm-depressed"))
                        {
                            Mojo.Animation.animateStyle(this.scrub, 'top', 'ease-in-out', {
                                from: 0,
                                to: 60,
                                duration: 0.15,
                                reverse: false,
                                onComplete: this.handleVolumeScrubHide}
                            );
                        }
                        else
                        {
                            Mojo.Animation.animateStyle(this.command, 'top', 'ease-in-out', {
                                from: 0,
                                to: 60,
                                duration: 0.15,
                                reverse: false,
                                onComplete: this.handleControlHide}
                            );
                        }
                        this.volumeToggle.select(".palm-menu-button")[0].addClassName("palm-depressed");
                    }
                    this.scrubToggle.select(".palm-menu-button")[0].removeClassName("palm-depressed");
                break;
                case 'do-menu-scrub-toggle':
                    if (this.scrubToggle.select(".palm-menu-button")[0].hasClassName("palm-depressed"))
                    {
                        this.scrubToggle.select(".palm-menu-button")[0].removeClassName("palm-depressed");
                        Mojo.Animation.animateStyle(this.scrub, 'top', 'ease-in-out', {
                            from: 0,
                            to: 60,
                            duration: 0.15,
                            reverse: false,
                            onComplete: this.handleVolumeHide}
                        );
                    }
                    else
                    {
                        this.scrubVisible = true;
                        if (this.volumeToggle.select(".palm-menu-button")[0].hasClassName("palm-depressed"))
                        {
                            Mojo.Animation.animateStyle(this.volume, 'top', 'ease-in-out', {
                                from: 0,
                                to: 60,
                                duration: 0.15,
                                reverse: false,
                                onComplete: this.handleScrubVolumeHide}
                            );
                        }
                        else
                        {
                            Mojo.Animation.animateStyle(this.command, 'top', 'ease-in-out', {
                                from: 0,
                                to: 60,
                                duration: 0.15,
                                reverse: false,
                                onComplete: this.handleScrubControlHide}
                            );
                        }
                        this.scrubToggle.select(".palm-menu-button")[0].addClassName("palm-depressed");
                    }
                    this.volumeToggle.select(".palm-menu-button")[0].removeClassName("palm-depressed");
                break;
                /* VOLUME */
                case 'button-volume-mute':
                    this.cmd.mute({
                        onError: this.handleKeyError
                    });
                break;
                /* CONTROL */
                case 'button-action-pause':
                    if (this.isPlaying)
                    {
                        mitems[1].down(".palm-menu-icon").setStyle({"backgroundImage" : "url(images/menu-icon-play.png)"});
                    }
                    else
                    {
                        mitems[1].down(".palm-menu-icon").setStyle({"backgroundImage" : "url(images/menu-icon-pause.png)"});
                    }
                    this.cmd.playCmd({
                        command: "Pause",
                        onError: this.handleError,
                        onSuccess: this.handleRefresh
                    });
                break;
                case 'button-action-stop':
                    this.isPlaying = false;
                    mitems[1].down(".palm-menu-icon").setStyle({"backgroundImage" : "url(images/menu-icon-play.png)"});
                    this.cmd.playCmd({
                        command: "Stop",
                        onError: this.handleError,
                        onSuccess: this.handleRefresh
                    });
                break;
                case 'button-action-rewind':
                    if (this.nowPlaying["Type"] == "Video")
                    {
                        seek = (30 / this.nowPlaying["DurationSec"]) * 100;
                        this.cmd.playCmd({
                            command: "SeekPercentageRelative(" + (seek * -1) + ")",
                            onError: this.handleError,
                            onSuccess: this.handleRefresh
                        });
                    }
                    else
                    {
                        this.cmd.playCmd({
                            command: "PlayPrev",
                            onError: this.handleError,
                            onSuccess: this.handleRefresh
                        });
                    }
                break;
                case 'button-action-forward':
                    if (this.nowPlaying["Type"] == "Video")
                    {
                        seek = (30 / this.nowPlaying["DurationSec"]) * 100;
                        this.cmd.playCmd({
                            command: "SeekPercentageRelative(" + seek + ")",
                            onError: this.handleError,
                            onSuccess: this.handleRefresh
                        });
                    }
                    else
                    {
                        this.cmd.playCmd({
                            command: "PlayNext",
                            onError: this.handleError,
                            onSuccess: this.handleRefresh
                        });
                    }
                break;
            }
        }
        $super(event);
    },
    
    startUpdateInterval : function ()
    {
        this.cmd.getVolume({
            onSuccess: this.handleGetVolume
        });
        this.cmd.observe('onData', this.handleNowPlaying);
        this.cmd.startNowPlaying();
    },
        
    onMenuChange : function ()
    {
        this.volumeToggle = $$(".palm-menu.command-menu .palm-menu-group")[0];
        this.command = $$(".palm-menu.command-menu .palm-menu-group")[1];
        this.scrubToggle = $$(".palm-menu.command-menu .palm-menu-group")[2];
        this.volume = $$(".palm-menu.command-menu .palm-menu-group")[3];
        this.scrub = $$(".palm-menu.command-menu .palm-menu-group")[4];
        this.command.setStyle({
            "position" : "absolute",
            "left" : "50px",
            "width" : "220px",
            "top" : "60px"
        });
        this.scrubToggle.setStyle({
            "position" : "absolute",
            "left" : "270px",
            "top" : "0px"
        });
        if (!this.volumeVisible && !this.scrubVisible)
        {
            this.command.setStyle({"top" : "0px"});
        }
        var mitems = this.command.select(".palm-menu-button");
        mitems[1].setStyle({"position" : "absolute","left" : "60px"});
        mitems[2].setStyle({"position" : "absolute","left" : "110px"});
        mitems[3].setStyle({"position" : "absolute","left" : "160px"});
        this.volume.setStyle({
            "position" : "absolute",
            "left" : "50px",
            "top" : "0px"
        });
        this.scrub.setStyle({
            "position" : "absolute",
            "left" : "50px",
            "top" : "0px"
        });
        if (!this.volumeVisible)
        {
            this.volume.setStyle({"top" : "60px"});
        }
        else
        {
            this.volumeToggle.select(".palm-menu-button")[0].addClassName("palm-depressed");
        }
        if (!this.scrubVisible)
        {
            this.scrub.setStyle({"top" : "60px"});
        }
        else
        {
            this.scrubToggle.select(".palm-menu-button")[0].addClassName("palm-depressed");
        }
        this.volume.select(".palm-menu-text")[0].setStyle({"left" : "60px"});
    },
    
    onNowPlaying : function (result)
    {
        if (this.isActive)
        {
            var mitems = this.command.select(".palm-menu-button");
            if (result["PlayStatus"] == "Playing")
            {
                this.isPlaying = true;
                if (result["PlayStatus"] != this.nowPlaying["PlayStatus"])
                {
                    mitems[1].down(".palm-menu-icon").setStyle({"backgroundImage" : "url(images/menu-icon-pause.png)"});
                }
            }
            if (result["PlayStatus"] == "Paused")
            {
                this.isPlaying = false;
                if (result["PlayStatus"] != this.nowPlaying["PlayStatus"])
                {
                    mitems[1].down(".palm-menu-icon").setStyle({"backgroundImage" : "url(images/menu-icon-play.png)"});
                }
            }
            this.setScrub(result['Percentage']);
        }
        this.nowPlaying = result;
    },
    
    setVolume : function (event)
    {
        var volume = 1;
        if (event.value > 0)
        {
            volume = event.value + 5;
        }
        this.cmd.setVolume({
            volume: volume
        });
    },
    
    onScrub : function (event)
    {
        var scrub = 0;
        if (event.value > 0)
        {
            scrub = event.value + 5;
        }
        this.cmd.seek({
            percentage: scrub
        });
    },
    
    setScrub: function (percentage)
    {
        this.scrubSliderModel.value = percentage;
        this.controller.modelChanged(this.scrubSliderModel);
    },
    
    onGetVolume : function (result)
    {
        this.sliderModel.value = result;
        this.controller.modelChanged(this.sliderModel);
    },
    
    onVolumeHide : function (element, cancelled)
    {
        if(!cancelled)
        {
            this.volumeVisible = false;
            Mojo.Animation.animateStyle(this.command, 'top', 'ease-in-out', {
                from: 0,
                to: 60,
                duration: 0.15,
                reverse: true}
            );
        }
    },
    
    onScrubControlHide : function (element, cancelled)
    {
        if(!cancelled)
        {
            this.volumeVisible = false;
            Mojo.Animation.animateStyle(this.scrub, 'top', 'ease-in-out', {
                from: 0,
                to: 60,
                duration: 0.15,
                reverse: true}
            );
        }
    },
    
    onVolumeScrubHide : function (element, cancelled)
    {
        if(!cancelled)
        {
            this.volumeVisible = false;
            Mojo.Animation.animateStyle(this.volume, 'top', 'ease-in-out', {
                from: 0,
                to: 60,
                duration: 0.15,
                reverse: true}
            );
        }
    },
    
    onScrubVolumeHide : function (element, cancelled)
    {
        if(!cancelled)
        {
            this.volumeVisible = false;
            Mojo.Animation.animateStyle(this.scrub, 'top', 'ease-in-out', {
                from: 0,
                to: 60,
                duration: 0.15,
                reverse: true}
            );
        }
    },
    
    onControlHide : function (element, cancelled)
    {
        if(!cancelled)
        {
            this.volumeVisible = true;
            Mojo.Animation.animateStyle(this.volume, 'top', 'ease-in-out', {
                from: 0,
                to: 60,
                duration: 0.15,
                reverse: true}
            );
        }
    },
    
    onRemoteToggle : function ()
    {
        if (this.sceneName != "remote") 
        {
            this.showScene("remote", {});
        }
    },
    
    onListToggle : function ()
    {
        if (this.sceneName != "list") 
        {
            this.showScene("list", {});
        }
    },
    
    onNowToggle : function ()
    {
        if (this.sceneName != "now-playing") 
        {
            this.showScene("now-playing", {});
        }
    }

});