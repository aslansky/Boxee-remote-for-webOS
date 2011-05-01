Boxee.Util.Dashboard = Boxee.Util.Singleton.create({
    dashboardInitialized: false,
    dashboardController: null,
    
    create: function ()
    {
        this.appController = Mojo.Controller.getAppController();
        if (!this.dashboardInitialized) {
            if (this.dashboardController){
                return;
            }
            this.dashboardInitialized = true;
            var f = function (stageController)
            {
                stageController.pushScene("dashboard", this);
            };
            var params = {
                name: "remoteDash",
                clickableWhenLocked: true,
                lightweight: true
            };
            this.appController.createStageWithCallback(params, f, "dashboard");
        }
        
    },
    
    show: function ()
    {
        if (!this.dashboardController)
        {
            this.create();
        }
    },
    
    hide: function ()
    {
        if (this.appController && this.appController.getStageProxy("remoteDash"))
        {
            this.appController.getStageProxy("remoteDash").window.close();
            this.dashboardInitialized = false;
        }
    }
});