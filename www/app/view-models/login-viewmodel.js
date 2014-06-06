var loginViewModel = function () {
    var self = this;

    self.username = ko.observable();
    self.password = ko.observable();
    self.rememberMe = ko.observable();

    self.attemptLogin = function () {
        Core.loginUser({username: self.username()}, self.rememberMe());
    };

    return self;
};