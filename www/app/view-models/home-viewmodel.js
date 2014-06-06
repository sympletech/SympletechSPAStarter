var homeViewModel = function () {
    var self = this;
    self.currentUser = ko.observable(Core.currentUser);

    self.loadLoginPage = function () {
        Core.loadPage('login');
    };

    self.logoutUser = function () {
        Core.logoutUser();
    };

    self.loadSecurePage = function () {
        Core.loadPage('secure');
    };

    return self;
};