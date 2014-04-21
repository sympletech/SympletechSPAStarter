var globalViewModel = new (function () {

    var self = this;

    self.navigation = ko.observableArray([
        {text : 'Home Page', path : 'home'},
        {text : 'Login Page', path : 'login'}
    ]);

    return self;

})();


ko.applyBindings(globalViewModel);