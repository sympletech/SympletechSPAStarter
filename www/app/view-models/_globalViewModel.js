var globalViewModel = new (function () {

    var self = this;

    self.basePageTitle = "Sympletech";

    self.pageTitle = ko.observable();
    self.pageTitle.subscribe(function () {
        document.title = self.pageTitle();
    });

    self.navigation = ko.observableArray([
        {text : 'Home Page', title : 'SPA Starter', path : 'home'},
        { text: 'Login Page', title: 'Login Page', path: 'login' }
    ]);

    self.loadNavigationPage = function (page) {
        self.pageTitle(self.basePageTitle + " " + page.title);
        Core.loadPage(page.path);
    };

    return self;

})();


ko.applyBindings(globalViewModel);