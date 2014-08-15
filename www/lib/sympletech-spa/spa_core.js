var Core = new (function () {
    var self = this;

    var $ContentWindow = $("#content-window");

    //************************************************
    // Active Environment
    //************************************************    
    self.activeEnvironment = null;
    self.loadActiveEnvironment = function() {

        var environment = _.find(AppSettings.environments, function (env) {
            var inHostList = _.find(env.hostnames, function (hostName) {
                return hostName.toLowerCase() == location.hostname.toLowerCase();
            });
            return inHostList != null;
        });

        var env = self.readQueryString('env');
        if (env) {
            AppSettings.defaultEnvironment = env;
        }

        if (environment == null || env) {
            environment = _.findWhere(environments, { name: AppSettings.defaultEnvironment });
        }
        self.activeEnvironment = environment;

        var includes = '';
        for (var i = 0; i < AppSettings.appRoutes.length; i++) {
            var route = AppSettings.appRoutes[i];
            includes += self.composeViewModelScriptInclude(route.path);
            includes += self.composeStyleSheetInclude(route.styles);
            includes += self.composeScriptsInclude(route.scripts);
        }
        document.write(includes);
    };
    
    //************************************************
    // Current User Management
    //************************************************

    self.currentUser = null;
    var authCookieName = (window.location.pathname != '/' ? window.location.pathname : window.location.hostname).replace(/\//g, "!") + '_cookie';

    $.cookie.json = true;
    self.loginUser = function (userDetails, rememberUser) {
        self.currentUser = userDetails;

        //Set Current User cookie
        var expires = rememberUser ? 365 : 1;

        $.cookie(authCookieName, self.currentUser, { expires: expires, path: window.location.pathname });

        //Check to see if there was a redirect 
        var target = AppSettings.defaultRoute;
        if (self.currentPageState && self.currentPageState.returnPath) {
            target = self.currentPageState.returnPath;
        }

        self.clearPageState();

        self.loadPage(target);
    };

    self.logoutUser = function () {
        self.currentUser = null;
        self.currentPath = null;
        
        $.removeCookie(authCookieName, { path: window.location.pathname });
        
        self.loadPage(AppSettings.defaultRoute, null);
    };

    self.getCurrentUser = function () {
        self.currentUser = self.currentUser ? self.currentUser : $.cookie(authCookieName);
        return self.currentUser;
    };

    //************************************************
    // Hash Processing
    //************************************************

    self.currentRoute = {
        path: '',
        state : {}
    };

    self.currentPath = null;
    self.currentPageState = null;
    self.documentReady = null;

    self.setPageState = function (pageState) {
        if (pageState) {
            self.currentRoute.state = pageState;
            self.currentPageState = pageState;
            self.writeCurrentRoute();
        }
    };

    self.getPageState = function () {
        return self.currentRoute.state;
    };

    self.clearPageState = function () {
        self.currentRoute.state = null;
        self.currentPageState = null;
        self.writeCurrentRoute();
    };

    self.writeCurrentRoute = function () {
        if (self.currentRoute.state != null) {
            window.location.hash = encodeURI(JSON.stringify(self.currentRoute));
        } else {
            window.location.hash = encodeURI(JSON.stringify({ path: self.currentRoute.path }));
        }
    };

    self.loadPageState = function () {
        if (window.location.hash != '') {
            self.currentRoute = JSON.parse(decodeURI(window.location.hash).substring(1));
        }
    };

    //************************************************
    // Resource Include Composition
    //************************************************
    function endsWith(str, suffix) {
        return str.toLowerCase().indexOf(suffix.toLowerCase(), str.length - suffix.length) !== -1;
    }    

    var includeScriptHtml = function (path) {
        if (endsWith(path, '.js') != true) {
            path = path + '.js';
        }

        return '<script type="text/javascript" src="' + path + '"></script>';
    };

    var includeStyleSheetHtml = function (path) {
        if (endsWith(path, '.css') != true) {
            path = path + '.css';
        }
        return '<link href="' + path + '" rel="stylesheet" type="text/css" />';
    };

    self.composeViewModelScriptInclude = function (path) {
        return includeScriptHtml("app/view-models/" + path + "-viewmodel.js");
    };

    self.composeStyleSheetInclude = function (styles) {
        var cssInclude = '';
        if (styles) {
            for (var i = 0; i < styles.length; i++) {
                var style = styles[i];
                cssInclude += includeStyleSheetHtml(style);
            }
        }
        return cssInclude;
    };

    self.composeScriptsInclude = function (scripts) {
        var jsInclude = '';
        if (scripts) {
            for (var i = 0; i < scripts.length; i++) {
                var script = scripts[i];
                jsInclude += includeScriptHtml(script);
            }
        }
        return jsInclude;
    };

    //************************************************
    // Global View Model
    //************************************************
    self.globalViewModel = {};

    var partialBindingProvider = function () {
        var result = new ko.bindingProvider(),
            originalHasBindings = result.nodeHasBindings;

        result.exclusionSelector = '#content-window';

        result.nodeHasBindings = function (node) {
            return !$(node).is(result.exclusionSelector) && originalHasBindings.call(this, node);
        };

        return result;
    };

    function instantiateGlobalViewModel() {
        try {
            var gblVm = eval('new ' + AppSettings.globalViewModel.className + '();');
        } catch(e) {}

        if (gblVm) {
            ko.bindingProvider.instance = new partialBindingProvider();
            
            self.globalViewModel = gblVm;
            ko.applyBindings(self.globalViewModel);

            ko.bindingProvider.instance = new ko.bindingProvider();
        } else {
            setTimeout(function() {
                instantiateGlobalViewModel();
            }, 100);
        }
    }

    self.loadGlobalViewModel = function () {
        if (AppSettings.globalViewModel) {
            var gblVmInclude = includeScriptHtml(AppSettings.globalViewModel.path);
            document.write(gblVmInclude);

            instantiateGlobalViewModel();
        }
    };

    //************************************************
    // Content Loading
    //************************************************
    $(window).on('hashchange', function () {
        self.loadPageFromCurrentUrl();
    });

    self.loadPage = function (path, state) {
        var navigationEntry = _.findWhere(AppSettings.appRoutes, { path: path });
        if (navigationEntry == null) {
            self.currentRoute = {
                path: AppSettings.defaultRoute,
                state: null
            };
        } else {
            if (navigationEntry.secure && self.currentUser == null) {
                self.currentRoute = {
                    path: AppSettings.securedRedirect,
                    state: { returnPath: path }
                };
            } else {
                self.currentRoute = {
                    path: path,
                    state: state
                };
            }
        }

        self.writeCurrentRoute();
    };

    //Load the current url 
    self.loadPageFromCurrentUrl = function () {
        self.loadPageState();
        self.getCurrentUser();

        if (!self.currentRoute.path) {
            self.loadPage(AppSettings.defaultRoute, self.currentPageState);
        } else if (self.currentPath != self.currentRoute.path) {

            var navigationEntry = _.findWhere(AppSettings.appRoutes, { path: self.currentRoute.path });

            if (navigationEntry.secure && self.currentUser == null) {
                self.loadPage(AppSettings.securedRedirect, { returnPath: self.currentRoute.path });
            } else {
                self.loadTemplates(navigationEntry.templates).then(function() {
                    self.loadPageHtml(navigationEntry);
                });
            }
        }
    };

    self.loadPageHtml = function (navigationEntry) {
        //Load the page
        var htmlPath = 'app/views/' + navigationEntry.path + '.html?z=' + new Date().getTime();

        $.get(htmlPath, function (data) {
            self.currentPath = navigationEntry.path;
            $ContentWindow.html(data);

            var vModel;
            eval('vModel = ' + navigationEntry.path + 'ViewModel;');
            if (vModel) {
                self.bindViewModel(vModel);
            }

            document.title = AppSettings.applicationTitle + " - " + navigationEntry.title;
            $("#panel-title").html(navigationEntry.title);

            if (self.documentReady) {
                self.documentReady();
                self.documentReady = null;
            }

        });
    };
    
    //************************************************
    // Template Loading
    //************************************************

    var templateContainer;
    self.loadTemplates = function (templates) {
        var deferred = Q.defer();

        var containerId = "template-container";
        templateContainer = $('#' + containerId);
        if (templateContainer.length == 0) {
            $('body').append('<div id="' + containerId + '"></div>');
            templateContainer = $('#' + containerId);
        }

        templateContainer.html("");
        if (templates) {
            var promises = [];
            _.each(templates, function (template) {
                promises.push(self.getTemplate(template));
            });
            Q.all(promises).spread(function (results) {
                deferred.resolve();
            });
        } else {
            deferred.resolve();
        }
        return deferred.promise;
    };

    self.getTemplate = function (template) {
        var d = Q.defer();

        var templatePath = template + '.html?z=' + new Date().getTime();

        $.get(templatePath, function (data) {
            templateContainer.append(data);
            d.resolve(template);
        });
        return d.promise;
    };

    self.bindViewModel = function (vModel) {
        ko.cleanNode($ContentWindow[0]);
        window.currentViewModel = new vModel();
        ko.applyBindings(window.currentViewModel, $ContentWindow[0]);
        
        //Fills viewmodels with any fields auto filled by browser
        setTimeout(function () {
            $('input').trigger('change');
        }, 250);
    };

    //************************************************
    // Loader Methods
    //************************************************

    self.showLoader = function () {
        $("#loader").fadeIn();
    };

    self.hideLoader = function () {
        $("#loader").fadeOut();
    };

    //************************************************
    // Query String Methods
    //************************************************
    self.readQueryString = function(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    };

    //************************************************
    // API Methods
    //************************************************

    self.apiGet = function (endpoint, params, onSuccess, onFail) {
        return self.apiAjaxRequest("GET", endpoint, params, onSuccess, onFail);
    };

    self.apiPost = function (endpoint, params, onSuccess, onFail) {
        return self.apiAjaxRequest("POST", endpoint, params, onSuccess, onFail);
    };

    self.apiPostAsJson = function (endpoint, payloadObject, onSuccess, onFail) {
        var payloadJson = JSON.stringify(payloadObject);
        return self.apiAjaxRequest("POST", endpoint, { payload: payloadJson }, onSuccess, onFail);
    };

    self.apiAjaxRequest = function (method, endpoint, params, onSuccess, onFail) {
        self.showLoader();
        
        self.currentUser = self.getCurrentUser();
        if (self.currentUser) {
            params = $.extend({ token: self.currentUser.token }, params);
        }

        var requestPath = endpoint;
        if (requestPath.indexOf('http://') == -1 && self.activeEnvironment.apiUrl) {

            var apiUrlEndsWithSlash = self.activeEnvironment.apiUrl.lastIndexOf('/') == self.activeEnvironment.apiUrl.length - 1,
                endPointStartsWithSlash = endpoint.indexOf('/') == 0;

            if (apiUrlEndsWithSlash && endPointStartsWithSlash) {
                endpoint = endpoint.substring(1, endpoint.length);
            }

            if (!apiUrlEndsWithSlash && !endPointStartsWithSlash) {
                endpoint = '/' + endpoint;
            }

            requestPath = self.activeEnvironment.apiUrl + endpoint;
        }

        requestPath += (requestPath.indexOf('?') == -1) ? '?' : '&';
        requestPath += 'z=' + new Date().getTime();		
		
        $.ajax({
            url: requestPath,
            type: method,
            data: params,
            success: function (data) {
                if (data.success == null) {
                    onSuccess(data);
                } else {
                    if (data.success == true) {
                        if (onSuccess) {
                            onSuccess(data.data);
                        }
                    } else {
                        if (onFail) {
                            onFail(data.errorMessage);
                        } else {
                            alert("Error : " + data.errorMessage);
                        }
                    }
                }
                self.hideLoader();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                if (jqXHR.status == 403) {
                    alert('You do not have permission to complete the requested opertation.  Redirecting to login page');
                    self.loadPage(AppSettings.securedRedirect);
                } else {
                    if (onFail) {
                        onFail(errorThrown);
                    } else {
                        alert("Error : " + errorThrown);
                    }
                }
                self.hideLoader();
            }
        });
    };

    //************************************************
    // Init
    //************************************************ 
    self.init = function () {
        if (AppSettings.libs) {
            var jsInclude = '';
            for (var i = 0; i < AppSettings.libs.length; i++) {
                var script = AppSettings.libs[i];
                jsInclude += '<script type="text/javascript" src="' + script + '"></script>';
            }
            document.write(jsInclude);
        }
        self.loadActiveEnvironment();
        self.loadGlobalViewModel();
    };
    self.init();

    return self;
})();
$(function () {
    Core.loadPageFromCurrentUrl();
});