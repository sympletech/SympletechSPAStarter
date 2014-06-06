var homeViewModel = function () {
    var self = this;

    self.welcomeMessage = ko.observable("W3lcome To My Spa St@rter");
    self.currentUser = ko.observable(Core.currentUser);

    self.loadLoginPage = function () {
        Core.loadPage('login');
    };

    self.logoutUser = function () {
        Core.logoutUser();
    };

    return self;
};