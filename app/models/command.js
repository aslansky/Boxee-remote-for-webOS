Boxee.Model.Command = Boxee.Util.Singleton.create({
    initialize : function (args)
    {
        Object.Event.extend(this);
        Object.extend(this, args);
        this.setup = false;
        this.headerParams = {};
        this.interval = null;
        this.handleInterval = this.getNowPlaying.bind(this);
        this.setConn();
    },
    
    cleanup : function ()
    {
        console.log("Boxee.Model.Command.cleanup");
        clearInterval(this.interval);
        this.interval = null;
        this.handleInterval = null;
        this.url = null;
        this.host = null;
        this.port = null;
        this.setup = null;
    },
    
    setConn : function ()
    {
        this.setup = true;
        if (Boxee.Util.Settings.getInstance().get("server") && Boxee.Util.Settings.getInstance().get("server").host)
        {
            this.host = Boxee.Util.Settings.getInstance().get("server").host;
        }
        else 
        {
            this.setup = false;
        }
        if (Boxee.Util.Settings.getInstance().get("server") && Boxee.Util.Settings.getInstance().get("server").port)
        {
            this.port = Boxee.Util.Settings.getInstance().get("server").port;
        }
        else 
        {
            this.setup = false;
        }
        if (Boxee.Util.Settings.getInstance().get("server") && Boxee.Util.Settings.getInstance().get("server").password)
        {
            this.headerParams = {
                "Authorization" : "Basic " + Base64.encode("boxee:" + Boxee.Util.Settings.getInstance().get("server").password)
            };
        }
        this.url = "http://" + this.host + ":" + this.port + "/xbmcCmds/xbmcHttp";
    },
    
    checkConn : function (args)
    {
        if (args.host && args.port)
        {
            this.host = args.host;
            this.port = args.port;
            this.url = "http://" + args.host + ":" + args.port + "/xbmcCmds/xbmcHttp";
            var params = {
                "command" : "Broadcast(discover)"
            };
            if (args.password)
            {
                this.headerParams = {
                    "Authorization" : "Basic " + Base64.encode("boxee:" + args.password)
                };
            }
            request = new Ajax.Request(this.url, {
               method: 'get',
               parameters: params,
               requestHeaders : this.headerParams,
               onSuccess: this.onEmptyResponse.bind(this, args),
               onFailure: this.onOkResponseError.bind(this, args)
           });
        }
        else
        {
            if (args.onError)
            {
                args.onError({
                    msg : "host and port missing",
                    code : "400"
                });
            }
        }
    },
    
    setupError : function (args)
    {
        if (args && args.onError)
        {
            args.onError({
                msg : "setup connection first",
                code : "404"
            });
        }
    },
    
    sendKey: function (args)
    {
        if (!this.setup)
        {
            this.setupError(args);
            return;
        }
        if (args.key)
        {
            var params = {
                "command" : "SendKey(" + args.key + ")"
            };
            request = new Ajax.Request(this.url, {
               method: 'get',
               parameters: params,
               requestHeaders : this.headerParams,
               onSuccess: this.onEmptyResponse.bind(this, args),
               onFailure: this.onOkResponseError.bind(this, args)
           });
        }
        else
        {
            if (args.onError)
            {
                args.onError({
                    msg : "key is missing",
                    code : "400"
                });
            }
        }
    },
    
    mute: function (args)
    {
        if (!this.setup)
        {
            this.setupError(args);
            return;
        }
        var params = {
            "command" : "Mute"
        };
        request = new Ajax.Request(this.url, {
           method: 'get',
           parameters: params,
           requestHeaders : this.headerParams,
           onSuccess: this.onEmptyResponse.bind(this, args),
           onFailure: this.onOkResponseError.bind(this, args)
       });
    },
    
    startNowPlaying : function ()
    {
        if (!this.interval)
        {
            this.interval = setInterval(this.handleInterval, 1000);
        }
    },
    
    slowDownNowPlaying : function ()
    {
        clearInterval(this.interval);
        this.interval = setInterval(this.handleInterval, 5000);
    },
    
    accelerateNowPlaying : function ()
    {
        clearInterval(this.interval);
        this.interval = setInterval(this.handleInterval, 1000);
    },
    
    getNowPlaying : function (args)
    {
        if (!this.setup)
        {
            this.setupError(args);
            return;
        }
        var params = {
            "command" : "GetCurrentlyPlaying()"
        };
        request = new Ajax.Request(this.url, {
           method: 'get',
           parameters: params,
           requestHeaders : this.headerParams,
           onSuccess: this.onNowPlaying.bind(this, args),
           onFailure: this.onOkResponseError.bind(this, args)
       });
    },
    
    getVolume: function (args)
    {
        if (!this.setup)
        {
            this.setupError(args);
            return;
        }
        var params = {
            "command" : "GetVolume()"
        };
        request = new Ajax.Request(this.url, {
           method: 'get',
           parameters: params,
           requestHeaders : this.headerParams,
           onSuccess: this.onGetVolume.bind(this, args),
           onFailure: this.onOkResponseError.bind(this, args)
       });
    },
    
    setVolume : function (args)
    {
        if (!this.setup)
        {
            this.setupError(args);
            return;
        }
        if (args.volume)
        {
            var params = {
                "command" : "SetVolume(" + (args.volume) + ")"
            };
            request = new Ajax.Request(this.url, {
                method: 'get',
                parameters: params,
                requestHeaders : this.headerParams,
                onSuccess: this.onEmptyResponse.bind(this, args),
                onFailure: this.onOkResponseError.bind(this, args)
            });
        }
    },
    
    seek : function (args)
    {
        if (!this.setup)
        {
            this.setupError(args);
            return;
        }
        if (args.percentage)
        {
            var params = {
                "command" : "SeekPercentage(" + (args.percentage) + ")"
            };
            request = new Ajax.Request(this.url, {
                method: 'get',
                parameters: params,
                requestHeaders : this.headerParams,
                onSuccess: this.onEmptyResponse.bind(this, args),
                onFailure: this.onOkResponseError.bind(this, args)
            });
        }
    },
    
    playCmd : function (args)
    {
        if (!this.setup)
        {
            this.setupError(args);
            return;
        }
        
        if (args.command)
        {
            var params = {
                "command" : args.command
            };
            request = new Ajax.Request(this.url, {
               method: 'get',
               parameters: params,
               requestHeaders : this.headerParams,
               onSuccess: this.onEmptyResponse.bind(this, args),
               onFailure: this.onOkResponseError.bind(this, args)
           });
        }
        else
        {
            if (args.onError)
            {
                args.onError({
                    msg : "command is missing",
                    code : "400"
                });
            }
        }
    },
    
    getMediaLocation : function (args)
    {
        if (!this.setup)
        {
            this.setupError(args);
            return;
        }
        
        if (args.type)
        {
            var command = (args.path.length > 0) ? "GetMediaLocation(" + args.type + ";" + args.path + ")" : "GetMediaLocation(" + args.type + ")";
            var params = {
                "command" : command
            };
            request = new Ajax.Request(this.url, {
               method: 'get',
               parameters: params,
               requestHeaders : this.headerParams,
               onSuccess: this.onLocation.bind(this, args),
               onFailure: this.onOkResponseError.bind(this, args)
           });
            
        }
        else
        {
            if (args.onError)
            {
                args.onError({
                    msg : "type is missing",
                    code : "400"
                });
            }
        }
    },
    
    playFile : function (args)
    {
        if (!this.setup)
        {
            this.setupError(args);
            return;
        }
        
        if (args.filename)
        {
            var params = {
                "command" : "PlayFile(" + args.filename + ")"
            };
            request = new Ajax.Request(this.url, {
               method: 'get',
               parameters: params,
               requestHeaders : this.headerParams,
               onSuccess: this.onEmptyResponse.bind(this, args),
               onFailure: this.onOkResponseError.bind(this, args)
           });
        }
        else
        {
            if (args.onError)
            {
                args.onError({
                    msg : "filename is missing",
                    code : "400"
                });
            }
        }
    },
    
    getImage : function (args)
    {
        if (!this.setup)
        {
            this.setupError(args);
            return;
        }
        if (args.thumb)
        {
            var params = {
                "command" : "GetThumbnail(" + args.thumb + ")"
            };
            request = new Ajax.Request(this.url, {
               method: 'get',
               parameters: params,
               requestHeaders : this.headerParams,
               onSuccess: this.onFile.bind(this, args),
               onFailure: this.onOkResponseError.bind(this, args)
           });
        }
        else
        {
            if (args.onError)
            {
                args.onError({
                    msg : "thumb is missing",
                    code : "400"
                });
            }
        }
    },
    
    onLocation : function (args, response)
    {
        console.log(response.responseText);
        if (!response.responseText.include("Error"))
        {
            var lines = response.responseText.replace(/\<html\>/, "").replace(/\<\/html\>/, "").split(/\<li\>/);
            if (lines.length <= 1)
            {
                lines = response.responseText.split(/\n/);
            }
            var result = [];
            var length = lines.length;
            for (var i = 0; i < length; i++)
            {
                var line = lines[i];
                if (line.include(";"))
                {
                    var fields = line.split(";");
                    result.push({
                        type : args.type,
                        title : fields[0].stripTags().replace(/\n/, ""),
                        path : fields[1].stripTags().replace(/\n/, ""),
                        list : fields[2].stripTags().replace(/\n/, "")
                    });
                }
            }
            if (args.onSuccess)
            {
                args.onSuccess(result);
            }
        }
        else
        {
            args.onError({
                msg : "location not available",
                code : "404"
            });
        }
    },
    
    onNowPlaying : function (args, response)
    {
        var result = response.responseText.split(/\<li\>/);
        if (result.length <= 1)
        {
            result = response.responseText.split(/\n/);
        }
        var data = {};
        var length = result.length;
        for (var i = 0; i < length; i++)
        {
            var item = result[i];
            field = item.substring(0, item.indexOf(":")).stripTags().replace(/\n/, "");
            value = item.substring(item.indexOf(":") + 1).stripTags().replace(/\n/, "");
            if (field.length > 0)
            {
                data[field] = value;
            }
        }
        if (data["Duration"]) {
            var dur = data["Duration"].split(":");
            data["DurationSec"] = Number(dur[0])*60*60 + Number(dur[1])*60 + Number(dur[2]);
        }
        this.notify("onData", data);
        if (args.onSuccess)
        {
            args.onSuccess(data);
        }
    },
    
    onFile : function (args, response)
    {
        var image = null;
        if (!response.responseText.include("Error"))
        {
            image = response.responseText.stripTags().strip();
        }
        if (args.onSuccess)
        {
            args.onSuccess(image);
        }
    },
    
    onGetVolume : function (args, response)
    {
        if (response.length == 0 || response.responseText.include("Error"))
        {
            if (args.onError)
            {
                args.onError({
                    msg : "failed to get volume",
                    code : "400"
                });
            }
        }
        else
        {
            if (args.onSuccess)
            {
                args.onSuccess(response.responseText.stripTags().strip());
            }
        }
    },
    
    onEmptyResponse : function (args, response)
    {
        if (args.onSuccess)
        {
            args.onSuccess(true);
        }
    },
    
    onOkResponse : function (args, response)
    {
        if (response.responseText.include("OK"))
        {
            if (args.onSuccess)
            {
                args.onSuccess(true);
            }
        }
        else
        {
            if (args.onError)
            {
                args.onError({
                    msg : "unexpected return",
                    code : "404"
                });
            }
        }
    },
    
    onOkResponseError : function (args, response)
    {
        if (args.onError)
        {
            args.onError({
                msg : "connection failed",
                code : "404"
            });
        }
    }
    
});