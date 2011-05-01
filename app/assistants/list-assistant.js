Boxee.Scene.List = Class.create(Boxee.Util.ToggleScene, {
    
    initialize : function ($super, args)
    {
        $super(args);
        this.name = "Boxee.Scene.List - " + Math.round(Math.random()*100);
        this.title = (args.title) ? args.title : $L("My Media");
        this.path = null;
        this.args = args;
        if (this.args.results)
        {
            if (this.args.results.length > 5)
            {
                this.dividerFunction = function (itemModel) {
                    return String(itemModel.title[0]);
                };
            }
            else
            {
                this.dividerFunction = function () {};
            }
            this.items = this.args.results;
        }
        else {
            this.dividerFunction = function () {};
            this.items = [
                {title: $L("Music"), type:"music", list : 1, path: ""},
                {title: $L("Videos"), type:"video", list : 1, path: ""},
                {title: $L("Pictures"), type:"pictures", list : 1, path: ""}
            ];
        }
        
        // event handler
        this.handleTap = this.onTap.bind(this);
        this.handleNewItems = this.onNewItems.bind(this);
        this.handleError = this.onError.bind(this);
        this.handleFilter = this.onFilter.bind(this);
        this.handleFilterChange = this.onFilterChange.bind(this);
    },
    
    setup : function ($super)
    {
        var template = 'list/startitem';
        if (this.args.results)
        {
            template = 'list/item';
        }
        this.controller.setupWidget(
            'list', 
            {
                itemTemplate : template,
                swipeToDelete: false,
                reorderable: false,
                renderLimit: 50,
                filterFunction: this.handleFilter,
                dividerFunction: this.dividerFunction
            }
        );
        Mojo.Event.listen(this.controller.get('list'), Mojo.Event.listTap,  this.handleTap);
        Mojo.Event.listen(this.controller.get('list'), Mojo.Event.filterImmediate,  this.handleFilterChange);
        
        this.spacerDiv = this.controller.get('spacerDiv');
        
        $super();
    },
    
    aboutToActivate : function ($super, callback)
    {
        $('title').innerHTML = this.title;
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
        Mojo.Event.stopListening(this.controller.get('list'), Mojo.Event.listTap,  this.handleTap);
        Mojo.Event.stopListening(this.controller.get('list'), Mojo.Event.filterImmediate,  this.handleFilterChange);
        this.name = null;
        this.path = null;
        this.items = null;
        this.handleTap = null;
        this.handleNewItems = null;
        this.handleError = null;
        this.handleFilter = null;
        this.handleFilterChange = null;
        $super();
    },
        
    onTap : function (event)
    {
        if (Number(event.item.list) === 1)
        {
            this.title = event.item.title;
            if (event.item.type)
            {
                this.cmd.getMediaLocation({
                    type: event.item.type,
                    path: event.item.path,
                    onSuccess: this.handleNewItems,
                    onError: this.handleError
                });
            }
        }
        else
        {
            if (event.item.path)
            {
                this.cmd.playFile({
                    filename: event.item.path,
                    onError: this.handleError
                });
            }
        }
    },
    
    onNewItems : function (result)
    {
        this.showScene("list", {"results" : result, "title" : this.title});
    },
    
    onError : function (error)
    {
        if (error.code == "404")
        {
            Mojo.Controller.errorDialog($L("Ups, the location is not available."));
        }
    },
    
    onFilter : function (filterString, listWidget, offset, count)
    {
        var items = [];
        if (filterString.length > 0)
        {
            items = this.items.findAll(function (item) {
                return item.title.toLowerCase().include(filterString.toLowerCase());
            }, this);
        }
        else
        {
            items = this.items;
        }
        this.controller.get('list').mojo.noticeUpdatedItems(0, items);
        this.controller.get('list').mojo.setLength(items.length);
		this.controller.get('list').mojo.setCount(items.length);
    },
    
    onFilterChange : function (event)
    {
        if (event.filterString.blank()) {
            this.spacerDiv.show();
        } else {
            this.spacerDiv.hide();
        }
    }
});