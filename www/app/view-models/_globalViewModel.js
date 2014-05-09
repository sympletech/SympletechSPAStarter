var globalViewModel = new (function () {

    var self = this;

    //************************************************
    // Page Title
    //************************************************
    self.basePageTitle = "Sympletech";

    self.pageTitle = ko.observable();
    self.pageTitle.subscribe(function () {
        document.title = self.pageTitle();
    });

    //************************************************
    // Navigation
    //************************************************
    var NavigationEntry = function (route) {
        this.text = route.text;
        this.title = route.title;
        this.path = route.path;
        this.templates = route.templates;
        this.active = ko.observable(false);
    };

    self.navigation = ko.observableArray();
    _.each(appRoutes, function (route) {
        self.navigation.push(new NavigationEntry(route));
    });

    self.loadNavigationPage = function (page) {
        self.pageTitle(self.basePageTitle + " " + page.title);
        Core.loadPage(page.path);
    };
    
    //************************************************
    // Current User
    //************************************************
    self.currentUser = ko.observable();

    self.logoutUser = function () {
        Core.logoutUser();
    };


    return self;

})();


ko.applyBindings(globalViewModel);
Core.loadPageFromCurrentUrl();