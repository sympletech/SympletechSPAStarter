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
    self.navigation = ko.observableArray([
        { text: 'Home Page', title: 'SPA Starter', path: 'home', active: ko.observable(false) },
        { text: 'Login Page', title: 'Login Page', path: 'login', active: ko.observable(false) }
    ]);

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