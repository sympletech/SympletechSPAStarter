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

    //State Example
    self.btnActive = ko.observable(false);
    
    var pageState = Core.getPageState();
    if (pageState && pageState.buttonState) {
        self.btnActive(true);
    }
    

    self.btnText = ko.computed(function () {
        return !self.btnActive() ? "Click Me To Change My State" : "Now Refresh The Page";
    });

    self.changeButtonState = function () {
        var newBtnState = !self.btnActive();
        Core.setPageState({ buttonState: newBtnState });
        self.btnActive(newBtnState);
    };

    return self;
};