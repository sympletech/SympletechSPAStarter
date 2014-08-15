var globalViewModel = function () {
    var self = this;

    self.globalObservable = ko.observable("Global Property");

    return self;
};