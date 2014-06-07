var Core = new (function () {
    var self = this;

    var $ContentWindow = $("#content-window");
    $c.DEBUG_MODE = false;

    //************************************************
    // Active Environment
    //************************************************    
    self.activeEnvironment = null;
    self.loadActiveEnvironment = function(){
        
        var environment = _.find(AppSettings.environments, function (env) {
            return env.hostnames.contains(location.hostname);
        });

        var env = $GET('env');
        if (env) {
            AppSettings.defaultEnvironment = env;
        }           

        if (environment == null || env) {
            environment = _.findWhere(environments, { name: defaultEnvironment });
        }
        self.activeEnvironment = environment;
    };
    self.loadActiveEnvironment();
    
    //************************************************
    // ViewModel Loads
    //************************************************
    self.loadViewModels = function () {
        var includes = '';
        _.each(AppSettings.appRoutes, function (route) {
            includes += '<script type="text/javascript" src="app/view-models/' + route.path + '-viewmodel.js"></script>';
        });
        document.write(includes);
    };
    self.loadViewModels();
    

    //************************************************
    // Current User Management
    //************************************************

    self.currentUser = null;
    var authCookieName = "userinfo";

    $.cookie.json = true;
    self.loginUser = function (userDetails, rememberUser) {
        self.currentUser = userDetails;

        //Set Current User cookie
        var expires = rememberUser ? 365 : 1;

        $.cookie(authCookieName, self.currentUser, { expires: expires });

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
        $.removeCookie(authCookieName);

        var target = window.location.href.split('#')[0];
        window.location.href = target;
    };

    self.getCurrentUser = function () {
        self.currentUser = self.currentUser ? self.currentUser : $.cookie(authCookieName);
        return self.currentUser;
    };

    //************************************************
    // Page Loading and Page State
    //************************************************

    self.currentPath = null;
    self.currentPageState = null;

    //Loads Specified path's content into Content Window protects paths if no user is logged in
    self.loadPage = function (path, state) {

        //Set current Path
        path = path ? path : AppSettings.defaultRoute;
        $SET("@p", path, { defer: true });

        self.setPageState(state, true);

        $COMMIT();
    };

    self.loadPageState = function () {
        var state = $GET('s');
        if (state) {
            try {
                state = unescape(state);
                self.currentPageState = JSON.parse(state);
            } catch (e) {
            }
        }
    };
    
    self.setPageState = function (pageState, defer) {
        if (pageState) {
            self.currentPageState = $.extend(self.currentPageState, pageState);
            $SET("@s", encodeURI(JSON.stringify(self.currentPageState)), { defer: defer });
        }
    };

    self.clearPageState = function () {
        $DEL("s");
    };

    var templateContainer = $("#template-container");
    self.loadTemplates = function (templates) {
        var deferred = Q.defer();

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

        var templatePath = 'app/templates/' + template + '.html?z=' + new Date().getTime();

        $.get(templatePath, function (data) {
            templateContainer.append(data);
            d.resolve(template);
        });
        return d.promise;
    };

    $(window).on('hashchange', function () {
        self.loadPageFromCurrentUrl();
    });

    //Load the current url 
    self.loadPageFromCurrentUrl = function () {
        var page = $GET('p');

        self.getCurrentUser();
        self.loadPageState();

        if (!page) {
            self.loadPage(AppSettings.defaultRoute, self.currentPageState);
        } else if (self.currentPath != page) {

            var navigationEntry = _.findWhere(AppSettings.appRoutes, { path: page });

            if (navigationEntry.secure && self.currentUser == null) {
                
                self.loadPage(AppSettings.securedRedirect, { returnPath: page });
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

        });
    };

    self.bindViewModel = function (vModel) {
        ko.cleanNode($ContentWindow[0]);
        ko.applyBindings(new vModel(), $ContentWindow[0]);
        
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
        if (self.activeEnvironment.apiUrl) {
            if (self.activeEnvironment.apiUrl.endsWith("/") && endpoint.startsWith("/")) {
                endpoint = endpoint.substring(1, endpoint.length);
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
                if (data.success == true) {
                    if(onSuccess){
						onSuccess(data.data);
					}
                } else {
                    logit("Error : " + data.errorMessage);
					if(onFail){
						onFail(data.errorMessage);
					}
                }
                self.hideLoader();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                if (jqXHR.status == 403) {
                    self.loadPage(loginPath);
                } else {
                    logit("Error : " + errorThrown);
					if(onFail){
						onFail(errorThrown);
					}
                }
                self.hideLoader();
            }
        });
    };

    return self;
})();
$(function () {
    Core.loadPageFromCurrentUrl();
});